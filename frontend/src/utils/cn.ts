import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge Tailwind classes safely, resolving conflicts.
 * Combines clsx (conditional logic) + tailwind-merge (conflict resolution).
 *
 * Usage: cn('px-4 py-2', isActive && 'bg-brand-purple', className)
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
