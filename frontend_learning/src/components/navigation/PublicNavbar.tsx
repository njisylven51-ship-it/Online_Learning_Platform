import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/Button';

function navLink(active: boolean) {
  return [
    'text-sm font-bold transition-colors',
    active ? 'text-pastel-lilac' : 'text-gray-300 hover:text-white',
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
    <header className="sticky top-0 z-50 border-b border-white/10 bg-auth-bg/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 lg:px-8">
        <Link to="/" className="text-xl font-extrabold text-white">
          CS <span className="text-pastel-lilac">Learning</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          <NavLink to="/" end className={({ isActive }) => navLink(isActive)}>
            Home
          </NavLink>
          <NavLink to="/courses" className={({ isActive }) => navLink(isActive)}>
            Courses
          </NavLink>
          <NavLink to="/register" className={({ isActive }) => navLink(isActive)}>
            Become an instructor
          </NavLink>
        </nav>

        <div className="hidden items-center gap-4 md:flex">
          {isAuthenticated ? (
            <>
              <span className="text-sm font-bold text-gray-300">{user?.full_name}</span>
              <Link to={dashboardFor(role)}>
                <Button variant="secondary" size="sm" className="rounded-full border-white/20 bg-white/10 text-white hover:bg-white/20">Dashboard</Button>
              </Link>
              <Button variant="ghost" size="sm" onClick={handleLogout} className="rounded-full text-gray-300 hover:text-white">
                Log out
              </Button>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost" size="sm" className="rounded-full text-gray-300 hover:bg-white/10 hover:text-white">Sign in</Button>
              </Link>
              <Link to="/register">
                <Button variant="primary" size="sm" className="rounded-full bg-pastel-lilac text-forest hover:bg-pastel-lilac/90">Get Started</Button>
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          className="rounded-md p-2 text-white md:hidden"
          onClick={() => setOpen((v) => !v)}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="border-t border-white/10 bg-auth-bg md:hidden">
          <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4">
            <NavLink to="/" end className={({ isActive }) => navLink(isActive)} onClick={() => setOpen(false)}>Home</NavLink>
            <NavLink to="/courses" className={({ isActive }) => navLink(isActive)} onClick={() => setOpen(false)}>Courses</NavLink>
            <NavLink to="/register" className={({ isActive }) => navLink(isActive)} onClick={() => setOpen(false)}>Become an instructor</NavLink>
            <div className="mt-2 flex flex-col gap-3 border-t border-white/10 pt-4">
              {isAuthenticated ? (
                <>
                  <Link to={dashboardFor(role)} className="text-sm font-bold text-white">Dashboard</Link>
                  <button onClick={handleLogout} className="text-left text-sm font-bold text-red-400">Log out</button>
                </>
              ) : (
                <>
                  <Link to="/login" className="text-sm font-bold text-white">Sign in</Link>
                  <Link to="/register" className="text-sm font-bold text-pastel-lilac">Get Started</Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}