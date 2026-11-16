import type { Category } from '../types';

interface CategoryFilterProps {
  categories: Category[];
  selectedId: string;
  onSelect: (id: string) => void;
}

export function CategoryFilter({ categories, selectedId, onSelect }: CategoryFilterProps) {
  if (categories.length === 0) return null;
  
  const baseClass = 'rounded-full px-6 py-2.5 text-sm font-bold transition-all ring-1';
  const activeClass = 'bg-primary-container text-on-primary-container ring-primary-container shadow-[0_4px_12px_rgba(210,189,246,0.3)]';
  const inactiveClass = 'bg-surface-container text-on-surface-variant ring-transparent hover:bg-surface-container-high hover:text-carbon';

  return (
    <div className="flex flex-wrap gap-3">
      <button
        type="button"
        onClick={() => onSelect('')}
        className={`${baseClass} ${selectedId === '' ? activeClass : inactiveClass}`}
      >
        All Courses
      </button>
      {categories.map((c) => (
        <button
          key={c.id}
          type="button"
          onClick={() => onSelect(c.id)}
          className={`${baseClass} ${selectedId === c.id ? activeClass : inactiveClass}`}
        >
          {c.name}
        </button>
      ))}
    </div>
  );
}