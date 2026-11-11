import { NavLink } from 'react-router-dom';
import { NavIcon } from './icons';
import type { NavItem } from '../../config/navigation';

interface MobileBottomNavProps {
  items: NavItem[];
}

export function MobileBottomNav({ items }: MobileBottomNavProps) {
  if (items.length !== 5) {
    console.warn(`MobileBottomNav expects exactly 5 items, got ${items.length}.`);
  }

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-30 h-[64px] bg-white shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)] lg:hidden"
      aria-label="Primary"
    >
      <ul className="mx-auto grid h-full max-w-lg grid-cols-5">
        {items.map((item) => (
          <li key={item.to} className="relative flex h-full items-center justify-center">
            <NavLink
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                [
                  'flex h-full w-full flex-col items-center justify-center transition-colors duration-200',
                  item.primary
                    ? 'relative'
                    : isActive
                      ? 'text-accent' // <--- Green Active State
                      : 'text-gray-400 hover:text-gray-600',
                ].join(' ')
              }
            >
              {({ isActive }) =>
                item.primary ? (
                  /* Floating Create Button */
                  <div className="absolute -top-5 left-1/2 flex -translate-x-1/2 flex-col items-center">
                    <span
                      className={[
                        'flex h-[50px] w-[50px] items-center justify-center rounded-full shadow-md transition',
                        isActive
                          ? 'bg-accent-deep text-white'
                          : 'bg-accent text-forest hover:bg-accent-hover',
                      ].join(' ')}
                    >
                      <NavIcon name={item.icon} className="h-7 w-7" strokeWidth={2.5} />
                    </span>
                  </div>
                ) : (
                  /* Standard Icon Only */
                  <NavIcon
                    name={item.name || item.icon}
                    active={isActive}
                    className={[
                      'transition-all duration-200',
                      isActive ? 'h-[26px] w-[26px] scale-110' : 'h-6 w-6',
                    ].join(' ')}
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