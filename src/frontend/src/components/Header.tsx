import { Link, useNavigate } from '@tanstack/react-router';
import { Search, Upload, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function Header() {
  const { identity, login, clear, isLoggingIn } = useInternetIdentity();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Search functionality would go here
      console.log('Search:', searchQuery);
    }
  };

  return (
    <header className="sticky top-0 z-50 flex h-16 items-center gap-4 border-b border-border bg-card px-4 shadow-sm">
      <Link to="/" className="flex items-center gap-2">
        <img src="/assets/Picsart_26-02-04_12-36-12-798.jpg.jpeg" alt="mytube" className="h-10 w-10 rounded-lg" />
        <span className="text-xl font-bold bg-gradient-to-r from-[#d97398] via-[#8eb5c0] to-[#5fc4d4] bg-clip-text text-transparent">
          mytube
        </span>
      </Link>

      <form onSubmit={handleSearch} className="mx-auto flex w-full max-w-2xl items-center gap-2">
        <div className="relative flex-1">
          <Input
            type="search"
            placeholder="Search videos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-full border-muted-foreground/20 bg-secondary/50 pl-4 pr-12"
          />
          <Button
            type="submit"
            size="icon"
            variant="ghost"
            className="absolute right-0 top-0 h-full rounded-r-full"
          >
            <Search className="h-5 w-5" />
          </Button>
        </div>
      </form>

      <div className="flex items-center gap-2">
        {identity ? (
          <>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate({ to: '/upload' })}
              title="Upload video"
            >
              <Upload className="h-5 w-5" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={() => navigate({ to: '/library' })}>
                  Your Library
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate({ to: `/channel/${identity.getPrincipal().toString()}` })}>
                  Your Channel
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={clear}>
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        ) : (
          <Button onClick={login} disabled={isLoggingIn} variant="default">
            {isLoggingIn ? 'Signing in...' : 'Sign In'}
          </Button>
        )}
      </div>
    </header>
  );
}
