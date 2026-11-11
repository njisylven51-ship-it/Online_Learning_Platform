import { NavLink } from 'react-router-dom';
import { NavIcon } from './icons';
import type { NavItem } from '../../config/navigation';

interface DesktopSidebarProps {
  brand: string;
  items: NavItem[];
}

export function DesktopSidebar({ brand, items }: DesktopSidebarProps) {
  return (
    <aside className="hidden w-64 shrink-0 border-r border-line bg-white lg:flex lg:flex-col">
      <div className="border-b border-line px-6 py-4">
        <span className="text-lg font-bold text-forest">
          CS <span className="text-accent">Learning</span>
        </span>
        <p className="mt-0.5 text-xs uppercase tracking-wide text-ink-subtle">
          {brand}
        </p>
      </div>
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="space-y-1">
          {items.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  [
                    'group flex items-center gap-3 rounded-lg border-l-2 px-3 py-2 text-sm font-medium transition',
                    isActive
                      ? 'border-accent bg-accent-tint text-forest'
                      : 'border-transparent text-ink-muted hover:bg-forest-tint hover:text-forest',
                  ].join(' ')
                }
              >
                {({ isActive }) => (
                  <>
                    <NavIcon
                      name={item.icon}
                      className={[
                        'h-5 w-5 shrink-0',
                        isActive ? 'text-accent' : 'text-ink-subtle group-hover:text-forest',
                      ].join(' ')}
                    />
                    <span>{item.label}</span>
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}