import { useState } from 'react';
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
  History
} from 'lucide-react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

export function Sidebar() {
  const [openRepos, setOpenRepos] = useState(true);
  const [openPipelines, setOpenPipelines] = useState(true);
  const [openHistory, setOpenHistory] = useState(true);
  const [openCredentials, setOpenCredentials] = useState(true);
  
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-50 dark:bg-[#12121e] transition-colors duration-300">
      <aside className="w-64 bg-[#1e1e2d] h-screen flex flex-col text-white shrink-0 py-6 z-20 shadow-xl">
      <div className="px-6 mb-8">
        <h1 className="text-xl font-bold">Migration Platform</h1>
      </div>

      <nav className="flex-1 overflow-y-auto px-4 flex flex-col gap-2">
        {/* Repositories Dropdown */}
        {user.permissions.includes('repositories') && (
        <div>
          <button 
            onClick={() => setOpenRepos(!openRepos)}
            className="w-full flex items-center justify-between p-3 rounded-lg text-gray-300 hover:bg-[#2a2a3c] hover:text-white transition-colors"
          >
            <div className="flex items-center gap-3">
              <Database className="w-5 h-5" />
              <span className="font-medium">Repositories</span>
            </div>
            {openRepos ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
          
          {openRepos && (
            <div className="mt-1 flex flex-col gap-1 pl-11 pr-2">
              <NavLink
                to="/repositories/migrated"
                className={({ isActive }) => twMerge(
                  clsx(
                    "p-2 rounded-lg text-sm transition-colors block",
                    isActive ? "bg-indigo-600 text-white" : "text-gray-400 hover:text-white hover:bg-[#2a2a3c]"
                  )
                )}
              >
                Migrated repos
              </NavLink>
              <NavLink
                to="/repositories/waiting"
                className={({ isActive }) => twMerge(
                  clsx(
                    "p-2 rounded-lg text-sm transition-colors block",
                    isActive ? "bg-indigo-600 text-white" : "text-gray-400 hover:text-white hover:bg-[#2a2a3c]"
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
            className="w-full flex items-center justify-between p-3 rounded-lg text-gray-300 hover:bg-[#2a2a3c] hover:text-white transition-colors"
          >
            <div className="flex items-center gap-3">
              <GitMerge className="w-5 h-5" />
              <span className="font-medium">Pipelines</span>
            </div>
            {openPipelines ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
          
          {openPipelines && (
            <div className="mt-1 flex flex-col gap-1 pl-11 pr-2">
              <NavLink
                to="/pipelines/migrated"
                className={({ isActive }) => twMerge(
                  clsx(
                    "p-2 rounded-lg text-sm transition-colors block",
                    isActive ? "bg-indigo-600 text-white" : "text-gray-400 hover:text-white hover:bg-[#2a2a3c]"
                  )
                )}
              >
                Migrated pipelines
              </NavLink>
              <NavLink
                to="/pipelines/waiting"
                className={({ isActive }) => twMerge(
                  clsx(
                    "p-2 rounded-lg text-sm transition-colors block",
                    isActive ? "bg-indigo-600 text-white" : "text-gray-400 hover:text-white hover:bg-[#2a2a3c]"
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
            className="w-full flex items-center justify-between p-3 rounded-lg text-gray-300 hover:bg-[#2a2a3c] hover:text-white transition-colors"
          >
            <div className="flex items-center gap-3">
              <History className="w-5 h-5" />
              <span className="font-medium">History</span>
            </div>
            {openHistory ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
          
          {openHistory && (
            <div className="mt-1 flex flex-col gap-1 pl-11 pr-2">
              <NavLink
                to="/history/all"
                className={({ isActive }) => twMerge(
                  clsx(
                    "p-2 rounded-lg text-sm transition-colors block",
                    isActive ? "bg-indigo-600 text-white" : "text-gray-400 hover:text-white hover:bg-[#2a2a3c]"
                  )
                )}
              >
                All activities
              </NavLink>
              <NavLink
                to="/history/my"
                className={({ isActive }) => twMerge(
                  clsx(
                    "p-2 rounded-lg text-sm transition-colors block",
                    isActive ? "bg-indigo-600 text-white" : "text-gray-400 hover:text-white hover:bg-[#2a2a3c]"
                  )
                )}
              >
                My activities
              </NavLink>
            </div>
          )}
        </div>

        {/* Standalone Routes */}
        {/* Credentials Dropdown */}
        {user.permissions.includes('credentials') && (
        <div>
          <button 
            onClick={() => setOpenCredentials(!openCredentials)}
            className="w-full flex items-center justify-between p-3 rounded-lg text-gray-300 hover:bg-[#2a2a3c] hover:text-white transition-colors"
          >
            <div className="flex items-center gap-3">
              <Key className="w-5 h-5" />
              <span className="font-medium">Credentials</span>
            </div>
            {openCredentials ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
          
          {openCredentials && (
            <div className="mt-1 flex flex-col gap-1 pl-11 pr-2">
              <NavLink
                to="/credentials/migrated"
                className={({ isActive }) => twMerge(
                  clsx(
                    "p-2 rounded-lg text-sm transition-colors block",
                    isActive ? "bg-indigo-600 text-white" : "text-gray-400 hover:text-white hover:bg-[#2a2a3c]"
                  )
                )}
              >
                Migrated
              </NavLink>
              <NavLink
                to="/credentials/waiting"
                className={({ isActive }) => twMerge(
                  clsx(
                    "p-2 rounded-lg text-sm transition-colors block",
                    isActive ? "bg-indigo-600 text-white" : "text-gray-400 hover:text-white hover:bg-[#2a2a3c]"
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
          className={({ isActive }) => twMerge(
            clsx(
              "flex items-center gap-3 p-3 rounded-lg text-gray-300 transition-colors",
              isActive ? "bg-indigo-600 text-white" : "hover:bg-[#2a2a3c] hover:text-white"
            )
          )}
        >
          <Users className="w-5 h-5" />
          <span className="font-medium">Users</span>
        </NavLink>
        )}
      </nav>

      {/* Bottom Actions */}
      <div className="px-4 mt-auto flex flex-col gap-2 pt-4 border-t border-[#2a2a3c]">
        <NavLink
          to="/settings"
          className={({ isActive }) => twMerge(
            clsx(
              "flex items-center gap-3 p-3 rounded-lg text-gray-300 transition-colors",
              isActive ? "bg-indigo-600 text-white" : "hover:bg-[#2a2a3c] hover:text-white"
            )
          )}
        >
          <Settings className="w-5 h-5" />
          <span className="font-medium">Settings</span>
        </NavLink>

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 p-3 rounded-lg text-rose-400 hover:bg-rose-500/10 transition-colors w-full text-left"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </aside>
      <main className="flex-1 h-screen overflow-y-auto relative z-10 w-full text-slate-800 dark:text-slate-200">
        <Outlet />
      </main>
    </div>
  );
}
