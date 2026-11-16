import type { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}

export function PageHeader({ title, subtitle, action }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-carbon sm:text-4xl">{title}</h1>
        {subtitle && <p className="mt-2 text-lg font-medium text-on-surface-variant">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}