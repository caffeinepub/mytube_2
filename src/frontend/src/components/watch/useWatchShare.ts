import { useState } from 'react';
import { toast } from 'sonner';

export function useWatchShare(videoId: string, videoTitle: string) {
  const [isSharing, setIsSharing] = useState(false);

  const share = async () => {
    setIsSharing(true);
    try {
      const shareUrl = `${window.location.origin}/watch/${videoId}`;
      const shareData = {
        title: videoTitle,
        text: `Check out this video: ${videoTitle}`,
        url: shareUrl,
      };

      // Check if Web Share API is available
      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
        toast.success('Shared successfully!');
      } else {
        // Fallback to clipboard
        await navigator.clipboard.writeText(shareUrl);
        toast.success('Link copied to clipboard!');
      }
    } catch (error: any) {
      // User cancelled share or clipboard failed
      if (error.name !== 'AbortError') {
        console.error('Share failed:', error);
        toast.error('Failed to share. Please try again.');
      }
    } finally {
      setIsSharing(false);
    }
  };

  return { share, isSharing };
}
