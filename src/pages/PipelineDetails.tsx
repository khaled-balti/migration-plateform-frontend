import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { 
  ArrowLeft, 
  History as HistoryIcon, 
  Code2, 
  Terminal, 
  ExternalLink, 
  CheckCircle2, 
  Clock,
  Calendar,
  Layout,
  AlertCircle,
  Cpu,
  Zap,
  BarChart3,
  FileCode
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ResponsiveContainer, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid,
  AreaChart,
  Area
} from "recharts";
import toast from "react-hot-toast";

import { PipelineDetailSkeleton } from "../components/Skeletons";

export function PipelineDetails() {
  const { id } = useParams<{ id: string }>();
  const [details, setDetails] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "history" | "source">("overview");

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const res = await fetch(`/api/pipelines/details/${id}/`);
        const json = await res.json();
        if (!res.ok) {
          throw new Error(json.error || "Failed to fetch pipeline details");
        }
        setDetails(json.details);
      } catch (err: any) {
        console.error(err);
        setError(err.message);
        toast.error(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (id) {
      fetchDetails();
    }
  }, [id]);

  if (isLoading) {
    return <PipelineDetailSkeleton />;
  }

  if (error || !details) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full text-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white dark:bg-slate-900/50 backdrop-blur-xl ring-1 ring-slate-200 dark:ring-white/10 p-12 rounded-3xl max-w-lg mx-auto"
        >
          <div className="w-16 h-16 bg-rose-50 dark:bg-rose-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-8 h-8 text-rose-500" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200">Pipeline Not Found</h2>
          <p className="text-slate-500 mt-2 max-w-md mx-auto">{error || "The pipeline you're looking for might have been deleted or doesn't exist."}</p>
          <Link 
            to="/app/pipelines" 
            className="mt-8 inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-all shadow-lg shadow-indigo-200"
          >
            <ArrowLeft className="w-4 h-4" /> Go Back to Pipelines
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
      {/* Header Section */}
      <div className="mb-8">
        <Link 
          to={details.is_migrated ? "/app/pipelines/migrated" : "/app/pipelines/waiting"} 
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors mb-6 group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" /> 
          Back to {details.is_migrated ? "Migrated" : "Waiting"} Pipelines
        </Link>
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border ${
              details.is_migrated 
                ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" 
                : "bg-indigo-500/10 text-indigo-500 border-indigo-500/20"
            }`}>
              <Cpu className="w-7 h-7" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-3 mb-1">
                <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                  {details.name}
                </h1>
                <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                  details.is_migrated 
                    ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" 
                    : "bg-indigo-500/10 text-indigo-500 border border-indigo-500/20"
                }`}>
                  {details.is_migrated ? "Modernized" : "Legacy Jenkins"}
                </span>
              </div>
              <p className="text-slate-500 dark:text-slate-400 flex items-center gap-2 text-sm mt-1">
                <Terminal className="w-4 h-4" />
                Pipeline ID: <span className="font-mono bg-slate-100 dark:bg-slate-800/50 px-2 py-0.5 rounded border border-slate-200 dark:border-white/5">{details.id}</span>
              </p>
            </div>
          </div>
          
          <div className="flex items-center bg-slate-100 dark:bg-slate-800/50 p-1 rounded-2xl border border-slate-200 dark:border-white/5 shadow-inner">
            <TabButton active={activeTab === "overview"} onClick={() => setActiveTab("overview")} label="Overview" icon={<Layout className="w-4 h-4" />} />
            <TabButton active={activeTab === "history"} onClick={() => setActiveTab("history")} label="History" icon={<HistoryIcon className="w-4 h-4" />} />
            <TabButton active={activeTab === "source"} onClick={() => setActiveTab("source")} label="Source" icon={<Code2 className="w-4 h-4" />} />
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === "overview" && <PipelineOverview details={details} />}
          {activeTab === "history" && <PipelineHistory details={details} />}
          {activeTab === "source" && <PipelineSource details={details} />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ----------------------------------------------------------------------
// SUB-COMPONENTS
// ----------------------------------------------------------------------

function PipelineOverview({ details }: { details: any }) {
  const history = details.history || [];
  const successCount = history.filter((h: any) => h.status === 'SUCCESS' || h.status === 'success' || h.status === 'completed').length;
  const successRate = history.length > 0 ? (successCount / history.length) * 100 : 0;
  
  const chartData = history.slice(0, 10).reverse().map((h: any) => ({
    name: `#${h.number}`,
    duration: parseInt(h.duration) || 0,
    status: h.status
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <QuickStat 
            icon={<CheckCircle2 className="w-5 h-5" />} 
            label="Overall Status" 
            value={details.status} 
            color={details.status === 'SUCCESS' || details.status === 'Success' ? 'emerald' : 'rose'} 
          />
          <QuickStat 
            icon={<Zap className="w-5 h-5" />} 
            label="Success Rate" 
            value={`${Math.round(successRate)}%`} 
            color={successRate > 90 ? 'emerald' : successRate > 70 ? 'amber' : 'rose'} 
          />
          <QuickStat 
            icon={<Clock className="w-5 h-5" />} 
            label="Avg Duration" 
            value={history[0]?.duration || 'N/A'} 
            color="indigo" 
          />
        </div>

        <GlassCard className="p-8">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-indigo-500" />
              Recent Performance
            </h3>
            <span className="text-xs font-bold text-slate-400">Duration per Build (Seconds)</span>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorDur" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" strokeOpacity={0.5} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12, fontWeight: 600}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 4px 20px -2px rgba(0,0,0,0.1)'}}
                />
                <Area type="monotone" dataKey="duration" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorDur)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>

      <div className="space-y-8">
        <GlassCard className="p-8">
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-6">Pipeline Configuration</h3>
          <div className="space-y-6">
            <MetadataItem label="Migration Status" value={details.is_migrated ? "Modernized (GitHub Actions)" : "In Progress"} isTag />
            {details.migration_date && (
              <MetadataItem label="Modernization Date" value={new Date(details.migration_date).toLocaleDateString()} icon={<Calendar className="w-4 h-4" />} />
            )}
            <MetadataItem label="Source Tool" value={details.is_migrated ? "GitHub Actions" : "Jenkins CI"} />
            <MetadataItem label="Definition Type" value={details.is_migrated ? "Declarative YAML" : "Groovy DSL"} />
          </div>
        </GlassCard>

        <div className="p-6 bg-indigo-600 text-white rounded-3xl overflow-hidden relative shadow-lg shadow-indigo-500/20">
          <div className="relative z-10">
            <h4 className="font-black text-xl mb-2">Modernized Workflow</h4>
            <p className="text-white/80 text-sm mb-4">This pipeline is now fully integrated with cloud-native CI/CD standards.</p>
            <div className="flex items-center gap-2 font-bold text-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                Enhanced Security & Speed
            </div>
          </div>
          <Zap className="absolute -right-4 -bottom-4 w-32 h-32 text-white/10 rotate-12" />
        </div>
      </div>
    </div>
  );
}

function PipelineHistory({ details }: { details: any }) {
  const history = details.history || [];
  return (
    <GlassCard className="overflow-hidden">
      <div className="px-8 py-6 border-b border-white/5 flex justify-between items-center bg-slate-50/50 dark:bg-white/[0.02]">
        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <HistoryIcon className="w-5 h-5 text-indigo-500" />
          Execution History
        </h3>
        <span className="text-xs font-black px-3 py-1 bg-slate-100 dark:bg-white/5 rounded-full border border-slate-200 dark:border-white/10 uppercase tracking-widest">Last 10 Runs</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 dark:bg-white/[0.01]">
              <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-white/5">Run</th>
              <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-white/5">Status</th>
              <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-white/5">Started</th>
              <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-white/5">Duration</th>
              <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-white/5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-white/5">
            {history.map((run: any, i: number) => {
              const status = run.status?.toLowerCase();
              const isSuccess = status === "success" || status === "completed";
              const isFailure = status === "failure";
              
              const badgeClass = isSuccess 
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" 
                : isFailure 
                  ? "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                  : "bg-amber-500/10 text-amber-600 dark:text-amber-400";
              
              const dotClass = isSuccess ? "bg-emerald-500" : isFailure ? "bg-rose-500" : "bg-amber-500";

              return (
                <tr key={i} className="hover:bg-slate-50/80 dark:hover:bg-white/[0.02] transition-colors group">
                  <td className="px-8 py-5 text-sm font-black text-slate-700 dark:text-slate-300">#{run.number}</td>
                  <td className="px-8 py-5">
                    <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-black shadow-sm ${badgeClass}`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${dotClass}`} />
                      {run.status}
                    </span>
                  </td>
                <td className="px-8 py-5 text-sm font-medium text-slate-500 flex items-center gap-2">
                  <Clock className="w-4 h-4 opacity-40" />
                  {run.timestamp}
                </td>
                <td className="px-8 py-5 text-sm font-black text-slate-600 dark:text-slate-400">{run.duration}</td>
                <td className="px-8 py-5 text-right">
                  <a 
                    href={details.is_migrated ? run.url : `${run.url}/console`} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="inline-flex items-center gap-2 text-xs font-black text-indigo-500 hover:text-indigo-400 transition-all bg-indigo-500/10 px-4 py-2 rounded-xl ring-1 ring-indigo-500/20"
                  >
                    Logs <ExternalLink className="w-3 h-3" />
                  </a>
                </td>
              </tr>
            );
          })}
          </tbody>
        </table>
      </div>
    </GlassCard>
  );
}

