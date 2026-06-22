import React from 'react';

/**
 * @typedef {Object} ButtonProps
 * @property {'primary' | 'secondary' | 'outline'} [variant='primary'] - The visual style variant of the button.
 * @property {'sm' | 'md' | 'lg'} [size='md'] - The size multiplier of the button.
 * @property {boolean} [disabled=false] - Whether the button interaction is disabled.
 * @property {React.ReactNode} children - Content elements to render inside the button.
 * @property {() => void} [onClick] - Interactive callback fired when the button is clicked.
 * @property {string} [className=''] - Additional custom CSS class names to apply.
 * @property {'button' | 'submit' | 'reset'} [type='button'] - The HTML button type property.
 */

/**
 * Premium Button component supporting multiple sizes, styles, and hover micro-animations.
 * @param {ButtonProps} props
 * @returns {React.JSX.Element}
 */
export default function Button({
  variant = 'primary',
  size = 'md',
  disabled = false,
  children,
  onClick,
  className = '',
  type = 'button',
  ...props
}) {
  const baseStyles = 'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-300 active:scale-95 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100';

  const variants = {
    primary: 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-md hover:shadow-emerald-500/20 shadow-sm border border-emerald-500/20',
    secondary: 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 hover:bg-zinc-200 dark:hover:bg-zinc-700/80 border border-zinc-200/50 dark:border-zinc-700/30',
    outline: 'border border-zinc-200 dark:border-zinc-800 bg-transparent text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900/50',
  };

  const sizes = {
    sm: 'px-3.5 py-1.5 text-xs',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-7 py-3.5 text-base',
  };

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
