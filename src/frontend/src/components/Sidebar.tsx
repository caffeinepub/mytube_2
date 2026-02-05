import { Link, useRouterState } from '@tanstack/react-router';
import { Home, Compass, Upload, Library, Settings } from 'lucide-react';
import { followCopy } from '@/lib/followCopy';
import { cn } from '@/lib/utils';

export default function Sidebar() {
  const router = useRouterState();
  const currentPath = router.location.pathname;

  const navItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: Compass, label: followCopy.navigation.label, path: '/following' },
    { icon: Upload, label: 'Upload', path: '/upload' },
    { icon: Library, label: 'Library', path: '/library' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];

  return (
    <aside className="hidden w-64 flex-col gap-2 border-r border-border bg-card p-4 md:flex">
      <nav className="flex flex-col gap-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPath === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-accent text-accent-foreground'
                  : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
              )}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
