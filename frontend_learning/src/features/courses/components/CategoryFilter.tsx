import type { Category } from '../types';

interface CategoryFilterProps {
  categories: Category[];
  selectedId: string;
  onSelect: (id: string) => void;
}

export function CategoryFilter({ categories, selectedId, onSelect }: CategoryFilterProps) {
  if (categories.length === 0) return null;
  
  const baseClass = 'rounded-full px-5 py-2 text-sm font-bold transition-colors ring-1';
  const activeClass = 'bg-pastel-lilac text-forest ring-pastel-lilac';
  const inactiveClass = 'bg-white/5 text-gray-300 ring-white/10 hover:bg-white/10 hover:text-white';

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