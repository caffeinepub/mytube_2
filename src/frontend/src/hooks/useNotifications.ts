import { useState, useEffect } from 'react';
import { useInternetIdentity } from './useInternetIdentity';

export type NotificationType = 'comment' | 'like' | 'follower';

export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  timestamp: number;
  read: boolean;
}

const STORAGE_KEY_PREFIX = 'mytube_notifications_';

// Seed notifications for demo purposes
const seedNotifications = (userId: string): Notification[] => [
  {
    id: `${userId}_1`,
    type: 'comment',
    message: 'Someone commented on your video "Amazing Sunset"',
    timestamp: Date.now() - 1000 * 60 * 30, // 30 minutes ago
    read: false,
  },
  {
    id: `${userId}_2`,
    type: 'like',
    message: 'Your video "Travel Vlog Day 1" received 10 new likes',
    timestamp: Date.now() - 1000 * 60 * 60 * 2, // 2 hours ago
    read: false,
  },
  {
    id: `${userId}_3`,
    type: 'follower',
    message: 'You have 3 new followers',
    timestamp: Date.now() - 1000 * 60 * 60 * 5, // 5 hours ago
    read: false,
  },
  {
    id: `${userId}_4`,
    type: 'comment',
    message: 'New reply to your comment on "Tech Review 2026"',
    timestamp: Date.now() - 1000 * 60 * 60 * 24, // 1 day ago
    read: true,
  },
];

export function useNotifications() {
  const { identity } = useInternetIdentity();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isSignedIn, setIsSignedIn] = useState(false);

  useEffect(() => {
    if (identity) {
      const userId = identity.getPrincipal().toString();
      setIsSignedIn(true);
      
      // Load from localStorage
      const storageKey = STORAGE_KEY_PREFIX + userId;
      const stored = localStorage.getItem(storageKey);
      
      if (stored) {
        try {
          setNotifications(JSON.parse(stored));
        } catch (error) {
          console.error('Error parsing stored notifications:', error);
          // Seed if parsing fails
          const seeded = seedNotifications(userId);
          setNotifications(seeded);
          localStorage.setItem(storageKey, JSON.stringify(seeded));
        }
      } else {
        // First time - seed notifications
        const seeded = seedNotifications(userId);
        setNotifications(seeded);
        localStorage.setItem(storageKey, JSON.stringify(seeded));
      }
    } else {
      setIsSignedIn(false);
      setNotifications([]);
    }
  }, [identity]);

  const markAsRead = (notificationId: string) => {
    if (!identity) return;
    
    const updated = notifications.map(n =>
      n.id === notificationId ? { ...n, read: true } : n
    );
    setNotifications(updated);
    
    const userId = identity.getPrincipal().toString();
    const storageKey = STORAGE_KEY_PREFIX + userId;
    localStorage.setItem(storageKey, JSON.stringify(updated));
  };

  const markAllAsRead = () => {
    if (!identity) return;
    
    const updated = notifications.map(n => ({ ...n, read: true }));
    setNotifications(updated);
    
    const userId = identity.getPrincipal().toString();
    const storageKey = STORAGE_KEY_PREFIX + userId;
    localStorage.setItem(storageKey, JSON.stringify(updated));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return {
    notifications,
    unreadCount,
    isSignedIn,
    markAsRead,
    markAllAsRead,
  };
}
