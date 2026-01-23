import { ButtonHTMLAttributes, forwardRef } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline';
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'default', className = '', children, ...props }, ref) => {
    const baseClasses = 'px-4 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';
    
    const variantClasses = 
      variant === 'default' 
        ? 'bg-gray-900 text-white hover:bg-gray-800 focus:ring-gray-900' 
        : 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-gray-900';
    
    const classes = `${baseClasses} ${variantClasses} ${className}`;

    return (
      <button ref={ref} className={classes} {...props}>
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';