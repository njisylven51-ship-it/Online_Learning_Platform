import { NavLink } from 'react-router-dom';
import { NavIcon } from './icons';
import type { NavItem } from '../../config/navigation';

interface MobileBottomNavProps {
  items: NavItem[];
  isDark?: boolean;
}

export function MobileBottomNav({ items, isDark = false }: MobileBottomNavProps) {
  return (
    <nav className={`fixed bottom-0 left-0 right-0 z-30 h-[68px] border-t pb-safe lg:hidden ${isDark ? 'bg-auth-bg border-white/10' : 'bg-white border-line'}`}>
      <ul className="mx-auto grid h-full max-w-lg grid-cols-5">
        {items.map((item) => (
          <li key={item.to} className="relative flex h-full items-center justify-center">
            <NavLink
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                [
                  'flex h-full w-full flex-col items-center justify-center transition-colors',
                  item.primary
                    ? 'relative'
                    : isActive
                      ? (isDark ? 'text-pastel-lilac' : 'text-accent')
                      : (isDark ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'),
                ].join(' ')
              }
            >
              {({ isActive }) =>
                item.primary ? (
                  <div className="absolute -top-5 left-1/2 flex -translate-x-1/2 flex-col items-center">
                    <span className={`flex h-[50px] w-[50px] items-center justify-center rounded-full shadow-md transition ${isActive ? 'bg-accent-deep text-white' : 'bg-accent text-forest hover:bg-accent-hover'}`}>
                      <NavIcon name={item.icon} className="h-7 w-7" strokeWidth={2.5} />
                    </span>
                  </div>
                ) : (
                  <NavIcon
                    name={item.name || item.icon}
                    active={isActive}
                    className={['transition-all duration-200', isActive ? 'h-[26px] w-[26px] scale-110' : 'h-6 w-6'].join(' ')}
                  />
                )
              }
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}