import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useGetMoodPreferences, useUpdateMoodPreferences } from '../../hooks/useQueries';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { Mood } from '../../backend';
import { Loader2, Sparkles } from 'lucide-react';

export default function MoodAISection() {
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;

  const { data: preferences, isLoading: prefsLoading } = useGetMoodPreferences();
  const updateMutation = useUpdateMoodPreferences();

  const moodAIEnabled = preferences?.moodAIEnabled ?? false;
  const currentMood = preferences?.currentMood ?? Mood.happy;

  const handleToggleMoodAI = async (enabled: boolean) => {
    if (!isAuthenticated) return;
    try {
      await updateMutation.mutateAsync({
        moodAIEnabled: enabled,
        currentMood,
      });
    } catch (error) {
      console.error('Failed to update Mood AI:', error);
    }
  };

  const handleMoodChange = async (mood: string) => {
    if (!isAuthenticated) return;
    try {
      await updateMutation.mutateAsync({
        moodAIEnabled,
        currentMood: mood as Mood,
      });
    } catch (error) {
      console.error('Failed to update mood:', error);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="space-y-4">
        <div>
          <h3 className="mb-2 flex items-center gap-2 text-base font-medium">
            <Sparkles className="h-4 w-4 text-primary" />
            Mood AI
          </h3>
          <p className="text-sm text-muted-foreground">
            Get personalized content recommendations based on your mood
          </p>
        </div>
        <Alert>
          <AlertDescription>
            Please sign in to use Mood AI features.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (prefsLoading) {
    return (
      <div className="space-y-4">
        <div>
          <h3 className="mb-2 flex items-center gap-2 text-base font-medium">
            <Sparkles className="h-4 w-4 text-primary" />
            Mood AI
          </h3>
          <p className="text-sm text-muted-foreground">
            Get personalized content recommendations based on your mood
          </p>
        </div>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  const isUpdating = updateMutation.isPending;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="mb-2 flex items-center gap-2 text-base font-medium">
          <Sparkles className="h-4 w-4 text-primary" />
          Mood AI
        </h3>
        <p className="text-sm text-muted-foreground">
          Get personalized content recommendations based on your mood
        </p>
      </div>

      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label htmlFor="mood-ai-enabled">Enable Mood AI</Label>
          <p className="text-xs text-muted-foreground">
            Automatically recommend content based on your current mood
          </p>
        </div>
        <Switch
          id="mood-ai-enabled"
          checked={moodAIEnabled}
          onCheckedChange={handleToggleMoodAI}
          disabled={isUpdating}
        />
      </div>

      <Separator />

      <div className="space-y-2">
        <Label htmlFor="current-mood">Current Mood</Label>
        <Select
          value={currentMood}
          onValueChange={handleMoodChange}
          disabled={isUpdating}
        >
          <SelectTrigger id="current-mood" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={Mood.happy}>😊 Happy</SelectItem>
            <SelectItem value={Mood.sad}>😢 Sad</SelectItem>
            <SelectItem value={Mood.chill}>😌 Chill</SelectItem>
            <SelectItem value={Mood.excited}>🤩 Excited</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          Select your current mood to get better recommendations
        </p>
      </div>

      {moodAIEnabled && (
        <Alert className="border-primary/20 bg-primary/5">
          <Sparkles className="h-4 w-4 text-primary" />
          <AlertDescription>
            Mood AI is active. Your feed will be personalized based on your mood and viewing patterns.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
