import { Button } from '../../../components/ui/Button';

interface LessonNavigationProps {
  hasPrev: boolean;
  hasNext: boolean;
  onPrev: () => void;
  onNext: () => void;
}

export function LessonNavigation({ hasPrev, hasNext, onPrev, onNext }: LessonNavigationProps) {
  return (
    <div className="mt-8 flex items-center justify-between border-t border-line pt-6">
      <Button variant="secondary" onClick={onPrev} disabled={!hasPrev}>
        ← Previous Lesson
      </Button>
      <Button variant="secondary" onClick={onNext} disabled={!hasNext}>
        Next Lesson →
      </Button>
    </div>
  );
}