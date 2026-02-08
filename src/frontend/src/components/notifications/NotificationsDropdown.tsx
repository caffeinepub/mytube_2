import { Bell, MessageSquare, Heart, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useNotifications, type NotificationType } from '@/hooks/useNotifications';
import { cn } from '@/lib/utils';

function getNotificationIcon(type: NotificationType) {
  switch (type) {
    case 'comment':
      return <MessageSquare className="h-4 w-4 text-blue-500" />;
    case 'like':
      return <Heart className="h-4 w-4 text-pink-500" />;
    case 'follower':
      return <UserPlus className="h-4 w-4 text-green-500" />;
  }
}

function formatTimestamp(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  if (minutes < 60) {
    return `${minutes}m ago`;
  } else if (hours < 24) {
    return `${hours}h ago`;
  } else {
    return `${days}d ago`;
  }
}

export default function NotificationsDropdown() {
  const { notifications, unreadCount, isSignedIn, markAsRead, markAllAsRead } = useNotifications();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {isSignedIn && unreadCount > 0 && (
            <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="w-80 p-0 backdrop-blur-none bg-[#ffffff] dark:bg-[#1a1a1a]"
      >
        <div className="flex items-center justify-between border-b border-border px-4 py-3 bg-[#ffffff] dark:bg-[#1a1a1a]">
          <h3 className="font-semibold">Notifications</h3>
          {isSignedIn && unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              className="h-auto p-1 text-xs text-muted-foreground hover:text-foreground"
            >
              Mark all as read
            </Button>
          )}
        </div>
        
        {!isSignedIn ? (
          <div className="flex flex-col items-center justify-center gap-2 py-8 text-center bg-[#ffffff] dark:bg-[#1a1a1a]">
            <Bell className="h-12 w-12 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">
              Sign in to see your notifications
            </p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-8 text-center bg-[#ffffff] dark:bg-[#1a1a1a]">
            <Bell className="h-12 w-12 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">
              No notifications yet
            </p>
          </div>
        ) : (
          <ScrollArea className="max-h-[400px] bg-[#ffffff] dark:bg-[#1a1a1a]">
            <div className="py-1 bg-[#ffffff] dark:bg-[#1a1a1a]">
              {notifications.map((notification) => (
                <DropdownMenuItem
                  key={notification.id}
                  className={cn(
                    'flex cursor-pointer items-start gap-3 px-4 py-3 focus:bg-accent bg-[#ffffff] dark:bg-[#1a1a1a]',
                    !notification.read && 'bg-accent/30'
                  )}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="mt-0.5 shrink-0">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm leading-snug">{notification.message}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatTimestamp(notification.timestamp)}
                    </p>
                  </div>
                  {!notification.read && (
                    <div className="mt-2 h-2 w-2 shrink-0 rounded-full bg-primary" />
                  )}
                </DropdownMenuItem>
              ))}
            </div>
          </ScrollArea>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
