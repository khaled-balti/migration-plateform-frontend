import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2, User, Mail, Lock, Eye, EyeOff, ArrowRight,
  CodeSquare, KeyRound, Link2, ShieldCheck, Server
} from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../providers/AuthContext";
import { useEffect } from "react";
import toast from "react-hot-toast";

type Step = "company" | "admin" | "verification";

interface FormData {
  company_name: string;
  github_token: string;
  github_org: string;
  gitlab_token: string;
  gitlab_org: string;
  jenkins_url: string;
  jenkins_username: string;
  jenkins_token: string;
  admin_name: string;
  admin_email: string;
  admin_password: string;
  admin_password_confirm: string;
}

const INITIAL: FormData = {
  company_name: "",
  github_token: "",
  github_org: "",
  gitlab_token: "",
  gitlab_org: "",
  jenkins_url: "",
  jenkins_username: "",
  jenkins_token: "",
  admin_name: "",
  admin_email: "",
  admin_password: "",
  admin_password_confirm: "",
};

export function RegisterPage() {
  const [step, setStep] = useState<Step>("company");
  const [form, setForm] = useState<FormData>(INITIAL);
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [showPwConfirm, setShowPwConfirm] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const navigate = useNavigate();
  const { login } = useAuth();
  const location = useLocation();

  useEffect(() => {
    if (location.state?.step === "verification" && location.state?.email) {
      setStep("verification");
      setForm(f => ({ ...f, admin_email: location.state.email }));
    }
  }, [location.state]);

  const set = (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(f => ({ ...f, [field]: e.target.value }));
    if (errors[field]) setErrors(err => ({ ...err, [field]: undefined }));
  };

  const validateCompanyStepFields = () => {
    const newErrors: Partial<FormData> = {};
    if (!form.company_name.trim()) newErrors.company_name = "Company name is required";
    return newErrors;
  };

  const validateAdminStep = () => {
    const newErrors: Partial<FormData> = {};
    if (!form.admin_name.trim()) newErrors.admin_name = "Name is required";
    if (!form.admin_email.trim()) newErrors.admin_email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.admin_email)) newErrors.admin_email = "Invalid email address";
    if (!form.admin_password) newErrors.admin_password = "Password is required";
    else if (form.admin_password.length < 6) newErrors.admin_password = "Minimum 6 characters";
    if (form.admin_password !== form.admin_password_confirm)
      newErrors.admin_password_confirm = "Passwords do not match";
    return newErrors;
  };

  const handleNextStep = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors = validateCompanyStepFields();
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }
    
    setErrors({});
    
    if (form.github_token || form.gitlab_token || form.jenkins_url || form.jenkins_token) {
      setIsValidating(true);
      const toastId = toast.loading("Validating integration tokens...");
      
      try {
        const res = await fetch("/api/company/validate-tokens/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            github_token: form.github_token,
            gitlab_token: form.gitlab_token,
            jenkins_url: form.jenkins_url,
            jenkins_username: form.jenkins_username,
            jenkins_token: form.jenkins_token,
          }),
        });
        
        const data = await res.json();
        
        if (!res.ok) {
          toast.error(data.error || "Token validation failed", { id: toastId });
          return;
        }
        
        toast.success("Tokens validated successfully!", { id: toastId });
      } catch (err: any) {
        toast.error("Connection error during validation", { id: toastId });
        return;
      } finally {
        setIsValidating(false);
      }
    }
    
    setStep("admin");
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors = validateAdminStep();
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }
    setErrors({});
    setIsLoading(true);
    try {
      const res = await fetch("/api/company/register/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company_name: form.company_name,
          github_token: form.github_token,
          github_org: form.github_org,
          gitlab_token: form.gitlab_token,
          gitlab_org: form.gitlab_org,
          jenkins_url: form.jenkins_url,
          jenkins_username: form.jenkins_username,
          jenkins_token: form.jenkins_token,
          admin_name: form.admin_name,
          admin_email: form.admin_email,
          admin_password: form.admin_password,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Registration failed");
      setStep("verification");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join("");
    if (code.length < 6) {
      toast.error("Please enter the complete 6-digit code");
      return;
    }
    setErrors({});
    setIsLoading(true);
    try {
      const res = await fetch("/api/company/verify-otp/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.admin_email,
          otp: code,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Verification failed");
      login(data.token);
      navigate("/app");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/company/resend-otp/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.admin_email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to resend code");
      toast.success("Verification code resent");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (isNaN(Number(value))) return;
    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const labelCls = "text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-1 mb-1 block";
  
  const inputCls = (field: keyof FormData) =>
    `w-full pl-12 pr-4 py-3 bg-white dark:bg-white/5 border rounded-2xl focus:ring-2 outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-700 font-medium text-slate-800 dark:text-white ${
      errors[field]
        ? "border-red-500/50 focus:ring-red-500/20"
        : "border-slate-200 dark:border-white/10 focus:ring-indigo-500/20 focus:border-indigo-600 dark:focus:border-indigo-500/50"
    }`;

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
          animate={{ x: [0, 60, -40, 0], y: [0, -50, 70, 0], scale: [1, 1.3, 0.8, 1] }}
          transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
          className="absolute top-[-5%] left-[-5%] w-[85%] h-[85%] rounded-full bg-white/10 dark:bg-indigo-500/10 blur-[130px] pointer-events-none" 
        />
        <motion.div 
          animate={{ x: [0, -70, 50, 0], y: [0, 60, -50, 0], scale: [1.2, 0.8, 1.3, 1.2] }}
          transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-[-15%] right-[-5%] w-[75%] h-[75%] rounded-full bg-indigo-400/10 dark:bg-purple-500/5 blur-[110px] pointer-events-none" 
        />

        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-white/10 dark:border-white/[0.03] animate-[spin_60s_linear_infinite] pointer-events-none" />
        
        <Link to="/" className="relative z-10 flex items-center gap-3 font-black text-2xl tracking-tighter uppercase italic">
          <div className="w-10 h-10 bg-white/10 dark:bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg border border-white/20">
            <CodeSquare className="w-6 h-6 text-white" />
          </div>
          Move to GitHub
        </Link>

        <div className="relative z-10 mt-auto">
          <div className="flex gap-4 mb-12">
            {(["company", "admin", "verification"] as Step[]).map((s, i) => (
              <div key={s} className="flex flex-col gap-2 flex-1">
                <div className={`h-1 rounded-full transition-colors ${
                  step === s || 
                  (s === "company" && (step === "admin" || step === "verification")) ||
                  (s === "admin" && step === "verification")
                    ? "bg-white dark:bg-indigo-500" : "bg-white/20 dark:bg-white/10"
                }`} />
                <span className={`text-[10px] font-black uppercase tracking-widest ${step === s ? "text-white" : "text-white/40 dark:text-white/20"}`}>
                  Step 0{i + 1}
                </span>
              </div>
            ))}
          </div>
          <h1 className="text-4xl font-black mb-6 leading-tight tracking-tight">
            Deploy your <span className="text-indigo-200 dark:text-indigo-400">migration hub</span> in minutes.
          </h1>
          <p className="text-indigo-100 dark:text-slate-400 text-lg font-medium leading-relaxed mb-8">
            Manage organizations, teams, and security contexts with enterprise-grade isolation.
          </p>
        </div>
      </div>

      {/* Form Side */}
      <div className="w-full lg:w-[55%] flex items-center justify-center p-8 lg:p-24 relative bg-slate-50/50 dark:bg-[#050508] transition-colors duration-500 overflow-y-auto">
        <div className="w-full max-w-xl relative z-10">
          <AnimatePresence mode="wait">
            {step === "company" ? (
              <motion.div key="company" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div className="mb-10 text-center lg:text-left">
                  <h2 className="text-4xl font-black text-slate-900 dark:text-white mb-3 tracking-tight">Create Workspace</h2>
                  <p className="text-slate-500 font-medium">Establish your organization's digital headquarter</p>
                </div>

                <form className="grid grid-cols-1 md:grid-cols-2 gap-6" onSubmit={handleNextStep} noValidate>
                  <div className="col-span-1 md:col-span-2 space-y-2">
                    <label className={labelCls}>Company Name *</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 dark:text-slate-500 group-focus-within:text-indigo-600 dark:group-focus-within:text-indigo-400 transition-colors">
                        <Building2 size={18} />
                      </div>
                      <input type="text" value={form.company_name} onChange={set("company_name")} placeholder="Acme Global" className={inputCls("company_name")} />
                    </div>
                    {errors.company_name && <p className="text-red-500 dark:text-red-400 text-xs font-bold ml-1">{errors.company_name}</p>}
                  </div>

                  <div className="col-span-1 md:col-span-2 pt-4">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="h-px bg-slate-200 dark:bg-white/5 flex-1" />
                      <span className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-[0.3em]">Integrations</span>
                      <div className="h-px bg-slate-200 dark:bg-white/5 flex-1" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className={labelCls}>GitHub Org</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 dark:text-slate-500 group-focus-within:text-indigo-600 dark:group-focus-within:text-indigo-400 transition-colors"><Building2 size={18} /></div>
                      <input type="text" value={form.github_org} onChange={set("github_org")} placeholder="org-name" className={inputCls("github_org")} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className={labelCls}>GitHub Token</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 dark:text-slate-500 group-focus-within:text-indigo-600 dark:group-focus-within:text-indigo-400 transition-colors"><KeyRound size={18} /></div>
                      <input type="password" value={form.github_token} onChange={set("github_token")} placeholder="ghp_••••••••" className={inputCls("github_token")} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className={labelCls}>GitLab Org</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 dark:text-slate-500 group-focus-within:text-indigo-600 dark:group-focus-within:text-indigo-400 transition-colors"><Link2 size={18} /></div>
                      <input type="text" value={form.gitlab_org} onChange={set("gitlab_org")} placeholder="group/project" className={inputCls("gitlab_org")} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className={labelCls}>GitLab Token</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 dark:text-slate-500 group-focus-within:text-indigo-600 dark:group-focus-within:text-indigo-400 transition-colors"><KeyRound size={18} /></div>
                      <input type="password" value={form.gitlab_token} onChange={set("gitlab_token")} placeholder="glpat-••••••••" className={inputCls("gitlab_token")} />
                    </div>
                  </div>

                  <div className="col-span-1 md:col-span-2 pt-4">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="h-px bg-slate-200 dark:bg-white/5 flex-1" />
                      <span className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-[0.3em]">Jenkins Integration</span>
                      <div className="h-px bg-slate-200 dark:bg-white/5 flex-1" />
                    </div>
                  </div>

                  <div className="col-span-1 md:col-span-2 space-y-2">
                    <label className={labelCls}>Jenkins URL</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 dark:text-slate-500 group-focus-within:text-indigo-600 dark:group-focus-within:text-indigo-400 transition-colors"><Server size={18} /></div>
                      <input type="url" value={form.jenkins_url} onChange={set("jenkins_url")} placeholder="https://jenkins.company.com" className={inputCls("jenkins_url")} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className={labelCls}>Jenkins User</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 dark:text-slate-500 group-focus-within:text-indigo-600 dark:group-focus-within:text-indigo-400 transition-colors"><User size={18} /></div>
                      <input type="text" value={form.jenkins_username} onChange={set("jenkins_username")} placeholder="admin" className={inputCls("jenkins_username")} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className={labelCls}>Jenkins Token</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 dark:text-slate-500 group-focus-within:text-indigo-600 dark:group-focus-within:text-indigo-400 transition-colors"><KeyRound size={18} /></div>
                      <input type="password" value={form.jenkins_token} onChange={set("jenkins_token")} placeholder="••••••••" className={inputCls("jenkins_token")} />
                    </div>
                  </div>

                  <div className="col-span-1 md:col-span-2 pt-6">
                    <button disabled={isValidating} type="submit" className="w-full flex items-center justify-center gap-3 bg-indigo-600 dark:bg-white text-white dark:text-black font-black py-4 px-6 rounded-2xl hover:bg-indigo-700 dark:hover:bg-slate-200 transition-all font-['Inter'] shadow-[0_20px_40px_-15px_rgba(79,70,229,0.3)] dark:shadow-[0_20px_40px_-15px_rgba(255,255,255,0.1)] disabled:opacity-50">
                      {isValidating ? "Validating Tokens..." : "Next Configuration"} <ArrowRight size={20} />
                    </button>
                  </div>
                </form>
              </motion.div>
            ) : step === "admin" ? (
              <motion.div key="admin" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div className="mb-10">
                  <button onClick={() => setStep("company")} className="text-xs font-black text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 uppercase tracking-widest flex items-center gap-2 mb-4">
                    <ArrowRight size={14} className="rotate-180" /> Change Company Info
                  </button>
                  <h2 className="text-4xl font-black text-slate-900 dark:text-white mb-3 tracking-tight">Admin Account</h2>
                  <p className="text-slate-500 font-medium">Create your first administrative profile</p>
                </div>

                <form className="space-y-6" onSubmit={handleRegister} noValidate>
                  <div className="space-y-2">
                    <label className={labelCls}>Full Name *</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 dark:text-slate-500 group-focus-within:text-indigo-600 dark:group-focus-within:text-indigo-400 transition-colors"><User size={18} /></div>
                      <input type="text" value={form.admin_name} onChange={set("admin_name")} placeholder="Alexander Hamilton" className={inputCls("admin_name")} />
                    </div>
                    {errors.admin_name && <p className="text-red-500 dark:text-red-400 text-xs font-bold ml-1">{errors.admin_name}</p>}
                  </div>

                  <div className="space-y-2">
                    <label className={labelCls}>Work Email *</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 dark:text-slate-500 group-focus-within:text-indigo-600 dark:group-focus-within:text-indigo-400 transition-colors"><Mail size={18} /></div>
                      <input type="email" value={form.admin_email} onChange={set("admin_email")} placeholder="alex@company.com" className={inputCls("admin_email")} />
                    </div>
                    {errors.admin_email && <p className="text-red-500 dark:text-red-400 text-xs font-bold ml-1">{errors.admin_email}</p>}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className={labelCls}>Password *</label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 dark:text-slate-500 group-focus-within:text-indigo-600 dark:group-focus-within:text-indigo-400 transition-colors"><Lock size={18} /></div>
                        <input type={showPw ? "text" : "password"} value={form.admin_password} onChange={set("admin_password")} placeholder="••••••••" className={inputCls("admin_password") + " pr-11"} />
                        <button type="button" onClick={() => setShowPw(v => !v)} className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 dark:text-slate-600 dark:hover:text-slate-400">
                          {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className={labelCls}>Confirm *</label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 dark:text-slate-500 group-focus-within:text-indigo-600 dark:group-focus-within:text-indigo-400 transition-colors"><Lock size={18} /></div>
                        <input type={showPwConfirm ? "text" : "password"} value={form.admin_password_confirm} onChange={set("admin_password_confirm")} placeholder="••••••••" className={inputCls("admin_password_confirm") + " pr-11"} />
                        <button type="button" onClick={() => setShowPwConfirm(v => !v)} className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 dark:text-slate-600 dark:hover:text-slate-400">
                          {showPwConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="pt-8">
                    <button disabled={isLoading} type="submit" className="w-full flex items-center justify-center gap-3 bg-indigo-600 dark:bg-white text-white dark:text-black font-black py-4 px-6 rounded-2xl hover:bg-indigo-700 dark:hover:bg-slate-200 transition-all shadow-[0_20px_40px_-15px_rgba(79,70,229,0.3)] dark:shadow-[0_20px_40px_-15px_rgba(255,255,255,0.1)] disabled:opacity-50">
                      {isLoading ? "Provisioning..." : "Initialize Workspace"}
                      <ShieldCheck size={20} />
                    </button>
                  </div>
                </form>
              </motion.div>
            ) : (
              <motion.div key="verification" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
                <div className="w-20 h-20 bg-indigo-500/10 border border-indigo-500/20 rounded-3xl flex items-center justify-center mb-8 mx-auto shadow-md">
                  <ShieldCheck className="w-10 h-10 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h2 className="text-4xl font-black text-slate-900 dark:text-white mb-3 tracking-tight">Security Code</h2>
                <p className="text-slate-500 font-medium mb-12">Sent to <span className="text-indigo-600 dark:text-white font-bold">{form.admin_email}</span></p>

                <form className="max-w-xs mx-auto space-y-8" onSubmit={handleVerifyOtp}>
                  <div className="flex gap-3 justify-center">
                    {otp.map((digit, index) => (
                      <input key={index} 
                        // @ts-ignore
                        ref={(el) => (inputRefs.current[index] = el)} 
                        type="text" inputMode="numeric" value={digit}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                        className="w-12 h-16 text-center text-2xl font-black bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 dark:focus:border-indigo-500/50 outline-none transition-all text-slate-800 dark:text-white shadow-sm dark:shadow-none"
                      />
                    ))}
                  </div>
                  <button disabled={isLoading} type="submit" className="w-full py-4 bg-indigo-600 dark:bg-white text-white dark:text-black font-black rounded-2xl hover:bg-indigo-700 dark:hover:bg-slate-200 transition-all disabled:opacity-50 shadow-[0_20px_40px_-15px_rgba(79,70,229,0.3)] dark:shadow-[0_20px_40px_-15px_rgba(255,255,255,0.1)]">
                    {isLoading ? "Verifying..." : "Access Dashboard"}
                  </button>
                  <button type="button" onClick={handleResendOtp} className="text-xs font-black text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 uppercase tracking-widest transition-colors mb-4 block mx-auto">Resend Code</button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-12 text-center text-sm font-medium text-slate-500 dark:text-slate-600">
            Already part of a workspace?
            <Link to="/login" className="ml-2 font-black text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 transition-colors underline-offset-4 hover:underline">Log in</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
