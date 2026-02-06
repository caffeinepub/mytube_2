import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import type { UserProfile } from '../../backend';

interface ProfileEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentProfile: UserProfile | null;
  onSave: (profile: UserProfile) => Promise<void>;
  isSaving: boolean;
}

export default function ProfileEditDialog({
  open,
  onOpenChange,
  currentProfile,
  onSave,
  isSaving,
}: ProfileEditDialogProps) {
  const [formData, setFormData] = useState<UserProfile>({
    username: '',
    displayName: '',
    bio: '',
    profilePhotoUrl: '',
    bannerUrl: '',
    website: '',
    youtube: '',
    twitter: '',
    instagram: '',
    facebook: '',
  });

  useEffect(() => {
    if (currentProfile) {
      setFormData(currentProfile);
    }
  }, [currentProfile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogDescription>
            Update your profile information. Changes will be visible to all users.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                placeholder="Enter your username"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="displayName">Display Name</Label>
              <Input
                id="displayName"
                value={formData.displayName}
                onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                placeholder="Enter your display name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Tell us about yourself"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="profilePhotoUrl">Profile Photo URL</Label>
              <Input
                id="profilePhotoUrl"
                type="url"
                value={formData.profilePhotoUrl}
                onChange={(e) => setFormData({ ...formData, profilePhotoUrl: e.target.value })}
                placeholder="https://example.com/photo.jpg"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bannerUrl">Banner Image URL</Label>
              <Input
                id="bannerUrl"
                type="url"
                value={formData.bannerUrl}
                onChange={(e) => setFormData({ ...formData, bannerUrl: e.target.value })}
                placeholder="https://example.com/banner.jpg"
              />
            </div>

            <div className="border-t pt-4">
              <h3 className="mb-3 text-sm font-semibold">Social Links</h3>
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    type="url"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    placeholder="https://yourwebsite.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="youtube">YouTube</Label>
                  <Input
                    id="youtube"
                    type="url"
                    value={formData.youtube}
                    onChange={(e) => setFormData({ ...formData, youtube: e.target.value })}
                    placeholder="https://youtube.com/@username"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="twitter">Twitter/X</Label>
                  <Input
                    id="twitter"
                    type="url"
                    value={formData.twitter}
                    onChange={(e) => setFormData({ ...formData, twitter: e.target.value })}
                    placeholder="https://twitter.com/username"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="instagram">Instagram</Label>
                  <Input
                    id="instagram"
                    type="url"
                    value={formData.instagram}
                    onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                    placeholder="https://instagram.com/username"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="facebook">Facebook</Label>
                  <Input
                    id="facebook"
                    type="url"
                    value={formData.facebook}
                    onChange={(e) => setFormData({ ...formData, facebook: e.target.value })}
                    placeholder="https://facebook.com/username"
                  />
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
