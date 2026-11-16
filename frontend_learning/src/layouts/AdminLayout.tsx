import { Outlet, useLocation } from 'react-router-dom';
import { AuthHero } from '../components/auth/AuthHero';

export default function AuthLayout() {
  const location = useLocation();
  
  // Dynamically change the headline based on the route
  const isLogin = location.pathname.includes('login');
  const title = isLogin ? "Let's get you signed in!" : "Join the CS Learning community!";

  return (
    <div className="auth-font min-h-screen bg-white">
      <AuthHero title={title} />
      
      {/* Curved Form Card */}
      <div className="relative z-30 mx-auto -mt-16 w-full max-w-lg rounded-t-[3rem] bg-white px-6 pt-10 pb-8 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] sm:px-10 sm:pb-12 min-h-[60vh]">
        <Outlet />
      </div>
    </div>
  );
}