import { NavLink } from 'react-router-dom';
import { NavIcon } from './icons';
import type { NavItem } from '../../config/navigation';

interface MobileBottomNavProps {
  items: NavItem[];
}

export function MobileBottomNav({ items }: MobileBottomNavProps) {
  if (items.length !== 5) {
    // Developer safety check per spec: exactly 5 items.
    console.warn(
      `MobileBottomNav expects exactly 5 items, got ${items.length}.`,
    );
  }

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-30 border-t border-line bg-white lg:hidden"
      aria-label="Primary"
    >
      <ul className="mx-auto grid max-w-xl grid-cols-5">
        {items.map((item) => (
          <li key={item.to} className="flex">
            <NavLink
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                [
                  'flex flex-1 flex-col items-center justify-center gap-1 px-1 py-2 text-[11px] font-medium transition',
                  item.primary
                    ? 'relative'
                    : isActive
                      ? 'text-accent'
                      : 'text-ink-subtle hover:text-forest',
                ].join(' ')
              }
            >
              {({ isActive }) =>
                item.primary ? (
                  <>
                    <span className="-mt-5 flex h-12 w-12 items-center justify-center rounded-full bg-accent text-forest shadow-lg ring-4 ring-white">
                      <NavIcon name={item.icon} className="h-6 w-6" />
                    </span>
                    <span className="text-forest">{item.label}</span>
                  </>
                ) : (
                  <>
                    <NavIcon name={item.icon} className="h-5 w-5" />
                    <span>{item.label}</span>
                    <span
                      className={[
                        'h-0.5 w-5 rounded-full transition',
                        isActive ? 'bg-accent' : 'bg-transparent',
                      ].join(' ')}
                    />
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