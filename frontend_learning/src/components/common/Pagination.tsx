import { Button } from '../ui/Button';

interface PaginationProps {
  hasPrev: boolean;
  hasMore: boolean;
  onPrev: () => void;
  onNext: () => void;
}

export function Pagination({ hasPrev, hasMore, onPrev, onNext }: PaginationProps) {
  if (!hasPrev && !hasMore) return null;
  
  // We will use custom classes to override the default light secondary button
  const btnClass = "rounded-full border border-white/20 bg-white/5 text-white hover:bg-white/10 disabled:opacity-30";
  
  return (
    <div className="flex items-center justify-between border-t border-white/10 pt-6 mt-10">
      <Button variant="secondary" className={btnClass} disabled={!hasPrev} onClick={onPrev}>
        ← Previous
      </Button>
      <Button variant="secondary" className={btnClass} disabled={!hasMore} onClick={onNext}>
        Next →
      </Button>
    </div>
  );
}