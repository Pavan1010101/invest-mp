/**
 * SISMP — Button Component
 * Institutional, accessible button with variants for the summit platform.
 */
import React, { type ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'accent';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  isLoading?: boolean;
  fullWidth?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, fullWidth, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          // Base
          'inline-flex items-center justify-center gap-2 font-semibold rounded-lg',
          'transition-all duration-200 ease-out',
          'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
          'active:scale-[0.98]',
          'disabled:opacity-50 disabled:pointer-events-none',
          // Variants
          variant === 'primary' && [
            'bg-primary text-white',
            'hover:bg-primary-800 hover:shadow-lg',
            'shadow-md',
          ],
          variant === 'secondary' && [
            'bg-primary-100 text-primary-900',
            'hover:bg-primary-200',
          ],
          variant === 'outline' && [
            'border-2 border-border dark:border-slate-600 text-foreground dark:text-white',
            'hover:border-primary hover:text-primary hover:bg-primary-50 dark:hover:bg-slate-800',
          ],
          variant === 'ghost' && [
            'text-foreground-muted dark:text-slate-300',
            'hover:bg-primary-50 hover:text-primary dark:hover:bg-slate-800 dark:hover:text-white',
          ],
          variant === 'destructive' && [
            'bg-destructive text-white',
            'hover:bg-red-700 hover:shadow-lg',
            'shadow-md',
          ],
          variant === 'accent' && [
            'bg-accent text-white',
            'hover:bg-accent-dark hover:shadow-lg',
            'shadow-md shadow-accent/20',
          ],
          // Sizes
          size === 'sm' && 'text-sm px-3 py-1.5 rounded-md',
          size === 'md' && 'text-sm px-5 py-2.5',
          size === 'lg' && 'text-base px-6 py-3',
          size === 'xl' && 'text-lg px-8 py-4 rounded-xl',
          // Width
          fullWidth && 'w-full',
          className
        )}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && (
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
export { Button };
