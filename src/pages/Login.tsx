import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, ArrowRight, Globe, CodeSquare, AlertCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../providers/AuthContext";

export function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{email?: string; password?: string; general?: string}>({});
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: {email?: string; password?: string} = {};
    
    if (!email) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Please enter a valid email address";
    }
    
    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setIsLoading(true);

    try {
      const res = await fetch('/api/users/login/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to login');
      }
      
      login(data.token);
      navigate("/repositories/migrated");
    } catch (err: any) {
      setErrors({ general: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-[#f8f9fa]">
      {/* Left Side - Brand & Graphics */}
      <div className="hidden lg:flex flex-col w-1/2 p-12 relative overflow-hidden bg-[#1e1e2d] text-white">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1e1e2d] via-indigo-900/40 to-[#1e1e2d] z-0" />
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-full h-1/2 bg-gradient-to-t from-indigo-600/20 to-transparent" />
        
        <div className="relative z-10 flex items-center gap-3 font-semibold text-2xl tracking-tight mb-auto">
          <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <CodeSquare className="w-6 h-6 text-white" />
          </div>
          Migration Platform
        </div>

        <div className="relative z-10 max-w-md">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-4xl font-bold mb-6 leading-tight"
          >
            Seamlessly migrate your repositories and pipelines.
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-indigo-200/80 text-lg mb-12"
          >
            Manage active credentials, trigger workflows, and review comprehensive migration histories in one secure dashboard.
          </motion.p>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-12">
        <div className="w-full max-w-sm">
          <div className="text-center lg:text-left mb-10">
            <h2 className="text-3xl font-bold text-slate-900 mb-3">Welcome back</h2>
            <p className="text-slate-500">Sign in to your account to continue</p>
          </div>

          <form className="space-y-5" onSubmit={handleLogin} noValidate>
            <AnimatePresence>
              {errors.general && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, height: 0 }} className="p-3 bg-rose-50 border border-rose-200 text-rose-600 rounded-xl text-sm font-medium flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  {errors.general}
                </motion.div>
              )}
            </AnimatePresence>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700 ml-1">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Mail className={`h-5 w-5 ${errors.email ? 'text-rose-400' : 'text-slate-400'}`} />
                </div>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => {setEmail(e.target.value); if(errors.email) setErrors({...errors, email: undefined})}}
                  placeholder="name@company.com" 
                  className={`w-full pl-11 pr-4 py-3 bg-white border rounded-xl focus:ring-2 outline-none transition-all placeholder:text-slate-400 shadow-sm
                    ${errors.email ? 'border-rose-300 focus:ring-rose-200 focus:border-rose-400' : 'border-slate-200 focus:ring-indigo-500/20 focus:border-indigo-500'}`}
                />
              </div>
              <AnimatePresence>
                {errors.email && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="flex items-center gap-1.5 text-rose-500 text-xs ml-1 font-medium overflow-hidden">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {errors.email}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between ml-1">
                <label className="text-sm font-medium text-slate-700">Password</label>
                <Link to="/forgot-password" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">Forgot password?</Link>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock className={`h-5 w-5 ${errors.password ? 'text-rose-400' : 'text-slate-400'}`} />
                </div>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => {setPassword(e.target.value); if(errors.password) setErrors({...errors, password: undefined})}}
                  placeholder="••••••••" 
                  className={`w-full pl-11 pr-4 py-3 bg-white border rounded-xl focus:ring-2 outline-none transition-all placeholder:text-slate-400 shadow-sm
                    ${errors.password ? 'border-rose-300 focus:ring-rose-200 focus:border-rose-400' : 'border-slate-200 focus:ring-indigo-500/20 focus:border-indigo-500'}`}
                />
              </div>
              <AnimatePresence>
                {errors.password && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="flex items-center gap-1.5 text-rose-500 text-xs ml-1 font-medium overflow-hidden">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {errors.password}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="pt-2">
              <button disabled={isLoading} type="submit" className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-700 hover:to-indigo-600 text-white font-semibold py-3 px-4 rounded-xl shadow-md shadow-indigo-500/20 transition-all active:scale-[0.98] disabled:opacity-70">
                {isLoading ? 'Signing in...' : 'Sign In'}
                {!isLoading && <ArrowRight className="w-4 h-4" />}
              </button>
            </div>
          </form>

          <div className="mt-8 flex items-center justify-center gap-3">
            <div className="h-px w-full bg-slate-200" />
            <span className="text-sm text-slate-400 font-medium">OR</span>
            <div className="h-px w-full bg-slate-200" />
          </div>

          <div className="mt-8">
            <button className="w-full flex items-center justify-center gap-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold py-3 px-4 rounded-xl shadow-sm transition-all active:scale-[0.98]">
              <Globe className="w-5 h-5" />
              Continue with Google
            </button>
          </div>
          
          <p className="mt-10 text-center text-sm text-slate-500">
            Don't have an account? <a href="#" className="font-semibold text-indigo-600 hover:text-indigo-500">Contact admin</a>
          </p>
        </div>
      </div>
    </div>
  );
}
