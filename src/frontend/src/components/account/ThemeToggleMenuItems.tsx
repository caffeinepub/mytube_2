import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from 'next-themes';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';

export default function ThemeToggleMenuItems() {
  const { theme, setTheme } = useTheme();

  return (
    <>
      <DropdownMenuItem
        onClick={() => setTheme('light')}
        className="text-zinc-100 focus:bg-zinc-800 focus:text-white"
      >
        <Sun className="mr-2 h-4 w-4" />
        Light
        {theme === 'light' && <span className="ml-auto text-xs">✓</span>}
      </DropdownMenuItem>
      <DropdownMenuItem
        onClick={() => setTheme('dark')}
        className="text-zinc-100 focus:bg-zinc-800 focus:text-white"
      >
        <Moon className="mr-2 h-4 w-4" />
        Dark
        {theme === 'dark' && <span className="ml-auto text-xs">✓</span>}
      </DropdownMenuItem>
      <DropdownMenuItem
        onClick={() => setTheme('system')}
        className="text-zinc-100 focus:bg-zinc-800 focus:text-white"
      >
        <Monitor className="mr-2 h-4 w-4" />
        System
        {theme === 'system' && <span className="ml-auto text-xs">✓</span>}
      </DropdownMenuItem>
    </>
  );
}
