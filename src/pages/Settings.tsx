import { useTheme } from "../providers/ThemeProvider";
import { Sun, Moon, Laptop, Building2, Eye, EyeOff, Save, Loader2 } from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import { SettingsSkeleton } from "../components/Skeletons";
import { useAuth } from "../providers/AuthContext";
import toast from "react-hot-toast";

interface CompanyInfo {
  name: string;
  github_token: string;
  github_org: string;
  gitlab_token: string;
  gitlab_org: string;
  jenkins_url: string;
  jenkins_username: string;
  jenkins_token: string;
}

const INITIAL_FORM: CompanyInfo = {
  name: "", github_token: "", github_org: "",
  gitlab_token: "", gitlab_org: "",
  jenkins_url: "", jenkins_username: "", jenkins_token: "",
};

function TokenField({ label, name, value, onChange }: {
  label: string; name: keyof CompanyInfo; value: string;
  onChange: (n: keyof CompanyInfo, v: string) => void;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">{label}</label>
      <div className="relative">
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={e => onChange(name, e.target.value)}
          placeholder={`Enter ${label.toLowerCase()}`}
          className="w-full pr-10 pl-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
        />
        <button type="button" onClick={() => setShow(s => !s)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white transition">
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}

function TextField({ label, name, value, onChange, placeholder }: {
  label: string; name: keyof CompanyInfo; value: string;
  onChange: (n: keyof CompanyInfo, v: string) => void; placeholder?: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">{label}</label>
      <input
        type="text"
        value={value}
        onChange={e => onChange(name, e.target.value)}
        placeholder={placeholder ?? `Enter ${label.toLowerCase()}`}
        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
      />
    </div>
  );
}

export function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [form, setForm] = useState<CompanyInfo>(INITIAL_FORM);
  const [saving, setSaving] = useState(false);

  const canManageCompany = user?.permissions?.includes("users");

  const loadCompany = useCallback(async () => {
    try {
      const res = await fetch("/api/company/me/");
      if (res.ok) {
        const data = await res.json();
        setForm({
          name: data.name || "",
          github_token: data.github_token || "",
          github_org: data.github_org || "",
          gitlab_token: data.gitlab_token || "",
          gitlab_org: data.gitlab_org || "",
          jenkins_url: data.jenkins_url || "",
          jenkins_username: data.jenkins_username || "",
          jenkins_token: data.jenkins_token || "",
        });
      }
    } catch { /* non-blocking */ }
    setIsLoading(false);
  }, []);

  useEffect(() => { loadCompany(); }, [loadCompany]);

  const handleChange = (name: keyof CompanyInfo, value: string) =>
    setForm(f => ({ ...f, [name]: value }));

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const toastId = toast.loading("Saving company settings...");
    try {
      const res = await fetch("/api/company/update/", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Settings saved successfully!", { id: toastId });
      } else {
        toast.error(data.error || "Failed to save settings.", { id: toastId });
      }
    } catch {
      toast.error("Network error, please try again.", { id: toastId });
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) return <SettingsSkeleton />;

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

      {/* Appearance */}
      <div className="bg-white dark:bg-[#111] border border-slate-200 dark:border-white/5 rounded-3xl p-8 shadow-sm mb-6">
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
          {[
            { key: "light", label: "Light Mode", desc: "Clean and sharp for daytime.", icon: <Sun className="w-8 h-8 text-amber-400" />, bg: "bg-white border-slate-200" },
            { key: "dark",  label: "Dark Mode",  desc: "Easy on the eyes at night.",  icon: <Moon className="w-8 h-8 text-indigo-400" />, bg: "bg-[#0a0a0a] border-white/10" },
            { key: "system",label: "System Mode",desc: "Adapts to your environment.", icon: <Laptop className="w-8 h-8 text-slate-500" />, bg: "bg-gradient-to-br from-white to-[#0a0a0a] border-slate-200 dark:border-white/10" },
          ].map(({ key, label, desc, icon, bg }) => (
            <div key={key}
              onClick={() => setTheme(key as "light" | "dark" | "system")}
              className={`cursor-pointer rounded-2xl border-2 transition-all p-4 ${
                theme === key ? "border-indigo-500 bg-indigo-50/30" : "border-slate-100 dark:border-white/5 hover:border-slate-200 dark:hover:border-white/10"
              }`}>
              <div className={`aspect-video ${bg} rounded-lg border shadow-inner mb-4 flex items-center justify-center`}>{icon}</div>
              <span className="font-bold text-slate-800 dark:text-slate-200">{label}</span>
              <p className="text-xs text-slate-500 mt-1">{desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Company Settings — only for users with 'users' permission */}
      {canManageCompany && (
        <div className="bg-white dark:bg-[#111] border border-slate-200 dark:border-white/5 rounded-3xl p-8 shadow-sm">
          <div className="mb-8">
            <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-2 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-indigo-500" />
              Company Configuration
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Update your organization's integration credentials and tokens.
            </p>
          </div>

          <form onSubmit={handleSave} className="space-y-8">
            {/* General */}
            <div>
              <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-4 uppercase tracking-wider">General</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <TextField label="Company Name" name="name" value={form.name} onChange={handleChange} placeholder="Acme Corp" />
              </div>
            </div>

            <hr className="border-slate-100 dark:border-white/5" />

            {/* GitHub */}
            <div>
              <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-4 uppercase tracking-wider">GitHub</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <TokenField label="GitHub Token" name="github_token" value={form.github_token} onChange={handleChange} />
                <TextField label="GitHub Organization" name="github_org" value={form.github_org} onChange={handleChange} placeholder="my-github-org" />
              </div>
            </div>

            <hr className="border-slate-100 dark:border-white/5" />

            {/* GitLab */}
            <div>
              <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-4 uppercase tracking-wider">GitLab</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <TokenField label="GitLab Token" name="gitlab_token" value={form.gitlab_token} onChange={handleChange} />
                <TextField label="GitLab Group / Username" name="gitlab_org" value={form.gitlab_org} onChange={handleChange} placeholder="my-gitlab-group" />
              </div>
            </div>

            <hr className="border-slate-100 dark:border-white/5" />

            {/* Jenkins */}
            <div>
              <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-4 uppercase tracking-wider">Jenkins</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <TextField label="Jenkins URL" name="jenkins_url" value={form.jenkins_url} onChange={handleChange} placeholder="http://jenkins.example.com" />
                <TextField label="Jenkins Username" name="jenkins_username" value={form.jenkins_username} onChange={handleChange} />
                <TokenField label="Jenkins Token" name="jenkins_token" value={form.jenkins_token} onChange={handleChange} />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button type="submit" disabled={saving}
                className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white rounded-xl font-semibold text-sm transition-all shadow-md hover:shadow-indigo-500/30">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {saving ? "Saving…" : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
