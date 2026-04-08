import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowLeft, CodeSquare, AlertCircle, ShieldCheck } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";

export function VerifyOTPPage() {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState<string | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || "your email";

  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleChange = (index: number, value: string) => {
    if (isNaN(Number(value))) return;

    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);
    setError(null);

    // Auto focus next input
    if (value && index < 5 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0 && inputRefs.current[index - 1]) {
      // Focus previous on backspace if current is empty
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join("");
    if (code.length < 6) {
      setError("Please enter the complete 6-digit code");
    } else {
      setError(null);
      // Proceed to reset password
      navigate("/reset-password", { state: { email, otp: code } });
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-[#f8f9fa]">
      {/* Left Side */}
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
            Two-factor authentication.
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-indigo-200/80 text-lg mb-12"
          >
            We require verified access to reset your password and keep the platform configuration airtight and secure.
          </motion.p>
        </div>
      </div>

      {/* Right Side */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-12 relative">
        <Link to="/forgot-password" className="absolute top-8 right-8 text-slate-500 hover:text-slate-800 font-medium flex items-center gap-2 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>

        <div className="w-full max-w-sm">
          <div className="text-center lg:text-left mb-10">
            <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center mb-6 mx-auto lg:mx-0">
              <ShieldCheck className="w-6 h-6 text-indigo-600" />
            </div>
            <h2 className="text-3xl font-bold text-slate-900 mb-3">Check your inbox</h2>
            <p className="text-slate-500 leading-relaxed">
              We've sent a 6-digit verification code to <span className="font-semibold text-slate-700">{email}</span>.
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <div className="flex gap-2 justify-between">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    // @ts-ignore
                    ref={(el) => (inputRefs.current[index] = el)}
                    type="text"
                    inputMode="numeric"
                    value={digit}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className={`w-12 h-14 text-center text-xl font-bold bg-white border rounded-xl focus:ring-2 outline-none transition-all shadow-sm
                      ${error ? 'border-rose-300 focus:ring-rose-200 focus:border-rose-400 text-rose-500' : 'border-slate-200 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800'}`}
                  />
                ))}
              </div>

              <AnimatePresence>
                {error && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="flex items-center gap-1.5 text-rose-500 text-xs ml-1 font-medium overflow-hidden pt-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="pt-4">
              <button type="submit" className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-700 hover:to-indigo-600 text-white font-semibold py-3 px-4 rounded-xl shadow-md shadow-indigo-500/20 transition-all active:scale-[0.98]">
                Verify Code
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            
            <p className="mt-8 text-center text-sm text-slate-500">
              Didn't receive the code? <button type="button" className="font-semibold text-indigo-600 hover:text-indigo-500 shadow-none border-none bg-transparent cursor-pointer">Click to resend</button>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
