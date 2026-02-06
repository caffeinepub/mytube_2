import { useParams, Link } from '@tanstack/react-router';
import { ThumbsUp, ThumbsDown, Share2, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import VideoPlayer from '@/components/VideoPlayer';
import CommentSection from '@/components/CommentSection';
import FollowButton from '@/components/FollowButton';
import { useMoodSignals } from '../hooks/useMoodSignals';
import { useGetVideoMetadata } from '../hooks/useQueries';
import { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';

export default function WatchPage() {
  const { videoId } = useParams({ from: '/watch/$videoId' });
  const [likes, setLikes] = useState(123);
  const [dislikes, setDislikes] = useState(5);
  const [isLiked, setIsLiked] = useState(false);
  const [isDisliked, setIsDisliked] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [watchStartTime] = useState(Date.now());

  const { data: videoMetadata, isLoading: metadataLoading, error: metadataError } = useGetVideoMetadata(videoId);
  const { recordWatch, recordLike, recordActivity } = useMoodSignals();

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

  const comments = [
    {
      id: '1',
      author: 'John Doe',
      authorId: 'user1',
      content: 'Great video! Really enjoyed the content.',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
    },
    {
      id: '2',
      author: 'Jane Smith',
      authorId: 'user2',
      content: 'Thanks for sharing this. Very informative!',
      createdAt: new Date(Date.now() - 1000 * 60 * 60),
    },
  ];

  const handleLike = () => {
    if (isLiked) {
      setLikes(likes - 1);
      setIsLiked(false);
    } else {
      setLikes(likes + 1);
      setIsLiked(true);
      recordLike();
      if (isDisliked) {
        setDislikes(dislikes - 1);
        setIsDisliked(false);
      }
    }
  };

  const handleDislike = () => {
    if (isDisliked) {
      setDislikes(dislikes - 1);
      setIsDisliked(false);
    } else {
      setDislikes(dislikes + 1);
      setIsDisliked(true);
      if (isLiked) {
        setLikes(likes - 1);
        setIsLiked(false);
      }
    }
  };

  const handleShare = () => {
    recordActivity();
  };

  const handleFollow = () => {
    recordActivity();
  };

  const handleComment = () => {
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
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>
                Failed to load video metadata. The video may not exist or you may not have permission to view it.
              </AlertDescription>
            </Alert>
          ) : (
            <VideoPlayer
              videoId={videoId}
              title={videoMetadata?.title || 'Video'}
              isOffline={isOffline}
              metadata={videoMetadata ? {
                totalChunks: Number(videoMetadata.totalChunks),
                chunkSize: Number(videoMetadata.chunkSize),
              } : undefined}
            />
          )}

          <div className="mt-4 space-y-4">
            {metadataLoading ? (
              <>
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-20 w-full" />
              </>
            ) : videoMetadata ? (
              <>
                <div className="flex items-start justify-between gap-4">
                  <h1 className="text-xl font-bold">{videoMetadata.title}</h1>
                  {getResolutionBadge(videoMetadata.resolution)}
                </div>

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

                  <div className="flex items-center gap-2">
                    <div className="flex items-center rounded-full bg-secondary">
                      <Button
                        variant="ghost"
                        size="sm"
                        className={`rounded-l-full ${isLiked ? 'text-primary' : ''}`}
                        onClick={handleLike}
                      >
                        <ThumbsUp className="mr-2 h-4 w-4" />
                        {likes}
                      </Button>
                      <Separator orientation="vertical" className="h-6" />
                      <Button
                        variant="ghost"
                        size="sm"
                        className={`rounded-r-full ${isDisliked ? 'text-primary' : ''}`}
                        onClick={handleDislike}
                      >
                        <ThumbsDown className="h-4 w-4" />
                      </Button>
                    </div>
                    <Button variant="secondary" size="sm" className="rounded-full" onClick={handleShare}>
                      <Share2 className="mr-2 h-4 w-4" />
                      Share
                    </Button>
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
            ) : (
              <Alert>
                <AlertDescription>Video not found.</AlertDescription>
              </Alert>
            )}

            <Separator />

            <div onClick={handleComment}>
              <CommentSection videoId={videoId} comments={comments} />
            </div>
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
