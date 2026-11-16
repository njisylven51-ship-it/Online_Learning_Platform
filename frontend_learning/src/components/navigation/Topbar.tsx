import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/Button';

export function Topbar({ isDark = false }: { isDark?: boolean }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate('/login', { replace: true });
  }

  return (
    <header className={`sticky top-0 z-20 border-b backdrop-blur-md ${isDark ? 'bg-auth-bg/90 border-white/10' : 'bg-white/95 border-line'}`}>
      <div className="flex items-center justify-between gap-3 px-4 py-4 lg:px-8">
        <span className={`text-base font-extrabold lg:hidden ${isDark ? 'text-white' : 'text-forest'}`}>
          CS <span className={isDark ? 'text-pastel-lilac' : 'text-accent'}>Learning</span>
        </span>

        <div className="hidden flex-1 lg:block" />

        <div className="flex items-center gap-4">
          <span className={`hidden text-sm font-bold sm:inline ${isDark ? 'text-gray-300' : 'text-ink-muted'}`}>
            {user?.full_name}
          </span>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleLogout} 
            className={isDark ? 'rounded-full text-gray-300 hover:bg-white/10 hover:text-white' : ''}
          >
            Log out
          </Button>
        </div>
      </div>
    </header>
  );
}