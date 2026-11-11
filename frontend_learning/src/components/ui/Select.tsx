import { forwardRef, type SelectHTMLAttributes } from 'react';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: SelectOption[];
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    { id, label, error, options, placeholder, className = '', required, ...rest },
    ref,
  ) => (
    <div className="w-full">
      {label && (
        <label htmlFor={id} className="mb-1 block text-sm font-medium text-forest">
          {label}
          {required && <span className="ml-1 text-accent">*</span>}
        </label>
      )}
      <select
        ref={ref}
        id={id}
        required={required}
        aria-invalid={error ? true : undefined}
        className={[
          'block w-full rounded-lg border bg-white px-3 py-2 text-sm text-ink shadow-sm',
          'transition',
          'focus:outline-none focus:ring-2',
          'disabled:cursor-not-allowed disabled:bg-forest-tint disabled:text-ink-muted',
          error
            ? 'border-red-400 focus:border-red-400 focus:ring-red-400'
            : 'border-line focus:border-accent focus:ring-accent',
          className,
        ].join(' ')}
        {...rest}
      >
        {placeholder !== undefined && <option value="">{placeholder}</option>}
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  ),
);
Select.displayName = 'Select';