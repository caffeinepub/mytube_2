import { WifiOff, Loader2 } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import { useActor } from '../hooks/useActor';
import { VideoStreamSource } from '../lib/videoStreamSource';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface VideoPlayerProps {
  videoId: string;
  title: string;
  isOffline?: boolean;
  metadata?: {
    totalChunks: number;
    chunkSize: number;
  };
}

export default function VideoPlayer({ videoId, title, isOffline = false, metadata }: VideoPlayerProps) {
  const { actor } = useActor();
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadProgress, setLoadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (isOffline || !actor || !metadata) {
      return;
    }

    let isMounted = true;
    let blobUrl: string | null = null;

    const loadVideo = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const streamSource = new VideoStreamSource(
          videoId,
          actor,
          Number(metadata.totalChunks),
          Number(metadata.chunkSize)
        );

        blobUrl = await streamSource.createBlobUrl((percentage) => {
          if (isMounted) {
            setLoadProgress(percentage);
          }
        });

        if (isMounted) {
          setVideoUrl(blobUrl);
          setIsLoading(false);
        }
      } catch (err: any) {
        console.error('Error loading video:', err);
        if (isMounted) {
          setError(err.message || 'Failed to load video. Please try again.');
          setIsLoading(false);
        }
      }
    };

    loadVideo();

    return () => {
      isMounted = false;
      if (blobUrl) {
        VideoStreamSource.revokeBlobUrl(blobUrl);
      }
    };
  }, [videoId, actor, isOffline, metadata]);

  if (isOffline) {
    return (
      <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-black">
        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#d97398]/10 via-[#8eb5c0]/10 to-[#5fc4d4]/10">
          <div className="text-center">
            <WifiOff className="mx-auto mb-4 h-16 w-16 text-white/30" />
            <p className="text-xl font-semibold text-white/60">Video Unavailable Offline</p>
            <p className="mt-2 text-sm text-white/40">
              Connect to the internet to watch this video
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!metadata) {
    return (
      <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-black">
        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#d97398]/10 via-[#8eb5c0]/10 to-[#5fc4d4]/10">
          <div className="text-center">
            <p className="text-6xl font-bold text-white/20">mytube</p>
            <p className="mt-4 text-sm text-white/60">Video Player Placeholder</p>
            <p className="mt-1 text-xs text-white/40">Video ID: {videoId}</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-black">
        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#d97398]/10 via-[#8eb5c0]/10 to-[#5fc4d4]/10 p-8">
          <Alert variant="destructive" className="max-w-md">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-black">
        <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-[#d97398]/10 via-[#8eb5c0]/10 to-[#5fc4d4]/10">
          <Loader2 className="h-12 w-12 animate-spin text-white/60" />
          <p className="mt-4 text-sm text-white/60">Loading video...</p>
          <p className="mt-2 text-xs text-white/40">{loadProgress}%</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-black">
      {videoUrl ? (
        <video
          ref={videoRef}
          src={videoUrl}
          controls
          className="h-full w-full"
          title={title}
        >
          Your browser does not support the video tag.
        </video>
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#d97398]/10 via-[#8eb5c0]/10 to-[#5fc4d4]/10">
          <p className="text-white/60">Preparing video...</p>
        </div>
      )}
    </div>
  );
}
