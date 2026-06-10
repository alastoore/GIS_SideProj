import { Button } from '../ui/Button';
import { Icon } from '../ui/Icon';
import { cn } from '../../lib/utils';

export const Navbar = ({ scrolled }: { scrolled: boolean }) => {
  return (
    <header className={cn(
      "fixed top-0 w-full z-50 transition-all duration-300",
      scrolled ? "py-2" : "py-6"
    )}>
      <div className={cn("mx-auto max-w-7xl px-4 transition-all", scrolled ? "max-w-full px-0" : "")}>
        <nav className={cn(
          "flex justify-between items-center px-8 py-3 transition-all",
          scrolled ? "bg-[#0f172a]/80 backdrop-blur-md border-b border-slate-800" : "bg-slate-900/70 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl"
        )}>
          <div className="flex items-center gap-2">
            <Icon name="health_and_safety" className="text-secondary text-3xl" />
            <span className="font-bold text-white text-xl tracking-tight">HealthAccess</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-slate-400 hover:text-white text-sm font-medium">Features</a>
            <a href="#analysis" className="text-slate-400 hover:text-white text-sm font-medium">Solutions</a>
          </div>
          <Button size="sm">Get Started</Button>
        </nav>
      </div>
    </header>
  );
};