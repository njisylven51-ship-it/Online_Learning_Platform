import type { Category } from '../types';

interface CategoryFilterProps {
  categories: Category[];
  selectedId: string;
  onSelect: (id: string) => void;
}

export function CategoryFilter({ categories, selectedId, onSelect }: CategoryFilterProps) {
  if (categories.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={() => onSelect('')}
        className={[
          'rounded-full px-3 py-1.5 text-sm font-medium transition',
          selectedId === ''
            ? 'bg-accent text-forest'
            : 'bg-forest-tint text-ink-muted hover:bg-forest-tint-strong hover:text-forest',
        ].join(' ')}
      >
        All
      </button>
      {categories.map((c) => (
        <button
          key={c.id}
          type="button"
          onClick={() => onSelect(c.id)}
          className={[
            'rounded-full px-3 py-1.5 text-sm font-medium transition',
            selectedId === c.id
              ? 'bg-accent text-forest'
              : 'bg-forest-tint text-ink-muted hover:bg-forest-tint-strong hover:text-forest',
          ].join(' ')}
        >
          {c.name}
        </button>
      ))}
    </div>
  );
}