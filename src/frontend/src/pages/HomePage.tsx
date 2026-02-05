import VideoCard from '@/components/VideoCard';

export default function HomePage() {
  // Mock data
  const videos = [
    {
      videoId: '1',
      title: 'Welcome to mytube - Your New Video Platform',
      channelName: 'mytube Official',
      channelId: 'official',
      views: 1234,
      uploadedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
    },
    {
      videoId: '2',
      title: 'Getting Started with Video Uploads',
      channelName: 'Tutorial Channel',
      channelId: 'tutorial',
      views: 567,
      uploadedAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
    },
    {
      videoId: '3',
      title: 'Amazing Content Coming Soon',
      channelName: 'Creator Studio',
      channelId: 'creator',
      views: 890,
      uploadedAt: new Date(Date.now() - 1000 * 60 * 60 * 12),
    },
  ];

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="mb-6 text-2xl font-bold">Home</h1>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {videos.map((video) => (
          <VideoCard key={video.videoId} {...video} />
        ))}
      </div>
    </div>
  );
}
