import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import MoodAISection from '@/components/settings/MoodAISection';

type SettingsSection = 'general' | 'playback' | 'privacy' | 'notifications';

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState<SettingsSection>('general');

  // General settings state
  const [language, setLanguage] = useState('en');
  const [location, setLocation] = useState('us');
  const [restrictedMode, setRestrictedMode] = useState(false);

  // Playback settings state
  const [autoplay, setAutoplay] = useState(true);
  const [annotations, setAnnotations] = useState(true);
  const [playbackQuality, setPlaybackQuality] = useState('auto');
  const [playbackSpeed, setPlaybackSpeed] = useState('1');
  const [volume, setVolume] = useState([75]);

  // Privacy settings state
  const [watchHistory, setWatchHistory] = useState(true);
  const [searchHistory, setSearchHistory] = useState(true);
  const [showLikedVideos, setShowLikedVideos] = useState(true);
  const [showSubscriptions, setShowSubscriptions] = useState(true);

  // Notifications settings state
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(false);
  const [subscriptionNotifications, setSubscriptionNotifications] = useState(true);
  const [commentReplies, setCommentReplies] = useState(true);
  const [recommendedVideos, setRecommendedVideos] = useState(false);

  const sections = [
    { id: 'general' as const, label: 'General' },
    { id: 'playback' as const, label: 'Playback and performance' },
    { id: 'privacy' as const, label: 'Privacy' },
    { id: 'notifications' as const, label: 'Notifications' },
  ];

  return (
    <div className="flex h-full flex-col bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card px-6 py-4">
        <h1 className="text-2xl font-semibold">Settings</h1>
      </div>

      {/* Two-column layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left sidebar - Section navigation */}
        <aside className="w-64 border-r border-border bg-card p-4">
          <nav className="flex flex-col gap-1">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={cn(
                  'rounded-lg px-4 py-2.5 text-left text-sm font-medium transition-colors',
                  activeSection === section.id
                    ? 'bg-accent text-accent-foreground'
                    : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
                )}
              >
                {section.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Right content panel */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="mx-auto max-w-3xl">
            {activeSection === 'general' && (
              <div className="space-y-6">
                <div>
                  <h2 className="mb-4 text-xl font-semibold">General</h2>
                  <p className="mb-6 text-sm text-muted-foreground">
                    Manage your general account settings and preferences
                  </p>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="language">Language</Label>
                    <Select value={language} onValueChange={setLanguage}>
                      <SelectTrigger id="language" className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English (US)</SelectItem>
                        <SelectItem value="es">Español</SelectItem>
                        <SelectItem value="fr">Français</SelectItem>
                        <SelectItem value="de">Deutsch</SelectItem>
                        <SelectItem value="ja">日本語</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      Choose your preferred language for the interface
                    </p>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Select value={location} onValueChange={setLocation}>
                      <SelectTrigger id="location" className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="us">United States</SelectItem>
                        <SelectItem value="uk">United Kingdom</SelectItem>
                        <SelectItem value="ca">Canada</SelectItem>
                        <SelectItem value="au">Australia</SelectItem>
                        <SelectItem value="de">Germany</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      Your location helps us show relevant content and recommendations
                    </p>
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="restricted-mode">Restricted Mode</Label>
                      <p className="text-xs text-muted-foreground">
                        Hide potentially mature or sensitive content
                      </p>
                    </div>
                    <Switch
                      id="restricted-mode"
                      checked={restrictedMode}
                      onCheckedChange={setRestrictedMode}
                    />
                  </div>

                  <Separator />

                  <MoodAISection />
                </div>
              </div>
            )}

            {activeSection === 'playback' && (
              <div className="space-y-6">
                <div>
                  <h2 className="mb-4 text-xl font-semibold">Playback and performance</h2>
                  <p className="mb-6 text-sm text-muted-foreground">
                    Control how videos play and perform on your device
                  </p>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="autoplay">Autoplay</Label>
                      <p className="text-xs text-muted-foreground">
                        Automatically play the next video
                      </p>
                    </div>
                    <Switch
                      id="autoplay"
                      checked={autoplay}
                      onCheckedChange={setAutoplay}
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="annotations">Annotations</Label>
                      <p className="text-xs text-muted-foreground">
                        Show annotations on videos
                      </p>
                    </div>
                    <Switch
                      id="annotations"
                      checked={annotations}
                      onCheckedChange={setAnnotations}
                    />
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Label htmlFor="quality">Playback quality</Label>
                    <Select value={playbackQuality} onValueChange={setPlaybackQuality}>
                      <SelectTrigger id="quality" className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="auto">Auto (recommended)</SelectItem>
                        <SelectItem value="2160p">2160p (4K)</SelectItem>
                        <SelectItem value="1440p">1440p</SelectItem>
                        <SelectItem value="1080p">1080p</SelectItem>
                        <SelectItem value="720p">720p</SelectItem>
                        <SelectItem value="480p">480p</SelectItem>
                        <SelectItem value="360p">360p</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      Choose the default video quality for playback
                    </p>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Label htmlFor="speed">Playback speed</Label>
                    <Select value={playbackSpeed} onValueChange={setPlaybackSpeed}>
                      <SelectTrigger id="speed" className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0.25">0.25x</SelectItem>
                        <SelectItem value="0.5">0.5x</SelectItem>
                        <SelectItem value="0.75">0.75x</SelectItem>
                        <SelectItem value="1">Normal</SelectItem>
                        <SelectItem value="1.25">1.25x</SelectItem>
                        <SelectItem value="1.5">1.5x</SelectItem>
                        <SelectItem value="1.75">1.75x</SelectItem>
                        <SelectItem value="2">2x</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      Set the default playback speed for videos
                    </p>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Label htmlFor="volume">Default volume</Label>
                    <div className="flex items-center gap-4">
                      <Slider
                        id="volume"
                        value={volume}
                        onValueChange={setVolume}
                        max={100}
                        step={1}
                        className="flex-1"
                      />
                      <span className="w-12 text-sm text-muted-foreground">{volume[0]}%</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Set the default volume level for video playback
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'privacy' && (
              <div className="space-y-6">
                <div>
                  <h2 className="mb-4 text-xl font-semibold">Privacy</h2>
                  <p className="mb-6 text-sm text-muted-foreground">
                    Manage your privacy settings and control what others can see
                  </p>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="watch-history">Watch history</Label>
                      <p className="text-xs text-muted-foreground">
                        Save the videos you watch to improve recommendations
                      </p>
                    </div>
                    <Switch
                      id="watch-history"
                      checked={watchHistory}
                      onCheckedChange={setWatchHistory}
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="search-history">Search history</Label>
                      <p className="text-xs text-muted-foreground">
                        Save your searches to improve recommendations
                      </p>
                    </div>
                    <Switch
                      id="search-history"
                      checked={searchHistory}
                      onCheckedChange={setSearchHistory}
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="liked-videos">Show liked videos</Label>
                      <p className="text-xs text-muted-foreground">
                        Make your liked videos visible to others
                      </p>
                    </div>
                    <Switch
                      id="liked-videos"
                      checked={showLikedVideos}
                      onCheckedChange={setShowLikedVideos}
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="subscriptions">Show subscriptions</Label>
                      <p className="text-xs text-muted-foreground">
                        Make your subscriptions visible to others
                      </p>
                    </div>
                    <Switch
                      id="subscriptions"
                      checked={showSubscriptions}
                      onCheckedChange={setShowSubscriptions}
                    />
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'notifications' && (
              <div className="space-y-6">
                <div>
                  <h2 className="mb-4 text-xl font-semibold">Notifications</h2>
                  <p className="mb-6 text-sm text-muted-foreground">
                    Choose what notifications you want to receive
                  </p>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="email-notifications">Email notifications</Label>
                      <p className="text-xs text-muted-foreground">
                        Receive notifications via email
                      </p>
                    </div>
                    <Switch
                      id="email-notifications"
                      checked={emailNotifications}
                      onCheckedChange={setEmailNotifications}
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="push-notifications">Push notifications</Label>
                      <p className="text-xs text-muted-foreground">
                        Receive push notifications on your device
                      </p>
                    </div>
                    <Switch
                      id="push-notifications"
                      checked={pushNotifications}
                      onCheckedChange={setPushNotifications}
                    />
                  </div>

                  <Separator />

                  <div>
                    <h3 className="mb-4 text-sm font-medium">Notification preferences</h3>
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <Checkbox
                          id="subscription-notifications"
                          checked={subscriptionNotifications}
                          onCheckedChange={(checked) => setSubscriptionNotifications(checked as boolean)}
                        />
                        <div className="space-y-0.5">
                          <Label htmlFor="subscription-notifications" className="cursor-pointer">
                            Subscriptions
                          </Label>
                          <p className="text-xs text-muted-foreground">
                            Get notified when channels you follow upload new videos
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <Checkbox
                          id="comment-replies"
                          checked={commentReplies}
                          onCheckedChange={(checked) => setCommentReplies(checked as boolean)}
                        />
                        <div className="space-y-0.5">
                          <Label htmlFor="comment-replies" className="cursor-pointer">
                            Comment replies
                          </Label>
                          <p className="text-xs text-muted-foreground">
                            Get notified when someone replies to your comments
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <Checkbox
                          id="recommended-videos"
                          checked={recommendedVideos}
                          onCheckedChange={(checked) => setRecommendedVideos(checked as boolean)}
                        />
                        <div className="space-y-0.5">
                          <Label htmlFor="recommended-videos" className="cursor-pointer">
                            Recommended videos
                          </Label>
                          <p className="text-xs text-muted-foreground">
                            Get notified about videos we think you might like
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
