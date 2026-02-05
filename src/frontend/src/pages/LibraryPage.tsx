import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import VideoCard from '@/components/VideoCard';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Button } from '@/components/ui/button';
import { Library as LibraryIcon } from 'lucide-react';

export default function LibraryPage() {
  const { identity, login } = useInternetIdentity();

  if (!identity) {
    return (
      <div className="container mx-auto flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
        <LibraryIcon className="h-16 w-16 text-muted-foreground" />
        <h2 className="mt-4 text-2xl font-bold">Your Library</h2>
        <p className="mt-2 text-muted-foreground">Sign in to access your uploaded and liked videos</p>
        <Button onClick={login} className="mt-6">
          Sign In
        </Button>
      </div>
    );
  }

  // Mock data
  const uploadedVideos = [
    {
      videoId: '1',
      title: 'My First Upload',
      channelName: 'You',
      channelId: identity.getPrincipal().toString(),
      views: 123,
      uploadedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
    },
  ];

  const likedVideos = [
    {
      videoId: '2',
      title: 'Liked Video 1',
      channelName: 'Other Creator',
      channelId: 'other1',
      views: 456,
      uploadedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
    },
  ];

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="mb-6 text-2xl font-bold">Library</h1>

      <Tabs defaultValue="uploads" className="w-full">
        <TabsList>
          <TabsTrigger value="uploads">Your Videos</TabsTrigger>
          <TabsTrigger value="liked">Liked Videos</TabsTrigger>
        </TabsList>

        <TabsContent value="uploads" className="mt-6">
          {uploadedVideos.length === 0 ? (
            <div className="flex min-h-[40vh] flex-col items-center justify-center text-center">
              <p className="text-muted-foreground">You haven't uploaded any videos yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {uploadedVideos.map((video) => (
                <VideoCard key={video.videoId} {...video} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="liked" className="mt-6">
          {likedVideos.length === 0 ? (
            <div className="flex min-h-[40vh] flex-col items-center justify-center text-center">
              <p className="text-muted-foreground">You haven't liked any videos yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {likedVideos.map((video) => (
                <VideoCard key={video.videoId} {...video} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
