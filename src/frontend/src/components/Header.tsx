import { Link } from '@tanstack/react-router';
import { Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import NotificationsDropdown from './notifications/NotificationsDropdown';
import ProfileMenu from './account/ProfileMenu';

export default function Header() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showMobileSearch, setShowMobileSearch] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Search functionality would go here
      console.log('Search:', searchQuery);
      setShowMobileSearch(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 flex h-16 items-center gap-4 border-b border-border bg-card px-4 shadow-sm">
      {/* Logo - always visible */}
      <Link to="/" className="flex items-center gap-2 shrink-0">
        <img src="/assets/Picsart_26-02-04_12-36-12-798.jpg.jpeg" alt="mytube" className="h-10 w-10 rounded-lg" />
        <span className="text-xl font-bold bg-gradient-to-r from-[#d97398] via-[#8eb5c0] to-[#5fc4d4] bg-clip-text text-transparent">
          mytube
        </span>
      </Link>

      {/* Desktop search - hidden on mobile */}
      <form onSubmit={handleSearch} className="mx-auto hidden w-full max-w-2xl items-center gap-2 md:flex">
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

      {/* Desktop right actions - hidden on mobile */}
      <div className="hidden items-center gap-1 md:flex">
        <NotificationsDropdown />
        <ProfileMenu />
      </div>

      {/* Mobile right actions - visible only on mobile */}
      <div className="ml-auto flex items-center gap-1 md:hidden">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setShowMobileSearch(!showMobileSearch)}
        >
          {showMobileSearch ? <X className="h-5 w-5" /> : <Search className="h-5 w-5" />}
        </Button>
        <NotificationsDropdown />
        <ProfileMenu />
      </div>

      {/* Mobile search dropdown - appears below header */}
      {showMobileSearch && (
        <div className="absolute left-0 right-0 top-16 z-40 border-b border-border bg-[#1a1a1a] p-4 shadow-lg md:hidden">
          <form onSubmit={handleSearch} className="flex items-center gap-2">
            <div className="relative flex-1">
              <Input
                type="search"
                placeholder="Search videos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-full border-muted-foreground/20 bg-secondary/50 pl-4 pr-12"
                autoFocus
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
        </div>
      )}
    </header>
  );
}
