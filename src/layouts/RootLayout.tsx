import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { ChatbotPopup } from '../components/ChatbotPopup';

export function RootLayout() {
  return (
    <div className="flex h-screen w-full bg-gray-50 overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-auto flex flex-col relative">
        <Outlet />
        <ChatbotPopup />
      </main>
    </div>
  );
}
