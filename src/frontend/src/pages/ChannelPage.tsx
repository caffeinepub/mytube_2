import { useParams } from '@tanstack/react-router';
import ChannelHeader from '@/components/ChannelHeader';
import VideoCard from '@/components/VideoCard';
import { useInternetIdentity } from '../hooks/useInternetIdentity';

export default function ChannelPage() {
  const { channelId } = useParams({ from: '/channel/$channelId' });
  const { identity } = useInternetIdentity();

  const isOwnChannel = identity?.getPrincipal().toString() === channelId;

  // Mock data
  const channel = {
    id: channelId,
    name: 'Content Creator',
    followerCount: 1234,
    videoCount: 42,
  };

  const videos = [
    {
      videoId: '1',
      title: 'Channel Video 1',
      channelName: channel.name,
      channelId: channel.id,
      views: 1234,
      uploadedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
    },
    {
      videoId: '2',
      title: 'Channel Video 2',
      channelName: channel.name,
      channelId: channel.id,
      views: 567,
      uploadedAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
    },
  ];

  return (
    <div>
      <ChannelHeader
        channelId={channel.id}
        channelName={channel.name}
        followerCount={channel.followerCount}
        videoCount={channel.videoCount}
        isFollowing={false}
        isOwnChannel={isOwnChannel}
      />

      <div className="container mx-auto px-4 py-6">
        <h2 className="mb-4 text-xl font-semibold">Videos</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {videos.map((video) => (
            <VideoCard key={video.videoId} {...video} />
          ))}
        </div>
      </div>
    </div>
  );
}
