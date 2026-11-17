
import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';

export interface LoadingStateProps {
  message?: string;
  title?: string;
  description?: ReactNode;
  card?: boolean;
  fullScreen?: boolean;
  className?: string;
  /** Milliseconds before the spinner becomes visible. Default 1000ms. */
  delay?: number;
}

export function LoadingState({
  message,
  title,
  description,
  card = true,
  fullScreen = false,
  className = '',
  delay = 1000,
}: LoadingStateProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = window.setTimeout(() => setVisible(true), delay);
    return () => window.clearTimeout(t);
  }, [delay]);

  const displayTitle = title || message;

  const wrapper = [
    'flex items-center justify-center',
    fullScreen ? 'min-h-screen w-full px-4 py-10' : 'w-full py-4',
    className,
  ].join(' ');

  const surface = card
    ? 'relative overflow-hidden rounded-[24px] border border-surface-container bg-surface-container-lowest shadow-[0_8px_24px_rgba(18,18,20,0.04)]'
    : 'relative';

  // Reserve space but don't show the spinner yet.
  if (!visible) {
    return (
      <div className={wrapper} aria-hidden="true">
        <div className={`flex w-full max-w-sm flex-col items-center px-6 py-10 ${surface}`}>
          <div className="mb-4 h-10 w-10" />
          <div className="h-5" />
        </div>
      </div>
    );
  }

  return (
    <div className={wrapper}>
      <div
        role="status"
        aria-live="polite"
        aria-busy="true"
        className={`flex w-full max-w-sm flex-col items-center px-6 py-10 text-center ${surface}`}
      >
        <div className="mb-4 h-10 w-10 animate-spin rounded-full border-[3px] border-surface-container border-t-primary" />

        {displayTitle && (
          <h3 className="text-lg font-extrabold tracking-tight text-carbon">
            {displayTitle}
          </h3>
        )}

        {description && (
          <p className="mt-1.5 text-sm font-medium leading-relaxed text-on-surface-variant">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}
