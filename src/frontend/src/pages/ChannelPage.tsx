import { useParams } from '@tanstack/react-router';
import { useState } from 'react';
import { Principal } from '@dfinity/principal';
import ChannelHeader from '@/components/ChannelHeader';
import VideoCard from '@/components/VideoCard';
import ProfileEditDialog from '@/components/profile/ProfileEditDialog';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetUserProfile, useGetCallerUserProfile, useSaveCallerUserProfile } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Pencil, Globe, Youtube, Twitter, Instagram, Facebook, Video, Heart } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

export default function ChannelPage() {
  const { channelId } = useParams({ from: '/channel/$channelId' });
  const { identity, login, isLoggingIn } = useInternetIdentity();
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const isOwnChannel = identity?.getPrincipal().toString() === channelId;

  // Convert channelId string to Principal for backend call
  let channelPrincipal: Principal | null = null;
  try {
    channelPrincipal = Principal.fromText(channelId);
  } catch (error) {
    console.error('Invalid principal ID:', channelId);
  }

  // Fetch profile data
  const { data: viewedProfile, isLoading: viewedProfileLoading } = useGetUserProfile(channelPrincipal);
  const { data: currentUserProfile, isLoading: currentUserProfileLoading } = useGetCallerUserProfile();
  const { mutateAsync: saveProfile, isPending: isSaving } = useSaveCallerUserProfile();

  // Use the appropriate profile based on whether it's own channel
  const profile = isOwnChannel ? currentUserProfile : viewedProfile;
  const isLoading = isOwnChannel ? currentUserProfileLoading : viewedProfileLoading;

  const handleSaveProfile = async (updatedProfile: NonNullable<typeof profile>) => {
    try {
      await saveProfile(updatedProfile);
      setEditDialogOpen(false);
      toast.success('Profile updated successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile');
    }
  };

  // Mock data for videos (backend integration pending)
  const videos = [
    {
      videoId: '1',
      title: 'Channel Video 1',
      channelName: profile?.displayName || 'Content Creator',
      channelId: channelId,
      views: 1234,
      uploadedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
    },
    {
      videoId: '2',
      title: 'Channel Video 2',
      channelName: profile?.displayName || 'Content Creator',
      channelId: channelId,
      views: 567,
      uploadedAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
    },
  ];

  const socialLinks = profile
    ? [
        { icon: Globe, url: profile.website, label: 'Website' },
        { icon: Youtube, url: profile.youtube, label: 'YouTube' },
        { icon: Twitter, url: profile.twitter, label: 'Twitter' },
        { icon: Instagram, url: profile.instagram, label: 'Instagram' },
        { icon: Facebook, url: profile.facebook, label: 'Facebook' },
      ].filter((link) => link.url && link.url.trim() !== '')
    : [];

  if (!identity) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <h2 className="mb-4 text-2xl font-bold">Sign in to view profiles</h2>
          <p className="mb-6 text-muted-foreground">You need to be signed in to view user profiles.</p>
          <Button onClick={login} disabled={isLoggingIn}>
            {isLoggingIn ? 'Signing in...' : 'Sign In'}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Banner */}
      {isLoading ? (
        <Skeleton className="h-48 w-full" />
      ) : profile?.bannerUrl ? (
        <div className="h-48 w-full overflow-hidden bg-gradient-to-r from-[#d97398] to-[#5fc4d4]">
          <img src={profile.bannerUrl} alt="Banner" className="h-full w-full object-cover" />
        </div>
      ) : (
        <div className="h-48 w-full bg-gradient-to-r from-[#d97398] to-[#5fc4d4]" />
      )}

      {/* Profile Header */}
      <ChannelHeader
        channelId={channelId}
        channelName={profile?.displayName || profile?.username || 'User'}
        profilePhotoUrl={profile?.profilePhotoUrl || ''}
        followerCount={0}
        videoCount={videos.length}
        isFollowing={false}
        isOwnChannel={isOwnChannel}
        isLoading={isLoading}
      />

      <div className="container mx-auto px-4 py-6">
        {/* Edit Profile Button */}
        {isOwnChannel && !isLoading && (
          <div className="mb-6">
            <Button onClick={() => setEditDialogOpen(true)} variant="outline">
              <Pencil className="mr-2 h-4 w-4" />
              Edit Profile
            </Button>
          </div>
        )}

        {/* Bio Section */}
        {!isLoading && profile?.bio && (
          <div className="mb-6">
            <h2 className="mb-2 text-lg font-semibold">About</h2>
            <p className="whitespace-pre-wrap text-muted-foreground">{profile.bio}</p>
          </div>
        )}

        {/* Social Links */}
        {!isLoading && socialLinks.length > 0 && (
          <div className="mb-6">
            <h2 className="mb-3 text-lg font-semibold">Links</h2>
            <div className="flex flex-wrap gap-3">
              {socialLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <a
                    key={link.label}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 transition-colors hover:bg-accent"
                  >
                    <Icon className="h-4 w-4" />
                    <span className="text-sm">{link.label}</span>
                  </a>
                );
              })}
            </div>
          </div>
        )}

        {/* Stats Section */}
        <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Video className="h-5 w-5" />
              <span className="text-sm">Videos</span>
            </div>
            <p className="mt-1 text-2xl font-bold">{videos.length}</p>
          </div>
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Heart className="h-5 w-5" />
              <span className="text-sm">Followers</span>
            </div>
            <p className="mt-1 text-2xl font-bold">0</p>
          </div>
        </div>

        {/* Videos Section */}
        <div>
          <h2 className="mb-4 text-xl font-semibold">Videos</h2>
          {videos.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {videos.map((video) => (
                <VideoCard key={video.videoId} {...video} />
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-border bg-card p-8 text-center">
              <Video className="mx-auto mb-3 h-12 w-12 text-muted-foreground" />
              <p className="text-muted-foreground">No videos yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Edit Profile Dialog */}
      {isOwnChannel && (
        <ProfileEditDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          currentProfile={profile ?? null}
          onSave={handleSaveProfile}
          isSaving={isSaving}
        />
      )}
    </div>
  );
}