function PipelineSource({ details }: { details: any }) {
  const lineCount = (details.source_code || "").split('\n').length;
  return (
    <GlassCard className="overflow-hidden flex flex-col min-h-[600px]">
      <div className="px-8 py-6 border-b border-white/5 flex justify-between items-center bg-slate-900 shadow-lg">
        <h3 className="text-xl font-bold text-slate-200 flex items-center gap-2">
          <FileCode className="w-5 h-5 text-indigo-400" />
          {details.is_migrated ? "GitHub Workflow YAML" : "Jenkinsfile Source"}
        </h3>
        <button 
          onClick={() => {
            navigator.clipboard.writeText(details.source_code);
            toast.success("Definition copied to clipboard!");
          }}
          className="text-xs font-black text-indigo-400 hover:text-indigo-300 hover:bg-white/5 px-4 py-2 rounded-xl transition-all border border-white/10 ring-1 ring-white/5"
        >
          Copy Code
        </button>
      </div>
      <div className="flex-1 bg-slate-950 p-8 pt-6 overflow-auto custom-scrollbar font-mono text-sm leading-relaxed flex">
        <div className="w-12 bg-slate-950 text-slate-700 text-right pr-4 select-none shrink-0 border-r border-white/5">
            {Array.from({ length: lineCount }).map((_, i) => (
                <div key={i} className="h-6 leading-6 text-[10px] font-bold">{i + 1}</div>
            ))}
        </div>
        <pre className="text-emerald-400/90 pl-6 flex-1">
          <code className="block whitespace-pre">
            {details.source_code}
          </code>
        </pre>
      </div>
    </GlassCard>
  );
}

