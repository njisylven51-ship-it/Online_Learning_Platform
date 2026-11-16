import type { ReactNode } from 'react';

interface EmptyStateProps {
  title: string;
  description?: ReactNode;
  action?: ReactNode;
  icon?: ReactNode;
}

export function EmptyState({ title, description, action, icon }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-[2rem] border border-surface-container bg-surface-container-lowest px-6 py-16 text-center shadow-[0_8px_24px_rgba(18,18,20,0.04)]">
      {icon && <div className="mb-4 text-outline">{icon}</div>}
      <h3 className="text-xl font-bold text-carbon">{title}</h3>
      {description && (
        <p className="mt-2 max-w-sm text-base font-medium text-on-surface-variant">
          {description}
        </p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}