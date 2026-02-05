import { useParams, Link } from '@tanstack/react-router';
import { ThumbsUp, ThumbsDown, Share2, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import VideoPlayer from '@/components/VideoPlayer';
import CommentSection from '@/components/CommentSection';
import FollowButton from '@/components/FollowButton';
import { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';

export default function WatchPage() {
  const { videoId } = useParams({ from: '/watch/$videoId' });
  const [likes, setLikes] = useState(123);
  const [dislikes, setDislikes] = useState(5);
  const [isLiked, setIsLiked] = useState(false);
  const [isDisliked, setIsDisliked] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

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

  // Mock data
  const video = {
    id: videoId,
    title: 'Amazing Video Title - You Won\'t Believe What Happens Next!',
    channelName: 'Content Creator',
    channelId: 'creator123',
    views: 1234,
    uploadedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
    description:
      'This is an amazing video description that tells you all about the content. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
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
          <VideoPlayer videoId={videoId} title={video.title} isOffline={isOffline} />

          <div className="mt-4 space-y-4">
            <h1 className="text-xl font-bold">{video.title}</h1>

            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Link to="/channel/$channelId" params={{ channelId: video.channelId }}>
                  <Avatar className="h-10 w-10">
                    <AvatarImage src="" />
                    <AvatarFallback className="bg-gradient-to-br from-[#d97398] to-[#5fc4d4] text-white">
                      {video.channelName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Link>
                <div>
                  <Link to="/channel/$channelId" params={{ channelId: video.channelId }}>
                    <p className="font-semibold hover:text-primary">{video.channelName}</p>
                  </Link>
                  <p className="text-xs text-muted-foreground">1.2K followers</p>
                </div>
                <FollowButton channelId={video.channelId} isFollowing={false} />
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
                <Button variant="secondary" size="sm" className="rounded-full">
                  <Share2 className="mr-2 h-4 w-4" />
                  Share
                </Button>
              </div>
            </div>

            <div className="rounded-xl bg-secondary/50 p-4">
              <p className="text-sm font-semibold">
                {video.views.toLocaleString()} views •{' '}
                {formatDistanceToNow(video.uploadedAt, { addSuffix: true })}
              </p>
              <p className="mt-2 text-sm text-foreground">{video.description}</p>
            </div>

            <Separator />

            <CommentSection videoId={videoId} comments={comments} />
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
