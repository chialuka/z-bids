import { ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * A utility function that combines multiple class names and resolves Tailwind CSS conflicts
 * 
 * @param inputs - Class names or conditional class name expressions to combine
 * @returns A merged string of class names with Tailwind conflicts resolved
 * 
 * @example
 * // Basic usage
 * cn('text-red-500', 'bg-blue-500')
 * 
 * @example
 * // With conditional classes
 * cn('text-lg', isLarge && 'font-bold', error ? 'text-red-500' : 'text-green-500')
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
} 
