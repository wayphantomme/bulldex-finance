import { forwardRef } from 'react';
import { cn } from '@/utils/cn';

// ─── Token Terminal button spec:
// Primary:   bg-[#10b981] text-[#0d0d0d] rounded-md h-8 px-3 text-[13px] font-semibold
// Ghost:     bg-transparent border border-[#262626] text-[#a3a3a3] rounded-md
// Danger:    bg-transparent border border-[#ef4444] text-[#ef4444]
// Icon btn:  w-7 h-7 rounded-md border border-[#262626]
// NO gradients, NO glow shadows on default, NO rounded-xl or rounded-2xl

type Variant = 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger';
type Size    = 'xs' | 'sm' | 'md' | 'lg' | 'icon';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:   Variant;
  size?:      Size;
  isLoading?: boolean;
  leftIcon?:  React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

const variants: Record<Variant, string> = {
  // Primary — TT emerald CTA, dark text
  primary: [
    'bg-[#10b981] text-[#0d0d0d] font-semibold',
    'hover:bg-[#059669]',
    'active:opacity-90',
    'disabled:opacity-40 disabled:cursor-not-allowed',
  ].join(' '),

  // Secondary — same as ghost but slightly more prominent
  secondary: [
    'bg-[#161616] text-[#f5f5f5] border border-[#262626]',
    'hover:bg-[#1e1e1e] hover:border-[#2e2e2e]',
    'disabled:opacity-40 disabled:cursor-not-allowed',
  ].join(' '),

  // Ghost — border only, for filters and secondary actions
  ghost: [
    'bg-transparent text-[#a3a3a3] border border-[#262626]',
    'hover:border-[#2e2e2e] hover:text-[#f5f5f5]',
    'disabled:opacity-40 disabled:cursor-not-allowed',
  ].join(' '),

  // Outline — brand-tinted, for "View all →" type actions
  outline: [
    'bg-transparent text-[#10b981] border border-[#064e3b]',
    'hover:bg-[#064e3b]/30 hover:border-[#10b981]/40',
    'disabled:opacity-40 disabled:cursor-not-allowed',
  ].join(' '),

  // Danger — destructive actions
  danger: [
    'bg-transparent text-[#ef4444] border border-[#ef4444]/30',
    'hover:bg-[#ef4444]/10 hover:border-[#ef4444]/60',
    'disabled:opacity-40 disabled:cursor-not-allowed',
  ].join(' '),
};

const sizes: Record<Size, string> = {
  xs:   'h-7  sm:h-6  px-2    text-[12px] sm:text-[11px] rounded-sm  gap-1',
  sm:   'h-9  sm:h-7  px-3    text-[13px] sm:text-[12px] rounded-md  gap-1.5',
  md:   'h-10 sm:h-8  px-4    text-[14px] sm:text-[13px] rounded-md  gap-1.5',  // ← mobile 44px, desktop 32px
  lg:   'h-11 sm:h-9  px-5    text-[14px] sm:text-[13px] rounded-md  gap-2',
  icon: 'h-9  sm:h-7  w-9 sm:w-7 text-[13px] sm:text-[12px] rounded-md  gap-0 p-0 justify-center',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      isLoading,
      leftIcon,
      rightIcon,
      fullWidth,
      className,
      disabled,
      children,
      ...props
    },
    ref,
  ) => (
    <button
      ref={ref}
      disabled={disabled || isLoading}
      className={cn(
        'inline-flex items-center justify-center font-medium transition-colors duration-100 select-none',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#404040] focus-visible:ring-offset-1 focus-visible:ring-offset-[#0d0d0d]',
        variants[variant],
        sizes[size],
        fullWidth && 'w-full',
        className,
      )}
      {...props}
    >
      {isLoading ? (
        <>
          <Spinner />
          {children && <span>{children}</span>}
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

function Spinner() {
  return (
    <svg
      className="h-3.5 w-3.5 animate-spin shrink-0"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle
        className="opacity-20"
        cx="12" cy="12" r="10"
        stroke="currentColor"
        strokeWidth="3"
      />
      <path
        className="opacity-80"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}
