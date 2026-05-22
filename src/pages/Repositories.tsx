import { useState, useEffect } from "react";
import { DataTable } from "../components/DataTable";
import { TableSkeleton } from "../components/Skeletons";
import type { Column } from "../components/DataTable";
import { ExternalLink, Eye, ArrowRightCircle, RefreshCw, Send, Terminal, GitBranch, Shield } from "lucide-react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import { useAuth } from "../providers/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

interface Repo {
  id: string;
  name: string;
  status: string;
  user: string;
  is_migrated: boolean;
  created_at: string;
  link: string;
  migration_date?: string;
}

const getSharedColumns = (): Column<Repo>[] => [
  { 
    header: "Repository Name", 
    accessorKey: "name", 
    cell: (row) => (
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-indigo-500/5 dark:bg-indigo-500/10 flex items-center justify-center border border-indigo-500/10">
          <GitBranch className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
        </div>
        <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{row.name}</span>
      </div>
    ) 
  },
  { 
    header: "Created At", 
    accessorKey: "created_at", 
    cell: (row) => (
      <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 font-mono text-xs">
        <span>{row.created_at}</span>
      </div>
    )
  },
  { 
    header: "Link", 
    accessorKey: "link", 
    cell: (row) => (
      <a href={row.link} target="_blank" rel="noreferrer" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 flex items-center gap-1.5 transition-all font-semibold text-sm group">
        <ExternalLink className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
        <span className="hover:underline underline-offset-4 tracking-tight">Source</span>
      </a>
    )
  }
];

const migratedColumns: Column<Repo>[] = [
  ...getSharedColumns(),
  { 
    header: "Migration Date", 
    accessorKey: "migration_date", 
    cell: (row) => (
      <div className="flex items-center gap-2 px-2 py-1 rounded-full bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/10 w-fit">
        <Shield className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
        <span className="text-emerald-700 dark:text-emerald-400 text-[11px] font-bold uppercase tracking-wider">{row.migration_date}</span>
      </div>
    )
  },
  { 
    header: "Actions", 
    accessorKey: "id", 
    cell: (row) => (
      <div className="flex items-center gap-2">
        <Link to={`/app/repositories/details/${row.id}`} className="flex items-center gap-2 px-4 py-1.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 bg-white dark:bg-white/5 hover:bg-slate-50 dark:hover:bg-white/10 transition-all border border-slate-200 dark:border-white/10 shadow-sm active:scale-95">
          <Eye className="w-3.5 h-3.5" />
          Details
        </Link>
      </div>
    )
  }
];

