import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { DataTable } from "../components/DataTable";
import { TableSkeleton } from "../components/Skeletons";
import type { Column } from "../components/DataTable";
import { PlayCircle, ExternalLink, Eye, ArrowRightCircle, Send, RefreshCw, Loader2, Terminal, Cpu, Activity } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../providers/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

interface Pipeline {
  id: string;
  name: string;
  status: string;
  user: string;
  is_migrated: boolean;
  buildable: boolean;
  created_at: string;
  link: string;
  migration_date?: string;
}

export function PipelinesPage({ type }: { type: "migrated" | "waiting" }) {
  const { user } = useAuth();
  const hasPipelinePermission = user?.permissions?.includes("pipelines") ?? false;

  const [selectedIds, setSelectedIds] = useState<(string | number)[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMigrating, setIsMigrating] = useState<string | null>(null);
  const [data, setData] = useState<Pipeline[]>([]);
  const navigate = useNavigate();

  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [migrationLogs, setMigrationLogs] = useState("");
  const [migratedResult, setMigratedResult] = useState<any>(null);
  const [currentPipeline, setCurrentPipeline] = useState<Pipeline | null>(null);

  const handleMigrate = async (pipeline: Pipeline) => {
    setCurrentPipeline(pipeline);
    setIsMigrating(pipeline.id);
    setIsLogModalOpen(true);
    setMigrationLogs(`🚀 Initializing secure dry-run for: ${pipeline.name}\nEstablishing connection to backend stream...\n`);
    
    try {
      const res = await fetch("/api/pipelines/dry-run/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: pipeline.id }),
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        const errorMsg = errorData.details || errorData.error || "Failed to initialize dry-run stream";
        toast.error(errorMsg, { duration: 6000 });
        setIsLogModalOpen(false);
        setIsMigrating(null);
        return;
      }

      const reader = res.body?.getReader();
      if (!reader) {
        toast.error("Stream reader not supported");
        setIsLogModalOpen(false);
        setIsMigrating(null);
        return;
      }

      const decoder = new TextDecoder("utf-8");
      let fullResult: any = null;
      let resultBuffer = "";
      let foundResultTag = false;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        
        if (foundResultTag) {
          resultBuffer += chunk;
        } else if (chunk.includes("__result__:")) {
          const parts = chunk.split("__result__:");
          setMigrationLogs((prev) => prev + parts[0]);
          resultBuffer = parts[1];
          foundResultTag = true;
        } else {
          setMigrationLogs((prev) => prev + chunk);
        }
      }

      setIsMigrating(null); // Mark as done processing but modal stays open

      if (foundResultTag) {
        try {
          fullResult = JSON.parse(resultBuffer);
          if (fullResult?.success) {
            setMigratedResult(fullResult);
            toast.success("Dry-run complete! Ready for review.");
            // We auto-navigate after a delay
            setTimeout(() => {
               navigate(`/app/pipelines/approve/${pipeline.id}`, { 
                 state: { yaml: fullResult.yaml, pipelineName: pipeline.name } 
               });
            }, 4000);
          }
        } catch (e) {
          console.error("Failed to parse result JSON", e, resultBuffer);
          toast.error("Failed to parse dry-run result");
        }
      } else {
        toast.error("Dry-run did not produce a result.");
      }
    } catch (err) {
      toast.error("Network error during dry-run");
      setIsMigrating(null);
    }
  };

  const handleMigrateAll = async () => {
    if (selectedIds.length === 0) return;
    
    setIsLogModalOpen(true);
    setIsMigrating("batch");
    setMigrationLogs(`🚀 Starting batch migration for ${selectedIds.length} pipelines...\nEstablishing stream...\n`);
    
    try {
      const res = await fetch("/api/pipelines/migrate-all/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedIds }),
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        toast.error(errorData.error || "Batch migration failed");
        setIsLogModalOpen(false);
        setIsMigrating(null);
        return;
      }

      const reader = res.body?.getReader();
      if (!reader) {
        toast.error("Stream reader not supported");
        setIsLogModalOpen(false);
        setIsMigrating(null);
        return;
      }

      const decoder = new TextDecoder("utf-8");
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        if (chunk.includes("__result__:")) {
          const parts = chunk.split("__result__:");
          setMigrationLogs((prev) => prev + parts[0]);
        } else {
          setMigrationLogs((prev) => prev + chunk);
        }
      }

      setIsMigrating(null);
      setSelectedIds([]);
      toast.success("Batch migration process finished!");
      fetchPipelines();
    } catch (err) {
      toast.error("Network error during batch migration");
      setIsMigrating(null);
    }
  };

  const getSharedColumns = (): Column<Pipeline>[] => [
    { header: "Pipeline Name", accessorKey: "name", cell: (row) => (
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-indigo-500/5 dark:bg-indigo-500/10 flex items-center justify-center border border-indigo-500/10">
          <Cpu className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
        </div>
        <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{row.name}</span>
      </div>
    )},
    { header: "Status", accessorKey: "status", cell: (row) => {
      const isSuccess = row.status.toLowerCase().includes('success') || row.status.toLowerCase().includes('migrated');
      return (
        <div className={`flex items-center gap-2 px-2.5 py-1 rounded-full border text-[11px] font-black uppercase tracking-wider w-fit ${
          isSuccess 
            ? "bg-emerald-500/5 dark:bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400" 
            : "bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400"
        }`}>
          <Activity className="w-3 h-3" />
          {row.status}
        </div>
      );
    }},
    { header: "Created At", accessorKey: "created_at", cell: (row) => (
      <span className="text-slate-500 dark:text-slate-400 font-mono text-xs">
        {row.created_at}
      </span>
    )},
    { header: "Link", accessorKey: "link", cell: (row) => (
      <a href={row.link} target="_blank" rel="noreferrer" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 flex items-center gap-1.5 transition-all font-semibold text-sm group">
        <ExternalLink className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
        <span className="hover:underline underline-offset-4 tracking-tight">Source</span>
      </a>
    )}
  ];

  const columns: Column<Pipeline>[] = type === "migrated" ? [
    ...getSharedColumns(),
    { header: "Migration Date", accessorKey: "migration_date", cell: (row) => <span className="text-slate-600 dark:text-slate-300 text-sm font-bold">{row.migration_date}</span> },
    { header: "Actions", accessorKey: "id", cell: (row) => (
      <div className="flex items-center gap-2">
        <Link 
          to={`/app/pipelines/details/${row.id}`}
          className="flex items-center gap-2 px-4 py-1.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 bg-white dark:bg-white/5 hover:bg-slate-50 dark:hover:bg-white/10 transition-all border border-slate-200 dark:border-white/10 shadow-sm active:scale-95"
        >
          <Eye className="w-3.5 h-3.5" />
          Details
        </Link>
      </div>
    )}
  ] : [
    ...getSharedColumns(),
    { header: "Actions", accessorKey: "id", cell: (row) => (
      <div className="flex items-center gap-3">
        <Link 
          to={`/app/pipelines/details/${row.id}`}
          className="flex items-center gap-2 px-4 py-1.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 bg-white dark:bg-white/5 hover:bg-slate-50 dark:hover:bg-white/10 transition-all border border-slate-200 dark:border-white/10 shadow-sm active:scale-95"
        >
          <Eye className="w-3.5 h-3.5" />
          Details
        </Link>
        {hasPipelinePermission && (
          <button 
            onClick={() => handleMigrate(row)}
            disabled={!!isMigrating}
            className="group flex items-center gap-2 px-4 py-1.5 rounded-xl text-xs font-black text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 transition-all active:scale-95 uppercase tracking-wider disabled:opacity-50"
          >
            {isMigrating === row.id ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
            ) : (
              <ArrowRightCircle className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
            )}
            {isMigrating === row.id ? "Seeding..." : "Migrate"}
          </button>
        )}
      </div>
    )}
  ];
  
  const fetchPipelines = async () => {
    try {
      const res = await fetch(`/api/pipelines/?type=${type}`);
      const text = await res.text();
      let json;
      try {
        json = JSON.parse(text);
      } catch (e) {
        throw new Error("Invalid JSON response from server. Status: " + res.status);
      }
      
      if (!res.ok) {
        toast.error("Fetch Error: " + (json.error || "Unknown"));
      }
      if(json.pipelines) {
        setData(json.pipelines);
      }
    } catch(err: any) {
      console.error(err);
      toast.error("Network Error: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  const syncPipelines = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/pipelines/sync/', { method: 'POST' });
      const text = await res.text();
      let json;
      try {
        json = JSON.parse(text);
      } catch (e) {
        throw new Error("Invalid JSON response from server. Status: " + res.status);
      }

      if (!res.ok) {
        toast.error("Sync Error: " + (json.error || "Failed to trigger sync"));
      }
      await fetchPipelines();
    } catch(err: any) {
      console.error("Failed to sync pipelines:", err);
      toast.error("Network Error: " + err.message);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    syncPipelines();
  }, [type]);
  
  return (
    <div className="p-4 sm:p-6 lg:p-10 max-w-7xl mx-auto w-full transition-all duration-500">
      <div className="mb-10 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl sm:text-4xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-br from-slate-900 to-slate-500 dark:from-white dark:to-slate-500 mb-2">
            {type === "migrated" ? "Migrated Pipelines" : "Waiting Pipelines"}
          </h1>
          <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 font-medium tracking-tight">
            View and trigger your {type === "migrated" ? "active CI/CD" : "legacy pending"} pipelines.
          </p>
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto overflow-x-auto sm:overflow-visible pb-2 sm:pb-0">
          {selectedIds.length > 0 && hasPipelinePermission && (
            <button 
              onClick={handleMigrateAll}
              disabled={!!isMigrating}
              className="flex items-center gap-2 px-5 py-3 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-[0.1em] shadow-xl shadow-indigo-500/30 hover:bg-indigo-700 transition-all active:scale-95 group animate-in fade-in slide-in-from-right-4 disabled:opacity-50 whitespace-nowrap"
            >
              <Send className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              Migrate All ({selectedIds.length})
            </button>
          )}
          {hasPipelinePermission && (
            <button 
              onClick={syncPipelines}
              className="flex items-center gap-2 px-5 py-3 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 rounded-2xl font-black text-xs uppercase tracking-[0.1em] shadow-sm transition-all active:scale-95 whitespace-nowrap"
            >
              <RefreshCw className={`w-4 h-4 text-indigo-500 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh Node
            </button>
          )}
        </div>
      </div>
      
      <div className="relative group">
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-indigo-500/5 blur-[80px] rounded-full pointer-events-none" />
        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-purple-500/5 blur-[80px] rounded-full pointer-events-none" />

        <div className="bg-white/50 dark:bg-[#080812]/50 backdrop-blur-xl border border-slate-200/50 dark:border-white/5 rounded-3xl overflow-hidden shadow-2xl shadow-indigo-500/5">
          {isLoading && data.length === 0 ? (
            <TableSkeleton />
          ) : (
            <DataTable 
              columns={columns} 
              data={data} 
              enableSelection={type === "waiting"} 
              selectedIds={selectedIds}
              onSelectionChange={setSelectedIds}
              isLoading={isLoading}
            />
          )}
        </div>
      </div>

      {/* Streaming Log Modal Overlay */}
      <AnimatePresence>
        {isLogModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 backdrop-blur-md bg-slate-950/40 transition-all duration-300">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-[#050508] border border-white/10 w-full max-w-4xl rounded-[2rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)] flex flex-col max-h-[85vh] overflow-hidden"
            >
              <div className="flex items-center justify-between px-8 py-6 border-b border-white/5 bg-[#080812]/50">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                    <Terminal className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-black text-lg tracking-tight uppercase tracking-[0.1em]">Dry-Run Terminal</h3>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Synthetic Execution Trace</p>
                  </div>
                </div>
                {!isMigrating && (
                  <button 
                    onClick={() => setIsLogModalOpen(false)}
                    className="w-10 h-10 flex items-center justify-center rounded-2xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all active:scale-90"
                  >
                    &times;
                  </button>
                )}
              </div>
              
              <div className="p-8 overflow-y-auto flex-1 font-mono text-sm leading-relaxed whitespace-pre-wrap text-emerald-400/90 [text-shadow:0_0_20px_rgba(52,211,153,0.3)] custom-scrollbar">
                {migrationLogs}
                {isMigrating && (
                  <div className="flex gap-2 mt-4 items-center">
                    <span className="animate-pulse w-2 h-5 bg-emerald-500/80 inline-block shadow-[0_0_10px_rgba(52,211,153,0.5)]"></span>
                    <span className="text-emerald-500/40 text-xs font-black uppercase tracking-widest animate-pulse">Establishing Bridge...</span>
                  </div>
                )}
              </div>
              
              {!isMigrating && (
                 <div className="px-8 py-6 border-t border-white/5 bg-[#080812]/50 flex justify-end gap-4">
                   {migratedResult && currentPipeline ? (
                     <button 
                       onClick={() => navigate(`/app/pipelines/approve/${currentPipeline.id}`, { 
                         state: { yaml: migratedResult.yaml, pipelineName: currentPipeline.name } 
                       })}
                       className="px-8 py-3 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-700 transition-all active:scale-95 uppercase text-xs tracking-widest shadow-xl shadow-indigo-500/20 flex items-center gap-2"
                     >
                       <ArrowRightCircle className="w-4 h-4" />
                       Verify & Approve
                     </button>
                   ) : (
                     <button 
                       onClick={() => setIsLogModalOpen(false)}
                       className="px-8 py-3 bg-white text-black font-black rounded-2xl hover:bg-slate-200 transition-all active:scale-95 uppercase text-xs tracking-widest"
                     >
                       Close Console
                     </button>
                   )}
                 </div>
              )}

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
