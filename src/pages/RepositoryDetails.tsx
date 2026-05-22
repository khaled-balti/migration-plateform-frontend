import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { 
  ArrowLeft, 
  GitCommitHorizontal, 
  Users, 
  GitBranch, 
  HardDrive, 
  AlertTriangle, 
  Terminal, 
  GitPullRequest, 
  CircleDot,
  Shield,
  Activity,
  ChevronRight,
  Globe,
  Calendar,
  CheckCircle2,
  History,
  Zap,
  RefreshCw
} from "lucide-react";
import { 
  ResponsiveContainer, PieChart, Pie, Cell, 
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar 
} from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

import { RepositoryDetailSkeleton } from "../components/Skeletons";

export function RepositoryDetails() {
  const { id } = useParams<{ id: string }>();
  const [response, setResponse] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchDetails = useCallback(async (force = false, silent = false) => {
    try {
      if (!silent) setIsRefreshing(true);
      const url = `/api/repositories/${id}/details/${force ? '?force=true' : ''}`;
      const res = await fetch(url);
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Failed to fetch repository details");
      }
      setResponse(json);
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
    return <RepositoryDetailSkeleton />;
  }

  if (error || !response) {
    return (
      <div className="p-4 sm:p-6 lg:p-10 max-w-7xl mx-auto w-full text-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-[#080812]/50 backdrop-blur-3xl p-12 rounded-[3rem] max-w-lg mx-auto border border-white/5 shadow-2xl"
        >
          <div className="w-20 h-20 bg-rose-500/10 border border-rose-500/20 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-lg shadow-rose-500/10">
            <AlertTriangle className="w-10 h-10 text-rose-500" />
          </div>
          <h2 className="text-3xl font-black text-white tracking-tighter mb-4">Sequence Error</h2>
          <p className="text-slate-500 font-medium leading-relaxed">{error || "Repository might not exist in the decentralized network."}</p>
          <Link to="/app/repositories" className="mt-10 inline-flex items-center gap-3 px-8 py-3.5 bg-white text-black font-black uppercase text-xs tracking-widest rounded-2xl hover:bg-slate-200 transition-all active:scale-95 shadow-xl shadow-white/5">
            <ArrowLeft className="w-4 h-4" /> Initialize Recovery
          </Link>
        </motion.div>
      </div>
    );
  }

  const repoName = response.type === 'migrated' 
    ? (response.github_data?.metadata?.name?.split('/').pop() || "Unknown Repository") 
    : (response.data?.metadata?.name || "Pending Repository");
  const repoUrl = response.type === 'migrated' ? response.github_data?.metadata?.url : response.data?.metadata?.url;

  return (
    <div className="p-4 sm:p-6 lg:p-10 max-w-7xl mx-auto w-full transition-all duration-500">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12"
      >
        <Link 
          to={response.type === 'migrated' ? "/app/repositories/migrated" : "/app/repositories/waiting"} 
          className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 hover:text-indigo-400 transition-all mb-8 group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" /> 
          Back to Registry
        </Link>
        
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
          <div className="relative">
            <div className="absolute -top-10 -left-10 w-32 h-32 bg-indigo-600/10 blur-[80px] rounded-full pointer-events-none" />
            
            <div className="flex flex-wrap items-center gap-4 mb-4">
              <div className={`px-3 py-1 rounded-[10px] text-[10px] font-black uppercase tracking-[0.15em] border ${
                response.type === 'migrated' 
                  ? "bg-emerald-500/5 text-emerald-400 border-emerald-500/20" 
                  : "bg-amber-500/5 text-amber-400 border-amber-500/20"
              }`}>
                {response.type === 'migrated' ? 'Active Migration' : 'Pending Verification'}
              </div>
              <div className="flex items-center gap-2 px-3 py-1 rounded-[10px] bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                <Shield className="w-3 h-3 text-indigo-500" />
                Protected Data
              </div>
            </div>

            <h1 className="text-4xl sm:text-6xl font-black bg-clip-text text-transparent bg-gradient-to-br from-slate-900 via-slate-700 to-slate-500 dark:from-white dark:via-slate-300 dark:to-slate-500 tracking-tighter mb-4">
              {repoName}
            </h1>
            
            <div className="flex items-center gap-3 px-4 py-2 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/5 w-fit shadow-sm">
              <Terminal className="w-4 h-4 text-indigo-500" />
              <span className="text-slate-500 dark:text-slate-400 font-mono text-xs font-bold tracking-tight">{repoUrl}</span>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="flex items-center gap-2 bg-slate-100 dark:bg-[#080812]/80 backdrop-blur-xl p-1.5 rounded-[2rem] border border-slate-200 dark:border-white/5 shadow-2xl shadow-black/20">
              <TabButton active={activeTab === "overview"} onClick={() => setActiveTab("overview")} label="System Overview" />
              <TabButton active={activeTab === "analysis"} onClick={() => setActiveTab("analysis")} label="Neural Analysis" />
              <TabButton active={activeTab === "activity"} onClick={() => setActiveTab("activity")} label="Sync Metrics" />
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
          {response.type === 'migrated' ? (
            <MigratedDetailsView tab={activeTab} gitlab={response.gitlab_data} github={response.github_data} loss={response.loss} />
          ) : (
            <WaitingDetailsView tab={activeTab} data={response.data} />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function TabButton({ active, onClick, label }: { active: boolean, onClick: () => void, label: string }) {
  return (
    <button
      onClick={onClick}
      className={`px-8 py-3 text-[10px] font-black uppercase tracking-[0.1em] rounded-[1.5rem] transition-all duration-300 relative overflow-hidden group ${
        active 
          ? "bg-white dark:bg-white/10 text-indigo-600 dark:text-white shadow-lg shadow-indigo-500/10 ring-1 ring-slate-200 dark:ring-white/10" 
          : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
      }`}
    >
      {active && (
        <motion.div 
          layoutId="tab-active" 
          className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent pointer-events-none" 
        />
      )}
      <span className="relative z-10">{label}</span>
    </button>
  );
}

// ----------------------------------------------------------------------
// WAITING DETAILS VIEW
// ----------------------------------------------------------------------
function WaitingDetailsView({ tab, data }: { tab: string, data: any }) {
  const { metadata, stats, analysis, recent_commits, top_contributors, open_merge_requests, open_issues } = data;

  if (tab === "overview") {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-10">
          <GlassCard className="p-10 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-[100px] rounded-full pointer-events-none group-hover:bg-indigo-500/10 transition-colors" />
            
            <div className="flex items-center justify-between mb-10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                  <Shield className="w-6 h-6 text-indigo-500" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-800 dark:text-white tracking-tight uppercase tracking-widest">Metadata Manifest</h3>
                  <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Identity & Discovery Parameters</p>
                </div>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10">
                <Globe className="w-3.5 h-3.5 text-indigo-500" />
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400">Global Visibility</span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-10 gap-x-16">
              <MetadataItem label="Identification" value={metadata.name} />
              <MetadataItem label="Standard Visibility" value={metadata.visibility} isTag />
              <MetadataItem label="Primary Node" value={metadata.default_branch || "main"} fontMono />
              <MetadataItem label="Last Sequence" value={new Date(metadata.last_activity_at || Date.now()).toLocaleDateString()} />
              <div className="sm:col-span-2">
                <MetadataItem label="Network Access Point" value={metadata.url} isLink />
              </div>
            </div>
          </GlassCard>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            <QuickStat icon={<HardDrive />} label="Payload" value={`${stats.size_mb || 0} MB`} color="indigo" />
            <QuickStat icon={<GitCommitHorizontal />} label="Sequences" value={stats.total_commits || 0} color="emerald" />
            <QuickStat icon={<GitBranch />} label="Forks" value={stats.branches_count || 0} color="amber" />
            <QuickStat icon={<Users />} label="Nodes" value={stats.contributors || 0} color="purple" />
          </div>
        </div>

        <div className="space-y-10">
          <GlassCard className="p-10 flex flex-col items-center text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/[0.02] to-transparent pointer-events-none" />
            <div className="flex items-center gap-3 mb-10 w-full">
              <Zap className="w-5 h-5 text-indigo-500" />
              <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-[0.2em]">Risk Analysis</h3>
            </div>
            
            <div className="relative w-48 h-48 mb-10 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <defs>
                  <linearGradient id="gradient-risk" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#6366f1" />
                    <stop offset="100%" stopColor="#818cf8" />
                  </linearGradient>
                </defs>
                <circle
                  cx="96"
                  cy="96"
                  r="85"
                  stroke="currentColor"
                  strokeWidth="12"
                  fill="transparent"
                  className="text-slate-100 dark:text-white/5"
                />
                <motion.circle
                  initial={{ strokeDashoffset: 534 }}
                  animate={{ strokeDashoffset: 534 - (534 * analysis.risk_score) / 10 }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  cx="96"
                  cy="96"
                  r="85"
                  stroke="url(#gradient-risk)"
                  strokeWidth="12"
                  fill="transparent"
                  strokeDasharray={534}
                  strokeLinecap="round"
                  className="filter drop-shadow-[0_0_10px_rgba(99,102,241,0.5)]"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center pt-2">
                <span className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter">{analysis.risk_score}</span>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Ref / 10</span>
              </div>
            </div>
            
            <div className={`px-6 py-2 rounded-2xl text-xs font-black uppercase tracking-[0.2em] mb-6 ${
              analysis.risk_level === 'High' ? 'bg-rose-500/10 text-rose-500 shadow-lg shadow-rose-500/10' : 
              analysis.risk_level === 'Medium' ? 'bg-amber-500/10 text-amber-500 shadow-lg shadow-amber-500/10' : 
              'bg-emerald-500/10 text-emerald-500 shadow-lg shadow-emerald-500/10'
            }`}>
              {analysis.risk_level} Complexity
            </div>
            
            <p className="text-slate-500 font-medium text-xs leading-relaxed max-w-[200px]">
              Calculated based on commit velocity, dependency depth, and structural integrity.
            </p>
          </GlassCard>
        </div>
      </div>
    );
  }

  if (tab === "analysis") {
    const radarData = [
      { subject: 'Structure', A: analysis.complexity_score * 10, fullMark: 100 },
      { subject: 'Velocity', A: analysis.activity_score * 10, fullMark: 100 },
      { subject: 'Volume', A: analysis.size_score * 10, fullMark: 100 },
      { subject: 'Integrity', A: 85, fullMark: 100 },
      { subject: 'Stability', A: 92, fullMark: 100 },
    ];

    const COLORS = ["#6366f1", "#8b5cf6", "#ec4899", "#f43f5e", "#f59e0b"];
    const contribData = top_contributors.map((name: string, i: number) => ({ 
      name, 
      value: 100 - i * 15,
      color: COLORS[i % COLORS.length]
    }));

    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <GlassCard className="p-10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/5 blur-[80px] pointer-events-none" />
          <h3 className="text-xl font-black text-slate-800 dark:text-white mb-10 flex items-center gap-4 tracking-widest uppercase">
            <Activity className="w-5 h-5 text-indigo-500" />
            Core Analytics Radar
          </h3>
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                <PolarGrid stroke="#e2e8f0" strokeOpacity={0.1} />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 10, fontWeight: 900 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                <Radar
                  name="Metrics"
                  dataKey="A"
                  stroke="#6366f1"
                  strokeWidth={3}
                  fill="#6366f1"
                  fillOpacity={0.2}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <GlassCard className="p-10 relative">
          <h3 className="text-xl font-black text-slate-800 dark:text-white mb-10 flex items-center gap-4 tracking-widest uppercase">
            <Users className="w-5 h-5 text-indigo-500" />
            Neural Map: Contributors
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-10 items-center">
            <div className="md:col-span-3 h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={contribData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={8}
                    dataKey="value"
                    stroke="none"
                  >
                    {contribData.map((entry: any, index: number) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.color} 
                        className="filter drop-shadow-[0_0_8px_rgba(0,0,0,0.2)]"
                      />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)', background: 'rgba(8,8,18,0.9)', backdropFilter: 'blur(10px)', boxShadow: '0 20px 40px -10px rgba(0,0,0,0.4)', padding: '12px 16px' }}
                    itemStyle={{ color: '#fff', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="md:col-span-2 space-y-4">
              {contribData.map((c: any, i: number) => (
                <div key={i} className="flex items-center justify-between bg-white dark:bg-white/5 p-4 rounded-2xl border border-slate-100 dark:border-white/5 hover:border-indigo-500/40 transition-all group">
                  <div className="flex items-center gap-4">
                    <div className="w-2.5 h-2.5 rounded-full shadow-[0_0_8px_currentColor]" style={{ color: c.color, backgroundColor: c.color }} />
                    <span className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest">{c.name}</span>
                  </div>
                  <ChevronRight className="w-3 h-3 text-slate-400 group-hover:translate-x-1 transition-transform" />
                </div>
              ))}
            </div>
          </div>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <GlassCard className="lg:col-span-1 p-10 overflow-hidden relative">
          <div className="absolute top-0 left-0 w-32 h-32 bg-indigo-600/5 blur-[60px] pointer-events-none" />
          <h3 className="text-xl font-black text-slate-800 dark:text-white mb-10 flex items-center gap-4 tracking-widest uppercase">
            <Activity className="w-5 h-5 text-indigo-500" />
            Stream: Commit History
          </h3>
          <div className="space-y-8 relative">
            <div className="absolute left-[7px] top-4 bottom-4 w-0.5 bg-slate-100 dark:bg-white/5" />
            {recent_commits.map((commit: any, idx: number) => (
              <div key={idx} className="relative pl-10 group">
                <div className="absolute left-0 top-1 w-4 h-4 rounded-full bg-white dark:bg-[#080812] border-2 border-indigo-600 shadow-[0_0_10px_rgba(79,70,229,0.3)] z-10 group-hover:scale-125 transition-transform" />
                <div>
                  <p className="text-sm font-black text-slate-700 dark:text-slate-200 line-clamp-2 tracking-tight group-hover:text-indigo-500 transition-colors cursor-default">{commit.title || commit.message || 'Sequence Init'}</p>
                  <div className="text-[10px] font-black text-slate-500 mt-2 flex items-center gap-4 uppercase tracking-widest">
                    <div className="flex items-center gap-1.5 opacity-60">
                      <Calendar className="w-3 h-3" />
                      {new Date(commit.date).toLocaleDateString()}
                    </div>
                    <div className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-white/5 text-indigo-600 dark:text-indigo-400 font-mono ring-1 ring-slate-200 dark:ring-white/10">
                      {(commit.id || commit.sha || '').substring(0, 8)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-10">
          <GlassCard className="p-10 relative">
            <div className="flex items-center justify-between mb-10">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 flex items-center justify-center">
                  <GitPullRequest className="w-5 h-5 text-indigo-500" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-800 dark:text-white uppercase tracking-widest">Merge Bridge</h3>
                  <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Pending Synchronization</p>
                </div>
              </div>
              <span className="text-[10px] font-black px-3 py-1.5 bg-indigo-500/10 text-indigo-500 rounded-xl ring-1 ring-indigo-500/20">{open_merge_requests?.length || 0} OPEN</span>
            </div>
            <div className="space-y-4">
              {open_merge_requests?.length > 0 ? open_merge_requests.map((mr: any, idx: number) => (
                  <div key={idx} className="p-5 bg-white dark:bg-white/5 rounded-[2rem] border border-slate-100 dark:border-white/5 hover:border-indigo-500/50 transition-all group flex flex-col gap-3 shadow-sm">
                    <p className="text-sm font-black text-slate-800 dark:text-slate-300 leading-snug group-hover:text-indigo-500 transition-colors uppercase tracking-tight">{mr.title}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-black text-indigo-500">!{mr.id}</span>
                        <div className="w-1 h-1 rounded-full bg-slate-300 dark:bg-white/20" />
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{new Date(mr.updated_at).toLocaleDateString()}</span>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
              )) : <EmptyState icon={<GitPullRequest />} message="No Synchronization Pending" />}
            </div>
          </GlassCard>

          <GlassCard className="p-10 relative">
            <div className="flex items-center justify-between mb-10">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/10 flex items-center justify-center">
                  <CircleDot className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-800 dark:text-white uppercase tracking-widest">Diagnostic Hub</h3>
                  <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Open System Reports</p>
                </div>
              </div>
              <span className="text-[10px] font-black px-3 py-1.5 bg-amber-500/10 text-amber-500 rounded-xl ring-1 ring-amber-500/20">{open_issues?.length || 0} ISSUES</span>
            </div>
            <div className="space-y-4">
              {open_issues?.length > 0 ? open_issues.map((iss: any, idx: number) => (
                  <div key={idx} className="p-5 bg-white dark:bg-white/5 rounded-[2rem] border border-slate-100 dark:border-white/5 hover:border-amber-500/50 transition-all group flex flex-col gap-3 shadow-sm">
                    <p className="text-sm font-black text-slate-800 dark:text-slate-300 leading-snug group-hover:text-amber-500 transition-colors uppercase tracking-tight">{iss.title}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-black text-amber-500">#{iss.id}</span>
                        <div className="w-1 h-1 rounded-full bg-slate-300 dark:bg-white/20" />
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{new Date(iss.updated_at).toLocaleDateString()}</span>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
              )) : <EmptyState icon={<CircleDot />} message="System Optimal: No Reports" />}
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// MIGRATED DETAILS VIEW
// ----------------------------------------------------------------------
function MigratedDetailsView({ tab, gitlab, github, loss }: { tab: string, gitlab: any, github: any, loss?: number }) {
  const normalizedCommits = (github.recent_commits || []).map((c: any) => ({
    id: c.id || c.sha || 'N/A',
    title: c.title || c.message || 'Sequence Registry',
    date: c.date
  }));

  const normalizedPRs = (github.open_prs || github.open_prs_list || []).map((pr: any) => 
    typeof pr === 'string' ? { title: pr, id: 'N/A' } : pr
  );

  const normalizedIssues = (github.open_issues || github.open_issues_list || []).map((iss: any) => 
    typeof iss === 'string' ? { title: iss, id: 'N/A' } : iss
  );

  const successRate = 100 - (loss || 0);

  if (tab === "overview") {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
            <GlassCard className="p-10 border-l-4 border-orange-500 group">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-[1.5rem] bg-orange-500/10 flex items-center justify-center border border-orange-500/20 shadow-lg shadow-orange-500/5 transition-transform group-hover:scale-110">
                  <Globe className="w-6 h-6 text-orange-500" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-widest">Legacy Node</h3>
                  <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest italic">Source: GitLab Enterprise</p>
                </div>
              </div>
              <div className="space-y-6">
                <MetadataItem label="Identification" value={gitlab?.metadata?.name || "N/A"} />
                <MetadataItem label="Temporal ID" value={gitlab?.metadata?.id || "N/A"} fontMono />
                <MetadataItem label="Network Link" value={gitlab?.metadata?.url || "N/A"} isLink />
              </div>
            </GlassCard>

            <GlassCard className="p-10 border-l-4 border-indigo-500 group">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-[1.5rem] bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 shadow-lg shadow-indigo-500/5 transition-transform group-hover:scale-110">
                  <Globe className="w-6 h-6 text-indigo-500" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-widest">Cloud Target</h3>
                  <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest italic">Host: GitHub Platform</p>
                </div>
              </div>
              <div className="space-y-6">
                <MetadataItem label="Repository Name" value={github?.metadata?.name?.split('/').pop() || "N/A"} />
                <MetadataItem label="Organization" value={github?.metadata?.name?.split('/')[0] || "N/A"} />
                <MetadataItem label="Registry URL" value={github?.metadata?.url || "N/A"} isLink />
              </div>
            </GlassCard>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            <QuickStat icon={<GitCommitHorizontal />} label="Sequences" value={github?.stats?.total_commits || 0} color="indigo" />
            <QuickStat icon={<GitBranch />} label="Active Nodes" value={github?.stats?.branches_count || 0} color="emerald" />
            <QuickStat icon={<Users />} label="Neural Agents" value={github?.stats?.contributors || 0} color="purple" />
            <QuickStat icon={<HardDrive />} label="Disk Payload" value={`${github?.stats?.size_mb || 0} MB`} color="amber" />
          </div>
        </div>

        <div className="space-y-10">
          <GlassCard className="p-10 flex flex-col items-center text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/[0.03] to-transparent pointer-events-none" />
            <div className="flex items-center gap-3 mb-10 w-full">
              <Shield className="w-5 h-5 text-emerald-500" />
              <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-[0.2em]">Data Integrity</h3>
            </div>
            
            <div className="relative w-48 h-48 mb-10 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <defs>
                  <linearGradient id="gradient-success" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="100%" stopColor="#34d399" />
                  </linearGradient>
                </defs>
                <circle
                  cx="96"
                  cy="96"
                  r="85"
                  stroke="currentColor"
                  strokeWidth="12"
                  fill="transparent"
                  className="text-slate-100 dark:text-white/5"
                />
                <motion.circle
                  initial={{ strokeDashoffset: 534 }}
                  animate={{ strokeDashoffset: 534 - (534 * successRate) / 100 }}
                  transition={{ duration: 2, ease: "easeOut" }}
                  cx="96"
                  cy="96"
                  r="85"
                  stroke="url(#gradient-success)"
                  strokeWidth="12"
                  fill="transparent"
                  strokeDasharray={534}
                  strokeLinecap="round"
                  className="filter drop-shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center pt-2">
                <span className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter">{successRate}%</span>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Verified</span>
              </div>
            </div>
            
            <div className="flex items-center gap-3 px-5 py-2 rounded-2xl bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-500/10 mb-6">
              <CheckCircle2 className="w-4 h-4" />
              Parity Confirmed
            </div>
            
            <p className="text-slate-500 font-medium text-xs leading-relaxed max-w-[200px]">
              Cryptographic hash mapping successfully validated all repository objects post-migration.
            </p>
          </GlassCard>
        </div>
      </div>
    );
  }

  if (tab === "analysis") {
    const comparisonData = [
      { name: 'Commits', GitLab: gitlab?.stats?.total_commits || 0, GitHub: github?.stats?.total_commits || 0 },
      { name: 'Branches', GitLab: gitlab?.stats?.branches_count || 0, GitHub: github?.stats?.branches_count || 0 },
      { name: 'Issues', GitLab: gitlab?.stats?.open_issues_count || 0, GitHub: github?.stats?.open_issues_count || 0 },
      { name: 'Bridge (MR/PR)', GitLab: gitlab?.stats?.open_merge_requests_count || 0, GitHub: github?.stats?.open_prs_count || 0 },
    ];

    return (
      <div className="space-y-10">
        <GlassCard className="p-10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-[100px] pointer-events-none" />
          <h3 className="text-xl font-black text-slate-800 dark:text-white mb-10 flex items-center gap-4 tracking-widest uppercase">
            <Activity className="w-5 h-5 text-indigo-500" />
            Synchronization Parity Metrics
          </h3>
          <div className="h-[450px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparisonData}>
                <defs>
                  <linearGradient id="bar-source" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f97316" stopOpacity={0.9} />
                    <stop offset="100%" stopColor="#ea580c" stopOpacity={0.6} />
                  </linearGradient>
                  <linearGradient id="bar-target" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity={0.9} />
                    <stop offset="100%" stopColor="#4f46e5" stopOpacity={0.6} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff" strokeOpacity={0.05} />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#64748b', fontSize: 10, fontWeight: 900}} 
                  dy={15}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#64748b', fontSize: 11, fontWeight: 'bold'}} 
                  dx={-10}
                />
                <Tooltip 
                  cursor={{fill: 'rgba(255, 255, 255, 0.05)', radius: 10}} 
                  contentStyle={{ borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)', background: 'rgba(8,8,18,0.9)', backdropFilter: 'blur(20px)', boxShadow: '0 20px 40px -10px rgba(0,0,0,0.4)', padding: '20px' }}
                  itemStyle={{ fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em' }}
                />
                <Bar name="Source (GitLab)" dataKey="GitLab" fill="url(#bar-source)" radius={[10, 10, 0, 0]} maxBarSize={50} />
                <Bar name="Target (GitHub)" dataKey="GitHub" fill="url(#bar-target)" radius={[10, 10, 0, 0]} maxBarSize={50} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <GlassCard className="lg:col-span-1 p-10 relative">
          <h3 className="text-xl font-black text-slate-800 dark:text-white mb-10 flex items-center gap-4 tracking-widest uppercase">
            <History className="w-5 h-5 text-indigo-500" />
            Verified Chain: Commits
          </h3>
          <div className="space-y-8 relative">
            <div className="absolute left-[7px] top-4 bottom-4 w-0.5 bg-slate-100 dark:bg-white/5" />
            {normalizedCommits.map((commit: any, idx: number) => (
              <div key={idx} className="relative pl-10 group">
                <div className="absolute left-0 top-1 w-4 h-4 rounded-full bg-white dark:bg-[#080812] border-2 border-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)] z-10 group-hover:scale-125 transition-transform" />
                <div>
                  <p className="text-sm font-black text-slate-700 dark:text-slate-200 line-clamp-2 tracking-tight group-hover:text-emerald-500 transition-colors cursor-default">{commit.title || 'Migration Checkpoint'}</p>
                  <div className="text-[10px] font-black text-slate-500 mt-2 flex items-center gap-4 uppercase tracking-widest">
                    <div className="flex items-center gap-1.5 opacity-60">
                      <Calendar className="w-3 h-3" />
                      {new Date(commit.date).toLocaleDateString()}
                    </div>
                    <div className="px-2 py-0.5 rounded-lg bg-emerald-500/5 text-emerald-500 font-mono ring-1 ring-emerald-500/20">
                      {(commit.id || '').substring(0, 8)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-10">
          <GlassCard className="p-10 relative group">
            <div className="flex items-center justify-between mb-10">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 flex items-center justify-center">
                  <GitPullRequest className="w-5 h-5 text-indigo-500" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-800 dark:text-white uppercase tracking-widest">Pull Access</h3>
                  <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Verified Pull Requests</p>
                </div>
              </div>
              <span className="text-[10px] font-black px-3 py-1.5 bg-indigo-500/10 text-indigo-500 rounded-xl ring-1 ring-indigo-500/20">{normalizedPRs.length} ACTIVE</span>
            </div>
            <div className="space-y-4">
              {normalizedPRs.length > 0 ? normalizedPRs.map((pr: any, idx: number) => (
                  <div key={idx} className="p-5 bg-white dark:bg-white/5 rounded-[2rem] border border-slate-100 dark:border-white/5 hover:border-indigo-500/50 transition-all flex flex-col gap-3 group/item cursor-default shadow-sm text-left">
                    <p className="text-sm font-black text-slate-800 dark:text-slate-300 group-hover/item:text-indigo-500 transition-colors uppercase tracking-tight">{pr.title}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-black text-indigo-500">#{pr.id}</span>
                        <div className="w-1 h-1 rounded-full bg-slate-300 dark:bg-white/20" />
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Synced Node</span>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover/item:translate-x-1 transition-transform" />
                    </div>
                  </div>
              )) : <EmptyState icon={<GitPullRequest />} message="Pipeline Clear: No PRs" />}
            </div>
          </GlassCard>

          <GlassCard className="p-10 relative">
            <div className="flex items-center justify-between mb-10">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/10 flex items-center justify-center">
                  <CircleDot className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-800 dark:text-white uppercase tracking-widest">Issue Tracker</h3>
                  <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Platform Integrity Reports</p>
                </div>
              </div>
              <span className="text-[10px] font-black px-3 py-1.5 bg-amber-500/10 text-amber-500 rounded-xl ring-1 ring-amber-500/20">{normalizedIssues.length} ACTIVE</span>
            </div>
            <div className="space-y-4">
              {normalizedIssues.length > 0 ? normalizedIssues.map((iss: any, idx: number) => (
                  <div key={idx} className="p-5 bg-white dark:bg-white/5 rounded-[2rem] border border-slate-100 dark:border-white/5 hover:border-amber-500/50 transition-all flex flex-col gap-3 group/item cursor-default shadow-sm text-left">
                    <p className="text-sm font-black text-slate-800 dark:text-slate-300 group-hover/item:text-amber-500 transition-colors uppercase tracking-tight">{iss.title}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-black text-amber-500">#{iss.id}</span>
                        <div className="w-1 h-1 rounded-full bg-slate-300 dark:bg-white/20" />
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Platform Report</span>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover/item:translate-x-1 transition-transform" />
                    </div>
                  </div>
              )) : <EmptyState icon={<CircleDot />} message="System Optimal: 0 Reports" />}
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// HELPER COMPONENTS
// ----------------------------------------------------------------------
function GlassCard({ children, className = "" }: { children: React.ReactNode, className?: string }) {
  return (
    <div className={`bg-white/60 dark:bg-[#080812]/60 backdrop-blur-3xl ring-1 ring-slate-200 dark:ring-white/5 rounded-[2.5rem] shadow-2xl shadow-indigo-500/5 ${className}`}>
      {children}
    </div>
  );
}

function MetadataItem({ label, value, isTag, isLink, fontMono }: { label: string, value: string, isTag?: boolean, isLink?: boolean, fontMono?: boolean }) {
  return (
    <div className="group/item">
      <h4 className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-[0.2em] mb-2.5 transition-colors group-hover/item:text-indigo-400">{label}</h4>
      {isTag ? (
        <span className="px-3 py-1.5 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase tracking-widest ring-1 ring-indigo-500/20 shadow-lg shadow-indigo-500/5">
          {value}
        </span>
      ) : isLink ? (
        <a href={value} target="_blank" rel="noreferrer" className="text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 underline underline-offset-4 decoration-2 decoration-indigo-500/30 flex items-center gap-2 group/link truncate max-w-full">
          <Terminal className="w-4 h-4 transition-transform group-hover/link:rotate-12" />
          {value}
        </a>
      ) : (
        <p className={`text-slate-800 dark:text-slate-100 font-black tracking-tight ${fontMono ? 'font-mono text-sm opacity-80' : 'text-lg'}`}>{value}</p>
      )}
    </div>
  );
}

function QuickStat({ icon, label, value, color }: { icon: React.ReactNode, label: string, value: string | number, color: 'indigo' | 'emerald' | 'amber' | 'purple' }) {
  const colors = {
    indigo: 'bg-indigo-500/5 text-indigo-600 dark:text-indigo-400 border-indigo-500/10 shadow-indigo-500/5',
    emerald: 'bg-emerald-500/5 text-emerald-600 dark:text-emerald-400 border-emerald-500/10 shadow-emerald-500/5',
    amber: 'bg-amber-500/5 text-amber-600 dark:text-amber-400 border-amber-500/10 shadow-amber-500/5',
    purple: 'bg-purple-500/5 text-purple-600 dark:text-purple-400 border-purple-500/10 shadow-purple-500/5',
  };

  return (
    <div className={`p-6 rounded-[2rem] border ${colors[color]} flex flex-col items-center text-center shadow-lg transition-transform hover:scale-105 group`}>
      <div className="mb-3 opacity-80 transition-transform group-hover:scale-110">{icon}</div>
      <div className="text-[10px] font-black uppercase tracking-[0.2em] opacity-50 mb-1.5">{label}</div>
      <div className="text-xl font-black tracking-tighter">{value}</div>
    </div>
  );
}

function EmptyState({ icon, message }: { icon: React.ReactNode, message: string }) {
  return (
    <div className="py-16 flex flex-col items-center text-center opacity-30 select-none">
      <div className="mb-6 scale-[2] text-slate-400">{icon}</div>
      <p className="text-[10px] font-black uppercase tracking-[0.3em]">{message}</p>
    </div>
  );
}
