
import { Outlet } from 'react-router-dom';
import { DesktopSidebar } from '../components/navigation/DesktopSidebar';
import { MobileBottomNav } from '../components/navigation/MobileBottomNav';
import { Topbar } from '../components/navigation/Topbar';
import { ADMIN_NAV, ADMIN_MOBILE_NAV } from '../config/navigation';

export default function AdminLayout() {
  return (
    <div className="jakarta-font flex h-screen w-full overflow-hidden bg-surface text-on-surface">
      <DesktopSidebar brand="Administrator" items={ADMIN_NAV} />

      <div className="flex h-full min-w-0 flex-1 flex-col pb-16 lg:pb-0">
        <Topbar />

        <main className="flex-1 min-h-0 w-full overflow-y-auto no-scrollbar">
          <div className="w-full min-h-full px-4 py-6 lg:px-8">
            <Outlet />
          </div>
        </main>
      </div>

      <MobileBottomNav items={ADMIN_MOBILE_NAV} />
    </div>
  );
}
