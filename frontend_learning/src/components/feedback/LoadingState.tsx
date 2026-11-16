import type { ReactNode } from 'react';

export interface LoadingStateProps {
  /** Support the old API so we don't break existing pages */
  message?: string;
  /** Main heading. Overrides message if provided. */
  title?: string;
  /** Supporting line under the title. */
  description?: ReactNode;
  /** Wrap in the EmptyState-style card. Set false to render bare. */
  card?: boolean;
  /** Fill the viewport (useful for route-level loading). */
  fullScreen?: boolean;
  className?: string;
}

export function LoadingState({
  message,
  title,
  description = 'Preparing your learning experience.',
  card = true,
  fullScreen = false,
  className = '',
}: LoadingStateProps) {
  const displayTitle = title || message || 'Getting things ready...';

  const wrapper = [
    'flex items-center justify-center',
    fullScreen ? 'min-h-screen w-full px-4 py-10' : 'w-full py-4',
    className,
  ].join(' ');

  const surface = card
    ? 'relative overflow-hidden rounded-[2rem] border border-surface-container bg-surface-container-lowest shadow-[0_8px_24px_rgba(18,18,20,0.04)]'
    : 'relative';

  return (
    <div className={wrapper}>
      <style>{`
        @keyframes fluid-indeterminate {
          0% {
            left: -35%;
            right: 100%;
          }
          60% {
            left: 100%;
            right: -90%;
          }
          100% {
            left: 100%;
            right: -90%;
          }
        }
        @keyframes soft-breathe {
          0%, 100% {
            transform: scale(0.92);
            opacity: 0.45;
          }
          50% {
            transform: scale(1.12);
            opacity: 0.85;
          }
        }
        .animate-fluid-bar {
          animation: fluid-indeterminate 1.8s cubic-bezier(0.65, 0.815, 0.735, 0.395) infinite;
        }
        .animate-soft-breathe {
          animation: soft-breathe 2.4s ease-in-out infinite;
        }
      `}</style>

      <div
        role="status"
        aria-live="polite"
        aria-busy="true"
        className={`flex w-full max-w-md flex-col items-center px-6 py-12 text-center sm:px-10 sm:py-14 ${surface}`}
      >
        {/* Subtle decorative background halo using existing tokens */}
        {card && (
          <div className="pointer-events-none absolute -top-24 h-48 w-48 rounded-full bg-primary-container/40 blur-2xl" />
        )}

        {/* Layered Orbital Spinner */}
        <div className="relative flex h-24 w-24 items-center justify-center">
          {/* Gentle breathing aura (replaces jarring default ping) */}
          <div className="animate-soft-breathe absolute inset-1 rounded-full bg-primary-container" />

          {/* Frosted inner disc */}
          <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-surface-container-lowest shadow-sm ring-1 ring-surface-container">
            {/* Primary rotating arc */}
            <div className="h-9 w-9 animate-spin rounded-full border-[3.5px] border-surface-container border-t-primary" />
            {/* Center anchor dot */}
            <span className="absolute h-2 w-2 rounded-full bg-primary" />
          </div>
        </div>

        {/* Copy */}
        <div className="relative z-10 mt-7 flex flex-col items-center">
          <span className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-surface-container px-3 py-0.5 text-[11px] font-bold uppercase tracking-widest text-primary">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
            Loading
          </span>

          <h3 className="text-xl font-extrabold tracking-tight text-carbon sm:text-2xl">
            {displayTitle}
          </h3>

          {description && (
            <p className="mt-2 max-w-xs text-sm font-medium leading-relaxed text-on-surface-variant sm:text-base">
              {description}
            </p>
          )}
        </div>

        {/* Elastic Indeterminate Progress Track */}
        <div className="relative z-10 mt-8 h-2 w-full max-w-[220px] overflow-hidden rounded-full bg-surface-container">
          <div className="animate-fluid-bar absolute inset-y-0 rounded-full bg-primary" />
        </div>
      </div>
    </div>
  );
}

export default LoadingState;