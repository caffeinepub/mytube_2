import { Outlet } from '@tanstack/react-router';
import Header from './Header';
import Sidebar from './Sidebar';
import BottomNav from './BottomNav';
import PwaInstallPrompt from './PwaInstallPrompt';

export default function Layout() {
  return (
    <div className="flex h-screen flex-col bg-background">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
          <Outlet />
        </main>
      </div>
      <BottomNav />
      <PwaInstallPrompt />
    </div>
  );
}
