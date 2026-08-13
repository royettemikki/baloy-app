import { ButtonHTMLAttributes } from 'react';

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md';
};

const VARIANTS = {
  primary: 'bg-brand text-on-brand disabled:opacity-60',
  secondary: 'bg-surface-muted text-ink border border-line',
  danger: 'bg-transparent text-danger',
};

const SIZES = {
  sm: 'text-sm px-4 py-2.5 rounded-lg',
  md: 'text-sm px-4 py-3.5 rounded-xl',
};

export default function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  ...props
}: Props) {
  return (
    <button
      className={`font-medium ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...props}
    />
  );
}
