import { NavLink } from 'react-router-dom';
import { NavIcon } from './icons';
import type { NavItem } from '../../config/navigation';

interface DesktopSidebarProps {
  brand: string;
  items: NavItem[];
  isDark?: boolean;
}

export function DesktopSidebar({ brand, items, isDark = false }: DesktopSidebarProps) {
  return (
    <aside className={`hidden w-64 shrink-0 flex-col border-r lg:flex ${isDark ? 'bg-auth-bg border-white/10' : 'bg-white border-line'}`}>
      <div className={`border-b px-6 py-5 ${isDark ? 'border-white/10' : 'border-line'}`}>
        <span className={`text-xl font-extrabold ${isDark ? 'text-white' : 'text-forest'}`}>
          CS <span className={isDark ? 'text-pastel-lilac' : 'text-accent'}>Learning</span>
        </span>
        <p className={`mt-1 text-xs font-bold uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-ink-subtle'}`}>
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
                    'group flex items-center gap-3 rounded-full px-4 py-3 text-sm font-bold transition-all',
                    isActive
                      ? (isDark ? 'bg-pastel-lilac text-forest shadow-md' : 'bg-accent-tint text-forest')
                      : (isDark ? 'text-gray-400 hover:bg-white/5 hover:text-white' : 'text-ink-muted hover:bg-forest-tint hover:text-forest'),
                  ].join(' ')
                }
              >
                {({ isActive }) => (
                  <>
                    <NavIcon
                      name={item.icon}
                      className={[
                        'h-5 w-5 shrink-0 transition-colors',
                        isActive 
                          ? (isDark ? 'text-forest' : 'text-accent') 
                          : (isDark ? 'text-gray-500 group-hover:text-white' : 'text-ink-subtle group-hover:text-forest'),
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