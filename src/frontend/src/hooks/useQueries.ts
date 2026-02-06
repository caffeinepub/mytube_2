import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { Short, UserPreferences, Mood, UserProfile, VideoMetadata } from '../backend';
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

  return useQuery<VideoMetadata | null>({
    queryKey: ['videoMetadata', videoId],
    queryFn: async () => {
      if (!actor) return null;
      try {
        return await actor.getVideoMetadata(videoId);
      } catch (error: any) {
        console.error('Error fetching video metadata:', error);
        return null;
      }
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
      await actor.addShort(title, videoUrl, duration, moods);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shorts'] });
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
export function useGetUserProfile(userId: string) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<UserProfile | null>({
    queryKey: ['userProfile', userId],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      try {
        const principal = Principal.fromText(userId);
        return await actor.getUserProfile(principal);
      } catch (error: any) {
        // If unauthorized or profile doesn't exist, return null
        if (error.message?.includes('Unauthorized') || error.message?.includes('not found')) {
          return null;
        }
        throw error;
      }
    },
    enabled: !!actor && !actorFetching && !!userId,
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
    onSuccess: (_, profile) => {
      // Invalidate current user profile
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      // Also invalidate the viewed profile if it matches the caller
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
    },
  });
}
