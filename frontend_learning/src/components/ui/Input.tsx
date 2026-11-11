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
          <label htmlFor={id} className="mb-1 block text-sm font-medium text-forest">
            {label}
            {required && <span className="ml-1 text-accent">*</span>}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={[
            'block w-full rounded-lg border bg-white px-3 py-2 text-sm text-ink shadow-sm',
            'transition placeholder:text-ink-subtle',
            'focus:outline-none focus:ring-2',
            'disabled:cursor-not-allowed disabled:bg-forest-tint disabled:text-ink-muted',
            error
              ? 'border-red-400 focus:border-red-400 focus:ring-red-400'
              : 'border-line focus:border-accent focus:ring-accent',
            className,
          ].join(' ')}
          {...rest}
        />
        {hint && !error && (
          <p id={`${id}-hint`} className="mt-1 text-xs text-ink-muted">{hint}</p>
        )}
        {error && (
          <p id={`${id}-error`} className="mt-1 text-xs text-red-600">{error}</p>
        )}
      </div>
    );
  },
);
Input.displayName = 'Input';