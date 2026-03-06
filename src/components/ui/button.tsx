import { ButtonHTMLAttributes, forwardRef } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline';
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'default', className = '', children, ...props }, ref) => {
    const baseClasses = 'px-4 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';
    
    const variantClasses = 
      variant === 'default' 
        ? 'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-200 focus:ring-gray-900 dark:focus:ring-gray-100' 
        : 'border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:ring-gray-900 dark:focus:ring-gray-100';
    
    const classes = `${baseClasses} ${variantClasses} ${className}`;

    return (
      <button ref={ref} className={classes} {...props}>
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';