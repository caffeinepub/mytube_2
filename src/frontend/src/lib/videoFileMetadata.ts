/**
 * Extracts metadata from a video file without blocking upload.
 * Duration and resolution are best-effort and optional.
 */
export interface VideoFileMetadata {
  duration: number; // in seconds, 0 if unknown
  resolution: string; // e.g., "1920x1080", "4K", "8K", or "unknown"
  mimeType: string;
}

export async function extractVideoMetadata(file: File): Promise<VideoFileMetadata> {
  return new Promise((resolve) => {
    const video = document.createElement('video');
    video.preload = 'metadata';

    const cleanup = () => {
      URL.revokeObjectURL(video.src);
      video.remove();
    };

    // Set a timeout to avoid blocking indefinitely
    const timeout = setTimeout(() => {
      cleanup();
      resolve({
        duration: 0,
        resolution: 'unknown',
        mimeType: file.type || 'video/mp4',
      });
    }, 5000);

    video.onloadedmetadata = () => {
      clearTimeout(timeout);
      
      const duration = Math.round(video.duration) || 0;
      const width = video.videoWidth;
      const height = video.videoHeight;
      
      let resolution = 'unknown';
      if (width && height) {
        // Determine resolution label
        if (width >= 7680 || height >= 4320) {
          resolution = '8K';
        } else if (width >= 3840 || height >= 2160) {
          resolution = '4K';
        } else if (width >= 2560 || height >= 1440) {
          resolution = '2K';
        } else if (width >= 1920 || height >= 1080) {
          resolution = '1080p';
        } else if (width >= 1280 || height >= 720) {
          resolution = '720p';
        } else {
          resolution = `${width}x${height}`;
        }
      }

      cleanup();
      resolve({
        duration,
        resolution,
        mimeType: file.type || 'video/mp4',
      });
    };

    video.onerror = () => {
      clearTimeout(timeout);
      cleanup();
      resolve({
        duration: 0,
        resolution: 'unknown',
        mimeType: file.type || 'video/mp4',
      });
    };

    video.src = URL.createObjectURL(file);
  });
}
