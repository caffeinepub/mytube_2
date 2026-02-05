import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';

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
