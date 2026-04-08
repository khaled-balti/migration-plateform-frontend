import { useState, useEffect } from "react";
import { DataTable } from "../components/DataTable";
import { TableSkeleton } from "../components/Skeletons";
import type { Column } from "../components/DataTable";
import { PlayCircle, ExternalLink, Eye, ArrowRightCircle, Send, RefreshCw } from "lucide-react";

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

const migratedColumns: Column<Pipeline>[] = [
  ...getSharedColumns(),
  { header: "Migration Date", accessorKey: "migration_date", cell: (row) => <span className="text-slate-600 text-sm font-medium">{row.migration_date}</span> },
  { header: "Migrated By", accessorKey: "user", cell: (row) => (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700">
      {row.user}
    </span>
  )},
  { header: "Actions", accessorKey: "id", cell: () => (
    <div className="flex items-center gap-2">
      <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-slate-600 bg-white hover:bg-slate-100 hover:text-slate-900 transition-colors border border-slate-200 shadow-sm">
        <Eye className="w-4 h-4" />
        Details
      </button>
    </div>
  )}
];

const waitingColumns: Column<Pipeline>[] = [
  ...getSharedColumns(),
  { header: "Actions", accessorKey: "id", cell: () => (
    <div className="flex items-center gap-3">
      <button className="group flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 shadow shadow-indigo-500/20 transition-all hover:shadow-indigo-500/40">
        <ArrowRightCircle className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
        Migrate
      </button>
      <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-slate-600 bg-white hover:bg-slate-100 hover:text-slate-900 transition-colors border border-slate-200 shadow-sm">
        <Eye className="w-4 h-4" />
        Details
      </button>
    </div>
  )}
];

export function PipelinesPage({ type }: { type: "migrated" | "waiting" }) {
  const [selectedIds, setSelectedIds] = useState<(string | number)[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<Pipeline[]>([]);

  const columns = type === "migrated" ? migratedColumns : waitingColumns;
  
  const fetchPipelines = async () => {
    try {
      const res = await fetch(`/api/pipelines/?type=${type}`);
      const json = await res.json();
      if (!res.ok) {
        alert("Fetch Error: " + (json.error || "Unknown"));
      }
      if(json.pipelines) {
        setData(json.pipelines);
      }
    } catch(err: any) {
      console.error(err);
      alert("Network Error: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  const syncPipelines = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/pipelines/sync/', { method: 'POST' });
      const json = await res.json();
      if (!res.ok) {
        alert("Sync Error: " + (json.error || "Failed to trigger sync"));
      }
      await fetchPipelines();
    } catch(err: any) {
      console.error("Failed to sync pipelines:", err);
      alert("Network Error: " + err.message);
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
    <div className="p-8 max-w-7xl mx-auto w-full">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400 mb-2">
            {type === "migrated" ? "Migrated Pipelines" : "Waiting Pipelines"}
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            View and trigger your {type === "migrated" ? "active CI/CD" : "legacy pending"} pipelines.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {selectedIds.length > 0 && (
            <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white rounded-lg font-semibold shadow-md shadow-indigo-500/20 transition-all hover:shadow-indigo-500/40 group animate-in fade-in slide-in-from-right-4">
              <Send className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              Migrate All ({selectedIds.length})
            </button>
          )}
          {type === "waiting" && (
            <button 
              onClick={syncPipelines}
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
    </div>
  );
}
