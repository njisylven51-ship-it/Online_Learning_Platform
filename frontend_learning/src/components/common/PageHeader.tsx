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
        {/* Changed to text-white for dark mode */}
        <h1 className="text-3xl font-extrabold text-white sm:text-4xl">{title}</h1>
        {subtitle && <p className="mt-2 text-lg font-semibold text-gray-400">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}