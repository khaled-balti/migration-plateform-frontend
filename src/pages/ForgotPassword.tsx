import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, ArrowRight, ArrowLeft, CodeSquare, AlertCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

export function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError("Email is required");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address");
    } else {
      setError(null);
      setIsLoading(true);
      
      try {
        const res = await fetch('/api/users/forgot-password/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email })
        });
        
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to send OTP');
        
        navigate("/verify-otp", { state: { email } });
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
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
            Recover your access securely.
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-indigo-200/80 text-lg mb-12"
          >
            We'll send a secure one-time passcode to your registered email to help you get back to managing your migrations.
          </motion.p>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-12 relative">
        <Link to="/login" className="absolute top-8 right-8 text-slate-500 hover:text-slate-800 font-medium flex items-center gap-2 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Return to login
        </Link>

        <div className="w-full max-w-sm">
          <div className="text-center lg:text-left mb-10">
            <h2 className="text-3xl font-bold text-slate-900 mb-3">Forgot Password</h2>
            <p className="text-slate-500">Enter your email and we'll send you an OTP.</p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit} noValidate>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700 ml-1">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Mail className={`h-5 w-5 ${error ? 'text-rose-400' : 'text-slate-400'}`} />
                </div>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => {setEmail(e.target.value); setError(null);}}
                  placeholder="name@company.com" 
                  className={`w-full pl-11 pr-4 py-3 bg-white border rounded-xl focus:ring-2 outline-none transition-all placeholder:text-slate-400 shadow-sm
                    ${error ? 'border-rose-300 focus:ring-rose-200 focus:border-rose-400' : 'border-slate-200 focus:ring-indigo-500/20 focus:border-indigo-500'}`}
                />
              </div>
              <AnimatePresence>
                {error && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="flex items-center gap-1.5 text-rose-500 text-xs ml-1 font-medium overflow-hidden">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="pt-2">
              <button disabled={isLoading} type="submit" className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-700 hover:to-indigo-600 text-white font-semibold py-3 px-4 rounded-xl shadow-md shadow-indigo-500/20 transition-all active:scale-[0.98] disabled:opacity-70">
                {isLoading ? 'Sending...' : 'Send Verification Code'}
                {!isLoading && <ArrowRight className="w-4 h-4" />}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
