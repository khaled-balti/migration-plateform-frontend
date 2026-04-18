import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { 
  ArrowLeft, 
  History as HistoryIcon, 
  Code2, 
  Terminal, 
  ExternalLink, 
  CheckCircle2, 
  XCircle, 
  Clock,
  Calendar,
  Layout,
  AlertCircle
} from "lucide-react";
import toast from "react-hot-toast";

import { PipelineDetailSkeleton } from "../components/Skeletons";

export function PipelineDetails() {
  const { id } = useParams<{ id: string }>();
  const [details, setDetails] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"history" | "source" | "logs">("history");

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
        <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="w-8 h-8 text-rose-500" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200">Pipeline Not Found</h2>
        <p className="text-slate-500 mt-2 max-w-md mx-auto">{error || "The pipeline you're looking for might have been deleted or doesn't exist."}</p>
        <Link 
          to="/pipelines" 
          className="mt-8 inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-all shadow-lg shadow-indigo-200"
        >
          <ArrowLeft className="w-4 h-4" /> Go Back to Pipelines
        </Link>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header Section */}
      <div className="mb-8">
        <Link 
          to={details.is_migrated ? "/pipelines/migrated" : "/pipelines/waiting"} 
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors mb-6 group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" /> 
          Back to {details.is_migrated ? "Migrated" : "Waiting"} Pipelines
        </Link>
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border ${
              details.is_migrated 
                ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20" 
                : "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-500/20"
            }`}>
              <Layout className="w-6 h-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-3 mb-1">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                  {details.name}
                </h1>
                <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                  details.is_migrated 
                    ? "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300" 
                    : "bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300"
                }`}>
                  {details.is_migrated ? "Migrated" : "Legacy"}
                </span>
              </div>
              <p className="text-slate-500 dark:text-slate-400 flex items-center gap-2 text-sm mt-1">
                <Terminal className="w-4 h-4" />
                Pipeline ID: <span className="font-mono bg-slate-100 dark:bg-[#111] px-2 py-0.5 rounded border border-slate-200 dark:border-[#333]">{details.id}</span>
              </p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="glass-panel p-4 rounded-2xl flex flex-row sm:flex-col items-center justify-between sm:justify-center min-w-[120px]">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest sm:mb-1.5">Status</span>
              <span className={`text-lg font-bold flex items-center gap-1.5 ${
                details.status === "Success" || details.status === "SUCCESS" ? "text-emerald-500" : "text-rose-500"
              }`}>
                {details.status === "Success" || details.status === "SUCCESS" ? <CheckCircle2 className="w-5 h-5 drop-shadow-sm" /> : <XCircle className="w-5 h-5 drop-shadow-sm" />}
                {details.status}
              </span>
            </div>
            {details.migration_date && (
              <div className="glass-panel p-4 rounded-2xl flex flex-row sm:flex-col items-center justify-between sm:justify-center min-w-[120px]">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest sm:mb-1.5">Migrated On</span>
                <span className="text-lg font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Calendar className="w-5 h-5 text-indigo-500 drop-shadow-sm" />
                  {new Date(details.migration_date).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Switch Style Navigation */}
      <div className="flex items-center justify-center mb-10">
        <div className="relative flex items-center bg-slate-100 dark:bg-[#111] p-1 rounded-full w-full max-w-[400px] border border-slate-200 dark:border-white/5 shadow-inner">
          {/* Sliding Background */}
          <div 
            className={`absolute h-[calc(100%-8px)] transition-all duration-300 ease-out bg-white dark:bg-slate-800 shadow-md rounded-full ${
              activeTab === "history" ? "w-[calc(50%-4px)] left-1" : "w-[calc(50%-4px)] left-[calc(50%)]"
            }`}
          />
          
          <button
            onClick={() => setActiveTab("history")}
            className={`flex-1 relative z-10 py-2.5 text-sm font-bold transition-colors duration-200 flex items-center justify-center gap-2 ${
              activeTab === "history" ? "text-indigo-600 dark:text-indigo-400" : "text-slate-500 dark:text-slate-400 hover:text-slate-700"
            }`}
          >
            <HistoryIcon className="w-4 h-4" />
            Build History
          </button>
          
          <button
            onClick={() => setActiveTab("source")}
            className={`flex-1 relative z-10 py-2.5 text-sm font-bold transition-colors duration-200 flex items-center justify-center gap-2 ${
              activeTab === "source" ? "text-indigo-600 dark:text-indigo-400" : "text-slate-500 dark:text-slate-400 hover:text-slate-700"
            }`}
          >
            <Code2 className="w-4 h-4" />
            Source Code
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="glass-panel rounded-2xl overflow-hidden min-h-[400px]">
        {activeTab === "history" ? (
          <div className="p-0">
            <div className="px-6 py-5 flex justify-between items-center bg-slate-50/50 dark:bg-white/[0.02] border-b border-slate-200 dark:border-white/5">
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <HistoryIcon className="w-5 h-5 text-indigo-500 drop-shadow-sm" />
                Recent {details.is_migrated ? "GitHub Workflow Runs" : "Jenkins Build History"}
              </h3>
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-200/50 dark:bg-white/5 px-2 py-1 rounded-md border border-slate-200/50 dark:border-white/5">Last 10 executions</span>
            </div>
            <div className="p-6">
              <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-white/10 shadow-sm">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-white/[0.02]">
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest border-b border-slate-200 dark:border-white/10">Number</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest border-b border-slate-200 dark:border-white/10">Status</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest border-b border-slate-200 dark:border-white/10">Timestamp</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest border-b border-slate-200 dark:border-white/10">Duration</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest border-b border-slate-200 dark:border-white/10 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                  {details.history.length > 0 ? details.history.map((build: any, i: number) => (
                    <tr key={i} className="hover:bg-slate-50/80 dark:hover:bg-white/5 transition-colors duration-200 group">
                      <td className="px-6 py-5 text-sm font-black text-slate-700 dark:text-slate-300">#{build.number}</td>
                      <td className="px-6 py-5">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold shadow-sm ${
                          build.status === "SUCCESS" || build.status === "success" || build.status === "completed" 
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 ring-1 ring-emerald-500/20" 
                            : build.status === "FAILURE" || build.status === "failure" 
                              ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 ring-1 ring-rose-500/20"
                              : "bg-amber-500/10 text-amber-600 dark:text-amber-400 ring-1 ring-amber-500/20"
                        }`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${
                             build.status === "SUCCESS" || build.status === "success" || build.status === "completed" 
                             ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" 
                             : build.status === "FAILURE" || build.status === "failure" 
                               ? "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)]"
                               : "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)]"
                          }`} />
                          {build.status || "Unknown"}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 font-medium">
                          <Clock className="w-4 h-4 text-slate-400" />
                          {build.timestamp}
                        </div>
                      </td>
                      <td className="px-6 py-5 text-sm font-medium text-slate-500 dark:text-slate-400">{build.duration}</td>
                      <td className="px-6 py-5 text-right">
                        <a 
                          href={`${build.url}/console`} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-500 hover:text-indigo-400 transition-all bg-indigo-500/10 px-3 py-1.5 rounded-lg border border-indigo-500/20"
                        >
                          View Logs <ExternalLink className="w-3 h-3" />
                        </a>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-20 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <HistoryIcon className="w-12 h-12 text-slate-200" />
                          <p className="text-slate-500 font-medium">No build history available yet.</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
          <div className="p-0 flex flex-col h-full min-h-[500px]">
            <div className="px-6 py-5 border-b border-white/5 flex justify-between items-center bg-slate-900/60 backdrop-blur-md">
              <h3 className="text-lg font-bold text-slate-200 flex items-center gap-2">
                <Code2 className="w-5 h-5 text-indigo-400 drop-shadow-sm" />
                {details.is_migrated ? "GitHub Action YAML" : "Jenkinsfile Source"}
              </h3>
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(details.source_code);
                  toast.success("Code copied to clipboard!");
                }}
                className="text-xs font-bold text-indigo-400 hover:text-indigo-300 hover:bg-white/5 px-3 py-1.5 rounded-lg transition-colors border border-white/10"
              >
                Copy Code
              </button>
            </div>
            <div className="flex-1 bg-slate-950 p-6 overflow-auto custom-scrollbar font-mono text-sm leading-relaxed">
              <pre className="text-emerald-400/90 drop-shadow-sm selection:bg-indigo-500/30">
                <code className="block whitespace-pre-wrap">
                  {details.source_code}
                </code>
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
