import VideoCard from '@/components/VideoCard';
import { followCopy } from '@/lib/followCopy';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Button } from '@/components/ui/button';
import { Compass } from 'lucide-react';

export default function FollowingPage() {
  const { identity, login } = useInternetIdentity();

  if (!identity) {
    return (
      <div className="container mx-auto flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
        <Compass className="h-16 w-16 text-muted-foreground" />
        <h2 className="mt-4 text-2xl font-bold">{followCopy.page.title}</h2>
        <p className="mt-2 text-muted-foreground">Sign in to see videos from channels you follow</p>
        <Button onClick={login} className="mt-6">
          Sign In
        </Button>
      </div>
    );
  }

  // Mock data - in real app, this would fetch from backend
  const videos = [
    {
      videoId: '1',
      title: 'Latest Video from Followed Channel',
      channelName: 'Followed Creator',
      channelId: 'followed1',
      views: 1234,
      uploadedAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
    },
  ];

  if (videos.length === 0) {
    return (
      <div className="container mx-auto flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
        <Compass className="h-16 w-16 text-muted-foreground" />
        <h2 className="mt-4 text-2xl font-bold">{followCopy.page.emptyState}</h2>
        <p className="mt-2 text-muted-foreground">{followCopy.page.emptyStateDescription}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="mb-6 text-2xl font-bold">{followCopy.page.title}</h1>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {videos.map((video) => (
          <VideoCard key={video.videoId} {...video} />
        ))}
      </div>
    </div>
  );
}
