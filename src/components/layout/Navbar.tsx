import { Button } from '../ui/Button';
import { Shield, Menu } from 'lucide-react';
import { cn } from '../../lib/utils';

export const Navbar = ({ scrolled }: { scrolled: boolean }) => {
  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled ? "py-2" : "py-6"
      )}
    >
      <div
        className={cn(
          "mx-auto max-w-7xl px-4 transition-all duration-300",
          scrolled ? "max-w-full px-6" : ""
        )}
      >
        <nav
          className={cn(
            "flex items-center justify-between transition-all duration-300",
            "font-sans",
            scrolled
              ? "bg-slate-950/70 backdrop-blur-md border-b border-white/10 px-6 py-3"
              : "bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl px-8 py-4 shadow-lg"
          )}
        >
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400">
              <Shield className="w-6 h-6"/>
            </div>

            <span className="font-semibold text-white text-lg tracking-tight">
              HealthAccess
            </span>
          </div>

          {/* Links */}
          <div className="hidden md:flex items-center gap-10">
            <a
              href="#features"
              className="text-sm text-slate-400 hover:text-white transition-colors"
            >
              Features
            </a>
            <a
              href="#analysis"
              className="text-sm text-slate-400 hover:text-white transition-colors"
            >
              Solutions
            </a>
            <a
              href="#docs"
              className="text-sm text-slate-400 hover:text-white transition-colors"
            >
              Docs
            </a>
          </div>

          {/* CTA */}
          <Button size="sm" className="font-medium">
            Get Started
          </Button>
        </nav>
      </div>
    </header>
  );
};
