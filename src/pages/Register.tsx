import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2, User, Mail, Lock, Eye, EyeOff, ArrowRight,
  CodeSquare, AlertCircle, KeyRound, Server, ChevronRight, Link2, ShieldCheck
} from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../providers/AuthContext";
import { useEffect } from "react";

type Step = "company" | "admin" | "verification";

interface FormData {
  // Company
  company_name: string;
  github_token: string;
  github_org: string;
  gitlab_token: string;
  gitlab_org: string;
  jenkins_url: string;
  jenkins_username: string;
  jenkins_token: string;
  // Admin
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
  const [errors, setErrors] = useState<Partial<FormData & { general: string }>>({});
  const [isLoading, setIsLoading] = useState(false);
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

  const validateCompanyStep = () => {
    const newErrors: Partial<FormData & { general: string }> = {};
    if (!form.company_name.trim()) newErrors.company_name = "Company name is required";
    return newErrors;
  };

  const validateAdminStep = () => {
    const newErrors: Partial<FormData & { general: string }> = {};
    if (!form.admin_name.trim()) newErrors.admin_name = "Name is required";
    if (!form.admin_email.trim()) newErrors.admin_email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.admin_email)) newErrors.admin_email = "Invalid email address";
    if (!form.admin_password) newErrors.admin_password = "Password is required";
    else if (form.admin_password.length < 6) newErrors.admin_password = "Minimum 6 characters";
    if (form.admin_password !== form.admin_password_confirm)
      newErrors.admin_password_confirm = "Passwords do not match";
    return newErrors;
  };

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors = validateCompanyStep();
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }
    setErrors({});
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
      setErrors({ general: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join("");
    if (code.length < 6) {
      setErrors({ general: "Please enter the complete 6-digit code" });
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
      setErrors({ general: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setIsLoading(true);
    setErrors({});
    try {
      const res = await fetch("/api/company/resend-otp/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.admin_email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to resend code");
      // Could show a success toast here if toast library was used
      setErrors({ general: "A new code has been sent to your email." }); // Using general error as a success message for simplicity
    } catch (err: any) {
      setErrors({ general: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (isNaN(Number(value))) return;
    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);
    if (errors.general) setErrors({});
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const inputCls = (field: keyof FormData) =>
    `w-full pl-11 pr-4 py-2.5 bg-white dark:bg-[#121212] border rounded-lg focus:ring-2 outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600 shadow-sm text-sm ${
      errors[field]
        ? "border-rose-400 focus:ring-rose-400/20 focus:border-rose-400 dark:border-rose-500/50"
        : "border-slate-200 dark:border-slate-800 focus:ring-indigo-500/20 focus:border-indigo-500 dark:focus:border-indigo-500"
    }`;

  return (
    <div className="min-h-screen w-full flex bg-slate-50 dark:bg-[#0a0a0a] text-slate-900 dark:text-slate-100 transition-colors duration-300">
      {/* Left panel */}
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
            Set up your workspace in minutes.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-indigo-200/80 text-lg mb-12"
          >
            Register your company, connect your platforms, and invite your team to start migrating repositories and pipelines at scale.
          </motion.p>

          {/* Steps indicator */}
          <div className="flex gap-6">
            {(["company", "admin", "verification"] as Step[]).map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                    step === s || 
                    (s === "company" && (step === "admin" || step === "verification")) ||
                    (s === "admin" && step === "verification")
                      ? "bg-indigo-500 text-white"
                      : "bg-white/10 text-white/40"
                  }`}
                >
                  {i + 1}
                </div>
                <span className={`text-sm font-medium capitalize ${step === s ? "text-white" : "text-white/40"}`}>
                  {s === "company" ? "Company" : s === "admin" ? "Admin" : "Verify"}
                </span>
                {i < 2 && <ChevronRight className="w-4 h-4 text-white/30 ml-1" />}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-12 bg-white dark:bg-[#0a0a0a] overflow-y-auto">
        <div className="w-full max-w-sm">
          <AnimatePresence mode="wait">
            {step === "company" ? (
              <motion.div
                key="company"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="mb-8">
                  <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight">
                    Company Setup
                  </h2>
                  <p className="text-slate-500 dark:text-slate-400 text-sm">
                    Enter your company name and connect your platforms.
                  </p>
                </div>

                <form className="space-y-4" onSubmit={handleNextStep} noValidate>
                  <AnimatePresence>
                    {errors.general && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, height: 0 }}
                        className="p-3 bg-rose-50 border border-rose-200 text-rose-600 rounded-xl text-sm font-medium flex items-center gap-2"
                      >
                        <AlertCircle className="w-4 h-4" /> {errors.general}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Company Name */}
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">Company Name *</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <Building2 className={`h-5 w-5 ${errors.company_name ? "text-rose-500" : "text-slate-400 dark:text-slate-500"}`} />
                      </div>
                      <input id="company_name" type="text" value={form.company_name} onChange={set("company_name")}
                        placeholder="Acme Corp" className={inputCls("company_name")} />
                    </div>
                    <AnimatePresence>{errors.company_name && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                        className="flex items-center gap-1.5 text-rose-500 text-xs ml-1 font-medium">
                        <AlertCircle className="w-3.5 h-3.5" />{errors.company_name}
                      </motion.div>
                    )}</AnimatePresence>
                  </div>

                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider pt-2">Platform Tokens (optional)</p>

                  {/* GitHub Token */}
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">GitHub Token</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <KeyRound className="h-5 w-5 text-slate-400 dark:text-slate-500" />
                      </div>
                      <input id="github_token" type="password" value={form.github_token} onChange={set("github_token")}
                        placeholder="ghp_••••••••" className={inputCls("github_token")} />
                    </div>
                  </div>

                  {/* GitHub Org */}
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">GitHub Organization</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <Building2 className="h-5 w-5 text-slate-400 dark:text-slate-500" />
                      </div>
                      <input id="github_org" type="text" value={form.github_org} onChange={set("github_org")}
                        placeholder="MyGitHubOrg" className={inputCls("github_org")} />
                    </div>
                  </div>

                  {/* GitLab Token */}
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">GitLab Token</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <Link2 className="h-5 w-5 text-slate-400 dark:text-slate-500" />
                      </div>
                      <input id="gitlab_token" type="password" value={form.gitlab_token} onChange={set("gitlab_token")}
                        placeholder="glpat-••••••••" className={inputCls("gitlab_token")} />
                    </div>
                  </div>

                  {/* GitLab Org */}
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">GitLab Organization</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <Building2 className="h-5 w-5 text-slate-400 dark:text-slate-500" />
                      </div>
                      <input id="gitlab_org" type="text" value={form.gitlab_org} onChange={set("gitlab_org")}
                        placeholder="MyGitLabOrg" className={inputCls("gitlab_org")} />
                    </div>
                  </div>

                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider pt-2">Jenkins (optional)</p>

                  {/* Jenkins URL */}
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">Jenkins URL</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <Server className="h-5 w-5 text-slate-400 dark:text-slate-500" />
                      </div>
                      <input id="jenkins_url" type="url" value={form.jenkins_url} onChange={set("jenkins_url")}
                        placeholder="https://jenkins.example.com" className={inputCls("jenkins_url")} />
                    </div>
                  </div>

                  {/* Jenkins Username */}
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">Jenkins Username</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-slate-400 dark:text-slate-500" />
                      </div>
                      <input id="jenkins_username" type="text" value={form.jenkins_username} onChange={set("jenkins_username")}
                        placeholder="admin" className={inputCls("jenkins_username")} />
                    </div>
                  </div>

                  {/* Jenkins Token */}
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">Jenkins Token</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <KeyRound className="h-5 w-5 text-slate-400 dark:text-slate-500" />
                      </div>
                      <input id="jenkins_token" type="password" value={form.jenkins_token} onChange={set("jenkins_token")}
                        placeholder="••••••••" className={inputCls("jenkins_token")} />
                    </div>
                  </div>

                  <div className="pt-4">
                    <button type="submit"
                      className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 px-4 rounded-lg shadow-sm transition-colors active:scale-[0.98] text-sm">
                      Continue to Admin Account <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </form>
              </motion.div>
            ) : step === "admin" ? (
              <motion.div
                key="admin"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="mb-8">
                  <button onClick={() => setStep("company")} className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline mb-3 flex items-center gap-1">
                    ← Back
                  </button>
                  <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight">Admin Account</h2>
                  <p className="text-slate-500 dark:text-slate-400 text-sm">
                    The first user gets all permissions by default.
                  </p>
                </div>

                <form className="space-y-4" onSubmit={handleRegister} noValidate>
                  <AnimatePresence>
                    {errors.general && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, height: 0 }}
                        className="p-3 bg-rose-50 border border-rose-200 text-rose-600 rounded-xl text-sm font-medium flex items-center gap-2"
                      >
                        <AlertCircle className="w-4 h-4" /> {errors.general}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Admin Name */}
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">Full Name *</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <User className={`h-5 w-5 ${errors.admin_name ? "text-rose-500" : "text-slate-400 dark:text-slate-500"}`} />
                      </div>
                      <input id="admin_name" type="text" value={form.admin_name} onChange={set("admin_name")}
                        placeholder="John Doe" className={inputCls("admin_name")} />
                    </div>
                    <AnimatePresence>{errors.admin_name && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                        className="flex items-center gap-1.5 text-rose-500 text-xs ml-1 font-medium">
                        <AlertCircle className="w-3.5 h-3.5" />{errors.admin_name}
                      </motion.div>
                    )}</AnimatePresence>
                  </div>

                  {/* Admin Email */}
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">Email Address *</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <Mail className={`h-5 w-5 ${errors.admin_email ? "text-rose-500" : "text-slate-400 dark:text-slate-500"}`} />
                      </div>
                      <input id="admin_email" type="email" value={form.admin_email} onChange={set("admin_email")}
                        placeholder="admin@company.com" className={inputCls("admin_email")} />
                    </div>
                    <AnimatePresence>{errors.admin_email && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                        className="flex items-center gap-1.5 text-rose-500 text-xs ml-1 font-medium">
                        <AlertCircle className="w-3.5 h-3.5" />{errors.admin_email}
                      </motion.div>
                    )}</AnimatePresence>
                  </div>

                  {/* Admin Password */}
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">Password *</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <Lock className={`h-5 w-5 ${errors.admin_password ? "text-rose-500" : "text-slate-400 dark:text-slate-500"}`} />
                      </div>
                      <input id="admin_password" type={showPw ? "text" : "password"} value={form.admin_password} onChange={set("admin_password")}
                        placeholder="••••••••" className={inputCls("admin_password") + " pr-11"} />
                      <button type="button" onClick={() => setShowPw(v => !v)}
                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                        {showPw ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                    <AnimatePresence>{errors.admin_password && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                        className="flex items-center gap-1.5 text-rose-500 text-xs ml-1 font-medium">
                        <AlertCircle className="w-3.5 h-3.5" />{errors.admin_password}
                      </motion.div>
                    )}</AnimatePresence>
                  </div>

                  {/* Confirm Password */}
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">Confirm Password *</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <Lock className={`h-5 w-5 ${errors.admin_password_confirm ? "text-rose-500" : "text-slate-400 dark:text-slate-500"}`} />
                      </div>
                      <input id="admin_password_confirm" type={showPwConfirm ? "text" : "password"} value={form.admin_password_confirm} onChange={set("admin_password_confirm")}
                        placeholder="••••••••" className={inputCls("admin_password_confirm") + " pr-11"} />
                      <button type="button" onClick={() => setShowPwConfirm(v => !v)}
                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                        {showPwConfirm ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                    <AnimatePresence>{errors.admin_password_confirm && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                        className="flex items-center gap-1.5 text-rose-500 text-xs ml-1 font-medium">
                        <AlertCircle className="w-3.5 h-3.5" />{errors.admin_password_confirm}
                      </motion.div>
                    )}</AnimatePresence>
                  </div>

                  <div className="pt-4">
                    <button disabled={isLoading} type="submit"
                      className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 px-4 rounded-lg shadow-sm transition-colors active:scale-[0.98] disabled:opacity-70 text-sm">
                      {isLoading ? "Creating workspace..." : "Create Workspace"}
                      {!isLoading && <ArrowRight className="w-4 h-4" />}
                    </button>
                  </div>
                </form>
              </motion.div>
            ) : (
              <motion.div
                key="verification"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="mb-8">
                  <button onClick={() => setStep("admin")} className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline mb-3 flex items-center gap-1">
                    ← Back
                  </button>
                  <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center mb-6">
                    <ShieldCheck className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight">Check your email</h2>
                  <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                    We've sent a code to <span className="font-semibold text-slate-700 dark:text-slate-300">{form.admin_email}</span>.
                  </p>
                </div>

                <form className="space-y-6" onSubmit={handleVerifyOtp}>
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
                          onChange={(e) => handleOtpChange(index, e.target.value)}
                          onKeyDown={(e) => handleOtpKeyDown(index, e)}
                          className={`w-12 h-14 text-center text-xl font-bold bg-white dark:bg-[#121212] border rounded-xl focus:ring-2 outline-none transition-all shadow-sm
                            ${errors.general ? 'border-rose-300 focus:ring-rose-200 focus:border-rose-400 text-rose-500' : 'border-slate-200 dark:border-slate-800 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800 dark:text-white'}`}
                        />
                      ))}
                    </div>

                    <AnimatePresence>
                      {errors.general && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} 
                          className="flex items-center gap-1.5 text-rose-500 text-xs ml-1 font-medium overflow-hidden pt-1">
                          <AlertCircle className="w-3.5 h-3.5" />
                          {errors.general}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="pt-2">
                    <button disabled={isLoading} type="submit" 
                      className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-4 rounded-xl shadow-md shadow-indigo-500/20 transition-all active:scale-[0.98] disabled:opacity-70">
                      {isLoading ? "Verifying..." : "Verify Account"}
                      {!isLoading && <ArrowRight className="w-4 h-4" />}
                    </button>
                  </div>
                  
                  <p className="text-center text-sm text-slate-500 dark:text-slate-400">
                    Didn't receive the code? <button type="button" onClick={handleResendOtp} disabled={isLoading} className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline bg-transparent border-none p-0 cursor-pointer disabled:opacity-50">Click to resend</button>
                  </p>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          <p className="mt-8 text-center text-sm text-slate-500 dark:text-slate-400">
            Already have an account?{" "}
            <Link to="/login" className="font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