export function RepositoriesPage({ type }: { type: "migrated" | "waiting" }) {
  const { user } = useAuth();
  const hasRepoPermission = user?.permissions?.includes("repositories") ?? false;

  const [selectedIds, setSelectedIds] = useState<(string | number)[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<Repo[]>([]);
  
  // Modal State
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [migrationLogs, setMigrationLogs] = useState("");

  const fetchRepositories = async () => {
    try {
      const res = await fetch(`/api/repositories/?type=${type}`);
      const json = await res.json();
      if (!res.ok) {
        toast.error("Fetch Error: " + (json.error || "Unknown"));
      }
      if(json.repositories) {
        setData(json.repositories);
      }
    } catch(err: any) {
      console.error(err);
      toast.error("Network Error: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  const syncRepositories = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/repositories/sync/', { method: 'POST' });
      const json = await res.json();
      if (!res.ok) {
        toast.error("Sync Error: " + (json.error || "Failed to trigger sync"));
      }
      await fetchRepositories();
    } catch(err: any) {
      console.error("Failed to sync repositories:", err);
      toast.error("Network Error: " + err.message);
      setIsLoading(false);
    }
  };

  const handleMigrate = async (idsToMigrate: (string | number)[]) => {
    if (!idsToMigrate.length) return;
    setIsLoading(true);
    setIsLogModalOpen(true);
    setMigrationLogs("Initializing secure migration sequence...\nConnecting to backend...\n");
    
    try {
      const res = await fetch('/api/repositories/migrate/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repo_ids: idsToMigrate })
      });
      
      if (!res.ok) {
        toast.error("Failed to sequence migration");
        setIsLoading(false);
        return;
      }
      
      if (!res.body) {
         toast.error("Stream reader not supported by HTTP browser");
         return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder("utf-8");
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const textChunk = decoder.decode(value);
        setMigrationLogs((prev: string) => prev + textChunk);
      }
      
      toast.success("Migration process complete!");
      setSelectedIds([]);
      await fetchRepositories();
    } catch(err: any) {
      console.error("Failed to migrate:", err);
      toast.error("Migration Network Error: " + err.message);
      setMigrationLogs((prev: string) => prev + `\n\n[FATAL] Local Network Exception: ${err.message}`);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    syncRepositories();
  }, [type]);

  const waitingColumns: Column<Repo>[] = [
    ...getSharedColumns(),
    { header: "Actions", accessorKey: "id", cell: (row) => (
      <div className="flex items-center gap-3">
        <Link to={`/app/repositories/details/${row.id}`} className="flex items-center gap-2 px-4 py-1.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 bg-white dark:bg-white/5 hover:bg-slate-50 dark:hover:bg-white/10 transition-all border border-slate-200 dark:border-white/10 shadow-sm active:scale-95">
          <Eye className="w-3.5 h-3.5" />
          Details
        </Link>
        {hasRepoPermission && (
          <button 
            onClick={() => handleMigrate([row.id])}
            className="group flex items-center gap-2 px-4 py-1.5 rounded-xl text-xs font-black text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 transition-all active:scale-95 uppercase tracking-wider"
          >
            <ArrowRightCircle className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
            Migrate
          </button>
        )}
      </div>
    )}
  ];

  const columns = type === "migrated" ? migratedColumns : waitingColumns;
  
  return (
    <div className="p-4 sm:p-6 lg:p-10 max-w-7xl mx-auto w-full transition-all duration-500">
      <div className="mb-10 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl sm:text-4xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-br from-slate-900 to-slate-500 dark:from-white dark:to-slate-500 mb-2">
            {type === "migrated" ? "Migrated Repositories" : "Waiting Repositories"}
          </h1>
          <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 font-medium tracking-tight">
            Manage your {type === "migrated" ? "successfully migrated" : "pending"} source code repositories.
          </p>
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto overflow-x-auto sm:overflow-visible pb-2 sm:pb-0">
          {selectedIds.length > 0 && hasRepoPermission && (
            <button 
              onClick={() => handleMigrate(selectedIds)}
              className="flex items-center gap-2 px-5 py-3 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-[0.1em] shadow-xl shadow-indigo-500/30 hover:bg-indigo-700 transition-all active:scale-95 group animate-in fade-in slide-in-from-right-4 whitespace-nowrap"
            >
              <Send className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              Migrate Selected ({selectedIds.length})
            </button>
          )}
          {hasRepoPermission && (
            <button 
              onClick={syncRepositories}
              className="flex items-center gap-2 px-5 py-3 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 rounded-2xl font-black text-xs uppercase tracking-[0.1em] shadow-sm transition-all active:scale-95 whitespace-nowrap"
            >
              <RefreshCw className={`w-4 h-4 text-indigo-500 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh Node
            </button>
          )}
        </div>
      </div>
      
      <div className="relative group">
        {/* Decorative elements behind the table */}
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
                    <h3 className="text-white font-black text-lg tracking-tight uppercase tracking-[0.1em]">Migration Console</h3>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Real-time Telemetry Stream</p>
                  </div>
                </div>
                {!isLoading && (
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
                {isLoading && (
                  <div className="flex gap-2 mt-4 items-center">
                    <span className="animate-pulse w-2 h-5 bg-emerald-500/80 inline-block shadow-[0_0_10px_rgba(52,211,153,0.5)]"></span>
                    <span className="text-emerald-500/40 text-xs font-black uppercase tracking-widest animate-pulse">Establishing Bridge...</span>
                  </div>
                )}
              </div>
              
              {!isLoading && (
                 <div className="px-8 py-6 border-t border-white/5 bg-[#080812]/50 flex justify-end">
                   <button 
                     onClick={() => setIsLogModalOpen(false)}
                     className="px-8 py-3 bg-white text-black font-black rounded-2xl hover:bg-slate-200 transition-all active:scale-95 uppercase text-xs tracking-widest shadow-xl shadow-white/5"
                   >
                     Close Console
                   </button>
                 </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
