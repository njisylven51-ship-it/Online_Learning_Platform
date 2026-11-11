import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/Button';

export function Topbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate('/login', { replace: true });
  }

  return (
    <header className="sticky top-0 z-20 border-b border-line bg-white/95 backdrop-blur">
      <div className="flex items-center justify-between gap-3 px-4 py-3 lg:px-6">
        {/* Mobile brand — desktop brand lives in the sidebar. */}
        <span className="text-base font-bold text-forest lg:hidden">
          CS <span className="text-accent">Learning</span>
        </span>

        <div className="hidden flex-1 lg:block" />

        <div className="flex items-center gap-3">
          <span className="hidden text-sm text-ink-muted sm:inline">
            {user?.full_name}
          </span>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            Log out
          </Button>
        </div>
      </div>
    </header>
  );
}