import type { ReactNode } from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  variant?: 'primary' | 'secondary' | 'tertiary';
  size?: 'featured' | 'compact';
  subtitle?: string;
}

export function StatCard({
  title,
  value,
  icon,
  variant = 'primary',
  size = 'featured',
  subtitle,
}: StatCardProps) {
  const themes = {
    primary: {
      bg: 'bg-primary-container',
      text: 'text-on-primary-container',
      iconBg: 'bg-white/40',
      shadow: 'shadow-[0_12px_30px_rgba(210,189,246,0.45)]',
    },
    secondary: {
      bg: 'bg-secondary-container',
      text: 'text-on-secondary-container',
      iconBg: 'bg-white/40',
      shadow: 'shadow-[0_12px_30px_rgba(184,236,199,0.45)]',
    },
    tertiary: {
      bg: 'bg-tertiary-container',
      text: 'text-on-tertiary-container',
      iconBg: 'bg-white/40',
      shadow: 'shadow-[0_12px_30px_rgba(230,204,112,0.45)]',
    },
  };

  const theme = themes[variant];
  const isCompact = size === 'compact';

  return (
    <div
      className={`group relative flex h-full overflow-hidden rounded-[2rem] transition-all duration-300 ease-out hover:-translate-y-1 ${
        theme.bg
      } ${theme.shadow} ${
        isCompact
          ? 'flex-row items-center justify-between gap-6 px-7 py-6'
          : 'flex-col justify-between p-8 sm:p-9'
      }`}
    >
      {/* Decorative translucent rings using existing white/40 token */}
      <div
        className={`pointer-events-none absolute -right-10 -top-10 rounded-full bg-white/40 opacity-30 transition-transform duration-500 group-hover:scale-110 ${
          isCompact ? 'h-36 w-36' : 'h-56 w-56'
        }`}
      />
      {!isCompact && (
        <div className="pointer-events-none absolute -bottom-16 right-8 h-40 w-40 rounded-full bg-white/40 opacity-20 transition-transform duration-500 group-hover:scale-125" />
      )}

      {isCompact ? (
        <>
          {/* Compact Horizontal Layout (Right Stack) */}
          <div className={`relative z-10 flex flex-col ${theme.text}`}>
            <p className="text-sm font-extrabold uppercase tracking-wider opacity-75">
              {title}
            </p>
            <div className="mt-1.5 flex items-baseline gap-3">
              <p className="text-4xl font-extrabold tracking-tight sm:text-5xl">
                {value}
              </p>
              {subtitle && (
                <span className="text-xs font-bold opacity-70">{subtitle}</span>
              )}
            </div>
          </div>

          <div
            className={`relative z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${theme.iconBg} ${theme.text} shadow-sm backdrop-blur-md transition-transform duration-300 group-hover:scale-105`}
          >
            {icon}
          </div>
        </>
      ) : (
        <>
          {/* Featured Hero Layout (Left Card) */}
          <div className="relative z-10 flex items-start justify-between">
            <div
              className={`flex h-16 w-16 items-center justify-center rounded-2xl ${theme.iconBg} ${theme.text} shadow-sm backdrop-blur-md transition-transform duration-300 group-hover:scale-105`}
            >
              {icon}
            </div>
            <span
              className={`rounded-full ${theme.iconBg} ${theme.text} px-3.5 py-1.5 text-xs font-extrabold uppercase tracking-wider backdrop-blur-md`}
            >
              Overview
            </span>
          </div>

          <div className={`relative z-10 mt-10 ${theme.text}`}>
            <p className="text-base font-extrabold uppercase tracking-wider opacity-75">
              {title}
            </p>
            <div className="mt-2 flex items-baseline justify-between gap-4">
              <p className="text-6xl font-extrabold tracking-tight sm:text-7xl">
                {value}
              </p>
              {subtitle && (
                <span className="rounded-full bg-white/40 px-3 py-1 text-xs font-bold backdrop-blur-sm">
                  {subtitle}
                </span>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}