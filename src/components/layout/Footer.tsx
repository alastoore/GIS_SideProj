import { Logo } from '@/components/logo';

export const Footer = () => (
  <footer className="border-t border-border bg-background py-10">
    <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 sm:px-6 lg:px-8 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <Logo className="h-8 w-8" />
        <div>
          <p className="text-sm font-semibold text-foreground">Health Access Cebu</p>
          <p className="text-xs text-muted-foreground/80">A student GIS project for Cebu LGUs</p>
        </div>
      </div>

      <nav className="flex items-center gap-5 text-sm text-muted-foreground">
        <a href="#dashboard" className="transition-colors hover:text-foreground">Analytics</a>
        <a href="#map" className="transition-colors hover:text-foreground">Map</a>
        <a href="#analysis" className="transition-colors hover:text-foreground">Data</a>
      </nav>

      <p className="text-xs text-muted-foreground/80">Data: PSA 2020 Census · DOH · © OpenStreetMap</p>
    </div>
  </footer>
);