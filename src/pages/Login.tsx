import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, ArrowRight, CodeSquare } from "lucide-react";
import { useAuth } from "../providers/AuthContext";
import toast from "react-hot-toast";

export function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch("/api/users/login/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Authentication failed");
      
      toast.success("Login successful! Redirecting...");
      login(data.token);
      navigate("/app");
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
        
        {/* Shadow Animations / Drifting Blobs */}
        <motion.div 
          animate={{ 
            x: [0, 50, -30, 0], 
            y: [0, -40, 60, 0],
            scale: [1, 1.2, 0.9, 1] 
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-[-10%] left-[-10%] w-[80%] h-[80%] rounded-full bg-white/10 dark:bg-indigo-500/10 blur-[120px] pointer-events-none" 
        />
        <motion.div 
          animate={{ 
            x: [0, -60, 40, 0], 
            y: [0, 50, -40, 0],
            scale: [1.1, 0.9, 1.2, 1.1] 
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-[-20%] right-[-10%] w-[70%] h-[70%] rounded-full bg-indigo-400/10 dark:bg-purple-500/5 blur-[100px] pointer-events-none" 
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
            Elevate your <span className="text-indigo-200 dark:text-indigo-400">migration velocity</span>.
          </h1>
          <p className="text-indigo-100 dark:text-slate-400 text-lg font-medium leading-relaxed">
            Access the command center for enterprise GitLab to GitHub transitions with zero downtime.
          </p>
        </div>
      </div>

      {/* Form Side */}
      <div className="w-full lg:w-[55%] flex items-center justify-center p-8 lg:p-24 relative bg-slate-50/50 dark:bg-[#050508] transition-colors duration-500">
        <div className="w-full max-w-md relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="mb-12 text-center lg:text-left">
              <h2 className="text-4xl font-black text-slate-900 dark:text-white mb-3 tracking-tight">Welcome Back</h2>
              <p className="text-slate-500 font-medium tracking-tight">Sign in with your organizational identity</p>
            </div>

            <form className="space-y-6" onSubmit={handleLogin}>
              <div className="space-y-2">
                <label className={labelCls}>Work Email</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-indigo-600 dark:group-focus-within:text-indigo-400 text-slate-400 dark:text-slate-500">
                    <Mail size={20} />
                  </div>
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="alex@company.com" 
                    className="w-full pl-12 pr-4 py-4 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 dark:focus:border-indigo-500/50 outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-700 font-medium text-slate-800 dark:text-white shadow-sm dark:shadow-none"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center px-1">
                  <label className={labelCls}>Vault Key</label>
                  <Link to="/forgot-password" className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 uppercase tracking-widest transition-colors mb-1">Recover Key?</Link>
                </div>
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

              <div className="pt-4">
                <button 
                  disabled={isLoading}
                  type="submit" 
                  className="w-full flex items-center justify-center gap-3 bg-indigo-600 dark:bg-white text-white dark:text-black font-black py-4 px-6 rounded-2xl hover:bg-indigo-700 dark:hover:bg-slate-200 transition-all font-['Inter'] shadow-[0_20px_40px_-15px_rgba(79,70,229,0.3)] dark:shadow-[0_20px_40px_-15px_rgba(255,255,255,0.1)] disabled:opacity-50"
                >
                  {isLoading ? "Authenticating..." : "Establish Session"}
                  <ArrowRight size={20} />
                </button>
              </div>

              <div className="text-center mt-10">
                <span className="text-sm font-medium text-slate-500 dark:text-slate-600">New organization?</span>
                <Link to="/register" className="ml-2 text-sm font-black text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 transition-colors uppercase tracking-widest border-b-2 border-indigo-500/10 hover:border-indigo-500">Register</Link>
              </div>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
