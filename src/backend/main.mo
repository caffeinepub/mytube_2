import Map "mo:core/Map";
import Nat "mo:core/Nat";
import List "mo:core/List";
import Array "mo:core/Array";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import Int "mo:core/Int";
import Iter "mo:core/Iter";

import MixinStorage "blob-storage/Mixin";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  type VideoId = Text;
  type CommentId = Nat;

  public type VideoChunk = {
    chunkNumber : Nat;
    data : Blob;
    size : Nat;
  };

  public type StreamChunk = {
    chunkNumber : Nat;
    data : Blob;
    size : Nat;
  };

  public type VideoMetadata = {
    id : VideoId;
    title : Text;
    description : Text;
    durationSeconds : Nat;
    resolution : Text;
    totalChunks : Nat;
    chunkSize : Nat;
    uploadedBy : Principal;
    uploadTimestamp : Nat;
  };

  public type Short = {
    title : Text;
    videoUrl : Text;
    duration : Nat;
    likes : Nat;
    moods : [Mood];
  };

  public type Mood = {
    #happy;
    #sad;
    #chill;
    #excited;
  };

  public type UserPreferences = {
    moodAIEnabled : Bool;
    currentMood : Mood;
  };

  public type UserProfile = {
    username : Text;
    displayName : Text;
    bio : Text;
    profilePhotoUrl : Text;
    bannerUrl : Text;
    website : Text;
    youtube : Text;
    twitter : Text;
    instagram : Text;
    facebook : Text;
  };

  public type Comment = {
    id : CommentId;
    videoId : VideoId;
    author : Principal;
    text : Text;
    timestamp : Nat;
  };

  public type InteractionState = {
    liked : Bool;
    disliked : Bool;
    saved : Bool;
  };

  public type VideoInteractionSummary = {
    likeCount : Nat;
    dislikeCount : Nat;
    commentCount : Nat;
    savedCount : Nat;
  };

  public type VideoInteractionRequest = {
    videoId : VideoId;
    like : Bool;
    dislike : Bool;
    saved : Bool;
  };

  public type CreatedCommentEvent = {
    commentId : CommentId;
    timestamp : Nat;
  };

  public type CommentsList = {
    comments : [Comment];
    totalCount : Nat;
  };

  let videoMetadataStore = Map.empty<VideoId, VideoMetadata>();
  let videoChunksStore = Map.empty<VideoId, Map.Map<Nat, VideoChunk>>();
  let shorts = List.empty<Short>();
  let userPreferences = Map.empty<Principal, UserPreferences>();
  let userMoodHistory = Map.empty<Principal, List.List<Mood>>();
  let userProfiles = Map.empty<Principal, UserProfile>();
  let commentsStore = Map.empty<CommentId, Comment>();
  let videoInteractions = Map.empty<VideoId, Map.Map<Principal, InteractionState>>();
  let accessControlState = AccessControl.initState();

  var nextCommentId : CommentId = 1;

  include MixinStorage();
  include MixinAuthorization(accessControlState);

  private func getCommentCountForVideo(videoId : VideoId) : Nat {
    var count = 0;
    for ((_, comment) in commentsStore.entries()) {
      if (comment.videoId == videoId) {
        count += 1;
      };
    };
    count;
  };

  public query ({ caller = _ }) func getVideoInteractionSummary(videoId : VideoId) : async VideoInteractionSummary {
    switch (videoInteractions.get(videoId)) {
      case (?interactions) {
        var likeCount = 0;
        var dislikeCount = 0;
        var savedCount = 0;
        for ((_, interaction) in interactions.entries()) {
          if (interaction.liked) {
            likeCount += 1;
          };
          if (interaction.disliked) {
            dislikeCount += 1;
          };
          if (interaction.saved) {
            savedCount += 1;
          };
        };
        let commentCount = getCommentCountForVideo(videoId);
        {
          likeCount;
          dislikeCount;
          commentCount;
          savedCount;
        };
      };
      case (null) {
        {
          likeCount = 0;
          dislikeCount = 0;
          commentCount = getCommentCountForVideo(videoId);
          savedCount = 0;
        };
      };
    };
  };

  public query ({ caller }) func getVideoInteractionState(videoId : VideoId) : async InteractionState {
    switch (videoInteractions.get(videoId)) {
      case (?interactions) {
        switch (interactions.get(caller)) {
          case (?state) { state };
          case (null) { { liked = false; disliked = false; saved = false } };
        };
      };
      case (null) {
        { liked = false; disliked = false; saved = false };
      };
    };
  };

  public shared ({ caller }) func updateVideoInteraction(request : VideoInteractionRequest) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can interact with videos");
    };

    let newState : InteractionState = {
      liked = request.like;
      disliked = request.dislike;
      saved = request.saved;
    };

    switch (videoInteractions.get(request.videoId)) {
      case (?interactions) {
        interactions.add(caller, newState);
      };
      case (null) {
        let newInteractions = Map.empty<Principal, InteractionState>();
        newInteractions.add(caller, newState);
        videoInteractions.add(request.videoId, newInteractions);
      };
    };
  };

  public shared ({ caller }) func addComment(videoId : VideoId, text : Text) : async CreatedCommentEvent {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can comment on videos");
    };
    let comment : Comment = {
      id = nextCommentId;
      videoId;
      author = caller;
      text;
      timestamp = Int.abs(Time.now());
    };
    commentsStore.add(nextCommentId, comment);
    let commentId = nextCommentId;
    nextCommentId += 1;
    { commentId; timestamp = comment.timestamp };
  };

  public query ({ caller = _ }) func getCommentsForVideo(
    videoId : VideoId,
    _skip : Nat,
    _limit : Nat,
  ) : async CommentsList {
    let filteredComments = commentsStore.filter(
      func(_id, comment) {
        comment.videoId == videoId;
      }
    );
    let commentsList = filteredComments.values();
    let totalCount = commentsList.size();
    let commentsArray = commentsList.toArray();
    { comments = commentsArray; totalCount };
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  public shared ({ caller }) func addShortUser(title : Text, videoUrl : Text, duration : Nat, moods : [Mood]) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add shorts");
    };
    let short : Short = {
      title;
      videoUrl;
      duration;
      likes = 0;
      moods;
    };
    shorts.add(short);
  };

  public shared ({ caller }) func addShortAdmin(title : Text, videoUrl : Text, duration : Nat, moods : [Mood]) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add shorts");
    };
    let short : Short = {
      title;
      videoUrl;
      duration;
      likes = 0;
      moods;
    };
    shorts.add(short);
  };

  public query ({ caller = _ }) func getShorts() : async [Short] {
    shorts.toArray();
  };

  public shared ({ caller }) func updateMoodPreferences(moodAIEnabled : Bool, currentMood : Mood) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update mood preferences");
    };
    let prefs : UserPreferences = {
      moodAIEnabled;
      currentMood;
    };
    userPreferences.add(caller, prefs);
  };

  public query ({ caller }) func getMoodPreferences() : async UserPreferences {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access mood preferences");
    };
    switch (userPreferences.get(caller)) {
      case (?prefs) { prefs };
      case (null) {
        Runtime.trap("No mood preferences found for caller");
      };
    };
  };

  public shared ({ caller }) func recordMood(mood : Mood) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can record mood");
    };
    let existingHistory = switch (userMoodHistory.get(caller)) {
      case (?history) { history };
      case (null) { List.empty<Mood>() };
    };
    // Remove oldest entry if there are already 10 moods
    if (existingHistory.size() >= 10) {
      let iterator = existingHistory.values();
      switch (iterator.next()) {
        case (null) {};
        case (?_oldestMood) {
          ignore iterator.next();
        };
      };
    };
    existingHistory.add(mood);
    userMoodHistory.add(caller, existingHistory);
  };

  public query ({ caller }) func getMoodHistory() : async [Mood] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access mood history");
    };
    switch (userMoodHistory.get(caller)) {
      case (?history) { history.toArray() };
      case (null) { [] };
    };
  };

  public query ({ caller }) func getRecommendedShorts() : async [Short] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get personalized recommendations");
    };
    let preferences = switch (userPreferences.get(caller)) {
      case (?prefs) { prefs };
      case (null) {
        Runtime.trap("No mood preferences found for caller");
      };
    };
    let preferredMood = if (preferences.moodAIEnabled) {
      switch (userMoodHistory.get(caller)) {
        case (?history) { history.last() };
        case (null) { ?preferences.currentMood };
      };
    } else { ?preferences.currentMood };
    switch (preferredMood) {
      case (null) { shorts.toArray() };
      case (?mood) {
        let recommended = shorts.filter(
          func(short) {
            short.moods.any(
              func(taggedMood) { taggedMood == mood }
            );
          }
        );
        recommended.toArray();
      };
    };
  };

  public shared ({ caller }) func uploadVideoMetadata(
    id : VideoId,
    title : Text,
    description : Text,
    durationSeconds : Nat,
    resolution : Text,
    totalChunks : Nat,
    chunkSize : Nat,
    uploadTimestamp : Nat,
  ) : async () {
    // Only authenticated users can upload videos
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can upload videos");
    };
    if (videoMetadataStore.containsKey(id)) {
      Runtime.trap("VideoId already exists. Please use a unique id.");
    };
    let metadata : VideoMetadata = {
      id;
      title;
      description;
      durationSeconds;
      resolution;
      totalChunks;
      chunkSize;
      uploadedBy = caller;
      uploadTimestamp;
    };
    videoMetadataStore.add(id, metadata);
    videoChunksStore.add(id, Map.empty<Nat, VideoChunk>());
  };

  public shared ({ caller }) func uploadVideoChunk(
    videoId : VideoId,
    chunkNumber : Nat,
    data : Blob,
    size : Nat,
  ) : async () {
    // Only authenticated users can upload chunks
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can upload video chunks");
    };
    switch (videoMetadataStore.get(videoId)) {
      case (null) {
        Runtime.trap("No such videoId found. Please upload metadata first.");
      };
      case (?metadata) {
        // Verify ownership: only the user who created the video can upload chunks
        if (metadata.uploadedBy != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Only the video owner can upload chunks to this video");
        };
        let newChunk : VideoChunk = { chunkNumber; data; size };
        switch (videoChunksStore.get(videoId)) {
          case (null) {
            let newChunkStore = Map.empty<Nat, VideoChunk>();
            newChunkStore.add(chunkNumber, newChunk);
            videoChunksStore.add(videoId, newChunkStore);
          };
          case (?existingChunks) {
            // Always overwrite existing chunks to ensure deterministic behavior
            existingChunks.add(chunkNumber, newChunk);
          };
        };
      };
    };
  };

  public query ({ caller = _ }) func getVideoMetadata(id : VideoId) : async VideoMetadata {
    switch (videoMetadataStore.get(id)) {
      case (?metadata) { metadata };
      case (null) {
        Runtime.trap("No video metadata found for the provided id.");
      };
    };
  };

  public query ({ caller = _ }) func getVideoMetadataList() : async [VideoMetadata] {
    let iter = videoMetadataStore.values();
    iter.toArray();
  };

  public shared ({ caller = _ }) func streamVideo(
    id : VideoId,
    startChunk : Nat,
    endChunk : Nat,
  ) : async {
    #chunks : [StreamChunk];
    #error : Text;
  } {
    switch (videoChunksStore.get(id)) {
      case (null) { #error("No video chunks found for id " # id) };
      case (?chunksStore) {
        // Fetch all requested chunk numbers in range
        let mutableChunks : List.List<StreamChunk> = List.empty<StreamChunk>();

        var currentChunk = startChunk;
        // Use while loop instead of try-catch to avoid throwing error
        while (currentChunk <= endChunk) {
          switch (chunksStore.get(currentChunk)) {
            case (null) {
              return #error("Missing chunk at chunkNumber " # currentChunk.toText());
            };
            case (?chunk) {
              let streamChunk : StreamChunk = {
                chunkNumber = chunk.chunkNumber;
                data = chunk.data;
                size = chunk.size;
              };
              mutableChunks.add(streamChunk);
            };
          };
          currentChunk += 1;
        };
        // All chunks in range found, convert to array and return
        #chunks(mutableChunks.toArray());
      };
    };
  };
};
