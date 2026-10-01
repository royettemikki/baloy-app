import { ButtonHTMLAttributes } from 'react';

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
};

const VARIANTS = {
  primary: 'bg-brand text-on-brand shadow-sm hover:bg-brand-strong focus-visible:ring-brand disabled:opacity-60',
  secondary: 'bg-surface text-ink border border-line shadow-sm hover:bg-surface-hover focus-visible:ring-brand',
  danger: 'bg-danger-soft text-danger hover:brightness-95 focus-visible:ring-danger',
  ghost: 'bg-transparent text-ink-soft hover:bg-surface-hover hover:text-ink focus-visible:ring-brand',
};

const SIZES = {
  sm: 'min-h-9 text-xs px-3.5 rounded-lg',
  md: 'min-h-10 text-sm px-4 rounded-xl',
  lg: 'min-h-11 text-sm px-5 rounded-xl',
};

export default function Button({ variant = 'primary', size = 'md', className = '', ...props }: Props) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 font-medium transition-all duration-150 outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-surface ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...props}
    />
  );
}
