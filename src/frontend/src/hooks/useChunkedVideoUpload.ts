import { useState, useCallback } from 'react';
import { useActor } from './useActor';
import type { VideoId } from '../backend';

const CHUNK_SIZE = 1024 * 1024; // 1MB chunks

interface UploadProgress {
  uploadedBytes: number;
  totalBytes: number;
  percentage: number;
  currentChunk: number;
  totalChunks: number;
}

interface UseChunkedVideoUploadResult {
  upload: (file: File, metadata: {
    id: VideoId;
    title: string;
    description: string;
    durationSeconds: number;
    resolution: string;
  }) => Promise<void>;
  progress: UploadProgress | null;
  isUploading: boolean;
  error: string | null;
  cancel: () => void;
  retry: () => void;
}

export function useChunkedVideoUpload(): UseChunkedVideoUploadResult {
  const { actor } = useActor();
  const [progress, setProgress] = useState<UploadProgress | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCancelled, setIsCancelled] = useState(false);
  const [lastUploadParams, setLastUploadParams] = useState<{
    file: File;
    metadata: any;
  } | null>(null);

  const cancel = useCallback(() => {
    setIsCancelled(true);
    setIsUploading(false);
    setProgress(null);
  }, []);

  const upload = useCallback(async (
    file: File,
    metadata: {
      id: VideoId;
      title: string;
      description: string;
      durationSeconds: number;
      resolution: string;
    }
  ) => {
    if (!actor) {
      setError('Not authenticated. Please sign in to upload videos.');
      return;
    }

    setLastUploadParams({ file, metadata });
    setIsUploading(true);
    setError(null);
    setIsCancelled(false);

    const totalBytes = file.size;
    const totalChunks = Math.ceil(totalBytes / CHUNK_SIZE);

    try {
      // Step 1: Upload metadata
      await actor.uploadVideoMetadata(
        metadata.id,
        metadata.title,
        metadata.description,
        BigInt(metadata.durationSeconds),
        metadata.resolution,
        BigInt(totalChunks),
        BigInt(CHUNK_SIZE),
        BigInt(Date.now())
      );

      // Step 2: Upload chunks sequentially
      for (let chunkNumber = 0; chunkNumber < totalChunks; chunkNumber++) {
        if (isCancelled) {
          setError('Upload cancelled by user.');
          return;
        }

        const start = chunkNumber * CHUNK_SIZE;
        const end = Math.min(start + CHUNK_SIZE, totalBytes);
        const chunk = file.slice(start, end);
        
        // Convert chunk to Uint8Array
        const arrayBuffer = await chunk.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);

        await actor.uploadVideoChunk(
          metadata.id,
          BigInt(chunkNumber),
          uint8Array,
          BigInt(uint8Array.length)
        );

        const uploadedBytes = end;
        const percentage = Math.round((uploadedBytes / totalBytes) * 100);

        setProgress({
          uploadedBytes,
          totalBytes,
          percentage,
          currentChunk: chunkNumber + 1,
          totalChunks,
        });
      }

      // Upload complete
      setIsUploading(false);
      setProgress(null);
    } catch (err: any) {
      console.error('Upload error:', err);
      setError(err.message || 'Upload failed. Please try again.');
      setIsUploading(false);
    }
  }, [actor, isCancelled]);

  const retry = useCallback(() => {
    if (lastUploadParams) {
      upload(lastUploadParams.file, lastUploadParams.metadata);
    }
  }, [lastUploadParams, upload]);

  return {
    upload,
    progress,
    isUploading,
    error,
    cancel,
    retry,
  };
}
