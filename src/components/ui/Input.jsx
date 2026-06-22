import React from 'react';

/**
 * @typedef {Object} InputProps
 * @property {string} [label] - Optional input label text displayed above the input field.
 * @property {string} [placeholder] - Placeholder text for empty state.
 * @property {string} [type='text'] - The type of input element (e.g., 'text', 'number', 'password').
 * @property {string | number} value - The controlled component value.
 * @property {(e: React.ChangeEvent<HTMLInputElement>) => void} onChange - Callback function triggered on input change.
 * @property {string} [error] - Validation error message to display below the input.
 * @property {string} [className=''] - Additional wrapper class names.
 * @property {string} [inputClassName=''] - Additional class names for the input element itself.
 */

/**
 * Input field component supporting error display states, hover/focus rings, and responsive styles.
 * @param {InputProps} props
 * @returns {React.JSX.Element}
 */
export default function Input({
  label,
  placeholder,
  type = 'text',
  value,
  onChange,
  error,
  className = '',
  inputClassName = '',
  ...props
}) {
  return (
    <div className={`flex flex-col space-y-1.5 w-full ${className}`}>
      {label && (
        <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
          {label}
        </label>
      )}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={`w-full bg-zinc-50 dark:bg-zinc-950 border rounded-xl px-4 py-3 text-sm focus:outline-none transition-all duration-200 placeholder-zinc-400 dark:placeholder-zinc-600
          ${error 
            ? 'border-red-500 focus:ring-2 focus:ring-red-500/20 focus:border-red-500' 
            : 'border-zinc-200 dark:border-zinc-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20'
          } ${inputClassName}`}
        {...props}
      />
      {error && (
        <span className="text-xs text-red-505 dark:text-red-400 font-medium transition-all duration-200 animate-slide-up">
          {error}
        </span>
      )}
    </div>
  );
}
