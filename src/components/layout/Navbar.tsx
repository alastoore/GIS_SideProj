import { useState } from 'react';
import { Menu, Moon, Sun, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/logo';
import { useTheme } from '@/components/theme-provider';
import { cn } from '@/lib/utils';

export const Navbar = ({ scrolled }: { scrolled: boolean }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  return (
    <header className={cn(
      "fixed inset-x-0 top-0 z-50 transition-all duration-300",
      scrolled ? "py-2" : "py-4"
    )}>
      <div className={cn(
        "mx-auto max-w-6xl px-4 sm:px-6 transition-all duration-300",
        scrolled
          ? "rounded-none border-b border-border bg-background/95 backdrop-blur-md"
          : "rounded-2xl border border-border bg-background/70 backdrop-blur-xl"
      )}>
        <div className="flex h-14 items-center justify-between">
          <a href="#top" className="flex items-center gap-3">
            <Logo className="h-8 w-8" />
            <div>
              <p className="text-sm font-semibold text-foreground leading-none">Health Access Cebu</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">Barangay accessibility atlas</p>
            </div>
          </a>

          <nav className="hidden md:flex items-center gap-6">
            <a href="#dashboard" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Analytics</a>
            <a href="#map" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Map</a>
            <a href="#analysis" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Data</a>
          </nav>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              onClick={toggleTheme}
            >
              {theme === 'dark' ? <Sun /> : <Moon />}
            </Button>
            <Button size="sm" className="hidden md:inline-flex" asChild>
              <a href="#map">Explore the map</a>
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="md:hidden"
              onClick={() => setMenuOpen((o) => !o)}
              aria-label="Toggle menu"
            >
              {menuOpen ? <X /> : <Menu />}
            </Button>
          </div>
        </div>
      </div>

      {menuOpen && (
        <div className="mx-auto max-w-6xl px-4 sm:px-6 md:hidden">
          <div className="rounded-b-2xl border border-t-0 border-border bg-background/95 px-4 pb-4 pt-2 backdrop-blur-xl">
            <a href="#dashboard" className="block rounded-xl px-4 py-3 text-sm text-muted-foreground transition hover:bg-foreground/5 hover:text-foreground" onClick={() => setMenuOpen(false)}>Analytics</a>
            <a href="#map" className="block rounded-xl px-4 py-3 text-sm text-muted-foreground transition hover:bg-foreground/5 hover:text-foreground" onClick={() => setMenuOpen(false)}>Map</a>
            <a href="#analysis" className="block rounded-xl px-4 py-3 text-sm text-muted-foreground transition hover:bg-foreground/5 hover:text-foreground" onClick={() => setMenuOpen(false)}>Data</a>
          </div>
        </div>
      )}
    </header>
  );
};
