import { useState, useRef, useEffect } from 'react';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  id?: string;
  label?: string;
  error?: string;
  options: SelectOption[];
  placeholder?: string;
  value: string;
  onChange: (e: { target: { value: string } }) => void;
  disabled?: boolean;
  required?: boolean;
  className?: string;
}

export function Select({
  id,
  label,
  error,
  options,
  placeholder,
  value,
  onChange,
  disabled = false,
  required = false,
  className = '',
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find((o) => o.value === value);
  const displayLabel = selectedOption ? selectedOption.label : (placeholder || 'Select an option');

  function handleSelect(optionValue: string) {
    onChange({ target: { value: optionValue } });
    setIsOpen(false);
  }

  return (
    <div className="w-full" ref={dropdownRef}>
      {label && (
        <label htmlFor={id} className="mb-2 block text-sm font-bold text-carbon ml-1">
          {label}
          {required && <span className="ml-1 text-error">*</span>}
        </label>
      )}
      
      <div className="relative">
        {/* Trigger Button */}
        <button
          type="button"
          id={id}
          onClick={() => setIsOpen(!isOpen)}
          disabled={disabled}
          className={[
            'flex w-full items-center justify-between rounded-lg border border-surface-container bg-surface-container-lowest px-5 py-3.5 text-sm font-semibold shadow-sm transition',
            'focus:outline-none focus:ring-2 focus:ring-primary-container focus:border-primary-container',
            'disabled:cursor-not-allowed disabled:bg-surface-container disabled:text-on-surface-variant',
            error ? 'border-error focus:border-error focus:ring-error' : '',
            !selectedOption && placeholder ? 'text-outline' : 'text-carbon',
            className,
          ].join(' ')}
        >
          <span className="truncate">{displayLabel}</span>
          <svg 
            className={`h-5 w-5 shrink-0 text-outline transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor" 
            strokeWidth="2"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Custom Dropdown Menu */}
        {isOpen && !disabled && (
          <div className="absolute z-50 mt-2 max-h-60 w-full overflow-y-auto rounded-lg border border-surface-container bg-surface-container-lowest py-2 shadow-xl no-scrollbar">
            {placeholder && options.length === 0 && (
               <div className="px-5 py-3 text-sm font-medium text-outline italic">
                 {placeholder}
               </div>
            )}
            
            {options.length > 0 && (
              <>
                {!required && placeholder && (
                  <button
                    type="button"
                    onClick={() => handleSelect('')}
                    className={`flex w-full items-center px-5 py-3 text-sm font-semibold transition hover:bg-surface-container ${
                      value === '' ? 'bg-primary-container/20 text-primary' : 'text-carbon'
                    }`}
                  >
                    {placeholder}
                  </button>
                )}
                {options.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleSelect(option.value)}
                    className={`flex w-full items-center justify-between px-5 py-3 text-sm font-semibold transition hover:bg-surface-container ${
                      value === option.value ? 'bg-primary-container/20 text-primary' : 'text-carbon'
                    }`}
                  >
                    <span className="truncate">{option.label}</span>
                    {value === option.value && (
                      <svg className="h-5 w-5 shrink-0 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                ))}
              </>
            )}
          </div>
        )}
      </div>
      
      {error && <p className="mt-2 ml-1 text-xs font-bold text-error">{error}</p>}
    </div>
  );
}