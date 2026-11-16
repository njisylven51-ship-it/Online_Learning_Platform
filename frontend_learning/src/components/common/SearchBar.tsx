interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function SearchBar({ value, onChange, placeholder }: SearchBarProps) {
  return (
    <div className="relative w-full max-w-2xl">
      <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" strokeLinecap="round" />
        </svg>
      </span>
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="block w-full rounded-full border-0 bg-white/5 py-3 pl-12 pr-4 text-base font-semibold text-white shadow-sm ring-1 ring-white/10 placeholder:text-gray-500 focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-pastel-lilac"
      />
    </div>
  );
}