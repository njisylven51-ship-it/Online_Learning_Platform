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
    <header className="sticky top-0 z-20 border-b border-surface-container bg-surface/90 backdrop-blur-md">
      <div className="flex items-center justify-between gap-3 px-4 py-4 lg:px-8">
        <span className="text-base font-extrabold text-carbon lg:hidden">
          CS <span className="text-primary">Learning</span>
        </span>

        <div className="hidden flex-1 lg:block" />

        <div className="flex items-center gap-4">
          <span className="hidden text-sm font-bold text-on-surface-variant sm:inline">
            {user?.full_name}
          </span>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleLogout} 
            className="rounded-full text-on-surface-variant hover:bg-surface-container hover:text-carbon"
          >
            Log out
          </Button>
        </div>
      </div>
    </header>
  );
}