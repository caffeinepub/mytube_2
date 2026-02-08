import { ThumbsUp, ThumbsDown, MessageSquare, Share2, Bookmark, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

interface WatchActionBarProps {
  likeCount: number;
  dislikeCount: number;
  commentCount: number;
  savedCount: number;
  isLiked: boolean;
  isDisliked: boolean;
  isSaved: boolean;
  onLike: () => void;
  onDislike: () => void;
  onComment: () => void;
  onShare: () => void;
  onSave: () => void;
  onDownload: () => void;
  isLoading?: boolean;
}

export default function WatchActionBar({
  likeCount,
  dislikeCount,
  commentCount,
  savedCount,
  isLiked,
  isDisliked,
  isSaved,
  onLike,
  onDislike,
  onComment,
  onShare,
  onSave,
  onDownload,
  isLoading = false,
}: WatchActionBarProps) {
  const formatCount = (count: number) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    }
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 hide-scrollbar">
      {/* Like/Dislike */}
      <div className="flex items-center rounded-full bg-secondary">
        <Button
          variant="ghost"
          size="sm"
          className={`rounded-l-full ${isLiked ? 'text-primary' : ''}`}
          onClick={onLike}
          disabled={isLoading}
        >
          <ThumbsUp className="mr-2 h-4 w-4" />
          {formatCount(likeCount)}
        </Button>
        <Separator orientation="vertical" className="h-6" />
        <Button
          variant="ghost"
          size="sm"
          className={`rounded-r-full ${isDisliked ? 'text-primary' : ''}`}
          onClick={onDislike}
          disabled={isLoading}
        >
          <ThumbsDown className="h-4 w-4" />
          {dislikeCount > 0 ? formatCount(dislikeCount) : ''}
        </Button>
      </div>

      {/* Comment */}
      <Button
        variant="secondary"
        size="sm"
        className="rounded-full"
        onClick={onComment}
        disabled={isLoading}
      >
        <MessageSquare className="mr-2 h-4 w-4" />
        Comment
        {commentCount > 0 && ` (${formatCount(commentCount)})`}
      </Button>

      {/* Share */}
      <Button
        variant="secondary"
        size="sm"
        className="rounded-full"
        onClick={onShare}
        disabled={isLoading}
      >
        <Share2 className="mr-2 h-4 w-4" />
        Share
      </Button>

      {/* Save */}
      <Button
        variant="secondary"
        size="sm"
        className={`rounded-full ${isSaved ? 'text-primary' : ''}`}
        onClick={onSave}
        disabled={isLoading}
      >
        <Bookmark className={`mr-2 h-4 w-4 ${isSaved ? 'fill-current' : ''}`} />
        {isSaved ? 'Saved' : 'Save'}
      </Button>

      {/* Download */}
      <Button
        variant="secondary"
        size="sm"
        className="rounded-full"
        onClick={onDownload}
        disabled={isLoading}
      >
        <Download className="mr-2 h-4 w-4" />
        Download
      </Button>
    </div>
  );
}
