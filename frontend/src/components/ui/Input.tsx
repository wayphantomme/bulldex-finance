import { forwardRef } from 'react';
import { cn } from '@/utils/cn';

// ─── Token Terminal input spec:
// bg-[#111111] border border-[#262626] rounded-md px-3 py-1.5 text-[13px] text-[#f5f5f5]
// focus: border-[#404040] ring-1 ring-[#404040]
// error: border-[#ef4444]
// placeholder: text-[#525252]

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?:        string;
  error?:        string;
  hint?:         string;
  leftElement?:  React.ReactNode;
  rightElement?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    { label, error, hint, leftElement, rightElement, className, id, ...props },
    ref,
  ) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-[12px] font-medium text-[#a3a3a3]"
          >
            {label}
          </label>
        )}

        <div className="relative flex items-center">
          {leftElement && (
            <div className="pointer-events-none absolute left-3 text-[#525252]">
              {leftElement}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            className={cn(
              // Base
              'w-full rounded-md bg-[#111111] px-3 py-1.5',
              'text-[13px] text-[#f5f5f5] placeholder:text-[#525252]',
              'border border-[#262626]',
              'transition-colors duration-100',
              // Focus
              'focus:border-[#404040] focus:ring-1 focus:ring-[#404040] focus:outline-none',
              // Error
              error && 'border-[#ef4444] focus:border-[#ef4444] focus:ring-[#ef4444]/40',
              // Disabled
              'disabled:cursor-not-allowed disabled:opacity-40',
              // Padding adjustments for adornments
              leftElement  && 'pl-9',
              rightElement && 'pr-10',
              className,
            )}
            {...props}
          />

          {rightElement && (
            <div className="absolute right-3 flex items-center text-[#525252]">
              {rightElement}
            </div>
          )}
        </div>

        {error && (
          <p className="text-[11px] text-[#ef4444]" role="alert">
            {error}
          </p>
        )}
        {hint && !error && (
          <p className="text-[11px] text-[#525252]">{hint}</p>
        )}
      </div>
    );
  },
);
Input.displayName = 'Input';

// ─── Textarea variant ────────────────────────────────────────────────────────

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?:  string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, className, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-[12px] font-medium text-[#a3a3a3]"
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          className={cn(
            'w-full rounded-md bg-[#111111] px-3 py-2',
            'text-[13px] text-[#f5f5f5] placeholder:text-[#525252]',
            'border border-[#262626]',
            'resize-none transition-colors duration-100',
            'focus:border-[#404040] focus:ring-1 focus:ring-[#404040] focus:outline-none',
            error && 'border-[#ef4444]',
            'disabled:cursor-not-allowed disabled:opacity-40',
            className,
          )}
          {...props}
        />
        {error && (
          <p className="text-[11px] text-[#ef4444]" role="alert">
            {error}
          </p>
        )}
        {hint && !error && (
          <p className="text-[11px] text-[#525252]">{hint}</p>
        )}
      </div>
    );
  },
);
Textarea.displayName = 'Textarea';

// ─── Search input ────────────────────────────────────────────────────────────

interface SearchInputProps extends Omit<InputProps, 'leftElement'> {
  shortcut?: string;
}

export function SearchInput({ shortcut = '⌘K', className, ...props }: SearchInputProps) {
  return (
    <Input
      type="search"
      leftElement={
        <svg className="h-3.5 w-3.5" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="M7 13A6 6 0 1 0 7 1a6 6 0 0 0 0 12zM14 14l-3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      }
      rightElement={
        shortcut ? (
          <span className="rounded bg-[#1e1e1e] px-1.5 py-0.5 text-[10px] font-mono text-[#525252]">
            {shortcut}
          </span>
        ) : undefined
      }
      placeholder="Search..."
      className={cn('pl-8 pr-12', className)}
      {...props}
    />
  );
}
