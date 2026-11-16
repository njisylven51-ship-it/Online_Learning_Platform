import { NavLink } from 'react-router-dom';
import { NavIcon } from './icons';
import type { NavItem } from '../../config/navigation';

interface MobileBottomNavProps {
  items: NavItem[];
}

export function MobileBottomNav({ items }: MobileBottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 h-[68px] border-t border-surface-container bg-surface-container-lowest pb-safe lg:hidden">
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
                      ? 'text-carbon'
                      : 'text-on-surface-variant hover:text-carbon',
                ].join(' ')
              }
            >
              {({ isActive }) =>
                item.primary ? (
                  <div className="absolute -top-5 left-1/2 flex -translate-x-1/2 flex-col items-center">
                    <span className={`flex h-[50px] w-[50px] items-center justify-center rounded-full shadow-lg transition ${isActive ? 'bg-carbon text-white' : 'bg-primary-container text-on-primary-container hover:bg-primary'}`}>
                      <NavIcon name={item.icon} className="h-7 w-7" strokeWidth={2.5} />
                    </span>
                  </div>
                ) : (
                  <>
                    <NavIcon
                      name={item.icon}
                      className={['transition-all duration-200', isActive ? 'h-[26px] w-[26px] scale-110' : 'h-6 w-6'].join(' ')}
                    />
                    <span className={['mt-1 h-1.5 w-1.5 rounded-full transition-colors', isActive ? 'bg-primary' : 'bg-transparent'].join(' ')} />
                  </>
                )
              }
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}