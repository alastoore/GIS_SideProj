import React from 'react';
import { cn } from '../../lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export const Button = ({ 
  variant = 'primary', 
  size = 'md', 
  className, 
  children, 
  ...props 
}: ButtonProps) => {
  const variants = {
    primary: "bg-secondary text-white shadow-lg shadow-secondary/20 hover:bg-secondary/90",
    secondary: "bg-slate-800 text-white hover:bg-slate-700 border border-slate-700",
    outline: "glass-panel text-white hover:bg-slate-800 border border-white/10",
    ghost: "text-slate-400 hover:text-white"
  };

  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3",
    lg: "px-8 py-4 text-lg"
  };

  return (
    <button 
      className={cn(
        "rounded-2xl font-semibold transition-all duration-300 flex items-center justify-center gap-2",
        "hover:-translate-y-1 active:translate-y-0 disabled:opacity-50",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};