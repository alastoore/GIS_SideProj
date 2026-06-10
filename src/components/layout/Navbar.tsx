import { useState } from 'react';
import { Button } from '../ui/Button';
import { Shield, Menu, X } from 'lucide-react';
import { cn } from '../../lib/utils';

export const Navbar = ({ scrolled }: { scrolled: boolean }) => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className={cn(
      "fixed inset-x-0 top-0 z-50 transition-all duration-300",
      scrolled ? "py-2" : "py-4"
    )}>
      <div className={cn(
        "mx-auto max-w-6xl px-4 sm:px-6 transition-all duration-300",
        scrolled
          ? "rounded-none border-b border-white/8 bg-[#060c18]/95 backdrop-blur-md"
          : "rounded-2xl border border-white/8 bg-[#060c18]/70 backdrop-blur-xl"
      )}>
        <div className="flex h-14 items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-500/15 text-cyan-400 ring-1 ring-cyan-500/20">
              <Shield className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white leading-none">HealthAccess</p>
              <p className="text-[11px] text-slate-500 mt-0.5">GIS Planning</p>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-sm text-slate-400 transition-colors hover:text-white">Features</a>
            <a href="#solutions" className="text-sm text-slate-400 transition-colors hover:text-white">Solutions</a>
            <a href="#contact" className="text-sm text-slate-400 transition-colors hover:text-white">Contact</a>
          </nav>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              className="hidden bg-cyan-500 text-slate-950 hover:bg-cyan-400 shadow-none md:flex"
            >
              Get started
            </Button>
            <button
              type="button"
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 text-slate-300 transition hover:bg-white/5 md:hidden"
              onClick={() => setMenuOpen((o) => !o)}
              aria-label="Toggle menu"
            >
              {menuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </div>

      {menuOpen && (
        <div className="mx-auto max-w-6xl px-4 sm:px-6 md:hidden">
          <div className="rounded-b-2xl border border-t-0 border-white/8 bg-[#060c18]/95 px-4 pb-4 pt-2 backdrop-blur-xl">
            <a href="#features" className="block rounded-xl px-4 py-3 text-sm text-slate-300 transition hover:bg-white/5 hover:text-white" onClick={() => setMenuOpen(false)}>Features</a>
            <a href="#solutions" className="block rounded-xl px-4 py-3 text-sm text-slate-300 transition hover:bg-white/5 hover:text-white" onClick={() => setMenuOpen(false)}>Solutions</a>
            <a href="#contact" className="block rounded-xl px-4 py-3 text-sm text-slate-300 transition hover:bg-white/5 hover:text-white" onClick={() => setMenuOpen(false)}>Contact</a>
          </div>
        </div>
      )}
    </header>
  );
};