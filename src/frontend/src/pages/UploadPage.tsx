import { useState, useEffect } from 'react';
import { useNavigate, Link } from '@tanstack/react-router';
import { Upload as UploadIcon, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useChunkedVideoUpload } from '../hooks/useChunkedVideoUpload';
import { extractVideoMetadata } from '../lib/videoFileMetadata';

export default function UploadPage() {
  const { identity, login } = useInternetIdentity();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [videoId, setVideoId] = useState<string>('');
  
  const { upload, progress, isUploading, error, retry } = useChunkedVideoUpload();

  // Generate a unique video ID when file is selected
  useEffect(() => {
    if (file) {
      const id = `video_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      setVideoId(id);
    }
  }, [file]);

  if (!identity) {
    return (
      <div className="container mx-auto flex min-h-[60vh] items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Sign In Required</CardTitle>
            <CardDescription>You need to sign in to upload videos</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={login} className="w-full">
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !title.trim() || !videoId) return;

    try {
      // Extract metadata (best-effort, non-blocking)
      const metadata = await extractVideoMetadata(file);

      await upload(file, {
        id: videoId,
        title: title.trim(),
        description: description.trim(),
        durationSeconds: metadata.duration,
        resolution: metadata.resolution,
      });

      // Navigate to watch page on success
      navigate({ to: '/watch/$videoId', params: { videoId } });
    } catch (err) {
      console.error('Upload failed:', err);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <Card className="mx-auto max-w-2xl">
        <CardHeader>
          <CardTitle>Upload Video</CardTitle>
          <CardDescription>Share your content with the mytube community. Supports high-resolution videos up to 8K.</CardDescription>
          <div className="pt-2">
            <Link to="/upload/short">
              <Button variant="outline" size="sm">
                Upload Short Instead
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="video-file">Video File</Label>
              <div className="flex items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/50 p-12 transition-colors hover:border-primary">
                <label htmlFor="video-file" className="cursor-pointer text-center">
                  <UploadIcon className="mx-auto h-12 w-12 text-muted-foreground" />
                  <p className="mt-2 text-sm font-medium">
                    {file ? file.name : 'Click to select a video file'}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    MP4, WebM, or OGG • Supports 4K-8K resolution
                  </p>
                  {file && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      Size: {(file.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  )}
                  <Input
                    id="video-file"
                    type="file"
                    accept="video/*"
                    className="hidden"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    disabled={isUploading}
                  />
                </label>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="Enter video title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                disabled={isUploading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Tell viewers about your video"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="min-h-[120px]"
                disabled={isUploading}
              />
            </div>

            {progress && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Uploading...</span>
                  <span className="font-medium">{progress.percentage}%</span>
                </div>
                <Progress value={progress.percentage} className="h-2" />
                <p className="text-xs text-muted-foreground">
                  Chunk {progress.currentChunk} of {progress.totalChunks} • {(progress.uploadedBytes / (1024 * 1024)).toFixed(2)} MB / {(progress.totalBytes / (1024 * 1024)).toFixed(2)} MB
                </p>
              </div>
            )}

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="flex items-center justify-between">
                  <span>{error}</span>
                  <Button variant="outline" size="sm" onClick={retry}>
                    Retry
                  </Button>
                </AlertDescription>
              </Alert>
            )}

            {!isUploading && !error && progress && progress.percentage === 100 && (
              <Alert className="border-green-500 bg-green-500/10">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <AlertDescription className="text-green-500">
                  Upload complete! Redirecting...
                </AlertDescription>
              </Alert>
            )}

            <div className="flex justify-end gap-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => navigate({ to: '/' })}
                disabled={isUploading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={!file || !title.trim() || isUploading}>
                {isUploading ? 'Uploading...' : 'Upload Video'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
