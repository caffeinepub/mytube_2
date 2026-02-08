import { useParams, Link } from '@tanstack/react-router';
import { WifiOff } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import VideoPlayer from '@/components/VideoPlayer';
import CommentSection, { CommentSectionRef } from '@/components/CommentSection';
import FollowButton from '@/components/FollowButton';
import WatchActionBar from '@/components/watch/WatchActionBar';
import { useWatchShare } from '@/components/watch/useWatchShare';
import { useMoodSignals } from '../hooks/useMoodSignals';
import { useGetVideoMetadata, useGetVideoInteractionSummary, useGetVideoInteractionState, useUpdateVideoInteraction } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useState, useEffect, useRef } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

export default function WatchPage() {
  const { videoId } = useParams({ from: '/watch/$videoId' });
  const { identity, login } = useInternetIdentity();
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [watchStartTime] = useState(Date.now());
  const [videoBlobUrl, setVideoBlobUrl] = useState<string | null>(null);
  const commentSectionRef = useRef<CommentSectionRef>(null);

  const { data: videoMetadata, isLoading: metadataLoading, error: metadataError } = useGetVideoMetadata(videoId);
  const { data: interactionSummary } = useGetVideoInteractionSummary(videoId);
  const { data: interactionState } = useGetVideoInteractionState(videoId);
  const updateInteractionMutation = useUpdateVideoInteraction();
  const { recordWatch, recordLike, recordActivity } = useMoodSignals();
  const { share: shareVideo } = useWatchShare(videoId, videoMetadata?.title || 'Video');

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Record watch time on unmount
  useEffect(() => {
    return () => {
      const watchDuration = (Date.now() - watchStartTime) / 1000;
      if (watchDuration > 5) {
        recordWatch(watchDuration);
      }
    };
  }, [watchStartTime, recordWatch]);

  // Mock data for fields not yet in backend
  const mockData = {
    channelName: 'Content Creator',
    channelId: 'creator123',
    views: 1234,
  };

  const handleLike = async () => {
    if (!identity) {
      login();
      return;
    }

    const newLiked = !interactionState?.liked;
    const newDisliked = false; // Clear dislike when liking

    try {
      await updateInteractionMutation.mutateAsync({
        videoId,
        like: newLiked,
        dislike: newDisliked,
        saved: interactionState?.saved || false,
      });
      if (newLiked) {
        recordLike();
      }
    } catch (error: any) {
      console.error('Failed to update like:', error);
      toast.error('Failed to update like. Please try again.');
    }
  };

  const handleDislike = async () => {
    if (!identity) {
      login();
      return;
    }

    const newDisliked = !interactionState?.disliked;
    const newLiked = false; // Clear like when disliking

    try {
      await updateInteractionMutation.mutateAsync({
        videoId,
        like: newLiked,
        dislike: newDisliked,
        saved: interactionState?.saved || false,
      });
    } catch (error: any) {
      console.error('Failed to update dislike:', error);
      toast.error('Failed to update dislike. Please try again.');
    }
  };

  const handleSave = async () => {
    if (!identity) {
      login();
      return;
    }

    const newSaved = !interactionState?.saved;

    try {
      await updateInteractionMutation.mutateAsync({
        videoId,
        like: interactionState?.liked || false,
        dislike: interactionState?.disliked || false,
        saved: newSaved,
      });
      recordActivity();
      toast.success(newSaved ? 'Video saved!' : 'Video removed from saved');
    } catch (error: any) {
      console.error('Failed to update save:', error);
      toast.error('Failed to save video. Please try again.');
    }
  };

  const handleComment = () => {
    if (!identity) {
      login();
      return;
    }
    recordActivity();
    // Focus the comment input
    commentSectionRef.current?.focusInput();
  };

  const handleShare = async () => {
    recordActivity();
    await shareVideo();
  };

  const handleDownload = () => {
    if (!videoBlobUrl) {
      toast.error('Video not ready for download');
      return;
    }

    try {
      const link = document.createElement('a');
      link.href = videoBlobUrl;
      link.download = `${videoMetadata?.title || 'video'}.mp4`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Download started!');
      recordActivity();
    } catch (error) {
      console.error('Download failed:', error);
      toast.error('Failed to download video');
    }
  };

  const handleFollow = () => {
    recordActivity();
  };

  // Helper to get resolution badge
  const getResolutionBadge = (resolution: string) => {
    const highRes = ['4K', '8K', '2K'];
    if (highRes.some(res => resolution.includes(res))) {
      return (
        <Badge variant="secondary" className="bg-primary/20 text-primary">
          {resolution}
        </Badge>
      );
    }
    return null;
  };

  return (
    <div className="container mx-auto px-4 py-6">
      {isOffline && (
        <Alert className="mb-4 border-warning bg-warning/10">
          <WifiOff className="h-4 w-4" />
          <AlertDescription>
            You are currently offline. Some content may not be available.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {metadataLoading ? (
            <Skeleton className="aspect-video w-full rounded-xl" />
          ) : metadataError ? (
            <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-black">
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#d97398]/10 via-[#8eb5c0]/10 to-[#5fc4d4]/10 p-8">
                <Alert variant="destructive" className="max-w-md">
                  <AlertDescription>
                    Failed to load video metadata. The video may not exist or you may not have permission to view it.
                  </AlertDescription>
                </Alert>
              </div>
            </div>
          ) : videoMetadata ? (
            <VideoPlayer
              videoId={videoId}
              title={videoMetadata.title}
              isOffline={isOffline}
              metadata={{
                totalChunks: Number(videoMetadata.totalChunks),
                chunkSize: Number(videoMetadata.chunkSize),
              }}
              onBlobUrlReady={setVideoBlobUrl}
            />
          ) : null}

          <div className="mt-4 space-y-4">
            {metadataLoading ? (
              <>
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-20 w-full" />
              </>
            ) : metadataError ? (
              <Alert variant="destructive">
                <AlertDescription>
                  Failed to load video information. Please try again later.
                </AlertDescription>
              </Alert>
            ) : videoMetadata ? (
              <>
                <div className="flex items-start justify-between gap-4">
                  <h1 className="text-xl font-bold">{videoMetadata.title}</h1>
                  {getResolutionBadge(videoMetadata.resolution)}
                </div>

                {/* Action Bar */}
                <WatchActionBar
                  likeCount={Number(interactionSummary?.likeCount || 0n)}
                  dislikeCount={Number(interactionSummary?.dislikeCount || 0n)}
                  commentCount={Number(interactionSummary?.commentCount || 0n)}
                  savedCount={Number(interactionSummary?.savedCount || 0n)}
                  isLiked={interactionState?.liked || false}
                  isDisliked={interactionState?.disliked || false}
                  isSaved={interactionState?.saved || false}
                  onLike={handleLike}
                  onDislike={handleDislike}
                  onComment={handleComment}
                  onShare={handleShare}
                  onSave={handleSave}
                  onDownload={handleDownload}
                  isLoading={updateInteractionMutation.isPending}
                />

                {/* Channel Info */}
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <Link to="/channel/$channelId" params={{ channelId: mockData.channelId }}>
                      <Avatar className="h-10 w-10">
                        <AvatarImage src="" />
                        <AvatarFallback className="bg-gradient-to-br from-[#d97398] to-[#5fc4d4] text-white">
                          {mockData.channelName.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </Link>
                    <div>
                      <Link to="/channel/$channelId" params={{ channelId: mockData.channelId }}>
                        <p className="font-semibold hover:text-primary">{mockData.channelName}</p>
                      </Link>
                      <p className="text-xs text-muted-foreground">1.2K followers</p>
                    </div>
                    <div onClick={handleFollow}>
                      <FollowButton channelId={mockData.channelId} isFollowing={false} />
                    </div>
                  </div>
                </div>

                <div className="rounded-xl bg-secondary/50 p-4">
                  <p className="text-sm font-semibold">
                    {mockData.views.toLocaleString()} views •{' '}
                    {formatDistanceToNow(new Date(Number(videoMetadata.uploadTimestamp)), { addSuffix: true })}
                  </p>
                  <p className="mt-2 text-sm text-foreground">{videoMetadata.description || 'No description provided.'}</p>
                </div>
              </>
            ) : null}

            <Separator />

            <CommentSection ref={commentSectionRef} videoId={videoId} />
          </div>
        </div>

        <div className="lg:col-span-1">
          <h2 className="mb-4 text-lg font-semibold">Suggested Videos</h2>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-2">
                <div className="h-24 w-40 flex-shrink-0 overflow-hidden rounded-lg bg-gradient-to-br from-[#d97398]/20 via-[#8eb5c0]/20 to-[#5fc4d4]/20" />
                <div className="flex-1">
                  <h3 className="line-clamp-2 text-sm font-semibold">Suggested Video Title {i}</h3>
                  <p className="mt-1 text-xs text-muted-foreground">Channel Name</p>
                  <p className="text-xs text-muted-foreground">100K views • 1 day ago</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
