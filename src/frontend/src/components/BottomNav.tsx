import { Link, useRouterState } from '@tanstack/react-router';
import { Home, PlaySquare, Compass, Upload, Library, Settings } from 'lucide-react';
import { followCopy } from '@/lib/followCopy';
import { cn } from '@/lib/utils';

export default function BottomNav() {
  const router = useRouterState();
  const currentPath = router.location.pathname;

  const navItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: PlaySquare, label: 'Shorts', path: '/shorts' },
    { icon: Compass, label: followCopy.navigation.label, path: '/following' },
    { icon: Upload, label: 'Upload', path: '/upload' },
    { icon: Library, label: 'Library', path: '/library' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around border-t border-border bg-bottom-nav-bar px-2 py-2 shadow-lg md:hidden">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = currentPath === item.path;
        return (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              'flex flex-col items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors bg-bottom-nav-button',
              isActive
                ? 'text-primary'
                : 'text-muted-foreground'
            )}
          >
            <Icon className={cn('h-5 w-5', isActive && 'fill-primary')} />
            <span className="text-[10px]">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
