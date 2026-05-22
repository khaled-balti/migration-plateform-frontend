import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Lock, Eye, EyeOff, ArrowRight, CodeSquare } from "lucide-react";
import toast from "react-hot-toast";

export function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showPwConfirm, setShowPwConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const email = location.state?.email;
  const otp = location.state?.otp;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (password.length < 6) {
      toast.error("Minimum 6 characters required");
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch("/api/users/reset-password/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, new_password: password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Reset failed");
      
      toast.success("Password updated successfully. Redirecting to login...");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const labelCls = "text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-1 mb-1 block";

  return (
    <div className="min-h-screen w-full flex bg-white dark:bg-[#050508] text-slate-900 dark:text-white font-['Inter',sans-serif]">
      {/* Visual Side */}
      <div className="hidden lg:flex flex-col w-[45%] p-16 relative overflow-hidden bg-indigo-600 dark:bg-[#080812] border-r border-indigo-500/20 dark:border-white/5 text-white transition-colors duration-500">
        {/* Motif: Grid Pattern */}
        <div className="absolute inset-0 z-0 opacity-[0.1]" 
          style={{ backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`, backgroundSize: '40px 40px' }} 
        />

        {/* Drifting Shadow Blobs */}
        <motion.div 
          animate={{ x: [0, 70, -30, 0], y: [0, -60, 40, 0], scale: [1, 1.1, 0.9, 1] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute top-[-10%] left-[-10%] w-[90%] h-[90%] rounded-full bg-white/10 dark:bg-indigo-500/10 blur-[140px] pointer-events-none" 
        />
        <motion.div 
          animate={{ x: [0, -40, 60, 0], y: [0, 70, -50, 0], scale: [1.1, 0.9, 1.2, 1.1] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-[-10%] right-[-10%] w-[80%] h-[80%] rounded-full bg-indigo-400/10 dark:bg-purple-500/5 blur-[120px] pointer-events-none" 
        />

        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-white/10 dark:border-white/[0.03] animate-[spin_60s_linear_infinite] pointer-events-none" />
        
        <Link to="/" className="relative z-10 flex items-center gap-3 font-black text-2xl tracking-tighter uppercase italic">
          <div className="w-10 h-10 bg-white/10 dark:bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg border border-white/20">
            <CodeSquare className="w-6 h-6 text-white" />
          </div>
          Move to GitHub
        </Link>

        <div className="relative z-10 mt-auto">
          <h1 className="text-4xl font-black mb-6 leading-tight tracking-tight">
            Finalize your <span className="text-indigo-200 dark:text-indigo-400">new identity</span>.
          </h1>
          <p className="text-indigo-100 dark:text-slate-400 text-lg font-medium leading-relaxed">
            Configure a robust password to ensure the continued integrity of your workspaces.
          </p>
        </div>
      </div>

      {/* Form Side */}
      <div className="w-full lg:w-[55%] flex items-center justify-center p-8 lg:p-24 relative bg-slate-50/50 dark:bg-[#050508] transition-colors duration-500">
        <div className="w-full max-w-md relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="mb-10 text-center lg:text-left">
              <h2 className="text-4xl font-black text-slate-900 dark:text-white mb-3 tracking-tight">Set New Password</h2>
              <p className="text-slate-500 font-medium">Create credentials that are hard to guess</p>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <label className={labelCls}>New Password</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-indigo-600 dark:group-focus-within:text-indigo-400 text-slate-400 dark:text-slate-500">
                    <Lock size={20} />
                  </div>
                  <input 
                    type={showPw ? "text" : "password"} 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••" 
                    className="w-full pl-12 pr-12 py-4 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 dark:focus:border-indigo-500/50 outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-700 font-medium text-slate-800 dark:text-white shadow-sm dark:shadow-none"
                  />
                  <button type="button" onClick={() => setShowPw(!showPw)} className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-indigo-600 dark:text-slate-600 dark:hover:text-slate-400">
                    {showPw ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className={labelCls}>Confirm Password</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-indigo-600 dark:group-focus-within:text-indigo-400 text-slate-400 dark:text-slate-500">
                    <Lock size={20} />
                  </div>
                  <input 
                    type={showPwConfirm ? "text" : "password"} 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    placeholder="••••••••" 
                    className="w-full pl-12 pr-12 py-4 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 dark:focus:border-indigo-500/50 outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-700 font-medium text-slate-800 dark:text-white shadow-sm dark:shadow-none"
                  />
                  <button type="button" onClick={() => setShowPwConfirm(!showPwConfirm)} className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-indigo-600 dark:text-slate-600 dark:hover:text-slate-400">
                    {showPwConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div className="pt-4">
                <button 
                  disabled={isLoading}
                  type="submit" 
                  className="w-full flex items-center justify-center gap-3 bg-indigo-600 dark:bg-white text-white dark:text-black font-black py-4 px-6 rounded-2xl hover:bg-indigo-700 dark:hover:bg-slate-200 transition-all font-['Inter'] shadow-[0_20px_40px_-15px_rgba(79,70,229,0.3)] dark:shadow-[0_20px_40px_-15px_rgba(255,255,255,0.1)] disabled:opacity-50"
                >
                  {isLoading ? "Updating..." : "Confirm New Password"}
                  <ArrowRight size={20} />
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
