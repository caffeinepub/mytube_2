import { User, Library, Settings, LogOut, Upload, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuGroup,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useInternetIdentity } from '@/hooks/useInternetIdentity';
import { useGetCallerUserProfile } from '@/hooks/useQueries';
import { useNavigate } from '@tanstack/react-router';
import { useQueryClient } from '@tanstack/react-query';

export default function ProfileMenu() {
  const { identity, login, clear, isLoggingIn } = useInternetIdentity();
  const { data: userProfile } = useGetCallerUserProfile();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const handleSignOut = async () => {
    await clear();
    queryClient.clear();
  };

  if (!identity) {
    return (
      <Button onClick={login} disabled={isLoggingIn} variant="default" size="sm">
        {isLoggingIn ? 'Signing in...' : 'Sign In'}
      </Button>
    );
  }

  const displayName = userProfile?.displayName || userProfile?.username || 'User';
  const initials = displayName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full">
          <Avatar className="h-8 w-8">
            {userProfile?.profilePhotoUrl && (
              <AvatarImage src={userProfile.profilePhotoUrl} alt={displayName} />
            )}
            <AvatarFallback className="bg-gradient-to-br from-[#d97398] to-[#5fc4d4] text-white text-xs">
              {initials}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="flex items-center gap-2 px-2 py-2">
          <Avatar className="h-10 w-10">
            {userProfile?.profilePhotoUrl && (
              <AvatarImage src={userProfile.profilePhotoUrl} alt={displayName} />
            )}
            <AvatarFallback className="bg-gradient-to-br from-[#d97398] to-[#5fc4d4] text-white">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <p className="text-sm font-medium">{displayName}</p>
            {userProfile?.username && userProfile.username !== displayName && (
              <p className="text-xs text-muted-foreground">@{userProfile.username}</p>
            )}
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => navigate({ to: `/channel/${identity.getPrincipal().toString()}` })}>
            <User className="mr-2 h-4 w-4" />
            Your Profile
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigate({ to: '/library' })}>
            <Library className="mr-2 h-4 w-4" />
            Library
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => navigate({ to: '/upload' })}>
            <Video className="mr-2 h-4 w-4" />
            Upload Video
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigate({ to: '/upload/short' })}>
            <Upload className="mr-2 h-4 w-4" />
            Upload Short
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => navigate({ to: '/settings' })}>
          <Settings className="mr-2 h-4 w-4" />
          Settings
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut}>
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
