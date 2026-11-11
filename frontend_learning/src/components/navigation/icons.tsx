interface NavIconProps {
  name: string;
  className?: string;
}

const PATHS: Record<string, string> = {
  home: 'M3 11.5 12 4l9 7.5M5 10v10h14V10',
  book: 'M4 4h11a3 3 0 0 1 3 3v13H7a3 3 0 0 1-3-3V4zm14 3v13',
  grid: 'M4 4h7v7H4zm9 0h7v7h-7zM4 13h7v7H4zm9 0h7v7h-7z',
  chart: 'M4 20V10m6 10V4m6 16v-8m6 8V8',
  award: 'M12 15a6 6 0 1 0 0-12 6 6 0 0 0 0 12zm-4 0v6l4-2 4 2v-6',
  card: 'M3 7h18v10H3zM3 11h18',
  bell: 'M6 8a6 6 0 0 1 12 0v5l2 3H4l2-3V8zm4 11a2 2 0 0 0 4 0',
  user: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
  settings:
    'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm7-3a7 7 0 0 1-.1 1l2 1.6-2 3.4-2.4-1a7 7 0 0 1-1.7 1l-.4 2.6h-4l-.4-2.6a7 7 0 0 1-1.7-1l-2.4 1-2-3.4 2-1.6a7 7 0 0 1 0-2l-2-1.6 2-3.4 2.4 1a7 7 0 0 1 1.7-1l.4-2.6h4l.4 2.6a7 7 0 0 1 1.7 1l2.4-1 2 3.4-2 1.6a7 7 0 0 1 .1 1z',
  plus: 'M12 5v14M5 12h14',
  clipboard: 'M9 4h6v3H9zM7 7H5v13h14V7h-2M9 12l2 2 4-4',
  users:
    'M17 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm14 10v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8',
  folder: 'M3 7h6l2 2h10v10H3z',
  layers: 'M12 3 3 8l9 5 9-5-9-5zM3 13l9 5 9-5M3 18l9 5 9-5',
  more: 'M5 12h.01M12 12h.01M19 12h.01',
};

export function NavIcon({ name, className = 'h-5 w-5' }: NavIconProps) {
  const d = PATHS[name] ?? PATHS.grid;
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={d} />
    </svg>
  );
}