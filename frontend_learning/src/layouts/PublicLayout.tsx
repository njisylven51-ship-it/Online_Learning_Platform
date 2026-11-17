
import { Outlet } from 'react-router-dom';
import { PublicNavbar } from '../components/navigation/PublicNavbar';

export default function PublicLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-surface text-on-surface">
      <PublicNavbar />

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-surface-container bg-surface py-10">
        <div className="mx-auto max-w-7xl px-4 text-center text-sm font-medium text-on-surface-variant lg:px-8">
          © {new Date().getFullYear()} CS Learning Platform. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
