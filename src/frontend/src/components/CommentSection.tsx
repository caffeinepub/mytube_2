import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { formatDistanceToNow } from 'date-fns';

interface Comment {
  id: string;
  author: string;
  authorId: string;
  content: string;
  createdAt: Date;
}

interface CommentSectionProps {
  videoId: string;
  comments: Comment[];
}

export default function CommentSection({ videoId, comments: initialComments }: CommentSectionProps) {
  const { identity, login } = useInternetIdentity();
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identity) {
      login();
      return;
    }
    if (!newComment.trim()) return;

    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));
      const comment: Comment = {
        id: Date.now().toString(),
        author: 'You',
        authorId: identity.getPrincipal().toString(),
        content: newComment,
        createdAt: new Date(),
      };
      setComments([comment, ...comments]);
      setNewComment('');
    } catch (error) {
      console.error('Failed to post comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">{comments.length} Comments</h2>

      {identity ? (
        <form onSubmit={handleSubmit} className="flex gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src="" />
            <AvatarFallback className="bg-gradient-to-br from-[#d97398] to-[#5fc4d4] text-white">
              U
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-2">
            <Textarea
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
                disabled={!newComment.trim() || isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={!newComment.trim() || isSubmitting}>
                {isSubmitting ? 'Posting...' : 'Comment'}
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
        {comments.map((comment) => (
          <div key={comment.id} className="flex gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src="" />
              <AvatarFallback className="bg-gradient-to-br from-[#d97398] to-[#5fc4d4] text-white">
                {comment.author.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold">{comment.author}</span>
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(comment.createdAt, { addSuffix: true })}
                </span>
              </div>
              <p className="text-sm text-foreground">{comment.content}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
