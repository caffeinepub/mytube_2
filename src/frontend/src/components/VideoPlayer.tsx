import { WifiOff } from 'lucide-react';

interface VideoPlayerProps {
  videoId: string;
  title: string;
  isOffline?: boolean;
}

export default function VideoPlayer({ videoId, title, isOffline = false }: VideoPlayerProps) {
  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-black">
      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#d97398]/10 via-[#8eb5c0]/10 to-[#5fc4d4]/10">
        <div className="text-center">
          {isOffline ? (
            <>
              <WifiOff className="mx-auto mb-4 h-16 w-16 text-white/30" />
              <p className="text-xl font-semibold text-white/60">Video Unavailable Offline</p>
              <p className="mt-2 text-sm text-white/40">
                Connect to the internet to watch this video
              </p>
            </>
          ) : (
            <>
              <p className="text-6xl font-bold text-white/20">mytube</p>
              <p className="mt-4 text-sm text-white/60">Video Player Placeholder</p>
              <p className="mt-1 text-xs text-white/40">Video ID: {videoId}</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
