import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';

export function RootLayout() {
  return (
    <div className="flex h-screen w-full bg-gray-50 overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-auto flex flex-col">
        <Outlet />
      </main>
    </div>
  );
}
