import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { Short, UserPreferences, Mood, UserProfile, VideoMetadata, VideoInteractionSummary, InteractionState, Comment, CommentsList } from '../backend';
import { Principal } from '@dfinity/principal';

// Placeholder hooks for future backend integration
// Currently using mock data in components

export function useGetVideos() {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['videos'],
    queryFn: async () => {
      if (!actor) return [];
      // TODO: Implement backend call
      return [];
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetVideo(videoId: string) {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['video', videoId],
    queryFn: async () => {
      if (!actor) return null;
      // TODO: Implement backend call
      return null;
    },
    enabled: !!actor && !isFetching && !!videoId,
  });
}

// Video metadata queries
export function useGetVideoMetadata(videoId: string) {
  const { actor, isFetching } = useActor();

  return useQuery<VideoMetadata>({
    queryKey: ['videoMetadata', videoId],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return await actor.getVideoMetadata(videoId);
    },
    enabled: !!actor && !isFetching && !!videoId,
    retry: false,
  });
}

export function useGetVideoMetadataList() {
  const { actor, isFetching } = useActor();

  return useQuery<VideoMetadata[]>({
    queryKey: ['videoMetadataList'],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getVideoMetadataList();
      } catch (error: any) {
        console.error('Error fetching video list:', error);
        return [];
      }
    },
    enabled: !!actor && !isFetching,
  });
}

// Video Interaction Queries
export function useGetVideoInteractionSummary(videoId: string) {
  const { actor, isFetching } = useActor();

  return useQuery<VideoInteractionSummary>({
    queryKey: ['videoInteractionSummary', videoId],
    queryFn: async () => {
      if (!actor) {
        return {
          likeCount: 0n,
          dislikeCount: 0n,
          commentCount: 0n,
          savedCount: 0n,
        };
      }
      try {
        return await actor.getVideoInteractionSummary(videoId);
      } catch (error: any) {
        console.error('Error fetching interaction summary:', error);
        return {
          likeCount: 0n,
          dislikeCount: 0n,
          commentCount: 0n,
          savedCount: 0n,
        };
      }
    },
    enabled: !!actor && !isFetching && !!videoId,
  });
}

export function useGetVideoInteractionState(videoId: string) {
  const { actor, isFetching } = useActor();

  return useQuery<InteractionState>({
    queryKey: ['videoInteractionState', videoId],
    queryFn: async () => {
      if (!actor) {
        return { liked: false, disliked: false, saved: false };
      }
      try {
        return await actor.getVideoInteractionState(videoId);
      } catch (error: any) {
        console.error('Error fetching interaction state:', error);
        return { liked: false, disliked: false, saved: false };
      }
    },
    enabled: !!actor && !isFetching && !!videoId,
  });
}

export function useUpdateVideoInteraction() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ videoId, like, dislike, saved }: { videoId: string; like: boolean; dislike: boolean; saved: boolean }) => {
      if (!actor) throw new Error('Not authenticated');
      await actor.updateVideoInteraction({
        videoId,
        like,
        dislike,
        saved,
      });
    },
    onSuccess: (_, variables) => {
      // Invalidate both summary and state for this video
      queryClient.invalidateQueries({ queryKey: ['videoInteractionSummary', variables.videoId] });
      queryClient.invalidateQueries({ queryKey: ['videoInteractionState', variables.videoId] });
      // Also invalidate saved videos list
      queryClient.invalidateQueries({ queryKey: ['savedVideos'] });
    },
  });
}

// Comments
export function useGetCommentsForVideo(videoId: string) {
  const { actor, isFetching } = useActor();

  return useQuery<Comment[]>({
    queryKey: ['comments', videoId],
    queryFn: async () => {
      if (!actor) return [];
      try {
        const result: CommentsList = await actor.getCommentsForVideo(videoId, 0n, 100n);
        return result.comments;
      } catch (error: any) {
        console.error('Error fetching comments:', error);
        return [];
      }
    },
    enabled: !!actor && !isFetching && !!videoId,
  });
}

