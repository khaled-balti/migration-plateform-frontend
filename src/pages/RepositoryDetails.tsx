import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Loader2, GitCommitHorizontal, Users, GitBranch, HardDrive, AlertTriangle, ArrowRight, TrendingDown, Terminal, GitPullRequest, CircleDot } from "lucide-react";
import { 
  ResponsiveContainer, PieChart, Pie, Cell, 
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid 
} from "recharts";
import toast from "react-hot-toast";

export function RepositoryDetails() {
  const { id } = useParams<{ id: string }>();
  const [response, setResponse] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (error || !response) {
    return (
      <div className="p-8 max-w-7xl mx-auto w-full text-center">
        <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200">Error Loading Repository Details</h2>
        <p className="text-slate-500 mt-2">{error || "Repository might not exist."}</p>
        <Link to="/repositories" className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors">
          <ArrowLeft className="w-4 h-4" /> Go Back
        </Link>
      </div>
    );
  }

  if (response.type === 'migrated') {
    return <MigratedDetails gitlab={response.gitlab_data} github={response.github_data} />;
  }

  return <WaitingDetails data={response.data} />;
}

// ----------------------------------------------------------------------
// WAITING DETAILS PORTION (Pre-Migration)
// ----------------------------------------------------------------------
function WaitingDetails({ data }: { data: any }) {
  const { metadata, stats, analysis, recent_commits, top_contributors, open_merge_requests, open_issues } = data;

  const scoreData = [
    { name: "Complexity", val: analysis.complexity_score },
    { name: "Activity", val: analysis.activity_score },
    { name: "Size Score", val: analysis.size_score },
  ];

  const COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ec4899", "#8b5cf6"];
  const contribData = top_contributors.map((name: string, i: number) => ({ name, value: 100 - i * 15 }));

  return (
    <div className="p-8 max-w-7xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <Link to="/repositories/waiting" className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors mb-4">
          <ArrowLeft className="w-4 h-4" /> Back to Waiting Repositories
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400 mb-2">
              {metadata.name}
            </h1>
            <p className="flex items-center gap-2 text-slate-500">
              <a href={metadata.url} target="_blank" rel="noreferrer" className="hover:underline hover:text-indigo-600 font-mono text-sm">
                {metadata.url}
              </a>
              <span className="px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-700 uppercase tracking-wider">
                {metadata.visibility}
              </span>
            </p>
          </div>
          <div className="text-right">
            <div className={`text-2xl font-black ${analysis.risk_level === 'High' ? 'text-rose-500' : analysis.risk_level === 'Medium' ? 'text-amber-500' : 'text-emerald-500'}`}>
              Risk: {analysis.risk_level}
            </div>
            <div className="text-sm font-medium text-slate-500">Score {analysis.risk_score} / 10</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <StatCard icon={<HardDrive />} label="Size" value={`${stats.size_mb} MB`} />
        <StatCard icon={<GitCommitHorizontal />} label="Commits" value={stats.total_commits} />
        <StatCard icon={<GitBranch />} label="Branches" value={stats.branches_count || 0} />
        <StatCard icon={<Users />} label="Contributors" value={stats.contributors} />
        <StatCard icon={<GitBranch />} label="Open MRs" value={stats.open_merge_requests_count || 0} />
        <StatCard icon={<AlertTriangle />} label="Open Issues" value={stats.open_issues_count || 0} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white dark:bg-slate-900 ring-1 ring-slate-200 dark:ring-slate-800 rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-6 font-display">Analysis Breakdown</h3>
            <div className="h-68">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={scoreData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 13}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 13}} domain={[0, 10]} />
                  <Tooltip cursor={{fill: '#f1f5f9'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                  <Bar dataKey="val" fill="#6366f1" radius={[4, 4, 0, 0]} maxBarSize={50} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-white dark:bg-slate-900 ring-1 ring-slate-200 dark:ring-slate-800 rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-6 flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-500" /> Top Contributors
            </h3>
            <div className="flex flex-col gap-3">
              {top_contributors.length > 0 ? top_contributors.map((contributor: string, i: number) => (
                <div key={i} className="flex items-center gap-4 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm text-white ${['bg-indigo-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500', 'bg-purple-500'][i % 5]}`}>
                    {contributor.charAt(0).toUpperCase()}
                  </div>
                  <span className="font-medium text-slate-700 text-sm">{contributor}</span>
                </div>
              )) : <div className="text-center py-6 text-sm text-slate-500">No contributors found.</div>}
            </div>
            {top_contributors && top_contributors.length > 0 && (
              <div className="h-48 mt-6">
                 <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={contribData} cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={5} dataKey="value" stroke="none">
                      {contribData.map((_: any, index: number) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}/>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>
        
      </div>
      <div className="bg-white dark:bg-slate-900 ring-1 ring-slate-200 dark:ring-slate-800 rounded-2xl overflow-hidden shadow-sm mt-8">
            <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Recent Commits</h3>
              <span className="text-xs font-medium text-slate-400">Last 10 commits</span>
            </div>
            <ul className="divide-y divide-slate-100 dark:divide-slate-800 max-h-[300px] overflow-y-auto custom-scrollbar">
              {recent_commits.map((commit: any, idx: number) => (
                <li key={idx} className="px-6 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-300 line-clamp-1">{commit.title}</p>
                      <p className="text-xs text-slate-500 mt-1">{new Date(commit.date).toLocaleDateString()}</p>
                    </div>
                    <span className="font-mono text-xs text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md">{commit.id}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>

      {/* New Row for MRs and Issues */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        <div className="bg-white dark:bg-slate-900 ring-1 ring-slate-200 dark:ring-slate-800 rounded-2xl overflow-hidden shadow-sm flex flex-col">
          <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/20">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <GitPullRequest className="w-5 h-5 text-indigo-500" /> Open Merge Requests
            </h3>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400">
              {open_merge_requests?.length || 0} Open
            </span>
          </div>
          <div className="flex-1 p-4 bg-slate-50/30 dark:bg-slate-900/10">
            <ul className="flex flex-col gap-3 max-h-[350px] overflow-y-auto custom-scrollbar pr-2">
              {open_merge_requests?.length > 0 ? open_merge_requests.map((mr: any, idx: number) => (
                <li key={idx} className="bg-white dark:bg-slate-900 p-4 rounded-xl ring-1 ring-slate-200 dark:ring-slate-700 shadow-sm hover:shadow-md hover:ring-indigo-200 dark:hover:ring-indigo-500/30 transition-all group cursor-default">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                      <GitPullRequest className="w-4 h-4 text-slate-400 group-hover:text-indigo-500 transition-colors" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-800 dark:text-slate-200 mb-1 leading-snug group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2">{mr.title}</p>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <span className="font-mono text-[10px] font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-500/10 dark:text-indigo-400 px-1.5 py-0.5 rounded">!{mr.id}</span>
                        <span>•</span>
                        <span>Updated {new Date(mr.updated_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </li>
              )) : <div className="p-8 text-center text-sm text-slate-500 flex flex-col items-center gap-2"><GitPullRequest className="w-8 h-8 text-slate-300 dark:text-slate-700 mx-auto" /> No open merge requests.</div>}
            </ul>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 ring-1 ring-slate-200 dark:ring-slate-800 rounded-2xl overflow-hidden shadow-sm flex flex-col">
          <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/20">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <CircleDot className="w-5 h-5 text-amber-500" /> Open Issues
            </h3>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400">
              {open_issues?.length || 0} Open
            </span>
          </div>
          <div className="flex-1 p-4 bg-slate-50/30 dark:bg-slate-900/10">
            <ul className="flex flex-col gap-3 max-h-[350px] overflow-y-auto custom-scrollbar pr-2">
              {open_issues?.length > 0 ? open_issues.map((iss: any, idx: number) => (
                <li key={idx} className="bg-white dark:bg-slate-900 p-4 rounded-xl ring-1 ring-slate-200 dark:ring-slate-700 shadow-sm hover:shadow-md hover:ring-amber-200 dark:hover:ring-amber-500/30 transition-all group cursor-default">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                      <CircleDot className="w-4 h-4 text-slate-400 group-hover:text-amber-500 transition-colors" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-800 dark:text-slate-200 mb-1 leading-snug group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors line-clamp-2">{iss.title}</p>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <span className="font-mono text-[10px] font-bold text-amber-600 bg-amber-50 dark:bg-amber-500/10 dark:text-amber-400 px-1.5 py-0.5 rounded">#{iss.id}</span>
                        <span>•</span>
                        <span>Updated {new Date(iss.updated_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </li>
              )) : <div className="p-8 text-center text-sm text-slate-500 flex flex-col items-center gap-2"><CircleDot className="w-8 h-8 text-slate-300 dark:text-slate-700 mx-auto" /> No open issues.</div>}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// MIGRATED DETAILS PORTION (Post-Migration)
// ----------------------------------------------------------------------
function MigratedDetails({ gitlab, github }: { gitlab: any, github: any }) {
  const gitlabTotalCommits = gitlab.stats.total_commits || 1; 
  const githubTotalCommits = github.stats.total_commits || 0; 
  const commitLossRate = 100 - ((githubTotalCommits / gitlabTotalCommits) * 100);

  const gitlabContribs = gitlab.stats.contributors || 0;
  const githubContribs = github.stats.contributors_count || 0;
  const contribLoss = gitlabContribs - githubContribs;

  const gitlabBranches = gitlab.stats.branches_count || 0;
  const githubBranches = github.stats.branches_count || 0;
  const branchDelta = gitlabBranches - githubBranches;

  const gitlabIssues = gitlab.stats.open_issues_count || 0;
  const githubIssues = github.stats.open_issues_count || 0;
  const issuesDelta = gitlabIssues - githubIssues;

  const gitlabMRs = gitlab.stats.open_merge_requests_count || 0;
  const githubPRs = github.stats.open_prs_count || 0;
  const prsDelta = gitlabMRs - githubPRs;

  const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899", "#64748b"];

  const languageData = github.languages ? Object.entries(github.languages).map(([name, value]) => ({ name, value })) : [];

  return (
    <div className="p-8 max-w-7xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <Link to="/repositories/migrated" className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-emerald-600 transition-colors mb-4">
          <ArrowLeft className="w-4 h-4" /> Back to Migrated Repositories
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-teal-500 mb-2">
               Post-Migration Insights: {github.metadata.name.split("/").pop()}
            </h1>
            <p className="flex items-center gap-2 text-slate-500">
              <a href={github.metadata.url} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:underline hover:text-emerald-600 font-mono text-sm">
                <Terminal className="w-4 h-4" /> {github.metadata.url}
              </a>
              <span className="px-2 py-0.5 rounded text-xs font-semibold bg-emerald-50 text-emerald-700 uppercase tracking-wider">
                MIGRATED
              </span>
            </p>
          </div>
          <div className="flex gap-4">
            <StatSmall icon={<Terminal/>} label="Stars" value={github.stats.stars} />
            <StatSmall icon={<GitBranch/>} label="Forks" value={github.stats.forks} />
            <StatSmall icon={<AlertTriangle/>} label="Issues" value={github.stats.open_issues_count} />
          </div>
        </div>
      </div>

      {/* Migration Success Rate Row */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <div className="lg:col-span-1 bg-white dark:bg-slate-900 rounded-2xl p-5 ring-1 ring-slate-200 dark:ring-slate-800 shadow-sm flex flex-col justify-between">
          <h3 className="text-slate-500 font-medium mb-1 text-sm flex items-center gap-1.5">
            <GitCommitHorizontal className="w-4 h-4" /> Commits Loss
          </h3>
          <div className="flex items-baseline gap-2 mt-2">
            <span className={`text-2xl font-black ${commitLossRate > 5 ? 'text-rose-500' : 'text-emerald-500'}`}>
              {commitLossRate.toFixed(1)}%
            </span>
            <div className="flex flex-col text-[10px] text-slate-400 font-medium ml-auto text-right">
              <span className="line-through">{gitlabTotalCommits} src</span>
              <span className="text-slate-600 dark:text-slate-300">{githubTotalCommits} dest</span>
            </div>
          </div>
        </div>
        
        <div className="lg:col-span-1 bg-white dark:bg-slate-900 rounded-2xl p-5 ring-1 ring-slate-200 dark:ring-slate-800 shadow-sm flex flex-col justify-between">
          <h3 className="text-slate-500 font-medium mb-1 text-sm flex items-center gap-1.5">
            <Users className="w-4 h-4" /> Contrib Delta
          </h3>
          <div className="flex items-baseline gap-2 mt-2">
            <span className={`text-2xl font-black ${contribLoss > 0 ? 'text-amber-500' : 'text-emerald-500'}`}>
              {contribLoss > 0 ? `-${contribLoss}` : '0'}
            </span>
            <div className="flex flex-col text-[10px] text-slate-400 font-medium ml-auto text-right">
              <span className="line-through">{gitlabContribs} src</span>
              <span className="text-slate-600 dark:text-slate-300">{githubContribs} dest</span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1 bg-white dark:bg-slate-900 rounded-2xl p-5 ring-1 ring-slate-200 dark:ring-slate-800 shadow-sm flex flex-col justify-between">
          <h3 className="text-slate-500 font-medium mb-1 text-sm flex items-center gap-1.5">
            <GitBranch className="w-4 h-4" /> Branches Delta
          </h3>
          <div className="flex items-baseline gap-2 mt-2">
            <span className={`text-2xl font-black ${branchDelta > 0 ? 'text-amber-500' : 'text-emerald-500'}`}>
              {branchDelta > 0 ? `-${branchDelta}` : '0'}
            </span>
            <div className="flex flex-col text-[10px] text-slate-400 font-medium ml-auto text-right">
              <span className="line-through">{gitlabBranches} src</span>
              <span className="text-slate-600 dark:text-slate-300">{githubBranches} dest</span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1 bg-white dark:bg-slate-900 rounded-2xl p-5 ring-1 ring-slate-200 dark:ring-slate-800 shadow-sm flex flex-col justify-between">
          <h3 className="text-slate-500 font-medium mb-1 text-sm flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4" /> Issues Delta
          </h3>
          <div className="flex items-baseline gap-2 mt-2">
            <span className={`text-2xl font-black ${issuesDelta > 0 ? 'text-amber-500' : 'text-emerald-500'}`}>
              {issuesDelta > 0 ? `-${issuesDelta}` : '0'}
            </span>
            <div className="flex flex-col text-[10px] text-slate-400 font-medium ml-auto text-right">
              <span className="line-through">{gitlabIssues} src</span>
              <span className="text-slate-600 dark:text-slate-300">{githubIssues} dest</span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1 bg-white dark:bg-slate-900 rounded-2xl p-5 ring-1 ring-slate-200 dark:ring-slate-800 shadow-sm flex flex-col justify-between">
          <h3 className="text-slate-500 font-medium mb-1 text-sm flex items-center gap-1.5">
            <GitBranch className="w-4 h-4" /> MRs/PRs Delta
          </h3>
          <div className="flex items-baseline gap-2 mt-2">
            <span className={`text-2xl font-black ${prsDelta > 0 ? 'text-amber-500' : 'text-emerald-500'}`}>
              {prsDelta > 0 ? `-${prsDelta}` : '0'}
            </span>
            <div className="flex flex-col text-[10px] text-slate-400 font-medium ml-auto text-right">
              <span className="line-through">{gitlabMRs} src</span>
              <span className="text-slate-600 dark:text-slate-300">{githubPRs} dest</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
           <div className="bg-white dark:bg-slate-900 ring-1 ring-slate-200 dark:ring-slate-800 rounded-2xl overflow-hidden shadow-sm">
            <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-[#161B22]">
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <Terminal className="w-5 h-5 text-slate-700 dark:text-slate-300" /> Post-Migration Commits (GitHub)
              </h3>
            </div>
            <ul className="divide-y divide-slate-100 dark:divide-slate-800 max-h-[300px] overflow-y-auto custom-scrollbar">
              {github.recent_commits.map((commit: any, idx: number) => (
                <li key={idx} className="px-6 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-300 line-clamp-1">{commit.message}</p>
                      <p className="text-xs text-slate-500 mt-1">{new Date(commit.date).toLocaleString()}</p>
                    </div>
                    <span className="font-mono text-xs text-slate-900 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md">{commit.sha}</span>
                  </div>
                </li>
              ))}
              {github.recent_commits.length === 0 && (
                <div className="p-8 text-center text-slate-500">No commits found.</div>
              )}
            </ul>
          </div>
        </div>
        
        {/* Sidebar */}
        <div className="space-y-8">
          <div className="bg-white dark:bg-slate-900 ring-1 ring-slate-200 dark:ring-slate-800 rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-6 border-b border-slate-100 dark:border-slate-800 pb-4">
              Languages Used
            </h3>
            {languageData.length > 0 ? (
               <div className="h-48 mt-2 -ml-4">
                 <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={languageData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={2} dataKey="value" stroke="none" labelLine={false}>
                      {languageData.map((_: any, index: number) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                    </Pie>
                    <Tooltip 
                      formatter={(value: any) => `${value}%`} 
                      contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} 
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="text-center py-6 text-sm text-slate-500">No language data retrieved.</div>
            )}
            
            <div className="mt-6 flex flex-col gap-2">
               {languageData.map((lang: any, index: number) => (
                 <div key={lang.name} className="flex items-center justify-between text-sm">
                   <div className="flex items-center gap-2">
                     <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                     <span className="text-slate-700 dark:text-slate-300">{lang.name}</span>
                   </div>
                   <span className="font-semibold text-slate-600 dark:text-slate-400">{lang.value}%</span>
                 </div>
               ))}
            </div>
          </div>
        </div>
        
      </div>
      {/* New Grid for Issues and PRs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
            <div className="bg-white dark:bg-slate-900 ring-1 ring-slate-200 dark:ring-slate-800 rounded-2xl overflow-hidden shadow-sm flex flex-col">
              <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/20">
                <h3 className="text-md font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                  <CircleDot className="w-4 h-4 text-amber-500" /> Open Issues (GH)
                </h3>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400">
                  {github.open_issues_list?.length || 0} Open
                </span>
              </div>
              <div className="flex-1 p-4 bg-slate-50/30 dark:bg-slate-900/10">
                <ul className="flex flex-col gap-3 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                  {github.open_issues_list?.length > 0 ? github.open_issues_list.map((iss: string, idx: number) => (
                    <li key={idx} className="bg-white dark:bg-slate-900 p-3.5 rounded-xl ring-1 ring-slate-200 dark:ring-slate-700 shadow-sm hover:shadow-md hover:ring-amber-200 dark:hover:ring-amber-500/30 transition-all group cursor-default">
                      <div className="flex items-start gap-2">
                        <CircleDot className="w-3.5 h-3.5 text-slate-300 group-hover:text-amber-500 transition-colors shrink-0 mt-0.5" />
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-300 leading-snug group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors line-clamp-2">{iss}</p>
                      </div>
                    </li>
                  )) : <div className="p-8 text-center text-sm text-slate-500 flex flex-col items-center gap-2"><CircleDot className="w-6 h-6 text-slate-200 dark:text-slate-700 mx-auto" /> No open issues.</div>}
                </ul>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 ring-1 ring-slate-200 dark:ring-slate-800 rounded-2xl overflow-hidden shadow-sm flex flex-col">
              <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/20">
                <h3 className="text-md font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                  <GitPullRequest className="w-4 h-4 text-emerald-500" /> Open PRs (GH)
                </h3>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                  {github.open_prs_list?.length || 0} Open
                </span>
              </div>
              <div className="flex-1 p-4 bg-slate-50/30 dark:bg-slate-900/10">
                <ul className="flex flex-col gap-3 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                  {github.open_prs_list?.length > 0 ? github.open_prs_list.map((pr: string, idx: number) => (
                    <li key={idx} className="bg-white dark:bg-slate-900 p-3.5 rounded-xl ring-1 ring-slate-200 dark:ring-slate-700 shadow-sm hover:shadow-md hover:ring-emerald-200 dark:hover:ring-emerald-500/30 transition-all group cursor-default">
                      <div className="flex items-start gap-2">
                        <GitPullRequest className="w-3.5 h-3.5 text-slate-300 group-hover:text-emerald-500 transition-colors shrink-0 mt-0.5" />
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-300 leading-snug group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-2">{pr}</p>
                      </div>
                    </li>
                  )) : <div className="p-8 text-center text-sm text-slate-500 flex flex-col items-center gap-2"><GitPullRequest className="w-6 h-6 text-slate-200 dark:text-slate-700 mx-auto" /> No open PRs.</div>}
                </ul>
              </div>
            </div>
          </div>
    </div>
  );
}

function StatSmall({ icon, label, value }: { icon: React.ReactNode, label: string, value: string | number }) {
  return (
    <div className="text-center border-l first:border-0 border-slate-200 dark:border-slate-700 pl-4 first:pl-0">
      <div className="flex items-center justify-center gap-1 text-slate-400 mb-1">
        <span className="opacity-70">{icon}</span>
      </div>
      <div className="text-xs font-semibold text-slate-500 uppercase tracking-widest">{label}</div>
      <div className="text-lg font-bold text-slate-800 dark:text-slate-200">{value}</div>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode, label: string, value: string | number }) {
  return (
    <div className="bg-white dark:bg-slate-900 ring-1 ring-slate-200 dark:ring-slate-800 rounded-2xl p-5 flex items-center gap-4 shadow-sm">
      <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div>
        <p className="text-slate-500 text-sm font-medium">{label}</p>
        <p className="text-2xl font-bold text-slate-800 dark:text-slate-200">{value}</p>
      </div>
    </div>
  );
}
