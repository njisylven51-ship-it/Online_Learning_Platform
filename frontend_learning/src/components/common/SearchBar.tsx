import { useEffect, useRef } from 'react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function SearchBar({ value, onChange, placeholder = 'Search courses...' }: SearchBarProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  // Support "/" keyboard shortcut to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === '/' &&
        document.activeElement?.tagName !== 'INPUT' &&
        document.activeElement?.tagName !== 'TEXTAREA'
      ) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="group relative w-full max-w-2xl">
      {/* Leading Search Icon (lights up in pastel-lilac on focus) */}
      <span className="pointer-events-none absolute left-4.5 top-1/2 -translate-y-1/2 text-gray-400 transition-colors duration-200 group-focus-within:text-pastel-lilac">
        <svg
          className="h-5 w-5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" strokeLinecap="round" />
        </svg>
      </span>

      <input
        ref={inputRef}
        type="text"
        role="searchbox"
        aria-label={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="block w-full rounded-full border-0 bg-white/5 py-3.5 pl-12 pr-14 text-base font-semibold text-white shadow-sm ring-1 ring-white/10 backdrop-blur-md transition-all duration-200 placeholder:font-medium placeholder:text-gray-500 hover:bg-white/10 hover:ring-white/20 focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-pastel-lilac"
      />

      {/* Right Action Slot: Clear button when typing, or "/" shortcut hint when empty */}
      <div className="absolute right-3.5 top-1/2 flex -translate-y-1/2 items-center">
        {value ? (
          <button
            type="button"
            onClick={() => {
              onChange('');
              inputRef.current?.focus();
            }}
            aria-label="Clear search"
            className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-gray-400 transition-colors hover:bg-white/20 hover:text-white focus:outline-none focus:ring-2 focus:ring-pastel-lilac"
          >
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" />
            </svg>
          </button>
        ) : (
          <kbd className="pointer-events-none hidden select-none items-center rounded-md bg-white/5 px-2 py-0.5 text-xs font-bold text-gray-400 ring-1 ring-white/10 group-focus-within:opacity-0 sm:inline-flex">
            /
          </kbd>
        )}
      </div>
    </div>
  );
}