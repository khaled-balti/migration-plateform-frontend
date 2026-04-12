import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { DataTable } from "../components/DataTable";
import { TableSkeleton } from "../components/Skeletons";
import type { Column } from "../components/DataTable";
import { PlayCircle, ExternalLink, Eye, ArrowRightCircle, Send, RefreshCw, Loader2, Terminal } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../providers/AuthContext";

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
               navigate(`/pipelines/approve/${pipeline.id}`, { 
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
      <div className="flex items-center gap-2">
        <PlayCircle className="w-4 h-4 text-indigo-500" />
        <span className="text-sm text-slate-600 dark:text-slate-400">{row.name}</span>
      </div>
    )},
    { header: "Status", accessorKey: "status", cell: (row) => (
      <span className="text-slate-500 font-medium text-xs bg-slate-100 rounded-md px-2 py-1 w-fit">
        {row.status}
      </span>
    )},
    { header: "Created At", accessorKey: "created_at", cell: (row) => (
      <span className="text-slate-500 font-mono text-xs">
        {row.created_at}
      </span>
    )},
    { header: "Link", accessorKey: "link", cell: (row) => (
      <a href={row.link} target="_blank" rel="noreferrer" className="text-indigo-600 hover:text-indigo-800 flex items-center gap-1.5 transition-colors font-medium">
        <ExternalLink className="w-3.5 h-3.5" />
        <span className="text-sm hover:underline">Pipeline</span>
      </a>
    )}
  ];

  const columns: Column<Pipeline>[] = type === "migrated" ? [
    ...getSharedColumns(),
    { header: "Migration Date", accessorKey: "migration_date", cell: (row) => <span className="text-slate-600 text-sm font-medium">{row.migration_date}</span> },
    { header: "Migrated By", accessorKey: "user", cell: (row) => (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700">
        {row.user}
      </span>
    )},
    { header: "Actions", accessorKey: "id", cell: (row) => (
      <div className="flex items-center gap-2">
        <Link 
          to={`/pipelines/details/${row.id}`}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-slate-600 bg-white hover:bg-slate-100 hover:text-slate-900 transition-colors border border-slate-200 shadow-sm"
        >
          <Eye className="w-4 h-4" />
          Details
        </Link>
      </div>
    )}
  ] : [
    ...getSharedColumns(),
    { header: "Actions", accessorKey: "id", cell: (row) => (
      <div className="flex items-center gap-3">
        <Link 
          to={`/pipelines/details/${row.id}`}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-slate-600 bg-white hover:bg-slate-100 hover:text-slate-900 transition-colors border border-slate-200 shadow-sm"
        >
          <Eye className="w-4 h-4" />
          Details
        </Link>
        {hasPipelinePermission && (
          <button 
            onClick={() => handleMigrate(row)}
            disabled={!!isMigrating}
            className="group flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 shadow shadow-indigo-500/20 transition-all hover:shadow-indigo-500/40 disabled:opacity-50"
          >
            {isMigrating === row.id ? (
              <Loader2 className="w-4 h-4 animate-spin text-white" />
            ) : (
              <ArrowRightCircle className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            )}
            {isMigrating === row.id ? "Processing..." : "Migrate"}
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
    if (type === "waiting") {
      syncPipelines();
    } else {
      fetchPipelines();
    }
  }, [type]);
  
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
      <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white mb-2">
            {type === "migrated" ? "Migrated Pipelines" : "Waiting Pipelines"}
          </h1>
          <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400">
            View and trigger your {type === "migrated" ? "active CI/CD" : "legacy pending"} pipelines.
          </p>
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto overflow-x-auto sm:overflow-visible pb-2 sm:pb-0">
          {selectedIds.length > 0 && hasPipelinePermission && (
            <button 
              onClick={handleMigrateAll}
              disabled={!!isMigrating}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white rounded-lg font-semibold shadow-md shadow-indigo-500/20 transition-all hover:shadow-indigo-500/40 group animate-in fade-in slide-in-from-right-4 disabled:opacity-50 whitespace-nowrap"
            >
              <Send className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              Migrate All ({selectedIds.length})
            </button>
          )}
          {type === "waiting" && hasPipelinePermission && (
            <button 
              onClick={syncPipelines}
              className="flex items-center gap-2 px-5 py-2.5 font-medium rounded-xl text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 ring-1 ring-slate-200 dark:ring-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 shadow-sm transition-all active:scale-95 group whitespace-nowrap"
            >
              <RefreshCw className={`w-4 h-4 text-slate-500 group-hover:text-indigo-500 transition-colors ${isLoading ? 'animate-spin' : ''}`} />
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
                <span>Dry-Run Execution Logs</span>
              </div>
              {!isMigrating && (
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
              {isMigrating && (
                <div className="flex gap-1 mt-4 items-center text-slate-500">
                  <span className="animate-pulse w-2 h-4 bg-emerald-500/80 inline-block"></span>
                </div>
              )}
            </div>
            
            {!isMigrating && (
               <div className="px-6 py-4 border-t border-slate-800 bg-[#161B22] flex justify-end gap-3">
                 {migratedResult && currentPipeline ? (
                   <button 
                     onClick={() => navigate(`/pipelines/approve/${currentPipeline.id}`, { 
                       state: { yaml: migratedResult.yaml, pipelineName: currentPipeline.name } 
                     })}
                     className="px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 rounded-lg text-white font-semibold transition-all shadow-lg shadow-indigo-500/20 flex items-center gap-2"
                   >
                     <ArrowRightCircle className="w-4 h-4" />
                     Continue to Review
                   </button>
                 ) : (
                   <button 
                     onClick={() => setIsLogModalOpen(false)}
                     className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg text-white font-medium transition-colors"
                   >
                     Close Console
                   </button>
                 )}
               </div>
            )}

          </div>
        </div>
      )}
    </div>
  );
}

