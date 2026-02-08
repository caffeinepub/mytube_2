import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import VideoCard from '@/components/VideoCard';
import { Skeleton } from '@/components/ui/skeleton';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetVideoMetadataList, useGetSavedVideos } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Library as LibraryIcon } from 'lucide-react';

export default function LibraryPage() {
  const { identity, login } = useInternetIdentity();
  const { data: allVideos = [], isLoading: allVideosLoading } = useGetVideoMetadataList();
  const { data: savedVideos = [], isLoading: savedVideosLoading } = useGetSavedVideos();

  if (!identity) {
    return (
      <div className="container mx-auto flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
        <LibraryIcon className="h-16 w-16 text-muted-foreground" />
        <h2 className="mt-4 text-2xl font-bold">Your Library</h2>
        <p className="mt-2 text-muted-foreground">Sign in to access your uploaded, liked, and saved videos</p>
        <Button onClick={login} className="mt-6">
          Sign In
        </Button>
      </div>
    );
  }

  // Filter uploaded videos by current user
  const uploadedVideos = allVideos.filter(
    (video) => video.uploadedBy.toString() === identity.getPrincipal().toString()
  );

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="mb-6 text-2xl font-bold">Library</h1>

      <Tabs defaultValue="uploads" className="w-full">
        <TabsList>
          <TabsTrigger value="uploads">Your Videos</TabsTrigger>
          <TabsTrigger value="liked">Liked Videos</TabsTrigger>
          <TabsTrigger value="saved">Saved Videos</TabsTrigger>
        </TabsList>

        <TabsContent value="uploads" className="mt-6">
          {allVideosLoading ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="aspect-video w-full rounded-lg" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              ))}
            </div>
          ) : uploadedVideos.length === 0 ? (
            <div className="flex min-h-[40vh] flex-col items-center justify-center text-center">
              <p className="text-muted-foreground">You haven't uploaded any videos yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {uploadedVideos.map((video) => (
                <VideoCard
                  key={video.id}
                  videoId={video.id}
                  title={video.title}
                  channelName="You"
                  channelId={identity.getPrincipal().toString()}
                  views={0}
                  uploadedAt={new Date(Number(video.uploadTimestamp))}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="liked" className="mt-6">
          <div className="flex min-h-[40vh] flex-col items-center justify-center text-center">
            <p className="text-muted-foreground">Liked videos feature coming soon</p>
          </div>
        </TabsContent>

        <TabsContent value="saved" className="mt-6">
          {savedVideosLoading ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="aspect-video w-full rounded-lg" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              ))}
            </div>
          ) : savedVideos.length === 0 ? (
            <div className="flex min-h-[40vh] flex-col items-center justify-center text-center">
              <p className="text-muted-foreground">You haven't saved any videos yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {savedVideos.map((video) => (
                <VideoCard
                  key={video.id}
                  videoId={video.id}
                  title={video.title}
                  channelName="Creator"
                  channelId={video.uploadedBy.toString()}
                  views={0}
                  uploadedAt={new Date(Number(video.uploadTimestamp))}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
