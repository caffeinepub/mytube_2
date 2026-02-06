import type { backendInterface, VideoId, StreamChunk } from '../backend';

/**
 * Creates a streaming video source for HTML5 video playback.
 * Requests chunks incrementally from the backend.
 */
export class VideoStreamSource {
  private videoId: VideoId;
  private actor: backendInterface;
  private totalChunks: number;
  private chunkSize: number;
  private currentChunk: number = 0;
  private buffer: Uint8Array[] = [];

  constructor(
    videoId: VideoId,
    actor: backendInterface,
    totalChunks: number,
    chunkSize: number
  ) {
    this.videoId = videoId;
    this.actor = actor;
    this.totalChunks = totalChunks;
    this.chunkSize = chunkSize;
  }

  /**
   * Fetches a range of chunks from the backend.
   */
  async fetchChunks(startChunk: number, endChunk: number): Promise<Uint8Array[]> {
    try {
      const result = await this.actor.streamVideo(
        this.videoId,
        BigInt(startChunk),
        BigInt(endChunk)
      );

      if (result.__kind__ === 'error') {
        throw new Error(result.error);
      }

      return result.chunks.map((chunk: StreamChunk) => chunk.data);
    } catch (error) {
      console.error('Error fetching video chunks:', error);
      throw error;
    }
  }

  /**
   * Fetches all chunks and returns a blob URL for the video.
   * For large videos, this loads incrementally but still creates a full blob.
   */
  async createBlobUrl(onProgress?: (percentage: number) => void): Promise<string> {
    const allChunks: Uint8Array[] = [];
    const batchSize = 10; // Fetch 10 chunks at a time

    for (let i = 0; i < this.totalChunks; i += batchSize) {
      const endChunk = Math.min(i + batchSize - 1, this.totalChunks - 1);
      const chunks = await this.fetchChunks(i, endChunk);
      allChunks.push(...chunks);

      if (onProgress) {
        const percentage = Math.round(((i + chunks.length) / this.totalChunks) * 100);
        onProgress(percentage);
      }
    }

    // Combine all chunks into a single blob
    const totalSize = allChunks.reduce((sum, chunk) => sum + chunk.length, 0);
    const combined = new Uint8Array(totalSize);
    let offset = 0;
    for (const chunk of allChunks) {
      combined.set(chunk, offset);
      offset += chunk.length;
    }

    const blob = new Blob([combined], { type: 'video/mp4' });
    return URL.createObjectURL(blob);
  }

  /**
   * Cleanup method to revoke blob URLs.
   */
  static revokeBlobUrl(url: string) {
    URL.revokeObjectURL(url);
  }
}
