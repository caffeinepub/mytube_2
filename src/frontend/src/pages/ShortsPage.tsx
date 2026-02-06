import { useEffect, useRef, useState } from 'react';
import { useGetShorts, useGetRecommendedShorts, useGetMoodPreferences } from '../hooks/useQueries';
import { useMoodSignals } from '../hooks/useMoodSignals';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, MessageCircle, Share2, Play } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import type { Short, Mood } from '../backend';

export default function ShortsPage() {
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;

  // Mood AI preferences
  const { data: preferences } = useGetMoodPreferences();
  const moodAIEnabled = preferences?.moodAIEnabled ?? false;
  const selectedMood = preferences?.currentMood;

  // Mood signals tracking
  const { inferredMood, recordWatch, recordLike, recordActivity } = useMoodSignals();

  // Determine active mood: prefer selected mood, fall back to inferred
  const activeMood: Mood | null = selectedMood ?? (moodAIEnabled ? inferredMood : null);

  // Fetch shorts
  const { data: defaultShorts, isLoading: defaultLoading, error: defaultError } = useGetShorts();
  const { data: recommendedShorts, isLoading: recommendedLoading } = useGetRecommendedShorts(
    isAuthenticated && moodAIEnabled && !!activeMood
  );

  // Choose which shorts to display
  const shouldUseRecommended = isAuthenticated && moodAIEnabled && !!activeMood && recommendedShorts && recommendedShorts.length > 0;
  const shorts = shouldUseRecommended ? recommendedShorts : defaultShorts;
  const isLoading = shouldUseRecommended ? recommendedLoading : defaultLoading;
  const error = defaultError;

  // Local filtering fallback if backend returns empty but we have default shorts
  const filteredShorts = shouldUseRecommended && (!recommendedShorts || recommendedShorts.length === 0) && defaultShorts && activeMood
    ? defaultShorts.filter((short) => short.moods.some((mood) => mood === activeMood))
    : shorts;

  const displayShorts = filteredShorts && filteredShorts.length > 0 ? filteredShorts : shorts;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState<{ [key: number]: boolean }>({});
  const [watchStartTime, setWatchStartTime] = useState<{ [key: number]: number }>({});
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRefs = useRef<{ [key: number]: HTMLVideoElement | null }>({});

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const scrollTop = container.scrollTop;
      const itemHeight = container.clientHeight;
      const newIndex = Math.round(scrollTop / itemHeight);
      if (newIndex !== currentIndex && newIndex >= 0 && displayShorts && newIndex < displayShorts.length) {
        // Record watch time for previous short
        if (watchStartTime[currentIndex]) {
          const watchDuration = (Date.now() - watchStartTime[currentIndex]) / 1000;
          if (watchDuration > 1) {
            recordWatch(watchDuration);
          }
        }
        setCurrentIndex(newIndex);
        // Start tracking new short
        setWatchStartTime((prev) => ({ ...prev, [newIndex]: Date.now() }));
      }
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [currentIndex, displayShorts, watchStartTime, recordWatch]);

  // Track initial view
  useEffect(() => {
    if (displayShorts && displayShorts.length > 0 && !watchStartTime[0]) {
      setWatchStartTime({ 0: Date.now() });
    }
  }, [displayShorts, watchStartTime]);

  const togglePlay = (index: number) => {
    const video = videoRefs.current[index];
    if (!video) return;

    if (isPlaying[index]) {
      video.pause();
      setIsPlaying((prev) => ({ ...prev, [index]: false }));
    } else {
      video.play();
      setIsPlaying((prev) => ({ ...prev, [index]: true }));
      recordActivity(); // Track play as activity
    }
  };

  const handleLike = (index: number) => {
    recordLike();
    // TODO: Implement actual like functionality with backend
  };

  const handleComment = () => {
    recordActivity();
    // TODO: Implement comment functionality
  };

  const handleShare = () => {
    recordActivity();
    // TODO: Implement share functionality
  };

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <div className="space-y-4 w-full max-w-md px-4">
          <Skeleton className="h-[600px] w-full rounded-lg" />
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">Failed to load shorts. Please try again later.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!displayShorts || displayShorts.length === 0) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">
              {moodAIEnabled && activeMood
                ? 'No shorts match your current mood. Try changing your mood in Settings.'
                : 'No shorts available yet. Be the first to upload!'}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="shorts-container h-[calc(100vh-4rem)] overflow-y-scroll snap-y snap-mandatory"
    >
      {displayShorts.map((short, index) => (
        <div
          key={index}
          className="shorts-item relative flex h-[calc(100vh-4rem)] w-full snap-start snap-always items-center justify-center bg-black"
        >
          <div className="relative h-full w-full max-w-md">
            <video
              ref={(el) => {
                videoRefs.current[index] = el;
              }}
              src={short.videoUrl}
              className="h-full w-full object-contain"
              loop
              playsInline
              onClick={() => togglePlay(index)}
            />

            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              {!isPlaying[index] && (
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-16 w-16 rounded-full bg-black/50 pointer-events-auto"
                  onClick={() => togglePlay(index)}
                >
                  <Play className="h-8 w-8 text-white" />
                </Button>
              )}
            </div>

            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 pb-6">
              <h3 className="text-lg font-semibold text-white mb-1">{short.title}</h3>
              <p className="text-sm text-white/80">
                {Number(short.likes)} likes · {Math.floor(Number(short.duration))}s
              </p>
            </div>

            <div className="absolute bottom-20 right-4 flex flex-col gap-4">
              <Button
                size="icon"
                variant="ghost"
                className="h-12 w-12 rounded-full bg-black/50 text-white hover:bg-black/70"
                onClick={() => handleLike(index)}
              >
                <Heart className="h-6 w-6" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="h-12 w-12 rounded-full bg-black/50 text-white hover:bg-black/70"
                onClick={handleComment}
              >
                <MessageCircle className="h-6 w-6" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="h-12 w-12 rounded-full bg-black/50 text-white hover:bg-black/70"
                onClick={handleShare}
              >
                <Share2 className="h-6 w-6" />
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
