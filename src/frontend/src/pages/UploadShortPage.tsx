import { useState } from 'react';
import { useNavigate, Link } from '@tanstack/react-router';
import { Upload as UploadIcon, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useUploadShort } from '../hooks/useQueries';
import { useShortUpload } from '../hooks/useShortUpload';
import { toast } from 'sonner';

export default function UploadShortPage() {
  const { identity, login } = useInternetIdentity();
  const navigate = useNavigate();
  const uploadShortMutation = useUploadShort();
  const { uploadVideo, progress, reset: resetUpload } = useShortUpload();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [duration, setDuration] = useState<number | null>(null);
  const [durationError, setDurationError] = useState<string | null>(null);

  if (!identity) {
    return (
      <div className="container mx-auto flex min-h-[60vh] items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Sign In Required</CardTitle>
            <CardDescription>You need to sign in to upload shorts</CardDescription>
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);
    setDurationError(null);
    setDuration(null);
    resetUpload();

    if (selectedFile) {
      const video = document.createElement('video');
      video.preload = 'metadata';

      video.onloadedmetadata = () => {
        window.URL.revokeObjectURL(video.src);
        const videoDuration = Math.floor(video.duration);
        setDuration(videoDuration);

        if (videoDuration > 60) {
          setDurationError(
            `This video is ${videoDuration} seconds long. Shorts must be 60 seconds or less. Please select a shorter video.`
          );
        }
      };

      video.src = URL.createObjectURL(selectedFile);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !title.trim() || !duration || duration > 60 || progress.isUploading) return;

    try {
      // Step 1: Upload video file to blob storage
      const { videoUrl } = await uploadVideo(file);

      // Step 2: Register short in backend with durable URL
      await uploadShortMutation.mutateAsync({
        title: title.trim(),
        videoUrl,
        duration: BigInt(duration),
        moods: [],
      });

      toast.success('Short uploaded successfully!');
      navigate({ to: '/shorts' });
    } catch (error: any) {
      console.error('Upload failed:', error);
      const errorMessage = error?.message || 'Failed to upload short. Please try again.';
      toast.error(errorMessage);
    }
  };

  const isUploading = progress.isUploading || uploadShortMutation.isPending;
  const canSubmit = file && title.trim() && duration !== null && duration <= 60 && !isUploading;

  return (
    <div className="container mx-auto px-4 py-6">
      <Card className="mx-auto max-w-2xl">
        <CardHeader>
          <CardTitle>Upload Short</CardTitle>
          <CardDescription>
            Share a short video (60 seconds or less) with the mytube community
          </CardDescription>
          <div className="pt-2">
            <Link to="/upload">
              <Button variant="outline" size="sm">
                Upload Regular Video Instead
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
                    MP4, WebM, or OGG (max 60 seconds)
                  </p>
                  {duration !== null && duration <= 60 && (
                    <p className="mt-1 text-xs text-accent-foreground">Duration: {duration} seconds</p>
                  )}
                  <Input
                    id="video-file"
                    type="file"
                    accept="video/*"
                    className="hidden"
                    onChange={handleFileChange}
                    disabled={isUploading}
                  />
                </label>
              </div>
              {durationError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{durationError}</AlertDescription>
                </Alert>
              )}
            </div>

            {progress.isUploading && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Uploading video...</span>
                  <span className="font-medium">{Math.round(progress.percentage)}%</span>
                </div>
                <Progress value={progress.percentage} className="h-2" />
              </div>
            )}

            {progress.error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{progress.error}</AlertDescription>
              </Alert>
            )}

            {uploadShortMutation.isError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {uploadShortMutation.error?.message || 'Failed to upload short. Please try again.'}
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="Enter short title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={isUploading}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                placeholder="Tell viewers about your short"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isUploading}
                className="min-h-[100px]"
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => navigate({ to: '/' })}
                disabled={isUploading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={!canSubmit}>
                {isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {progress.isUploading 
                  ? `Uploading ${Math.round(progress.percentage)}%` 
                  : uploadShortMutation.isPending 
                  ? 'Saving...' 
                  : 'Upload Short'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
