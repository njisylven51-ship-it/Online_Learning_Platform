import { Outlet } from 'react-router-dom';
import { AnnouncementBar } from '../components/navigation/AnnouncementBar';
import {PublicNavbar} from '../components/navigation/PublicNavbar';

export default function PublicLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <AnnouncementBar />
      <PublicNavbar />
      <main className="flex-1">
        <div className="mx-auto max-w-screen-2xl px-4 py-6 lg:px-8">
          <Outlet />
        </div>
      </main>
      <footer className="border-t border-line bg-forest-tint">
        <div className="mx-auto max-w-screen-2xl px-4 py-6 text-sm text-ink-muted lg:px-8">
          © {new Date().getFullYear()} CS Learning Platform. All rights reserved.
        </div>
      </footer>
    </div>
  );
}