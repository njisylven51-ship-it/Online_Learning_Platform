
import type { SVGProps } from 'react';

interface NavIconProps extends SVGProps<SVGSVGElement> {
  name: string;
  active?: boolean;
}

const iconPaths: Record<string, React.ReactNode> = {
  home: (
    <>
      <path d="m3 10 9-7 9 7" />
      <path d="M5 9v11a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9" />
      <path d="M9 21v-7h6v7" />
    </>
  ),

  book: (
    <>
      <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v18H6.5A2.5 2.5 0 0 1 4 18.5z" />
      <path d="M4 18.5A2.5 2.5 0 0 1 6.5 16H20" />
      <path d="M8 7h7" />
      <path d="M8 11h5" />
    </>
  ),

  plus: (
    <>
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </>
  ),

  clipboard: (
    <>
      <rect x="5" y="5" width="14" height="17" rx="2" />
      <path d="M9 5V3h6v2" />
      <path d="M9 11h6" />
      <path d="M9 15h6" />
      <path d="M9 19h3" />
    </>
  ),

  user: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M5 21v-2a7 7 0 0 1 14 0v2" />
    </>
  ),

  grid: (
    <>
      <rect x="3" y="3" width="8" height="8" rx="1.5" />
      <rect x="13" y="3" width="8" height="8" rx="1.5" />
      <rect x="3" y="13" width="8" height="8" rx="1.5" />
      <rect x="13" y="13" width="8" height="8" rx="1.5" />
    </>
  ),

  chart: (
    <>
      <path d="M3 3v18h18" />
      <path d="m7 14 4-4 4 3 6-7" />
    </>
  ),

  award: (
    <>
      <circle cx="12" cy="8" r="6" />
      <path d="m8.5 13-1 8 4.5-2.5 4.5 2.5-1-8" />
      <path d="m10 8 1.5 1.5L14 7" />
    </>
  ),
};

export function NavIcon({
  name,
  active = false,
  className = 'h-6 w-6',
  strokeWidth = 1.8,
  ...props
}: NavIconProps) {
  const icon = iconPaths[name] || iconPaths.grid;

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={active ? 2 : strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...props}
    >
      {icon}
    </svg>
  );
}
