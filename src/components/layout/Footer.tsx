import { Logo } from '@/components/logo';

export const Footer = () => (
  <footer className="border-t border-white/8 bg-[#060c18] py-10">
    <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 sm:px-6 lg:px-8 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <Logo className="h-8 w-8" />
        <div>
          <p className="text-sm font-semibold text-foreground">Health Access Cebu</p>
          <p className="text-xs text-slate-600">A student GIS project for Cebu LGUs</p>
        </div>
      </div>

      <nav className="flex items-center gap-5 text-sm text-slate-500">
        <a href="#dashboard" className="transition-colors hover:text-white">Analytics</a>
        <a href="#map" className="transition-colors hover:text-white">Map</a>
        <a href="#analysis" className="transition-colors hover:text-white">Data</a>
      </nav>

      <p className="text-xs text-slate-600">Data: PSA 2020 Census · DOH · © OpenStreetMap</p>
    </div>
  </footer>
);