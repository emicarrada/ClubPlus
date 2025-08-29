import { type ClassValue, clsx } from 'clsx';

/**
 * Club+ Utility function to merge class names
 * Combines clsx with Tailwind's class merging
 */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}
