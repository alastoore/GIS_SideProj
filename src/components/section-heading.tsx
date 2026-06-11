import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface SectionHeadingProps {
  index: string;
  label: string;
  children: ReactNode;
  className?: string;
}

export const SectionHeading = ({ index, label, children, className }: SectionHeadingProps) => (
  <div className={cn('max-w-2xl', className)}>
    <div className="flex items-center gap-3 text-xs">
      <span className="font-mono text-cyan-400/80">{index}</span>
      <span className="h-px w-10 bg-white/15" />
      <span className="uppercase tracking-[0.25em] text-slate-500">{label}</span>
    </div>
    <h2 className="font-display mt-5 text-4xl font-medium tracking-tight text-foreground sm:text-5xl">
      {children}
    </h2>
  </div>
);
