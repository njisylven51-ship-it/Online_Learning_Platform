import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/Button';

function navLink(active: boolean) {
  return [
    'text-sm font-medium transition',
    active ? 'text-accent' : 'text-forest hover:text-accent',
  ].join(' ');
}

function dashboardFor(role: string | null): string {
  if (role === 'teacher') return '/teacher/dashboard';
  if (role === 'administrator') return '/admin/dashboard';
  return '/student/dashboard';
}

export function PublicNavbar() {
  const { isAuthenticated, role, user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  async function handleLogout() {
    await logout();
    navigate('/login', { replace: true });
  }

  return (
    <header className="sticky top-0 z-20 border-b border-line bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link to="/" className="text-lg font-bold text-forest">
          CS <span className="text-accent">Learning</span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          <NavLink to="/" end className={({ isActive }) => navLink(isActive)}>
            Home
          </NavLink>
          <NavLink to="/courses" className={({ isActive }) => navLink(isActive)}>
            Courses
          </NavLink>
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {isAuthenticated ? (
            <>
              <span className="text-sm text-ink-muted">{user?.full_name}</span>
              <Link to={dashboardFor(role)}>
                <Button variant="secondary" size="sm">Dashboard</Button>
              </Link>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                Log out
              </Button>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost" size="sm">Sign in</Button>
              </Link>
              <Link to="/register">
                <Button variant="primary" size="sm">Get started</Button>
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          className="rounded-md p-2 text-forest md:hidden"
          aria-label="Toggle navigation"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {open && (
        <div className="border-t border-line bg-white md:hidden">
          <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-4">
            <NavLink to="/" end className={({ isActive }) => navLink(isActive)}>Home</NavLink>
            <NavLink to="/courses" className={({ isActive }) => navLink(isActive)}>Courses</NavLink>
            {isAuthenticated ? (
              <>
                <Link to={dashboardFor(role)} className={navLink(false)}>Dashboard</Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="text-left text-sm font-medium text-red-600"
                >
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className={navLink(false)}>Sign in</Link>
                <Link to="/register" className={navLink(false)}>Get started</Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}