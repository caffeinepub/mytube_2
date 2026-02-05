import { Button } from '@/components/ui/button';
import { followCopy } from '@/lib/followCopy';
import { useState } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';

interface FollowButtonProps {
  channelId: string;
  isFollowing: boolean;
  onFollowChange?: (isFollowing: boolean) => void;
}

export default function FollowButton({ channelId, isFollowing, onFollowChange }: FollowButtonProps) {
  const { identity, login } = useInternetIdentity();
  const [isLoading, setIsLoading] = useState(false);
  const [following, setFollowing] = useState(isFollowing);

  const handleClick = async () => {
    if (!identity) {
      login();
      return;
    }

    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));
      const newState = !following;
      setFollowing(newState);
      onFollowChange?.(newState);
    } catch (error) {
      console.error('Failed to update follow status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleClick}
      disabled={isLoading}
      variant={following ? 'secondary' : 'default'}
      className={following ? 'hover:bg-destructive hover:text-destructive-foreground' : ''}
    >
      {isLoading ? '...' : following ? followCopy.action.following : followCopy.action.follow}
    </Button>
  );
}
