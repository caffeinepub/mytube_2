import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import FollowButton from './FollowButton';
import { followCopy } from '@/lib/followCopy';

interface ChannelHeaderProps {
  channelId: string;
  channelName: string;
  followerCount: number;
  videoCount: number;
  isFollowing: boolean;
  isOwnChannel: boolean;
}

export default function ChannelHeader({
  channelId,
  channelName,
  followerCount,
  videoCount,
  isFollowing,
  isOwnChannel,
}: ChannelHeaderProps) {
  return (
    <div className="border-b border-border bg-card">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-start gap-6">
          <Avatar className="h-24 w-24 border-2 border-border">
            <AvatarImage src="" />
            <AvatarFallback className="bg-gradient-to-br from-[#d97398] to-[#5fc4d4] text-3xl text-white">
              {channelName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h1 className="text-3xl font-bold">{channelName}</h1>
            <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
              <span>{followCopy.channel.followersCount(followerCount)}</span>
              <span>•</span>
              <span>{videoCount} videos</span>
            </div>
            {!isOwnChannel && (
              <div className="mt-4">
                <FollowButton channelId={channelId} isFollowing={isFollowing} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
