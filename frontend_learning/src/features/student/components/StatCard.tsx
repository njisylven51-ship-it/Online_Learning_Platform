import type { ReactNode } from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
}

export function StatCard({ title, value, icon }: StatCardProps) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-line bg-white p-5 shadow-sm">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-forest-tint text-accent-deep">
        {icon}
      </div>
      <div>
        <p className="text-sm font-medium text-ink-muted">{title}</p>
        <p className="text-2xl font-black text-forest">{value}</p>
      </div>
    </div>
  );
}