export function useAddComment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ videoId, text }: { videoId: string; text: string }) => {
      if (!actor) throw new Error('Not authenticated');
      return await actor.addComment(videoId, text);
    },
    onSuccess: (_, variables) => {
      // Invalidate comments list and interaction summary (for comment count)
      queryClient.invalidateQueries({ queryKey: ['comments', variables.videoId] });
      queryClient.invalidateQueries({ queryKey: ['videoInteractionSummary', variables.videoId] });
    },
  });
}

// Saved Videos List
export function useGetSavedVideos() {
  const { actor, isFetching } = useActor();

  return useQuery<VideoMetadata[]>({
    queryKey: ['savedVideos'],
    queryFn: async () => {
      if (!actor) return [];
      try {
        // Get all videos
        const allVideos = await actor.getVideoMetadataList();
        
        // Filter for saved videos by checking interaction state
        const savedVideos: VideoMetadata[] = [];
        for (const video of allVideos) {
          try {
            const state = await actor.getVideoInteractionState(video.id);
            if (state.saved) {
              savedVideos.push(video);
            }
          } catch (error) {
            // Skip videos we can't check state for
            continue;
          }
        }
        
        return savedVideos;
      } catch (error: any) {
        console.error('Error fetching saved videos:', error);
        return [];
      }
    },
    enabled: !!actor && !isFetching,
  });
}

export function useFollowChannel() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ channelId, follow }: { channelId: string; follow: boolean }) => {
      if (!actor) throw new Error('Not authenticated');
      // TODO: Implement backend call
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['following'] });
      queryClient.invalidateQueries({ queryKey: ['channel'] });
    },
  });
}

export function useGetShorts() {
  const { actor, isFetching } = useActor();

  return useQuery<Short[]>({
    queryKey: ['shorts'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getShorts();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useUploadShort() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ title, videoUrl, duration, moods }: { title: string; videoUrl: string; duration: bigint; moods: Mood[] }) => {
      if (!actor) throw new Error('Not authenticated');
      try {
        await actor.addShortUser(title, videoUrl, duration, moods);
      } catch (error: any) {
        // Normalize error messages for UI display
        const message = error?.message || 'Failed to upload short. Please try again.';
        if (message.includes('Unauthorized')) {
          throw new Error('You must be signed in to upload shorts.');
        }
        throw new Error(message);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shorts'] });
      queryClient.invalidateQueries({ queryKey: ['recommendedShorts'] });
    },
  });
}

// Mood AI Preferences
export function useGetMoodPreferences() {
  const { actor, isFetching } = useActor();

  return useQuery<UserPreferences | null>({
    queryKey: ['moodPreferences'],
    queryFn: async () => {
      if (!actor) return null;
      try {
        return await actor.getMoodPreferences();
      } catch (error: any) {
        // If no preferences exist yet, return null instead of throwing
        if (error.message?.includes('No mood preferences found')) {
          return null;
        }
        throw error;
      }
    },
    enabled: !!actor && !isFetching,
    retry: false,
  });
}

export function useUpdateMoodPreferences() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ moodAIEnabled, currentMood }: { moodAIEnabled: boolean; currentMood: Mood }) => {
      if (!actor) throw new Error('Not authenticated');
      await actor.updateMoodPreferences(moodAIEnabled, currentMood);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['moodPreferences'] });
      queryClient.invalidateQueries({ queryKey: ['recommendedShorts'] });
    },
  });
}

// Recommended Shorts
export function useGetRecommendedShorts(enabled: boolean = true) {
  const { actor, isFetching } = useActor();

  return useQuery<Short[]>({
    queryKey: ['recommendedShorts'],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getRecommendedShorts();
      } catch (error: any) {
        // If no preferences exist, fall back to regular shorts
        if (error.message?.includes('No mood preferences found') || error.message?.includes('Unauthorized')) {
          return [];
        }
        throw error;
      }
    },
    enabled: !!actor && !isFetching && enabled,
    retry: false,
  });
}

// User Profile - Current User
export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

// User Profile - Any User (for viewing other profiles)
export function useGetUserProfile(user: Principal | null) {
  const { actor, isFetching } = useActor();

  return useQuery<UserProfile | null>({
    queryKey: ['userProfile', user?.toString()],
    queryFn: async () => {
      if (!actor || !user) return null;
      return actor.getUserProfile(user);
    },
    enabled: !!actor && !isFetching && !!user,
    retry: false,
  });
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Not authenticated');
      await actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}
