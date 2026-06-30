import { useState, useEffect, useCallback, useRef } from "react";
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
  FileCode,
  RefreshCw
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
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "history" | "source">("overview");
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchDetails = useCallback(async (force = false, silent = false) => {
    try {
      if (!silent) setIsRefreshing(true);
      const url = `/api/pipelines/details/${id}/${force ? '?force=true' : ''}`;
      const res = await fetch(url);
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Failed to fetch pipeline details");
      }
      setDetails(json.details);
    } catch (err: any) {
      if (!silent) {
        console.error(err);
        setError(err.message);
        toast.error(err.message);
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchDetails();
      // Poll every 30 seconds for live updates
      intervalRef.current = setInterval(() => fetchDetails(false, true), 30000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [id, fetchDetails]);

  const handleForceRefresh = () => {
    fetchDetails(true);
    toast.success("Fetching live data...");
  };

  if (isLoading) {
    return <PipelineDetailSkeleton />;
  }

  if (error || !details) {
    return (
      <div className="p-4 sm:p-6 lg:p-10 max-w-7xl mx-auto w-full text-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-[#080812]/50 backdrop-blur-3xl p-12 rounded-[3rem] max-w-lg mx-auto border border-white/5 shadow-2xl"
        >
          <div className="w-20 h-20 bg-rose-500/10 border border-rose-500/20 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-lg shadow-rose-500/10">
            <AlertCircle className="w-10 h-10 text-rose-500" />
          </div>
          <h2 className="text-3xl font-black text-white tracking-tighter mb-4">Pipeline Sync Failure</h2>
          <p className="text-slate-500 font-medium leading-relaxed">{error || "The requested pipeline node is not available in the current cluster."}</p>
          <Link 
            to="/app/pipelines" 
            className="mt-10 inline-flex items-center gap-3 px-8 py-3.5 bg-white text-black font-black uppercase text-xs tracking-widest rounded-2xl hover:bg-slate-200 transition-all active:scale-95 shadow-xl shadow-white/5"
          >
            <ArrowLeft className="w-4 h-4" /> Go Back to Registry
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-10 max-w-7xl mx-auto w-full transition-all duration-500">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12"
      >
        <Link 
          to={details.is_migrated ? "/app/pipelines/migrated" : "/app/pipelines/waiting"} 
          className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 hover:text-indigo-400 transition-all mb-8 group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" /> 
          Back to Cluster View
        </Link>
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="flex items-start gap-6">
            <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center shrink-0 border shadow-2xl ${
              details.is_migrated 
                ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20 shadow-emerald-500/10" 
                : "bg-indigo-500/10 text-indigo-500 border-indigo-500/20 shadow-indigo-500/10"
            }`}>
              <Cpu className="w-8 h-8" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-4 mb-2">
                <h1 className="text-3xl sm:text-4xl font-black bg-clip-text text-transparent bg-gradient-to-br from-slate-900 to-slate-500 dark:from-white dark:to-slate-500 tracking-tighter">
                  {details.name}
                </h1>
                <div className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border shadow-sm ${
                  details.is_migrated 
                    ? "bg-emerald-500/5 text-emerald-500 border-emerald-500/10" 
                    : "bg-indigo-500/5 text-indigo-500 border-indigo-500/10"
                }`}>
                  {details.is_migrated ? "Modernized Hub" : "Legacy Jenkins Node"}
                </div>
              </div>
              <p className="text-slate-500 dark:text-slate-400 flex items-center gap-2 text-xs font-bold uppercase tracking-widest mt-1">
                <Terminal className="w-4 h-4 text-indigo-500" />
                Stream Identifier: <span className="font-mono bg-slate-100 dark:bg-white/5 px-2 py-0.5 rounded border border-slate-200 dark:border-white/5 text-indigo-600 dark:text-indigo-400 lowercase italic">{details.id}</span>
              </p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="flex items-center gap-2 bg-slate-100 dark:bg-[#080812]/80 backdrop-blur-xl p-1.5 rounded-[2rem] border border-slate-200 dark:border-white/5 shadow-2xl shadow-black/20">
              <TabButton active={activeTab === "overview"} onClick={() => setActiveTab("overview")} label="Overview" icon={<Layout className="w-3.5 h-3.5" />} />
              <TabButton active={activeTab === "history"} onClick={() => setActiveTab("history")} label="Timeline" icon={<HistoryIcon className="w-3.5 h-3.5" />} />
              <TabButton active={activeTab === "source"} onClick={() => setActiveTab("source")} label="Definition" icon={<Code2 className="w-3.5 h-3.5" />} />
            </div>
            <button
              onClick={handleForceRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-2 px-5 py-3 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 rounded-2xl font-black text-xs uppercase tracking-[0.1em] shadow-sm transition-all active:scale-95 whitespace-nowrap disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 text-indigo-500 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Syncing...' : 'Refresh Data'}
            </button>
          </div>
        </div>
      </motion.div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
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

  const isGlobalSuccess = details.status === 'SUCCESS' || details.status === 'Success';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
      <div className="lg:col-span-2 space-y-10">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <QuickStat 
            icon={<CheckCircle2 className="w-5 h-5" />} 
            label="System Status" 
            value={details.status} 
            color={isGlobalSuccess ? 'emerald' : 'rose'} 
          />
          <QuickStat 
            icon={<Zap className="w-5 h-5" />} 
            label="Velocity Rate" 
            value={`${Math.round(successRate)}%`} 
            color={successRate > 90 ? 'emerald' : successRate > 70 ? 'amber' : 'rose'} 
          />
          <QuickStat 
            icon={<Clock className="w-5 h-5" />} 
            label="Latency Mean" 
            value={history[0]?.duration || '0s'} 
            color="indigo" 
          />
        </div>

        <GlassCard className="p-10 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-[100px] rounded-full pointer-events-none group-hover:bg-indigo-500/10 transition-colors" />
          <div className="flex items-center justify-between mb-10">
            <h3 className="text-xl font-black text-slate-800 dark:text-white tracking-widest uppercase flex items-center gap-4">
              <BarChart3 className="w-6 h-6 text-indigo-500" />
              Runtime Telemetry
            </h3>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Duration (s) / Sequence</span>
          </div>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorDur" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff" strokeOpacity={0.05} />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#64748b', fontSize: 10, fontWeight: 900}} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#64748b', fontSize: 11, fontWeight: 'bold'}} 
                  dx={-10}
                />
                <Tooltip 
                  cursor={{stroke: '#6366f1', strokeWidth: 2, strokeDasharray: '3 3'}}
                  contentStyle={{borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)', background: 'rgba(8,8,18,0.9)', backdropFilter: 'blur(20px)', boxShadow: '0 20px 40px -10px rgba(0,0,0,0.4)', padding: '20px' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="duration" 
                  stroke="#6366f1" 
                  strokeWidth={4} 
                  fillOpacity={1} 
                  fill="url(#colorDur)" 
                  className="filter drop-shadow-[0_0_8px_rgba(99,102,241,0.4)]"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>

      <div className="space-y-10">
        <GlassCard className="p-10 relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-32 h-32 bg-indigo-500/5 blur-[60px] pointer-events-none" />
          <h3 className="text-xl font-black text-slate-800 dark:text-white mb-10 tracking-widest uppercase">Configuration</h3>
          <div className="space-y-8">
            <MetadataItem label="Migration Hub" value={details.is_migrated ? "Verified Modern" : "Active Re-Route"} isTag />
            {details.migration_date && (
              <MetadataItem label="Modernization Stamp" value={new Date(details.migration_date).toLocaleDateString()} icon={<Calendar className="w-4 h-4 text-indigo-500" />} />
            )}
            <MetadataItem label="Primary Executor" value={details.is_migrated ? "GitHub Runner" : "Jenkins Master"} />
            <MetadataItem label="Protocol Type" value={details.is_migrated ? "Declarative YAML" : "Groovy/DSL Branch"} />
          </div>
        </GlassCard>

        <div className="p-10 bg-gradient-to-br from-indigo-600 to-indigo-800 text-white rounded-[2.5rem] overflow-hidden relative shadow-2xl shadow-indigo-500/30 group">
          <div className="relative z-10">
            <h4 className="font-black text-2xl tracking-tighter mb-4">Elite Workflow</h4>
            <p className="text-white/70 text-sm font-medium leading-relaxed mb-8">This sequence is fully optimized for cloud-native delivery standards with zero latency.</p>
            <div className="flex items-center gap-3 px-4 py-2 bg-white/10 backdrop-blur-md rounded-2xl w-fit border border-white/10 group-hover:bg-white/20 transition-all">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-black uppercase tracking-widest">Enhanced Security Protocol</span>
            </div>
          </div>
          <Zap className="absolute -right-6 -bottom-6 w-40 h-40 text-white/5 rotate-12 transition-transform group-hover:scale-110 group-hover:rotate-6 duration-700" />
        </div>
      </div>
    </div>
  );
}

function PipelineHistory({ details }: { details: any }) {
  const history = details.history || [];
  return (
    <GlassCard className="overflow-hidden">
      <div className="px-10 py-8 border-b border-white/5 flex justify-between items-center bg-slate-50/50 dark:bg-white/[0.02]">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
            <HistoryIcon className="w-5 h-5 text-indigo-500" />
          </div>
          <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-widest">Execution Timeline</h3>
        </div>
        <span className="text-[10px] font-black px-4 py-2 bg-white/5 rounded-2xl border border-white/5 uppercase tracking-widest text-slate-400">Archived: Last 10 Cycles</span>
      </div>
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 dark:bg-white/[0.01]">
              <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-white/5">Sequence ID</th>
              <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-white/5">Integrity</th>
              <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-white/5">Trigger Point</th>
              <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-white/5">Latency</th>
              <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-white/5 text-right">Access</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-white/5">
            {history.map((run: any, i: number) => {
              const status = run.status?.toLowerCase();
              const isSuccess = status === "success" || status === "completed";
              const isFailure = status === "failure";
              
              const badgeClass = isSuccess 
                ? "bg-emerald-500/5 text-emerald-500 border-emerald-500/10" 
                : isFailure 
                  ? "bg-rose-500/5 text-rose-500 border-rose-500/10"
                  : "bg-amber-500/5 text-amber-500 border-amber-500/10";
              
              const dotClass = isSuccess ? "bg-emerald-500" : isFailure ? "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]" : "bg-amber-500";

              return (
                <tr key={i} className="hover:bg-indigo-500/[0.02] transition-all group select-none">
                  <td className="px-10 py-6 text-sm font-black text-slate-800 dark:text-slate-200">#{run.number}</td>
                  <td className="px-10 py-6">
                    <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] font-black border shadow-sm ${badgeClass}`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${dotClass}`} />
                      {run.status.toUpperCase()}
                    </span>
                  </td>
                <td className="px-10 py-6 text-xs font-bold text-slate-500 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-white/5 flex items-center justify-center">
                    <Clock className="w-3.5 h-3.5 opacity-50" />
                  </div>
                  {run.timestamp}
                </td>
                <td className="px-10 py-6 text-sm font-black text-slate-600 dark:text-slate-400 italic opacity-80">{run.duration}</td>
                <td className="px-10 py-6 text-right">
                  <a 
                    href={details.is_migrated ? run.url : `${run.url}/console`} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="inline-flex items-center gap-2 text-[10px] font-black text-indigo-500 hover:text-white transition-all bg-indigo-500/5 hover:bg-indigo-500 px-5 py-2.5 rounded-2xl border border-indigo-500/10 uppercase tracking-widest active:scale-95 group/btn"
                  >
                    Fetch Info <ExternalLink className="w-3 h-3 group-hover/btn:translate-x-0.5 transition-transform" />
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
    <GlassCard className="overflow-hidden flex flex-col min-h-[600px] border-indigo-500/10">
      <div className="px-10 py-8 border-b border-white/5 flex justify-between items-center bg-[#050508] shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-64 h-64 bg-indigo-600/5 blur-[80px] pointer-events-none" />
        <div className="flex items-center gap-4 relative">
          <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
            <FileCode className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h3 className="text-xl font-black text-white tracking-widest uppercase">
              {details.is_migrated ? "GitHub Workflow YAML" : "Jenkinsfile Source"}
            </h3>
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-1">Definition Payload: {lineCount} Lines</p>
          </div>
        </div>
        <button 
          onClick={() => {
            navigator.clipboard.writeText(details.source_code);
            toast.success("Definition Payload Buffered!");
          }}
          className="text-[10px] font-black text-white bg-indigo-600 hover:bg-indigo-700 px-6 py-3 rounded-2xl transition-all shadow-xl shadow-indigo-500/20 uppercase tracking-widest active:scale-95"
        >
          Buffered Copy
        </button>
      </div>
      <div className="flex-1 bg-[#050508] p-10 pt-8 overflow-auto custom-scrollbar font-mono text-xs leading-relaxed flex border-t border-white/5">
        <div className="w-16 bg-[#050508] text-slate-700 text-right pr-6 select-none shrink-0 border-r border-white/10 opacity-30">
            {Array.from({ length: Math.max(1, lineCount) }).map((_, i) => (
                <div key={i} className="h-6 leading-6 font-black tracking-tighter">{i + 1}</div>
            ))}
        </div>
        <pre className="text-emerald-400/80 pl-10 flex-1 [text-shadow:0_0_10px_rgba(52,211,153,0.2)]">
          <code className="block whitespace-pre">
            {details.source_code || "# Empty definition file"}
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
    <div className={`bg-white/60 dark:bg-[#080812]/60 backdrop-blur-3xl ring-1 ring-slate-200 dark:ring-white/5 rounded-[2.5rem] shadow-2xl shadow-indigo-500/5 ${className}`}>
      {children}
    </div>
  );
}

function TabButton({ active, onClick, label, icon }: { active: boolean, onClick: () => void, label: string, icon: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`px-8 py-3 text-[10px] font-black uppercase tracking-[0.1em] rounded-[1.5rem] transition-all duration-300 flex items-center gap-3 relative overflow-hidden group ${
        active 
          ? "bg-white dark:bg-white/10 text-indigo-600 dark:text-white shadow-lg shadow-indigo-500/10 ring-1 ring-slate-200 dark:ring-white/10" 
          : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
      }`}
    >
      {active && (
        <motion.div 
          layoutId="tab-active-p" 
          className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent pointer-events-none" 
        />
      )}
      <span className="relative z-10 opacity-60 group-hover:scale-110 transition-transform">{icon}</span>
      <span className="relative z-10">{label}</span>
    </button>
  );
}

function QuickStat({ icon, label, value, color }: { icon: React.ReactNode, label: string, value: string | number, color: 'indigo' | 'emerald' | 'amber' | 'rose' }) {
  const colors = {
    indigo: 'bg-indigo-500/5 text-indigo-600 dark:text-indigo-400 border-indigo-500/10 shadow-indigo-500/5',
    emerald: 'bg-emerald-500/5 text-emerald-600 dark:text-emerald-400 border-emerald-500/10 shadow-emerald-500/5',
    amber: 'bg-amber-500/5 text-amber-600 dark:text-amber-400 border-amber-500/10 shadow-amber-500/5',
    rose: 'bg-rose-500/5 text-rose-600 dark:text-rose-400 border-rose-500/10 shadow-rose-500/5',
  };

  return (
    <div className={`p-6 rounded-[2rem] border ${colors[color]} flex flex-col items-center text-center shadow-lg transition-transform hover:scale-105 group`}>
      <div className="mb-3 opacity-80 transition-transform group-hover:scale-110">{icon}</div>
      <div className="text-[10px] font-black uppercase tracking-[0.2em] opacity-50 mb-1.5">{label}</div>
      <div className="text-xl font-black tracking-tighter">{value}</div>
    </div>
  );
}

function MetadataItem({ label, value, isTag, icon }: { label: string, value: string, isTag?: boolean, icon?: React.ReactNode }) {
  return (
    <div className="group/item">
      <h4 className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-[0.2em] mb-2.5 transition-colors group-hover/item:text-indigo-400 flex items-center gap-2">
          {icon}
          {label}
      </h4>
      {isTag ? (
        <span className="px-3 py-1.5 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase tracking-widest ring-1 ring-indigo-500/20 shadow-lg shadow-indigo-500/5">
          {value}
        </span>
      ) : (
        <p className="text-slate-800 dark:text-slate-100 font-black tracking-tight text-lg">{value || 'SEQUENCE NULL'}</p>
      )}
    </div>
  );
}
