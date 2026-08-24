import { cn } from '@/utils/cn';

interface BullIconProps extends React.SVGAttributes<SVGElement> {}

/**
 * Bulldex bull head icon — outline style, scalable.
 * Usage: <BullIcon className="h-8 w-8 text-brand-purple" />
 */
export function BullIcon({ className, ...props }: BullIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn('h-6 w-6', className)}
      aria-hidden="true"
      {...props}
    >
      {/* Horns */}
      <path d="M4 4 C2 2, 1 5, 3 7" />
      <path d="M20 4 C22 2, 23 5, 21 7" />
      {/* Head */}
      <ellipse cx="12" cy="13" rx="7" ry="6" />
      {/* Nose */}
      <ellipse cx="12" cy="16" rx="3" ry="2" />
      {/* Nostrils */}
      <circle cx="10.5" cy="16" r="0.5" fill="currentColor" />
      <circle cx="13.5" cy="16" r="0.5" fill="currentColor" />
      {/* Eyes */}
      <circle cx="9" cy="11" r="1" fill="currentColor" />
      <circle cx="15" cy="11" r="1" fill="currentColor" />
      {/* Ears */}
      <path d="M5 10 C3.5 9, 3.5 11.5, 5 12" />
      <path d="M19 10 C20.5 9, 20.5 11.5, 19 12" />
    </svg>
  );
}
