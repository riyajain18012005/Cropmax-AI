import React from 'react';

/**
 * @typedef {Object} LoaderProps
 * @property {'spinner' | 'skeleton'} [type='spinner'] - The mode of the loader. Spinner displays a circular loading ring; skeleton displays a pulsing grid block.
 * @property {'sm' | 'md' | 'lg'} [size='md'] - The size magnitude (only applies to spinner).
 * @property {string} [className=''] - Custom styling utilities to override positioning or size attributes.
 */

/**
 * Premium Loader element supporting both active circular spinner and layout skeleton blocks.
 * @param {LoaderProps} props
 * @returns {React.JSX.Element}
 */
export default function Loader({ type = 'spinner', size = 'md', className = '' }) {
  if (type === 'skeleton') {
    return (
      <div 
        className={`animate-pulse bg-zinc-200 dark:bg-zinc-800 rounded-xl w-full h-8 ${className}`} 
      />
    );
  }

  const spinnerSizes = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
  };

  return (
    <div className={`flex justify-center items-center ${className}`}>
      <div
        className={`animate-spin rounded-full border-t-emerald-600 dark:border-t-emerald-400 border-zinc-200 dark:border-zinc-800 ${spinnerSizes[size]}`}
      />
    </div>
  );
}
