import { useTheme } from "../providers/ThemeProvider";
import { Sun, Moon, Laptop } from "lucide-react";

import { useEffect, useState } from "react";
import { SettingsSkeleton } from "../components/Skeletons";

export function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading to show skeleton
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <SettingsSkeleton />;
  }
  
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto w-full animate-in fade-in duration-500">
      <div className="mb-10">
        <h1 className="text-2xl sm:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400 mb-2">
          Settings
        </h1>
        <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400">
          Personalize your dashboard experience and interface preferences.
        </p>
      </div>

      <div className="bg-white dark:bg-[#111] border border-slate-200 dark:border-white/5 rounded-3xl p-8 shadow-sm">
        <div className="mb-8">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-2 flex items-center gap-2">
            <Sun className="w-5 h-5 text-amber-500" /> 
            Appearance Mode
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Customize how the platform looks on your device.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div 
            onClick={() => setTheme("light")}
            className={`cursor-pointer group relative overflow-hidden rounded-2xl border-2 transition-all p-4 ${
              theme === 'light' ? 'border-indigo-500 bg-indigo-50/30' : 'border-slate-100 dark:border-white/5 hover:border-slate-200 dark:hover:border-white/10'
            }`}
          >
            <div className="aspect-video bg-white rounded-lg border border-slate-200 shadow-inner mb-4 flex items-center justify-center">
               <Sun className="w-8 h-8 text-amber-400" />
            </div>
            <span className="font-bold text-slate-800 dark:text-slate-200">Light Mode</span>
            <p className="text-xs text-slate-500 mt-1">Clean and sharp for daytime.</p>
          </div>

          <div 
            onClick={() => setTheme("dark")}
            className={`cursor-pointer group relative overflow-hidden rounded-2xl border-2 transition-all p-4 ${
              theme === 'dark' ? 'border-indigo-500 bg-indigo-50/30' : 'border-slate-100 dark:border-white/5 hover:border-slate-200 dark:hover:border-white/10'
            }`}
          >
            <div className="aspect-video bg-[#0a0a0a] rounded-lg border border-white/10 shadow-inner mb-4 flex items-center justify-center">
               <Moon className="w-8 h-8 text-indigo-400" />
            </div>
            <span className="font-bold text-slate-800 dark:text-slate-200">Dark Mode</span>
            <p className="text-xs text-slate-500 mt-1">Easy on the eyes at night.</p>
          </div>

          <div 
            onClick={() => setTheme("system")}
            className={`cursor-pointer group relative overflow-hidden rounded-2xl border-2 transition-all p-4 ${
              theme === 'system' ? 'border-indigo-500 bg-indigo-50/30' : 'border-slate-100 dark:border-white/5 hover:border-slate-200 dark:hover:border-white/10'
            }`}
          >
            <div className="aspect-video bg-gradient-to-br from-white to-[#0a0a0a] rounded-lg border border-slate-200 dark:border-white/10 shadow-inner mb-4 flex items-center justify-center">
               <Laptop className="w-8 h-8 text-slate-500" />
            </div>
            <span className="font-bold text-slate-800 dark:text-slate-200">System Mode</span>
            <p className="text-xs text-slate-500 mt-1">Adapts to your environment.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
