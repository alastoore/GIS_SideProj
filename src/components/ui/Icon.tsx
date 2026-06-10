import { cn } from '../../lib/utils';

interface IconProps {
  name: string;
  className?: string;
  fill?: boolean;
}

export const Icon = ({ name, className, fill = false }: IconProps) => (
  <span 
    className={cn("material-symbols-outlined select-none", className)}
    style={{ fontVariationSettings: `'FILL' ${fill ? 1 : 0}` }}
  >
    {name}
  </span>
);