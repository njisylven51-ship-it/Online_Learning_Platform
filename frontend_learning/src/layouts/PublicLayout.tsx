import { Outlet } from 'react-router-dom';
import { PublicNavbar } from '../components/navigation/PublicNavbar';

export default function PublicLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-auth-bg">
      <PublicNavbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="border-t border-white/10 bg-auth-bg py-12">
        <div className="mx-auto max-w-7xl px-4 text-center text-sm font-semibold text-gray-400 lg:px-8">
          © {new Date().getFullYear()} CS Learning Platform. All rights reserved.
        </div>
      </footer>
    </div>
  );
}