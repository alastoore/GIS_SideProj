import { Shield } from 'lucide-react';

export const Footer = () => (
  <footer className="border-t border-white/8 bg-[#060c18] py-10">
    <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 sm:px-6 lg:px-8 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-cyan-500/15 text-cyan-400 ring-1 ring-cyan-500/20">
          <Shield className="h-4 w-4" />
        </div>
        <div>
          <p className="text-sm font-semibold text-white">HealthAccess GIS</p>
          <p className="text-xs text-slate-600">Data: DOH, PSA</p>
        </div>
      </div>

      <nav className="flex items-center gap-5 text-sm text-slate-500">
        <a href="#features" className="transition-colors hover:text-white">Features</a>
        <a href="#analysis" className="transition-colors hover:text-white">Analysis</a>
        <a href="#contact" className="transition-colors hover:text-white">Contact</a>
      </nav>

      <p className="text-xs text-slate-600">© 2025 HealthAccess GIS</p>
    </div>
  </footer>
);