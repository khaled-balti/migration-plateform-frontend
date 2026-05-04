import { useState, useEffect } from "react";
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
  History
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
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const res = await fetch(`/api/repositories/${id}/details/`);
        const json = await res.json();
        if (!res.ok) {
          throw new Error(json.error || "Failed to fetch repository details");
        }
        setResponse(json);
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
    return <RepositoryDetailSkeleton />;
  }

  if (error || !response) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full text-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-panel p-12 rounded-3xl max-w-lg mx-auto"
        >
          <AlertTriangle className="w-16 h-16 text-rose-500 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200">Error Loading Details</h2>
          <p className="text-slate-500 mt-2">{error || "Repository might not exist."}</p>
          <Link to="/app/repositories" className="mt-8 inline-flex items-center gap-2 px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all">
            <ArrowLeft className="w-4 h-4" /> Go Back
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
      <div className="mb-8">
        <Link 
          to={response.type === 'migrated' ? "/app/repositories/migrated" : "/app/repositories/waiting"} 
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors mb-4 group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" /> 
          Back to {response.type === 'migrated' ? "Migrated" : "Waiting"} Repositories
        </Link>
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl sm:text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400">
                {response.type === 'migrated' ? response.github_data.metadata.name.split('/').pop() : response.data.metadata.name}
              </h1>
              <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                response.type === 'migrated' 
                  ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" 
                  : "bg-amber-500/10 text-amber-500 border border-amber-500/20"
              }`}>
                {response.type === 'migrated' ? 'Migrated' : 'Pending'}
              </span>
            </div>
            <p className="flex items-center gap-2 text-slate-500 font-mono text-sm">
              <Terminal className="w-4 h-4" />
              {response.type === 'migrated' ? response.github_data.metadata.url : response.data.metadata.url}
            </p>
          </div>
          
          <div className="flex items-center bg-slate-100 dark:bg-slate-800/50 p-1 rounded-2xl border border-slate-200 dark:border-white/5">
            <TabButton active={activeTab === "overview"} onClick={() => setActiveTab("overview")} label="Overview" />
            <TabButton active={activeTab === "analysis"} onClick={() => setActiveTab("analysis")} label="Analysis" />
            <TabButton active={activeTab === "activity"} onClick={() => setActiveTab("activity")} label="Activity" />
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
      className={`px-6 py-2.5 text-sm font-bold rounded-xl transition-all duration-200 ${
        active 
          ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-sm ring-1 ring-slate-200 dark:ring-white/10" 
          : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
      }`}
    >
      {label}
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <GlassCard className="p-8">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <Shield className="w-5 h-5 text-indigo-500" />
                Repository Metadata
              </h3>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5 text-slate-500 text-sm">
                  <Globe className="w-4 h-4" />
                  <span>Public</span>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-8 gap-x-12">
              <MetadataItem label="Full Name" value={metadata.name} />
              <MetadataItem label="Visibility" value={metadata.visibility} isTag />
              <MetadataItem label="Default Branch" value={metadata.default_branch || "main"} fontMono />
              <MetadataItem label="Last Updated" value={new Date(metadata.last_activity_at || Date.now()).toLocaleDateString()} />
              <div className="sm:col-span-2">
                <MetadataItem label="Repository URL" value={metadata.url} isLink />
              </div>
            </div>
          </GlassCard>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <QuickStat icon={<HardDrive />} label="Storage" value={`${stats.size_mb || 0}MB`} color="indigo" />
            <QuickStat icon={<GitCommitHorizontal />} label="Commits" value={stats.total_commits || 0} color="emerald" />
            <QuickStat icon={<GitBranch />} label="Branches" value={stats.branches_count || 0} color="amber" />
            <QuickStat icon={<Users />} label="Developers" value={stats.contributors || 0} color="purple" />
          </div>
        </div>

        <div className="space-y-8">
          <GlassCard className="p-8 flex flex-col items-center text-center">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-6 w-full text-left">Risk Assessment</h3>
            <div className="relative w-40 h-40 mb-6">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  stroke="currentColor"
                  strokeWidth="12"
                  fill="transparent"
                  className="text-slate-100 dark:text-slate-800"
                />
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  stroke="currentColor"
                  strokeWidth="12"
                  fill="transparent"
                  strokeDasharray={440}
                  strokeDashoffset={440 - (440 * analysis.risk_score) / 10}
                  strokeLinecap="round"
                  className={analysis.risk_level === 'High' ? 'text-rose-500' : analysis.risk_level === 'Medium' ? 'text-amber-500' : 'text-emerald-500'}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-black text-slate-800 dark:text-white">{analysis.risk_score}</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Score / 10</span>
              </div>
            </div>
            <h4 className={`text-xl font-black uppercase tracking-widest mb-2 ${
              analysis.risk_level === 'High' ? 'text-rose-500' : analysis.risk_level === 'Medium' ? 'text-amber-500' : 'text-emerald-500'
            }`}>
              {analysis.risk_level} Risk
            </h4>
            <p className="text-slate-500 text-sm leading-relaxed">
              This score represents the potential complexity and data loss risk during migration.
            </p>
          </GlassCard>
        </div>
      </div>
    );
  }

  if (tab === "analysis") {
    const radarData = [
      { subject: 'Complexity', A: analysis.complexity_score * 10, fullMark: 100 },
      { subject: 'Activity', A: analysis.activity_score * 10, fullMark: 100 },
      { subject: 'Size', A: analysis.size_score * 10, fullMark: 100 },
      { subject: 'Modernity', A: 80, fullMark: 100 },
      { subject: 'Stability', A: 90, fullMark: 100 },
    ];

    const COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ec4899", "#8b5cf6"];
    const contribData = top_contributors.map((name: string, i: number) => ({ 
      name, 
      value: 100 - i * 15,
      color: COLORS[i % COLORS.length]
    }));

    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <GlassCard className="p-8">
          <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-8 flex items-center gap-2">
            <Activity className="w-5 h-5 text-indigo-500" />
            Source Code Analysis
          </h3>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                <Radar
                  name="Analysis"
                  dataKey="A"
                  stroke="#6366f1"
                  fill="#6366f1"
                  fillOpacity={0.4}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <GlassCard className="p-8">
          <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-8 flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-500" />
            Contributor Distribution
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={contribData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {contribData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 4px 20px -2px rgba(0,0,0,0.1)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-4 justify-center flex flex-col">
              {contribData.map((c: any, i: number) => (
                <div key={i} className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl border border-slate-100 dark:border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: c.color }} />
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{c.name}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300" />
                </div>
              ))}
            </div>
          </div>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <GlassCard className="lg:col-span-1 p-8 overflow-hidden">
          <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-6 flex items-center gap-2">
            <GitCommitHorizontal className="w-5 h-5 text-indigo-500" />
            Recent History
          </h3>
          <div className="space-y-4">
            {recent_commits.map((commit: any, idx: number) => (
              <div key={idx} className="relative pl-6 pb-6 last:pb-0">
                {idx !== recent_commits.length - 1 && (
                  <div className="absolute left-[7px] top-[14px] bottom-0 w-0.5 bg-slate-100 dark:bg-slate-800" />
                )}
                <div className="absolute left-0 top-1.5 w-4 h-4 rounded-full bg-white dark:bg-slate-900 border-2 border-indigo-500 z-10" />
                <div>
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-300 line-clamp-1">{commit.title || commit.message || 'No message'}</p>
                  <p className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                    <Calendar className="w-3 h-3" />
                    {new Date(commit.date).toLocaleDateString()}
                    <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-mono">{(commit.id || commit.sha || '').substring(0, 7)}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8">
          <GlassCard className="p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <GitPullRequest className="w-5 h-5 text-indigo-500" />
                Merge Requests
              </h3>
              <span className="text-xs font-black px-2 py-1 bg-indigo-500/10 text-indigo-500 rounded-lg">{open_merge_requests?.length || 0} Open</span>
            </div>
            <div className="space-y-3">
              {open_merge_requests?.length > 0 ? open_merge_requests.map((mr: any, idx: number) => (
                  <div key={idx} className="p-4 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-slate-100 dark:border-white/5 hover:border-indigo-500/50 transition-colors group cursor-default">
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 line-clamp-1 group-hover:text-indigo-500 transition-colors">{mr.title}</p>
                    <div className="flex items-center gap-2 text-[10px] font-black text-slate-400">
                      <span className="text-indigo-600 dark:text-indigo-400 font-mono">!{mr.id}</span>
                      <span>•</span>
                      <span>Updated {new Date(mr.updated_at).toLocaleDateString()}</span>
                    </div>
                  </div>
              )) : <EmptyState icon={<GitPullRequest />} message="No open merge requests" />}
            </div>
          </GlassCard>

          <GlassCard className="p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <CircleDot className="w-5 h-5 text-amber-500" />
                Issues
              </h3>
              <span className="text-xs font-black px-2 py-1 bg-amber-500/10 text-amber-500 rounded-lg">{open_issues?.length || 0} Open</span>
            </div>
            <div className="space-y-3">
              {open_issues?.length > 0 ? open_issues.map((iss: any, idx: number) => (
                  <div key={idx} className="p-4 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-slate-100 dark:border-white/5 hover:border-amber-500/50 transition-colors group cursor-default">
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 line-clamp-1 group-hover:text-amber-500 transition-colors">{iss.title}</p>
                    <div className="flex items-center gap-2 text-[10px] font-black text-slate-400">
                      <span className="text-amber-600 dark:text-amber-400 font-mono">#{iss.id}</span>
                      <span>•</span>
                      <span>Updated {new Date(iss.updated_at).toLocaleDateString()}</span>
                    </div>
                  </div>
              )) : <EmptyState icon={<CircleDot />} message="No open issues found" />}
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
    title: c.title || c.message || 'No message',
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            <GlassCard className="p-8 border-l-4 border-orange-500">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
                  <Globe className="w-4 h-4 text-orange-500" />
                </div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Source (GitLab)</h3>
              </div>
              <div className="space-y-4">
                <MetadataItem label="Name" value={gitlab.metadata.name} />
                <MetadataItem label="ID" value={gitlab.metadata.id} fontMono />
                <MetadataItem label="URL" value={gitlab.metadata.url} isLink />
              </div>
            </GlassCard>

            <GlassCard className="p-8 border-l-4 border-indigo-500">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                  <Globe className="w-4 h-4 text-indigo-500" />
                </div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Target (GitHub)</h3>
              </div>
              <div className="space-y-4">
                <MetadataItem label="Name" value={github.metadata.name.split('/').pop()} />
                <MetadataItem label="Owner" value={github.metadata.name.split('/')[0]} />
                <MetadataItem label="URL" value={github.metadata.url} isLink />
              </div>
            </GlassCard>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <QuickStat icon={<GitCommitHorizontal />} label="Commits" value={github.stats.total_commits || 0} color="indigo" />
            <QuickStat icon={<GitBranch />} label="Branches" value={github.stats.branches_count || 0} color="emerald" />
            <QuickStat icon={<Users />} label="Developers" value={github.stats.contributors || 0} color="purple" />
            <QuickStat icon={<HardDrive />} label="Size" value={`${github.stats.size_mb || 0}MB`} color="amber" />
          </div>
        </div>

        <div className="space-y-8">
          <GlassCard className="p-8 flex flex-col items-center text-center">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-6 w-full text-left">Migration Integrity</h3>
            <div className="relative w-40 h-40 mb-6">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  stroke="currentColor"
                  strokeWidth="12"
                  fill="transparent"
                  className="text-slate-100 dark:text-slate-800"
                />
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  stroke="currentColor"
                  strokeWidth="12"
                  fill="transparent"
                  strokeDasharray={440}
                  strokeDashoffset={440 - (440 * successRate) / 100}
                  strokeLinecap="round"
                  className={successRate > 95 ? 'text-emerald-500' : successRate > 80 ? 'text-amber-500' : 'text-rose-500'}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-black text-slate-800 dark:text-white">{successRate}%</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Success Rate</span>
              </div>
            </div>
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              <span className="text-sm font-bold text-slate-600 dark:text-slate-400">Data Integrity Verified</span>
            </div>
            <p className="text-slate-500 text-sm leading-relaxed">
              Based on commit hash mapping and object verification between GitLab and GitHub.
            </p>
          </GlassCard>
        </div>
      </div>
    );
  }

  if (tab === "analysis") {
    const comparisonData = [
      { name: 'Commits', GitLab: gitlab.stats.total_commits, GitHub: github.stats.total_commits },
      { name: 'Branches', GitLab: gitlab.stats.branches_count, GitHub: github.stats.branches_count },
      { name: 'Issues', GitLab: gitlab.stats.open_issues_count, GitHub: github.stats.open_issues_count },
      { name: 'PRs/MRs', GitLab: gitlab.stats.open_merge_requests_count, GitHub: github.stats.open_prs_count },
    ];

    return (
      <div className="space-y-8">
        <GlassCard className="p-8">
          <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-8 flex items-center gap-2">
            <Activity className="w-5 h-5 text-indigo-500" />
            Comparison Metrics
          </h3>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparisonData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 13, fontWeight: 600}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 13}} />
                <Tooltip 
                  cursor={{fill: 'rgba(99, 102, 241, 0.05)'}} 
                  contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 4px 20px -2px rgba(0,0,0,0.1)'}}
                />
                <Bar dataKey="GitLab" fill="#f97316" radius={[4, 4, 0, 0]} maxBarSize={40} />
                <Bar dataKey="GitHub" fill="#6366f1" radius={[4, 4, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <GlassCard className="lg:col-span-1 p-8">
          <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-6 flex items-center gap-2">
            <History className="w-5 h-5 text-indigo-500" />
            Recent Commits (Post-Migration)
          </h3>
          <div className="space-y-4">
            {normalizedCommits.map((commit: any, idx: number) => (
              <div key={idx} className="relative pl-6 pb-6 last:pb-0">
                {idx !== github.recent_commits.length - 1 && (
                  <div className="absolute left-[7px] top-[14px] bottom-0 w-0.5 bg-slate-100 dark:bg-slate-800" />
                )}
                <div className="absolute left-0 top-1.5 w-4 h-4 rounded-full bg-white dark:bg-slate-900 border-2 border-emerald-500 z-10" />
                <div>
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-300 line-clamp-1">{commit.title || commit.message || 'No message'}</p>
                  <p className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                    <Calendar className="w-3 h-3" />
                    {new Date(commit.date).toLocaleDateString()}
                    <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-mono">{(commit.id || commit.sha || '').substring(0, 7)}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8">
          <GlassCard className="p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <GitPullRequest className="w-5 h-5 text-indigo-500" />
                GitHub Pull Requests
              </h3>
              <span className="text-xs font-black px-2 py-1 bg-indigo-500/10 text-indigo-500 rounded-lg">{normalizedPRs.length} Open</span>
            </div>
            <div className="space-y-3">
              {normalizedPRs.length > 0 ? normalizedPRs.map((pr: any, idx: number) => (
                  <div key={idx} className="p-4 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-slate-100 dark:border-white/5 hover:border-indigo-500/50 transition-colors group cursor-default">
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 line-clamp-1 group-hover:text-indigo-500 transition-colors">{pr.title}</p>
                    <div className="flex items-center gap-2 text-[10px] font-black text-slate-400">
                      <span className="text-indigo-600 dark:text-indigo-400 font-mono">#{pr.id}</span>
                      <span>•</span>
                      <span>Updated {new Date(pr.updated_at).toLocaleDateString()}</span>
                    </div>
                  </div>
              )) : <EmptyState icon={<GitPullRequest />} message="No open pull requests" />}
            </div>
          </GlassCard>

          <GlassCard className="p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <CircleDot className="w-5 h-5 text-amber-500" />
                GitHub Issues
              </h3>
              <span className="text-xs font-black px-2 py-1 bg-amber-500/10 text-amber-500 rounded-lg">{normalizedIssues.length} Open</span>
            </div>
            <div className="space-y-3">
              {normalizedIssues.length > 0 ? normalizedIssues.map((iss: any, idx: number) => (
                  <div key={idx} className="p-4 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-slate-100 dark:border-white/5 hover:border-amber-500/50 transition-colors group cursor-default">
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 line-clamp-1 group-hover:text-amber-500 transition-colors">{iss.title}</p>
                    <div className="flex items-center gap-2 text-[10px] font-black text-slate-400">
                      <span className="text-amber-600 dark:text-amber-400 font-mono">#{iss.id}</span>
                      <span>•</span>
                      <span>Updated {new Date(iss.updated_at).toLocaleDateString()}</span>
                    </div>
                  </div>
              )) : <EmptyState icon={<CircleDot />} message="No open issues found" />}
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
    <div className={`bg-white/80 dark:bg-slate-900/50 backdrop-blur-xl ring-1 ring-slate-200 dark:ring-white/10 rounded-3xl shadow-xl shadow-slate-200/20 dark:shadow-none ${className}`}>
      {children}
    </div>
  );
}

function MetadataItem({ label, value, isTag, isLink, fontMono }: { label: string, value: string, isTag?: boolean, isLink?: boolean, fontMono?: boolean }) {
  return (
    <div>
      <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">{label}</h4>
      {isTag ? (
        <span className="px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-bold ring-1 ring-indigo-500/20">
          {value}
        </span>
      ) : isLink ? (
        <a href={value} target="_blank" rel="noreferrer" className="text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1.5 line-clamp-1">
          <Terminal className="w-3.5 h-3.5" />
          {value}
        </a>
      ) : (
        <p className={`text-slate-800 dark:text-slate-200 font-bold ${fontMono ? 'font-mono text-sm' : 'text-base'}`}>{value}</p>
      )}
    </div>
  );
}

function QuickStat({ icon, label, value, color }: { icon: React.ReactNode, label: string, value: string | number, color: 'indigo' | 'emerald' | 'amber' | 'purple' }) {
  const colors = {
    indigo: 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20',
    emerald: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
    amber: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
    purple: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
  };

  return (
    <div className={`p-4 rounded-2xl border ${colors[color]} flex flex-col items-center text-center`}>
      <div className="mb-2 opacity-80">{icon}</div>
      <div className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">{label}</div>
      <div className="text-lg font-black">{value}</div>
    </div>
  );
}

function EmptyState({ icon, message }: { icon: React.ReactNode, message: string }) {
  return (
    <div className="py-12 flex flex-col items-center text-center opacity-40">
      <div className="mb-4 scale-150">{icon}</div>
      <p className="text-sm font-bold uppercase tracking-widest">{message}</p>
    </div>
  );
}


// End of RepositoryDetails.tsx