// ----------------------------------------------------------------------
// HELPERS
// ----------------------------------------------------------------------

function GlassCard({ children, className = "" }: { children: React.ReactNode, className?: string }) {
  return (
    <div className={`bg-white/80 dark:bg-slate-900/50 backdrop-blur-xl ring-1 ring-slate-200 dark:ring-white/10 rounded-3xl shadow-xl shadow-slate-200/10 dark:shadow-none ${className}`}>
      {children}
    </div>
  );
}

function TabButton({ active, onClick, label, icon }: { active: boolean, onClick: () => void, label: string, icon: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`px-5 py-2.5 text-sm font-black rounded-xl transition-all duration-200 flex items-center gap-2 ${
        active 
          ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-sm ring-1 ring-slate-200 dark:ring-white/10 scale-[1.02]" 
          : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function QuickStat({ icon, label, value, color }: { icon: React.ReactNode, label: string, value: string | number, color: 'indigo' | 'emerald' | 'amber' | 'rose' }) {
  const colors = {
    indigo: 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20',
    emerald: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
    amber: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
    rose: 'bg-rose-500/10 text-rose-600 border-rose-500/20',
  };

  return (
    <div className={`p-6 rounded-2xl border ${colors[color]} flex flex-col items-center text-center`}>
      <div className="mb-2 opacity-80 scale-110">{icon}</div>
      <div className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">{label}</div>
      <div className="text-xl font-black">{value}</div>
    </div>
  );
}

function MetadataItem({ label, value, isTag, icon }: { label: string, value: string, isTag?: boolean, icon?: React.ReactNode }) {
  return (
    <div>
      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
          {icon}
          {label}
      </h4>
      {isTag ? (
        <span className="px-3 py-1 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-black ring-1 ring-indigo-500/20">
          {value}
        </span>
      ) : (
        <p className="text-slate-800 dark:text-slate-200 font-black text-base">{value || 'N/A'}</p>
      )}
    </div>
  );
}
