import Map "mo:core/Map";
import Nat "mo:core/Nat";
import List "mo:core/List";
import Text "mo:core/Text";
import Array "mo:core/Array";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Order "mo:core/Order";
import Iter "mo:core/Iter";

import MixinStorage "blob-storage/Mixin";
import Storage "blob-storage/Storage";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";



actor {
  type VideoId = Text; // Unique video identifier.

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
    chunkSize : Nat; // Each chunk's size.
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

  let videoMetadataStore = Map.empty<VideoId, VideoMetadata>();
  let videoChunksStore = Map.empty<VideoId, List.List<VideoChunk>>();
  let shorts = List.empty<Short>();
  let userPreferences = Map.empty<Principal, UserPreferences>();
  let userMoodHistory = Map.empty<Principal, List.List<Mood>>();
  let userProfiles = Map.empty<Principal, UserProfile>();
  let accessControlState = AccessControl.initState();

  include MixinStorage();
  include MixinAuthorization(accessControlState);

  // User profile management (required by frontend)
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

  // Content management - Admin only
  public shared ({ caller }) func addShort(title : Text, videoUrl : Text, duration : Nat, moods : [Mood]) : async () {
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

  // Public query - accessible to all including guests
  public query ({ caller }) func getShorts() : async [Short] {
    shorts.toArray();
  };

  // User mood preferences - User only
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

  // User mood history - User only
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

  // Personalized recommendations - User only
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
      case (null) { shorts.toArray() }; // No specific mood, return all shorts
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

  // Video upload and streaming functionality
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
    videoChunksStore.add(id, List.empty<VideoChunk>());
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
            videoChunksStore.add(videoId, List.fromArray<VideoChunk>([newChunk]));
          };
          case (?existingChunks) {
            existingChunks.add(newChunk);
          };
        };
      };
    };
  };

  // Public query - anyone can view video metadata
  public query ({ caller }) func getVideoMetadata(id : VideoId) : async VideoMetadata {
    switch (videoMetadataStore.get(id)) {
      case (?metadata) { metadata };
      case (null) {
        Runtime.trap("No video metadata found for the provided id.");
      };
    };
  };

  // Public query - anyone can list videos
  public query ({ caller }) func getVideoMetadataList() : async [VideoMetadata] {
    let iter = videoMetadataStore.values();
    iter.toArray();
  };

  // Public streaming - anyone can stream videos
  public shared ({ caller }) func streamVideo(
    id : VideoId,
    startChunk : Nat,
    endChunk : Nat,
  ) : async {
    #chunks : [StreamChunk];
    #error : Text;
  } {
    switch (videoChunksStore.get(id)) {
      case (null) { #error("No video chunks found for id " # id) };
      case (?chunks) {
        let filteredChunks = chunks.filter(
          func(chunk) {
            chunk.chunkNumber >= startChunk and chunk.chunkNumber <= endChunk
          }
        );

        let sortedChunks = filteredChunks.toArray().sort(
          func(a, b) {
            Nat.compare(a.chunkNumber, b.chunkNumber);
          }
        );

        let resultChunks = sortedChunks.map(
          func(chunk) {
            {
              chunkNumber = chunk.chunkNumber;
              data = chunk.data;
              size = chunk.size;
            };
          }
        );

        #chunks(resultChunks);
      };
    };
  };
};
