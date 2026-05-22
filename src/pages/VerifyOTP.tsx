import React, { useState, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, CodeSquare, ShieldCheck } from "lucide-react";
import toast from "react-hot-toast";

export function VerifyOTPPage() {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const navigate = useNavigate();
  const location = useLocation();

  const email = location.state?.email;
  const type = location.state?.type; // 'registration' or 'password_reset'

  const handleOtpChange = (index: number, value: string) => {
    if (isNaN(Number(value))) return;
    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join("");
    if (code.length < 6) {
      toast.error("Please enter the complete 6-digit code");
      return;
    }

    if (type === "password_reset") {
      navigate("/reset-password", { state: { email, otp: code } });
    } else {
      setIsLoading(true);
      try {
        const res = await fetch("/api/company/verify-otp/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, otp: code }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Verification failed");
        
        toast.success("Identity verified successfully!");
        navigate("/login");
      } catch (err: any) {
        toast.error(err.message);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleResend = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/company/resend-otp/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Resend failed");
      
      toast.success("A new verification code has been sent.");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

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
          animate={{ x: [0, 50, -40, 0], y: [0, -70, 60, 0], scale: [1, 1.25, 0.8, 1] }}
          transition={{ duration: 21, repeat: Infinity, ease: "linear" }}
          className="absolute top-[-8%] left-[-8%] w-[85%] h-[85%] rounded-full bg-white/10 dark:bg-indigo-500/10 blur-[120px] pointer-events-none" 
        />
        <motion.div 
          animate={{ x: [0, -60, 50, 0], y: [0, 50, -60, 0], scale: [1.15, 0.85, 1.2, 1.15] }}
          transition={{ duration: 27, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-[-12%] right-[-8%] w-[75%] h-[75%] rounded-full bg-indigo-400/10 dark:bg-purple-500/5 blur-[110px] pointer-events-none" 
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
            Securing your <span className="text-indigo-200 dark:text-indigo-400">migration path</span>.
          </h1>
          <p className="text-indigo-100 dark:text-slate-400 text-lg font-medium leading-relaxed">
            Multi-factor validation ensures only authorized personnel can orchestrate resource transitions.
          </p>
        </div>
      </div>

      {/* Form Side */}
      <div className="w-full lg:w-[55%] flex items-center justify-center p-8 lg:p-24 relative bg-slate-50/50 dark:bg-[#050508] transition-colors duration-500">
        <div className="w-full max-w-sm relative z-10">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
            <div className="w-20 h-20 bg-indigo-500/10 border border-indigo-500/20 rounded-3xl flex items-center justify-center mb-8 mx-auto shadow-md">
              <ShieldCheck className="w-10 h-10 text-indigo-600 dark:text-indigo-400" />
            </div>
            
            <h2 className="text-4xl font-black text-slate-900 dark:text-white mb-3 tracking-tight">Verify Identity</h2>
            <p className="text-slate-500 font-medium mb-12 italic">One more step for security</p>

            <form className="space-y-8" onSubmit={handleSubmit}>
              <div className="flex gap-3 justify-center">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    // @ts-ignore
                    ref={(el) => (inputRefs.current[index] = el)}
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="w-12 h-16 text-center text-2xl font-black bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 dark:focus:border-indigo-500/50 outline-none transition-all text-slate-800 dark:text-white shadow-sm dark:shadow-none"
                  />
                ))}
              </div>

              <button 
                disabled={isLoading}
                type="submit" 
                className="w-full flex items-center justify-center gap-3 bg-indigo-600 dark:bg-white text-white dark:text-black font-black py-4 px-6 rounded-2xl hover:bg-indigo-700 dark:hover:bg-slate-200 transition-all font-['Inter'] shadow-[0_20px_40px_-15px_rgba(79,70,229,0.3)] dark:shadow-[0_20px_40px_-15px_rgba(255,255,255,0.1)] disabled:opacity-50"
              >
                {isLoading ? "Verifying..." : "Confirm Code"}
                <ArrowRight size={20} />
              </button>

              <div className="pt-2">
                <button type="button" onClick={handleResend} className="text-xs font-black text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 uppercase tracking-widest transition-colors underline-offset-4 hover:underline">
                  Resend Verification Code
                </button>
              </div>

              <div className="text-center mt-12">
                <Link to="/login" className="text-xs font-black text-slate-400 dark:text-slate-600 hover:text-indigo-600 dark:hover:text-indigo-400 uppercase tracking-widest flex items-center justify-center gap-2 transition-colors">
                  <ArrowRight size={14} className="rotate-180" /> Back to Login
                </Link>
              </div>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
