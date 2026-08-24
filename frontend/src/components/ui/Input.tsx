import { forwardRef } from 'react';
import { cn } from '@/utils/cn';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?:        string;
  error?:        string;
  hint?:         string;
  leftElement?:  React.ReactNode;
  rightElement?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, leftElement, rightElement, className, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');
    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label htmlFor={inputId} className="block text-xs font-medium text-ink-secondary">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {leftElement && (
            <div className="pointer-events-none absolute left-3 text-ink-faint">{leftElement}</div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              'w-full rounded-xl bg-base-surface px-4 py-3 text-sm text-ink',
              'border border-base-border placeholder:text-ink-faint',
              'transition-colors duration-150',
              'focus:border-green/40 focus:outline-none focus:bg-base-card focus:shadow-glow-sm',
              error && 'border-red/50 focus:border-red/70',
              'disabled:cursor-not-allowed disabled:opacity-40',
              leftElement  && 'pl-9',
              rightElement && 'pr-12',
              className,
            )}
            {...props}
          />
          {rightElement && (
            <div className="absolute right-3 flex items-center">{rightElement}</div>
          )}
        </div>
        {error && <p className="text-xs text-red">{error}</p>}
        {hint && !error && <p className="text-xs text-ink-faint">{hint}</p>}
      </div>
    );
  },
);
Input.displayName = 'Input';
