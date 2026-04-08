import { useState } from "react";
import { useTheme } from "../providers/ThemeProvider";
import { Sun, Moon, Laptop, ShieldCheck, Lock, AlertCircle, Save, Link } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function SettingsPage() {
  const { theme, setTheme } = useTheme();
  
  // Password State
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Integrations State
  const [jenkinsUser, setJenkinsUser] = useState("");
  const [jenkinsToken, setJenkinsToken] = useState("");
  const [githubToken, setGithubToken] = useState("");
  const [githubOrg, setGithubOrg] = useState("");
  const [gitLabToken, setGitLabToken] = useState("");
  
  const [integrationSuccess, setIntegrationSuccess] = useState<string | null>(null);

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!oldPassword || !newPassword || !confirmPassword) {
      setError("All fields are required.");
      setSuccess(null);
      return;
    }
    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters.");
      setSuccess(null);
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("New password and confirm password do not match.");
      setSuccess(null);
      return;
    }

    // Mock success
    setError(null);
    setSuccess("Password updated successfully!");
    setOldPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setTimeout(() => setSuccess(null), 3000);
  };

  return (
    <div className="p-6 md:p-8 m-4 md:m-8 max-w-2xl mx-auto w-full">
      <div className="mb-10">
        <h1 className="text-3xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400 mb-2">
          Global Settings
        </h1>
        <p className="text-slate-500 dark:text-slate-400">
          Manage your personal preferences, security credentials, and app appearance.
        </p>
      </div>

      <div className="flex flex-col gap-8 max-w-2xl">
        {/* Appearance Settings */}
        <div className="bg-white dark:bg-[#1e1e2d] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
            <Sun className="w-5 h-5 text-amber-500" /> 
            Appearance
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
            Select your preferred theme for the dashboard interface.
          </p>

          <div className="flex flex-col gap-3">
            <button 
              onClick={() => setTheme("light")}
              className={`flex items-center gap-3 p-4 rounded-xl border ${theme === 'light' ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300' : 'border-slate-200 dark:border-slate-700 bg-transparent hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'} transition-all text-left`}
            >
              <Sun className="w-5 h-5" />
              <div className="flex flex-col">
                <span className="font-semibold">Light Mode</span>
                <span className="text-xs opacity-80">Classic balanced appearance</span>
              </div>
            </button>

            <button 
              onClick={() => setTheme("dark")}
              className={`flex items-center gap-3 p-4 rounded-xl border ${theme === 'dark' ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300' : 'border-slate-200 dark:border-slate-700 bg-transparent hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'} transition-all text-left`}
            >
              <Moon className="w-5 h-5" />
              <div className="flex flex-col">
                <span className="font-semibold">Dark Mode</span>
                <span className="text-xs opacity-80">Ideal for low-light environments</span>
              </div>
            </button>

            <button 
              onClick={() => setTheme("system")}
              className={`flex items-center gap-3 p-4 rounded-xl border ${theme === 'system' ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300' : 'border-slate-200 dark:border-slate-700 bg-transparent hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'} transition-all text-left`}
            >
              <Laptop className="w-5 h-5" />
              <div className="flex flex-col">
                <span className="font-semibold">System Default</span>
                <span className="text-xs opacity-80">Syncs with your OS configuration</span>
              </div>
            </button>
          </div>
        </div>

        {/* Security Settings */}
        <div className="bg-white dark:bg-[#1e1e2d] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-500" /> 
            Account Security
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
            Ensure your account is using a long, random password to stay secure.
          </p>

          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">Current Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input 
                  type="password" 
                  value={oldPassword}
                  onChange={(e) => {setOldPassword(e.target.value); setError(null);}}
                  className="w-full pl-11 pr-4 py-2.5 bg-white dark:bg-[#2a2a3c] border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all dark:text-white placeholder:text-slate-400 shadow-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">New Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-indigo-400" />
                </div>
                <input 
                  type="password" 
                  value={newPassword}
                  onChange={(e) => {setNewPassword(e.target.value); setError(null);}}
                  className="w-full pl-11 pr-4 py-2.5 bg-white dark:bg-[#2a2a3c] border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all dark:text-white placeholder:text-slate-400 shadow-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">Confirm New Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-indigo-400" />
                </div>
                <input 
                  type="password" 
                  value={confirmPassword}
                  onChange={(e) => {setConfirmPassword(e.target.value); setError(null);}}
                  className="w-full pl-11 pr-4 py-2.5 bg-white dark:bg-[#2a2a3c] border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all dark:text-white placeholder:text-slate-400 shadow-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="flex items-center gap-1.5 text-rose-500 text-sm font-medium overflow-hidden pt-1">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </motion.div>
              )}
              {success && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="flex items-center gap-1.5 text-emerald-500 text-sm font-medium overflow-hidden pt-1">
                  <ShieldCheck className="w-4 h-4" />
                  {success}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="pt-2">
              <button type="submit" className="flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold py-2.5 px-6 rounded-xl shadow-md shadow-emerald-500/20 transition-all active:scale-[0.98]">
                <Save className="w-4 h-4" />
                Save Password
              </button>
            </div>
          </form>
        </div>

        {/* Account Integrations */}
        <div className="bg-white dark:bg-[#1e1e2d] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
            <Link className="w-5 h-5 text-indigo-500" /> 
            Account Integrations
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
            Configure your development integrations for automated workflows.
          </p>

          <form onSubmit={(e) => { 
            e.preventDefault(); 
            setIntegrationSuccess("Integrations saved successfully!"); 
            setTimeout(() => setIntegrationSuccess(null), 3000); 
          }} className="space-y-4">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">Jenkins User</label>
                <input 
                  type="text" 
                  value={jenkinsUser}
                  onChange={(e) => setJenkinsUser(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white dark:bg-[#2a2a3c] border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all dark:text-white placeholder:text-slate-400 shadow-sm"
                  placeholder="e.g. admin"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">Jenkins Token</label>
                <input 
                  type="password" 
                  value={jenkinsToken}
                  onChange={(e) => setJenkinsToken(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white dark:bg-[#2a2a3c] border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all dark:text-white placeholder:text-slate-400 shadow-sm"
                  placeholder="••••••••"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">GitHub Token</label>
                <input 
                  type="password" 
                  value={githubToken}
                  onChange={(e) => setGithubToken(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white dark:bg-[#2a2a3c] border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all dark:text-white placeholder:text-slate-400 shadow-sm"
                  placeholder="ghp_••••••••"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">GitHub Organization</label>
                <input 
                  type="text" 
                  value={githubOrg}
                  onChange={(e) => setGithubOrg(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white dark:bg-[#2a2a3c] border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all dark:text-white placeholder:text-slate-400 shadow-sm"
                  placeholder="e.g. facebook"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">GitLab Token</label>
                <input 
                  type="password" 
                  value={gitLabToken}
                  onChange={(e) => setGitLabToken(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white dark:bg-[#2a2a3c] border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all dark:text-white placeholder:text-slate-400 shadow-sm"
                  placeholder="glpat-••••••••"
                />
              </div>
            </div>

            <AnimatePresence>
              {integrationSuccess && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="flex items-center gap-1.5 text-indigo-500 text-sm font-medium overflow-hidden pt-1">
                  <ShieldCheck className="w-4 h-4" />
                  {integrationSuccess}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="pt-2">
              <button type="submit" className="flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-semibold py-2.5 px-6 rounded-xl shadow-md shadow-indigo-500/20 transition-all active:scale-[0.98]">
                <Save className="w-4 h-4" />
                Save Integrations
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
