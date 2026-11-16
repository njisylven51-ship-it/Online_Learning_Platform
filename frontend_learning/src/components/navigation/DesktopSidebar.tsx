import { NavLink } from 'react-router-dom';
import { NavIcon } from './icons';
import type { NavItem } from '../../config/navigation';

interface DesktopSidebarProps {
  brand: string;
  items: NavItem[];
}

export function DesktopSidebar({ brand, items }: DesktopSidebarProps) {
  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-surface-container bg-surface-container-lowest lg:flex">
      <div className="border-b border-surface-container px-6 py-6">
        <span className="text-xl font-extrabold tracking-tight text-carbon">
          CS <span className="text-primary">Learning</span>
        </span>
        <p className="mt-1 text-xs font-bold uppercase tracking-wider text-on-surface-variant">
          {brand}
        </p>
      </div>
      <nav className="flex-1 overflow-y-auto px-4 py-6">
        <ul className="space-y-1.5">
          {items.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  [
                    // Changed from rounded-full to rounded-lg
                    'group flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-bold transition-all',
                    isActive
                      ? 'bg-primary-container text-on-primary-container shadow-[0_4px_12px_rgba(210,189,246,0.3)]' 
                      : 'text-on-surface-variant hover:bg-surface-container hover:text-carbon',
                  ].join(' ')
                }
              >
                {({ isActive }) => (
                  <>
                    <NavIcon
                      name={item.icon}
                      className={[
                        'h-5 w-5 shrink-0 transition-colors',
                        isActive ? 'text-on-primary-container' : 'text-outline group-hover:text-carbon',
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