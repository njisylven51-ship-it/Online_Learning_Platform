import { Button } from '../../../components/ui/Button';

interface LessonNavigationProps {
  hasPrev: boolean;
  hasNext: boolean;
  onPrev: () => void;
  onNext: () => void;
}

export function LessonNavigation({ hasPrev, hasNext, onPrev, onNext }: LessonNavigationProps) {
  const btnClass = "rounded-full bg-surface-container text-carbon hover:bg-surface-container-high disabled:opacity-30 px-6 py-2.5 font-bold";
  return (
    <div className="mt-10 flex items-center justify-between border-t border-surface-container pt-8">
      <Button variant="secondary" className={btnClass} onClick={onPrev} disabled={!hasPrev}>← Previous</Button>
      <Button variant="secondary" className={btnClass} onClick={onNext} disabled={!hasNext}>Next →</Button>
    </div>
  );
}