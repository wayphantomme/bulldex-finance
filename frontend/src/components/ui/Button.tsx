import { forwardRef } from 'react';
import { cn } from '@/utils/cn';

type Variant = 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger';
type Size    = 'xs' | 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:   Variant;
  size?:      Size;
  isLoading?: boolean;
  leftIcon?:  React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

const variants: Record<Variant, string> = {
  // Primary — solid lime-green, black text. Jupiter "Connect" button style.
  // No gradient, no shadow by default — only glow on hover.
  primary: [
    'bg-brand text-base-bg font-semibold',
    'hover:bg-brand-dark hover:shadow-glow-sm',
    'active:opacity-90',
    'disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none',
  ].join(' '),

  // Secondary — cream tone
  secondary: [
    'bg-cream text-base-bg font-semibold',
    'hover:opacity-90',
    'disabled:opacity-40 disabled:cursor-not-allowed',
  ].join(' '),

  // Ghost — subtle dark card
  ghost: [
    'bg-base-card text-ink-secondary border border-base-border',
    'hover:bg-base-elevated hover:text-ink hover:border-base-border-light',
    'disabled:opacity-40 disabled:cursor-not-allowed',
  ].join(' '),

  // Outline — brand-tinted border, no fill
  outline: [
    'bg-transparent text-brand border border-brand-border',
    'hover:bg-brand-faint hover:border-brand',
    'disabled:opacity-40 disabled:cursor-not-allowed',
  ].join(' '),

  // Danger
  danger: [
    'bg-red/10 text-red border border-red/20',
    'hover:bg-red/20',
    'disabled:opacity-40 disabled:cursor-not-allowed',
  ].join(' '),
};

const sizes: Record<Size, string> = {
  xs: 'h-7  px-2.5 text-xs  rounded-lg  gap-1',
  sm: 'h-8  px-3   text-xs  rounded-lg  gap-1.5',
  md: 'h-10 px-4   text-sm  rounded-xl  gap-2',
  // lg: tall pill-ish CTA — matches Jupiter's main action button
  lg: 'h-14 px-6   text-sm  rounded-xl  gap-2',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', isLoading, leftIcon, rightIcon, fullWidth, className, disabled, children, ...props }, ref) => (
    <button
      ref={ref}
      disabled={disabled || isLoading}
      className={cn(
        'inline-flex items-center justify-center font-medium transition-all duration-150 select-none',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 focus-visible:ring-offset-1 focus-visible:ring-offset-base-bg',
        variants[variant],
        sizes[size],
        fullWidth && 'w-full',
        className,
      )}
      {...props}
    >
      {isLoading ? (
        <>
          <Spinner size={size} />
          <span>{children}</span>
        </>
      ) : (
        <>
          {leftIcon  && <span className="shrink-0">{leftIcon}</span>}
          {children}
          {rightIcon && <span className="shrink-0">{rightIcon}</span>}
        </>
      )}
    </button>
  ),
);
Button.displayName = 'Button';

function Spinner({ size }: { size: Size }) {
  const cls = size === 'xs' || size === 'sm' ? 'h-3 w-3' : 'h-4 w-4';
  return (
    <svg className={cn(cls, 'animate-spin')} viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}
