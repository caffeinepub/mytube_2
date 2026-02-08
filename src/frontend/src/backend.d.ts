import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface InteractionState {
    liked: boolean;
    saved: boolean;
    disliked: boolean;
}
export interface UserPreferences {
    moodAIEnabled: boolean;
    currentMood: Mood;
}
export type CommentId = bigint;
export interface Short {
    moods: Array<Mood>;
    title: string;
    duration: bigint;
    likes: bigint;
    videoUrl: string;
}
export interface Comment {
    id: CommentId;
    text: string;
    author: Principal;
    timestamp: bigint;
    videoId: VideoId;
}
export interface CommentsList {
    totalCount: bigint;
    comments: Array<Comment>;
}
export interface CreatedCommentEvent {
    commentId: CommentId;
    timestamp: bigint;
}
export interface VideoInteractionSummary {
    dislikeCount: bigint;
    likeCount: bigint;
    commentCount: bigint;
    savedCount: bigint;
}
export type VideoId = string;
export interface StreamChunk {
    chunkNumber: bigint;
    data: Uint8Array;
    size: bigint;
}
export interface VideoMetadata {
    id: VideoId;
    title: string;
    description: string;
    uploadTimestamp: bigint;
    resolution: string;
    totalChunks: bigint;
    durationSeconds: bigint;
    chunkSize: bigint;
    uploadedBy: Principal;
}
export interface VideoInteractionRequest {
    like: boolean;
    saved: boolean;
    dislike: boolean;
    videoId: VideoId;
}
export interface UserProfile {
    bio: string;
    username: string;
    twitter: string;
    displayName: string;
    instagram: string;
    website: string;
    facebook: string;
    youtube: string;
    bannerUrl: string;
    profilePhotoUrl: string;
}
export enum Mood {
    sad = "sad",
    happy = "happy",
    chill = "chill",
    excited = "excited"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addComment(videoId: VideoId, text: string): Promise<CreatedCommentEvent>;
    addShortAdmin(title: string, videoUrl: string, duration: bigint, moods: Array<Mood>): Promise<void>;
    addShortUser(title: string, videoUrl: string, duration: bigint, moods: Array<Mood>): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCommentsForVideo(videoId: VideoId, _skip: bigint, _limit: bigint): Promise<CommentsList>;
    getMoodHistory(): Promise<Array<Mood>>;
    getMoodPreferences(): Promise<UserPreferences>;
    getRecommendedShorts(): Promise<Array<Short>>;
    getShorts(): Promise<Array<Short>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getVideoInteractionState(videoId: VideoId): Promise<InteractionState>;
    getVideoInteractionSummary(videoId: VideoId): Promise<VideoInteractionSummary>;
    getVideoMetadata(id: VideoId): Promise<VideoMetadata>;
    getVideoMetadataList(): Promise<Array<VideoMetadata>>;
    isCallerAdmin(): Promise<boolean>;
    recordMood(mood: Mood): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    streamVideo(id: VideoId, startChunk: bigint, endChunk: bigint): Promise<{
        __kind__: "error";
        error: string;
    } | {
        __kind__: "chunks";
        chunks: Array<StreamChunk>;
    }>;
    updateMoodPreferences(moodAIEnabled: boolean, currentMood: Mood): Promise<void>;
    updateVideoInteraction(request: VideoInteractionRequest): Promise<void>;
    uploadVideoChunk(videoId: VideoId, chunkNumber: bigint, data: Uint8Array, size: bigint): Promise<void>;
    uploadVideoMetadata(id: VideoId, title: string, description: string, durationSeconds: bigint, resolution: string, totalChunks: bigint, chunkSize: bigint, uploadTimestamp: bigint): Promise<void>;
}
