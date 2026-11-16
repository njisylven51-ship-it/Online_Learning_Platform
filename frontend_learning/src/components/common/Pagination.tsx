import { Button } from '../ui/Button';

interface PaginationProps {
  hasPrev: boolean;
  hasMore: boolean;
  onPrev: () => void;
  onNext: () => void;
}

export function Pagination({ hasPrev, hasMore, onPrev, onNext }: PaginationProps) {
  if (!hasPrev && !hasMore) return null;
  
  const btnClass = "rounded-full bg-surface-container text-carbon hover:bg-surface-container-high disabled:opacity-30 px-6 py-2.5";
  
  return (
    <div className="mt-10 flex items-center justify-between border-t border-surface-container pt-6">
      <Button variant="secondary" className={btnClass} disabled={!hasPrev} onClick={onPrev}>
        ← Previous
      </Button>
      <Button variant="secondary" className={btnClass} disabled={!hasMore} onClick={onNext}>
        Next →
      </Button>
    </div>
  );
}

// ✅ Added default export to fix the Vite error
export default Pagination;