import { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../providers/AuthContext';
import { 
  Database,
  GitMerge, 
  Key, 
  Users, 
  Settings, 
  LogOut,
  ChevronDown,
  ChevronRight,
  History,
  Menu,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { twMerge } from 'tailwind-merge';
import clsx from 'clsx';
import { ChatbotPopup } from './ChatbotPopup';

export function Sidebar() {
  const [openRepos, setOpenRepos] = useState(true);
  const [openPipelines, setOpenPipelines] = useState(true);
  const [openHistory, setOpenHistory] = useState(true);
  const [openCredentials, setOpenCredentials] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const toggleMobileSidebar = () => setIsMobileOpen(!isMobileOpen);
  const closeMobileSidebar = () => setIsMobileOpen(false);

  useEffect(() => {
    // Close sidebar on route change
    closeMobileSidebar();
  }, [navigate]);

  if (!user) return null;

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#fafafa] dark:bg-[#000] transition-colors duration-300 relative">
      {/* Mobile Top Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white dark:bg-[#0a0a0a] border-b border-slate-200 dark:border-[#333] px-4 flex items-center justify-between z-40">
        <h1 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">Migration Platform</h1>
        <button 
          onClick={toggleMobileSidebar}
          className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-[#1a1a1a] transition-colors"
        >
          {isMobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Backdrop for Mobile */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeMobileSidebar}
            className="lg:hidden fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40"
          />
        )}
      </AnimatePresence>

      <aside className={twMerge(
        "fixed inset-y-0 left-0 lg:static w-[260px] bg-[#1e1e2d] dark:bg-[#0a0a0a] border-r border-[#1e1e2d] dark:border-[#333] h-screen flex flex-col text-slate-100 shrink-0 py-6 z-50 transition-all duration-300 transform",
        isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        <div className="px-6 mb-8 mt-2 flex items-center justify-between">
          <h1 className="text-xl font-bold tracking-tight text-white">Migration Platform</h1>
          <button 
            onClick={closeMobileSidebar}
            className="lg:hidden p-1 rounded-md hover:bg-[#2a2a3e] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-4 flex flex-col gap-2 sidebar-nav">
          {/* Repositories Dropdown */}
          {user.permissions.includes('repositories') && (
          <div>
            <button 
              onClick={() => setOpenRepos(!openRepos)}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-[#9494b8] dark:text-slate-400 hover:bg-[#2a2a3e] dark:hover:bg-[#111] hover:text-white dark:hover:text-slate-200 transition-colors group text-sm"
            >
              <div className="flex items-center gap-3">
                <Database className="w-4 h-4 text-[#73739c] dark:text-slate-500 group-hover:text-white dark:group-hover:text-slate-300 transition-colors" />
                <span className="font-medium">Repositories</span>
              </div>
              {openRepos ? <ChevronDown className="w-4 h-4 text-[#73739c] dark:text-slate-500" /> : <ChevronRight className="w-4 h-4 text-[#73739c] dark:text-slate-500" />}
            </button>
            
            {openRepos && (
              <div className="mt-1 flex flex-col gap-0.5 pl-10 pr-2">
                <NavLink
                  to="/repositories/migrated"
                  onClick={closeMobileSidebar}
                  className={({ isActive }) => twMerge(
                    clsx(
                      "px-3 py-2 rounded-lg text-sm font-medium transition-colors block",
                      isActive ? "bg-[#2a2a3e] dark:bg-[#222] text-white" : "text-[#9494b8] hover:text-white dark:text-slate-400 dark:hover:text-slate-200 hover:bg-[#2a2a3e] dark:hover:bg-[#111]"
                    )
                  )}
                >
                  Migrated repos
                </NavLink>
                <NavLink
                  to="/repositories/waiting"
                  onClick={closeMobileSidebar}
                  className={({ isActive }) => twMerge(
                    clsx(
                      "px-3 py-2 rounded-lg text-sm font-medium transition-colors block",
                      isActive ? "bg-[#2a2a3e] dark:bg-[#222] text-white" : "text-[#9494b8] hover:text-white dark:text-slate-400 dark:hover:text-slate-200 hover:bg-[#2a2a3e] dark:hover:bg-[#111]"
                    )
                  )}
                >
                  Waiting repos
                </NavLink>
              </div>
            )}
          </div>
          )}

          {/* Pipelines Dropdown */}
          {user.permissions.includes('pipelines') && (
          <div>
            <button 
              onClick={() => setOpenPipelines(!openPipelines)}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-[#9494b8] dark:text-slate-400 hover:bg-[#2a2a3e] dark:hover:bg-[#111] hover:text-white dark:hover:text-slate-200 transition-colors group text-sm"
            >
              <div className="flex items-center gap-3">
                <GitMerge className="w-4 h-4 text-[#73739c] dark:text-slate-500 group-hover:text-white dark:group-hover:text-slate-300 transition-colors" />
                <span className="font-medium">Pipelines</span>
              </div>
              {openPipelines ? <ChevronDown className="w-4 h-4 text-[#73739c] dark:text-slate-500" /> : <ChevronRight className="w-4 h-4 text-[#73739c] dark:text-slate-500" />}
            </button>
            
            {openPipelines && (
              <div className="mt-1 flex flex-col gap-0.5 pl-10 pr-2">
                <NavLink
                  to="/pipelines/migrated"
                  onClick={closeMobileSidebar}
                  className={({ isActive }) => twMerge(
                    clsx(
                      "px-3 py-2 rounded-lg text-sm font-medium transition-colors block",
                      isActive ? "bg-[#2a2a3e] dark:bg-[#222] text-white" : "text-[#9494b8] hover:text-white dark:text-slate-400 dark:hover:text-slate-200 hover:bg-[#2a2a3e] dark:hover:bg-[#111]"
                    )
                  )}
                >
                  Migrated pipelines
                </NavLink>
                <NavLink
                  to="/pipelines/waiting"
                  onClick={closeMobileSidebar}
                  className={({ isActive }) => twMerge(
                    clsx(
                      "px-3 py-2 rounded-lg text-sm font-medium transition-colors block",
                      isActive ? "bg-[#2a2a3e] dark:bg-[#222] text-white" : "text-[#9494b8] hover:text-white dark:text-slate-400 dark:hover:text-slate-200 hover:bg-[#2a2a3e] dark:hover:bg-[#111]"
                    )
                  )}
                >
                  Waiting pipelines
                </NavLink>
              </div>
            )}
          </div>
          )}

          {/* History Dropdown */}
          <div>
            <button 
              onClick={() => setOpenHistory(!openHistory)}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-[#9494b8] dark:text-slate-400 hover:bg-[#2a2a3e] dark:hover:bg-[#111] hover:text-white dark:hover:text-slate-200 transition-colors group text-sm"
            >
              <div className="flex items-center gap-3">
                <History className="w-4 h-4 text-[#73739c] dark:text-slate-500 group-hover:text-white dark:group-hover:text-slate-300 transition-colors" />
                <span className="font-medium">History</span>
              </div>
              {openHistory ? <ChevronDown className="w-4 h-4 text-[#73739c] dark:text-slate-500" /> : <ChevronRight className="w-4 h-4 text-[#73739c] dark:text-slate-500" />}
            </button>
            
            {openHistory && (
              <div className="mt-1 flex flex-col gap-0.5 pl-10 pr-2">
                <NavLink
                  to="/history/all"
                  onClick={closeMobileSidebar}
                  className={({ isActive }) => twMerge(
                    clsx(
                      "px-3 py-2 rounded-lg text-sm font-medium transition-colors block",
                      isActive ? "bg-[#2a2a3e] dark:bg-[#222] text-white" : "text-[#9494b8] hover:text-white dark:text-slate-400 dark:hover:text-slate-200 hover:bg-[#2a2a3e] dark:hover:bg-[#111]"
                    )
                  )}
                >
                  All activities
                </NavLink>
                <NavLink
                  to="/history/my"
                  onClick={closeMobileSidebar}
                  className={({ isActive }) => twMerge(
                    clsx(
                      "px-3 py-2 rounded-lg text-sm font-medium transition-colors block",
                      isActive ? "bg-[#2a2a3e] dark:bg-[#222] text-white" : "text-[#9494b8] hover:text-white dark:text-slate-400 dark:hover:text-slate-200 hover:bg-[#2a2a3e] dark:hover:bg-[#111]"
                    )
                  )}
                >
                  My activities
                </NavLink>
              </div>
            )}
          </div>

          {/* Credentials Dropdown */}
          {user.permissions.includes('credentials') && (
          <div>
            <button 
              onClick={() => setOpenCredentials(!openCredentials)}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-[#9494b8] dark:text-slate-400 hover:bg-[#2a2a3e] dark:hover:bg-[#111] hover:text-white dark:hover:text-slate-200 transition-colors group text-sm"
            >
              <div className="flex items-center gap-3">
                <Key className="w-4 h-4 text-[#73739c] dark:text-slate-500 group-hover:text-white dark:group-hover:text-slate-300 transition-colors" />
                <span className="font-medium">Credentials</span>
              </div>
              {openCredentials ? <ChevronDown className="w-4 h-4 text-[#73739c] dark:text-slate-500" /> : <ChevronRight className="w-4 h-4 text-[#73739c] dark:text-slate-500" />}
            </button>
            
            {openCredentials && (
              <div className="mt-1 flex flex-col gap-0.5 pl-10 pr-2">
                <NavLink
                  to="/credentials/migrated"
                  onClick={closeMobileSidebar}
                  className={({ isActive }) => twMerge(
                    clsx(
                      "px-3 py-2 rounded-lg text-sm font-medium transition-colors block",
                      isActive ? "bg-[#2a2a3e] dark:bg-[#222] text-white" : "text-[#9494b8] hover:text-white dark:text-slate-400 dark:hover:text-slate-200 hover:bg-[#2a2a3e] dark:hover:bg-[#111]"
                    )
                  )}
                >
                  Migrated
                </NavLink>
                <NavLink
                  to="/credentials/waiting"
                  onClick={closeMobileSidebar}
                  className={({ isActive }) => twMerge(
                    clsx(
                      "px-3 py-2 rounded-lg text-sm font-medium transition-colors block",
                      isActive ? "bg-[#2a2a3e] dark:bg-[#222] text-white" : "text-[#9494b8] hover:text-white dark:text-slate-400 dark:hover:text-slate-200 hover:bg-[#2a2a3e] dark:hover:bg-[#111]"
                    )
                  )}
                >
                  Waiting
                </NavLink>
              </div>
            )}
          </div>
          )}

          {user.permissions.includes('users') && (
          <NavLink
            to="/users"
            onClick={closeMobileSidebar}
            className={({ isActive }) => twMerge(
              clsx(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors group text-sm",
                isActive ? "bg-[#2a2a3e] dark:bg-[#222] text-white font-medium" : "text-[#9494b8] dark:text-slate-400 hover:bg-[#2a2a3e] dark:hover:bg-[#111] hover:text-white dark:hover:text-slate-200"
              )
            )}
          >
            {({ isActive }) => (
              <>
                <Users className={clsx("w-4 h-4 transition-colors", isActive ? "text-white" : "text-[#73739c] dark:text-slate-500 group-hover:text-white dark:group-hover:text-slate-300")} />
                <span className="font-medium">Users</span>
              </>
            )}
          </NavLink>
          )}

          <NavLink
            to="/settings"
            onClick={closeMobileSidebar}
            className={({ isActive }) => twMerge(
              clsx(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors group text-sm",
                isActive ? "bg-[#2a2a3e] dark:bg-[#222] text-white font-medium" : "text-[#9494b8] dark:text-slate-400 hover:bg-[#2a2a3e] dark:hover:bg-[#111] hover:text-white dark:hover:text-slate-200"
              )
            )}
          >
            {({ isActive }) => (
              <>
                <Settings className={clsx("w-4 h-4 transition-colors", isActive ? "text-white" : "text-[#73739c] dark:text-slate-500 group-hover:text-white dark:group-hover:text-slate-300")} />
                <span className="font-medium">Settings</span>
              </>
            )}
          </NavLink>
        </nav>

        {/* Bottom Actions */}
        <div className="px-4 mt-auto flex flex-col gap-1 pt-4 border-t border-[#333]">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-rose-400 hover:bg-rose-500/20 transition-colors w-full text-left text-sm"
          >
            <LogOut className="w-4 h-4" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 h-screen overflow-y-auto relative z-10 w-full text-slate-800 dark:text-slate-200 pt-16 lg:pt-0">
        <Outlet />
      </main>

      <ChatbotPopup />
    </div>
  );
}
