import { cn } from '@/lib/utils';

/** Map pin with a medical cross — the Health Access Cebu mark. */
export const Logo = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 32 32"
    className={cn('h-9 w-9', className)}
    role="img"
    aria-label="Health Access Cebu"
  >
    <defs>
      <linearGradient id="hac-pin" x1="0" y1="0" x2="1" y2="1">
        <stop stopColor="#22d3ee" />
        <stop offset="1" stopColor="#0e7490" />
      </linearGradient>
    </defs>
    <path
      d="M16 2.5C9.9 2.5 5 7.4 5 13.5c0 8 11 16 11 16s11-8 11-16c0-6.1-4.9-11-11-11Z"
      fill="url(#hac-pin)"
    />
    <path
      d="M14 6.5h4v4.5h4.5v4H18v4.5h-4V15h-4.5v-4H14V6.5Z"
      fill="#06121f"
    />
  </svg>
);
