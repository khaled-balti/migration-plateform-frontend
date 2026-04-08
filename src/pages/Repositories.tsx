import { useState, useEffect } from "react";
import { DataTable } from "../components/DataTable";
import { TableSkeleton } from "../components/Skeletons";
import type { Column } from "../components/DataTable";
import { ExternalLink, Eye, ArrowRightCircle, RefreshCw, Send, Terminal } from "lucide-react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";

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
  { header: "Repository Name", accessorKey: "name", cell: (row) => <span className="text-sm text-slate-600 dark:text-slate-400">{row.name}</span> },
  { header: "Created At", accessorKey: "created_at", cell: (row) => (
    <div className="flex items-center gap-2 text-slate-500 font-mono text-xs w-fit">
      <span>{row.created_at}</span>
    </div>
  )},
  { header: "Link", accessorKey: "link", cell: (row) => (
    <a href={row.link} target="_blank" rel="noreferrer" className="text-indigo-600 hover:text-indigo-800 flex items-center gap-1.5 transition-colors font-medium">
      <ExternalLink className="w-3.5 h-3.5" />
      <span className="text-sm hover:underline">Repo</span>
    </a>
  )}
];

const migratedColumns: Column<Repo>[] = [
  ...getSharedColumns(),
  { header: "Migration Date", accessorKey: "migration_date", cell: (row) => <span className="text-slate-600 text-sm font-medium">{row.migration_date}</span> },
  { header: "Migrated By", accessorKey: "user", cell: (row) => (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700">
      {row.user}
    </span>
  )},
  { header: "Actions", accessorKey: "id", cell: (row) => (
    <div className="flex items-center gap-2">
      <Link to={`/repositories/details/${row.id}`} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-slate-600 bg-white hover:bg-slate-100 hover:text-slate-900 transition-colors border border-slate-200 shadow-sm">
        <Eye className="w-4 h-4" />
        Details
      </Link>
    </div>
  )}
];

export function RepositoriesPage({ type }: { type: "migrated" | "waiting" }) {
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
    const loadingToast = toast.loading("Syncing with GitLab...");
    setIsLoading(true);
    try {
      const res = await fetch('/api/repositories/sync/', { method: 'POST' });
      const json = await res.json();
      if (!res.ok) {
        toast.error("Sync Error: " + (json.error || "Failed to trigger sync"), { id: loadingToast });
      } else {
        toast.success("Repositories Synced Successfully", { id: loadingToast });
      }
      await fetchRepositories();
    } catch(err: any) {
      console.error("Failed to sync repositories:", err);
      toast.error("Network Error: " + err.message, { id: loadingToast });
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
    fetchRepositories();
  }, [type]);

  const waitingColumns: Column<Repo>[] = [
    ...getSharedColumns(),
    { header: "Actions", accessorKey: "id", cell: (row) => (
      <div className="flex items-center gap-3">
        <button 
          onClick={() => handleMigrate([row.id])}
          className="group flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 shadow shadow-indigo-500/20 transition-all hover:shadow-indigo-500/40"
        >
          <ArrowRightCircle className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
          Migrate
        </button>
        <Link to={`/repositories/details/${row.id}`} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-slate-600 bg-white hover:bg-slate-100 hover:text-slate-900 transition-colors border border-slate-200 shadow-sm">
          <Eye className="w-4 h-4" />
          Details
        </Link>
      </div>
    )}
  ];

  const columns = type === "migrated" ? migratedColumns : waitingColumns;
  
  return (
    <div className="p-8 max-w-7xl mx-auto w-full">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400 mb-2">
            {type === "migrated" ? "Migrated Repositories" : "Waiting Repositories"}
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            Manage your {type === "migrated" ? "successfully migrated" : "pending"} source code repositories.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {selectedIds.length > 0 && (
            <button 
              onClick={() => handleMigrate(selectedIds)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white rounded-lg font-semibold shadow-md shadow-indigo-500/20 transition-all hover:shadow-indigo-500/40 group animate-in fade-in slide-in-from-right-4"
            >
              <Send className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              Migrate All ({selectedIds.length})
            </button>
          )}
          {type === "waiting" && (
            <button 
              onClick={syncRepositories}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg font-medium shadow-sm transition-colors active:scale-95"
            >
              <RefreshCw className={`w-4 h-4 text-slate-500 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          )}
        </div>
      </div>
      
      {isLoading ? (
        <TableSkeleton />
      ) : (
        <DataTable 
          columns={columns} 
          data={data} 
          enableSelection={type === "waiting"} 
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
        />
      )}
      
      {/* Streaming Log Modal Overlay */}
      {isLogModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#0D1117] border border-slate-700 w-full max-w-3xl rounded-xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden animate-in slide-in-from-bottom-8">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#161B22]">
              <div className="flex items-center gap-3 text-emerald-400 font-semibold">
                <Terminal className="w-5 h-5" />
                <span>Migration Execution Logs</span>
              </div>
              {!isLoading && (
                <button 
                  onClick={() => setIsLogModalOpen(false)}
                  className="text-slate-400 hover:text-white transition-colors text-xl font-bold p-1 rounded-md hover:bg-slate-800"
                >
                  &times;
                </button>
              )}
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 font-mono text-sm leading-relaxed whitespace-pre-wrap text-slate-300 custom-scrollbar">
              {migrationLogs}
              {isLoading && (
                <div className="flex gap-1 mt-4 items-center text-slate-500">
                  <span className="animate-pulse w-2 h-4 bg-emerald-500/80 inline-block"></span>
                </div>
              )}
            </div>
            
            {!isLoading && (
               <div className="px-6 py-4 border-t border-slate-800 bg-[#161B22] flex justify-end">
                 <button 
                   onClick={() => setIsLogModalOpen(false)}
                   className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg text-white font-medium transition-colors"
                 >
                   Close Console
                 </button>
               </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
