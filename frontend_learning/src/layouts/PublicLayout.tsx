import { Outlet } from 'react-router-dom';
import { PublicNavbar } from '../components/navigation/PublicNavbar';

export default function PublicLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <PublicNavbar />
      <main className="flex-1">
        <div className="mx-auto max-w-6xl px-4 py-6">
          <Outlet />
        </div>
      </main>
      <footer className="border-t border-line bg-forest-tint">
        <div className="mx-auto max-w-6xl px-4 py-6 text-sm text-ink-muted">
          © {new Date().getFullYear()} CS Learning Platform. All rights reserved.
        </div>
      </footer>
    </div>
  );
}