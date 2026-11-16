import { forwardRef, type InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ id, label, error, hint, className = '', required, ...rest }, ref) => {
    const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={id} className="mb-2 block text-sm font-bold text-carbon ml-1">
            {label}
            {required && <span className="ml-1 text-error">*</span>}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={[
            // Changed to rounded-lg for a rectangular shape
            'block w-full rounded-lg border border-surface-container bg-surface-container-lowest px-5 py-3.5 text-sm font-semibold text-carbon shadow-sm',
            'transition placeholder:text-outline',
            // Changed focus colors to match the sidebar's active background (primary-container)
            'focus:outline-none focus:ring-2 focus:ring-primary-container focus:border-primary-container',
            'disabled:cursor-not-allowed disabled:bg-surface-container disabled:text-on-surface-variant',
            error
              ? 'border-error focus:border-error focus:ring-error'
              : '',
            className,
          ].join(' ')}
          {...rest}
        />
        {hint && !error && (
          <p id={`${id}-hint`} className="mt-2 ml-1 text-xs font-medium text-on-surface-variant">
            {hint}
          </p>
        )}
        {error && (
          <p id={`${id}-error`} className="mt-2 ml-1 text-xs font-bold text-error">
            {error}
          </p>
        )}
      </div>
    );
  },
);
Input.displayName = 'Input';