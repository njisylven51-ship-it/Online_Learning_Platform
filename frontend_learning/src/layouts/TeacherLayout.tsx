import { Outlet } from 'react-router-dom';
import { DesktopSidebar } from '../components/navigation/DesktopSidebar';
import { MobileBottomNav } from '../components/navigation/MobileBottomNav';
import { Topbar } from '../components/navigation/Topbar';
import { TEACHER_NAV, TEACHER_MOBILE_NAV } from '../config/navigation';

export default function TeacherLayout() {
  return (
    // Changed min-h-screen to h-screen overflow-hidden to lock the page height
    <div className="flex h-screen overflow-hidden bg-white">
      <DesktopSidebar brand="Teacher" items={TEACHER_NAV} />
      <div className="flex h-full min-w-0 flex-1 flex-col pb-16 lg:pb-0">
        <Topbar />
        {/* Added overflow-y-auto so only this section scrolls */}
        <main className="flex-1 overflow-y-auto px-4 py-6 lg:px-8">
          <Outlet />
        </main>
      </div>
      <MobileBottomNav items={TEACHER_MOBILE_NAV} />
    </div>
  );
}