import { useState, useRef, forwardRef, useImperativeHandle } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCommentsForVideo, useAddComment, useGetCallerUserProfile } from '../hooks/useQueries';
import { formatDistanceToNow } from 'date-fns';
import type { Comment } from '../backend';

interface CommentSectionProps {
  videoId: string;
}

export interface CommentSectionRef {
  focusInput: () => void;
}

const CommentSection = forwardRef<CommentSectionRef, CommentSectionProps>(({ videoId }, ref) => {
  const { identity, login } = useInternetIdentity();
  const { data: comments = [], isLoading: commentsLoading } = useGetCommentsForVideo(videoId);
  const { data: userProfile } = useGetCallerUserProfile();
  const addCommentMutation = useAddComment();
  const [newComment, setNewComment] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Expose focus method to parent
  useImperativeHandle(ref, () => ({
    focusInput: () => {
      textareaRef.current?.focus();
      textareaRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    },
  }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identity) {
      login();
      return;
    }
    if (!newComment.trim()) return;

    try {
      await addCommentMutation.mutateAsync({
        videoId,
        text: newComment.trim(),
      });
      setNewComment('');
    } catch (error: any) {
      console.error('Failed to post comment:', error);
      // Error handling via React Query
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">{comments.length} Comments</h2>

      {identity ? (
        <form onSubmit={handleSubmit} className="flex gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={userProfile?.profilePhotoUrl || ''} />
            <AvatarFallback className="bg-gradient-to-br from-[#d97398] to-[#5fc4d4] text-white">
              {userProfile?.displayName?.charAt(0).toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-2">
            <Textarea
              ref={textareaRef}
              placeholder="Add a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="min-h-[80px] resize-none"
            />
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setNewComment('')}
                disabled={!newComment.trim() || addCommentMutation.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={!newComment.trim() || addCommentMutation.isPending}>
                {addCommentMutation.isPending ? 'Posting...' : 'Comment'}
              </Button>
            </div>
          </div>
        </form>
      ) : (
        <div className="rounded-lg border border-border bg-muted/50 p-4 text-center">
          <p className="text-sm text-muted-foreground">
            <Button variant="link" onClick={login} className="p-0">
              Sign in
            </Button>{' '}
            to leave a comment
          </p>
        </div>
      )}

      <div className="space-y-4">
        {commentsLoading ? (
          <>
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-16 w-full" />
                </div>
              </div>
            ))}
          </>
        ) : comments.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            No comments yet. Be the first to comment!
          </div>
        ) : (
          comments.map((comment: Comment) => (
            <div key={comment.id.toString()} className="flex gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src="" />
                <AvatarFallback className="bg-gradient-to-br from-[#d97398] to-[#5fc4d4] text-white">
                  {comment.author.toString().charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold">
                    {comment.author.toString().slice(0, 8)}...
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(Number(comment.timestamp) / 1000000), { addSuffix: true })}
                  </p>
                </div>
                <p className="text-sm text-foreground">{comment.text}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
});

CommentSection.displayName = 'CommentSection';

export default CommentSection;
