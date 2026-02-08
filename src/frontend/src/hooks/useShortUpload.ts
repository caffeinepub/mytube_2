import { useState, useCallback } from 'react';
import { ExternalBlob } from '../backend';

interface UploadProgress {
  percentage: number;
  isUploading: boolean;
  error: string | null;
}

interface UploadResult {
  videoUrl: string;
}

export function useShortUpload() {
  const [progress, setProgress] = useState<UploadProgress>({
    percentage: 0,
    isUploading: false,
    error: null,
  });

  const uploadVideo = useCallback(async (file: File): Promise<UploadResult> => {
    setProgress({ percentage: 0, isUploading: true, error: null });

    try {
      // Read file as bytes
      const arrayBuffer = await file.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);

      // Create ExternalBlob with progress tracking
      const blob = ExternalBlob.fromBytes(bytes).withUploadProgress((percentage) => {
        setProgress({ percentage, isUploading: true, error: null });
      });

      // Get the direct URL (this triggers the upload)
      const videoUrl = blob.getDirectURL();

      setProgress({ percentage: 100, isUploading: false, error: null });

      return { videoUrl };
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to upload video. Please try again.';
      setProgress({ percentage: 0, isUploading: false, error: errorMessage });
      throw new Error(errorMessage);
    }
  }, []);

  const reset = useCallback(() => {
    setProgress({ percentage: 0, isUploading: false, error: null });
  }, []);

  return {
    uploadVideo,
    progress,
    reset,
  };
}
