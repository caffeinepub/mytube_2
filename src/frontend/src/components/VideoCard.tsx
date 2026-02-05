import { Link } from '@tanstack/react-router';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';

interface VideoCardProps {
  videoId: string;
  title: string;
  channelName: string;
  channelId: string;
  views: number;
  uploadedAt: Date;
  thumbnailUrl?: string;
}

export default function VideoCard({
  videoId,
  title,
  channelName,
  channelId,
  views,
  uploadedAt,
  thumbnailUrl,
}: VideoCardProps) {
  return (
    <Card className="group overflow-hidden border-none bg-transparent shadow-none transition-transform hover:scale-[1.02]">
      <Link to="/watch/$videoId" params={{ videoId }}>
        <div className="relative aspect-video overflow-hidden rounded-xl bg-muted">
          {thumbnailUrl ? (
            <img src={thumbnailUrl} alt={title} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#d97398]/20 via-[#8eb5c0]/20 to-[#5fc4d4]/20">
              <span className="text-4xl font-bold text-muted-foreground/30">mytube</span>
            </div>
          )}
        </div>
      </Link>
      <CardContent className="flex gap-3 p-3">
        <Link to="/channel/$channelId" params={{ channelId }}>
          <Avatar className="h-9 w-9">
            <AvatarImage src="" />
            <AvatarFallback className="bg-gradient-to-br from-[#d97398] to-[#5fc4d4] text-white">
              {channelName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </Link>
        <div className="flex-1 space-y-1">
          <Link to="/watch/$videoId" params={{ videoId }}>
            <h3 className="line-clamp-2 text-sm font-semibold leading-tight text-foreground group-hover:text-primary">
              {title}
            </h3>
          </Link>
          <Link to="/channel/$channelId" params={{ channelId }}>
            <p className="text-xs text-muted-foreground hover:text-foreground">{channelName}</p>
          </Link>
          <p className="text-xs text-muted-foreground">
            {views.toLocaleString()} views • {formatDistanceToNow(uploadedAt, { addSuffix: true })}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
