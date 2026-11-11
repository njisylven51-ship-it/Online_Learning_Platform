import { Outlet } from 'react-router-dom';
import { DesktopSidebar } from '../components/navigation/DesktopSidebar';
import { MobileBottomNav } from '../components/navigation/MobileBottomNav';
import { Topbar } from '../components/navigation/Topbar';
import { ADMIN_NAV, ADMIN_MOBILE_NAV } from '../config/navigation';

export default function AdminLayout() {
  return (
    <div className="flex min-h-screen bg-white">
      <DesktopSidebar brand="Administrator" items={ADMIN_NAV} />
      <div className="flex min-w-0 flex-1 flex-col pb-16 lg:pb-0">
        <Topbar />
        <main className="flex-1 px-4 py-6 lg:px-8">
          <Outlet />
        </main>
      </div>
      <MobileBottomNav items={ADMIN_MOBILE_NAV} />
    </div>
  );
}