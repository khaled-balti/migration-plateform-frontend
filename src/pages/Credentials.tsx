import { useState, useEffect } from "react";
import { DataTable } from "../components/DataTable";
import { TableSkeleton } from "../components/Skeletons";
import type { Column } from "../components/DataTable";
import {
  Key, Send, RefreshCw, ArrowRightCircle, User, Globe,
  Eye, EyeOff, Lock, Terminal,
} from "lucide-react";
import { useAuth } from "../providers/AuthContext";
import toast from "react-hot-toast";

interface Credential {
  id: string;
  credential_id: string;
  name: string;
  description: string;
  type: string;
  scope: string;
  username: string;
  is_migrated: boolean;
  created_at: string;
  secret: string | null;
  has_secret: boolean;
}

// ─── Secret Cell ─────────────────────────────────────────────────────────────
function SecretCell({ row, canSee }: { row: Credential; canSee: boolean }) {
  const [visible, setVisible] = useState(false);

  if (!row.has_secret) {
    return <span className="text-slate-300 dark:text-slate-600 text-xs italic">None</span>;
  }

  if (!canSee) {
    return (
      <div className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500">
        <Lock className="w-3.5 h-3.5" />
        <span className="text-xs italic">No permission</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 min-w-0">
      <span className="font-mono text-xs text-slate-600 dark:text-slate-300 truncate max-w-[160px]">
        {visible ? (row.secret ?? "••••••••") : "••••••••"}
      </span>
      <button
        onClick={() => setVisible((v) => !v)}
        className="flex-shrink-0 p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
        title={visible ? "Hide secret" : "Reveal secret"}
      >
        {visible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
      </button>
    </div>
  );
}

// ─── Column Builders ─────────────────────────────────────────────────────────
const getSharedColumns = (canSeeSecrets: boolean, onMigrateOne?: (id: string) => void): Column<Credential>[] => [
  {
    header: "Credential ID",
    accessorKey: "credential_id",
    cell: (row) => (
      <div className="flex items-center gap-2">
        <Key className="w-4 h-4 text-emerald-500 flex-shrink-0" />
        <div>
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{row.credential_id}</p>
          {row.name && row.name !== row.credential_id && (
            <p className="text-xs text-slate-400 truncate max-w-[200px]">{row.name}</p>
          )}
        </div>
      </div>
    ),
  },
  {
    header: "Type",
    accessorKey: "type",
    cell: (row) => (
      <span className="text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded text-xs font-mono">
        {row.type || "—"}
      </span>
    ),
  },
  {
    header: "Scope",
    accessorKey: "scope",
    cell: (row) => (
      <div className="flex items-center gap-1.5">
        <Globe className="w-3.5 h-3.5 text-slate-400" />
        <span className="text-slate-500 dark:text-slate-400 text-xs">{row.scope || "GLOBAL"}</span>
      </div>
    ),
  },
  {
    header: "Username",
    accessorKey: "username",
    cell: (row) =>
      row.username ? (
        <div className="flex items-center gap-1.5">
          <User className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-600 dark:text-slate-300 text-sm font-mono">{row.username}</span>
        </div>
      ) : (
        <span className="text-slate-300 dark:text-slate-600 text-xs italic">N/A</span>
      ),
  },
  {
    header: "Secret",
    accessorKey: "secret",
    cell: (row) => <SecretCell row={row} canSee={canSeeSecrets} />,
  },
  {
    header: "Added At",
    accessorKey: "created_at",
    cell: (row) => (
      <span className="text-slate-500 dark:text-slate-400 font-mono text-xs">{row.created_at}</span>
    ),
  },
];

const getMigratedColumns = (canSeeSecrets: boolean): Column<Credential>[] => [
  ...getSharedColumns(canSeeSecrets),
  {
    header: "Status",
    accessorKey: "is_migrated",
    cell: () => (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
        Migrated
      </span>
    ),
  },
];

const getWaitingColumns = (canSeeSecrets: boolean, onMigrateOne: (id: string) => void): Column<Credential>[] => [
  ...getSharedColumns(canSeeSecrets),
  {
    header: "Status",
    accessorKey: "is_migrated",
    cell: () => (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" />
        Pending
      </span>
    ),
  },
  {
    header: "Actions",
    accessorKey: "id",
    cell: (row) => (
      <button
        onClick={() => onMigrateOne(row.id)}
        className="group flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 shadow shadow-indigo-500/20 transition-all hover:shadow-indigo-500/40"
      >
        <ArrowRightCircle className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
        Migrate
      </button>
    ),
  },
];

// ─── Page Component ───────────────────────────────────────────────────────────
export function CredentialsPage({ type }: { type: "migrated" | "waiting" }) {
  const { user } = useAuth();
  const canSeeSecrets = user?.permissions?.includes("credentials") ?? false;

  const [selectedIds, setSelectedIds] = useState<(string | number)[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<Credential[]>([]);

  // Log modal
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [migrationLogs, setMigrationLogs] = useState("");
  const [isMigrating, setIsMigrating] = useState(false);

  const fetchCredentials = async () => {
    try {
      const res = await fetch(`/api/credentials/?type=${type}`);
      const json = await res.json();
      if (!res.ok) {
        toast.error("Fetch Error: " + (json.error || "Unknown"));
        return;
      }
      if (json.credentials) setData(json.credentials);
    } catch (err: any) {
      toast.error("Network Error: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const syncCredentials = async () => {
    const toastId = toast.loading("Syncing with Jenkins...");
    setIsLoading(true);
    try {
      const res = await fetch("/api/credentials/sync/", { method: "POST" });
      const json = await res.json();
      if (!res.ok) {
        toast.error("Sync Error: " + (json.error || "Failed"), { id: toastId });
      } else {
        toast.success(`Synced — ${json.new_credentials} new, ${json.skipped_credentials} updated`, { id: toastId });
      }
      await fetchCredentials();
    } catch (err: any) {
      toast.error("Network Error: " + err.message, { id: toastId });
      setIsLoading(false);
    }
  };

  const handleMigrate = async (idsToMigrate: (string | number)[]) => {
    if (!idsToMigrate.length) return;
    setIsMigrating(true);
    setIsLogModalOpen(true);
    setMigrationLogs("🔐 Initializing credential migration to GitHub...\nConnecting...\n\n");

    try {
      const res = await fetch("/api/credentials/migrate/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential_ids: idsToMigrate }),
      });

      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        toast.error("Migration failed: " + (json.error || `HTTP ${res.status}`));
        setIsMigrating(false);
        return;
      }

      if (!res.body) {
        toast.error("Browser does not support streaming");
        setIsMigrating(false);
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder("utf-8");

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        setMigrationLogs((prev) => prev + decoder.decode(value));
      }

      toast.success("Credential migration complete!");
      setSelectedIds([]);
      await fetchCredentials();
    } catch (err: any) {
      toast.error("Migration error: " + err.message);
      setMigrationLogs((prev) => prev + `\n\n[FATAL] ${err.message}`);
    } finally {
      setIsMigrating(false);
    }
  };

  useEffect(() => {
    if (type === "waiting") {
      syncCredentials();
    } else {
      fetchCredentials();
    }
  }, [type]);

  const columns =
    type === "migrated"
      ? getMigratedColumns(canSeeSecrets)
      : getWaitingColumns(canSeeSecrets, (id) => handleMigrate([id]));

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400 mb-2">
            {type === "migrated" ? "Migrated Credentials" : "Credentials"}
          </h1>
          <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400">
            {type === "migrated"
              ? "Jenkins credentials successfully pushed to GitHub Actions Secrets."
              : "Jenkins credentials synced from your server — ready to migrate."}
          </p>
          {!canSeeSecrets && (
            <p className="mt-1 flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400">
              <Lock className="w-3 h-3" />
              Secret values are hidden. Requires the <strong className="ml-0.5">credentials</strong> permission.
            </p>
          )}
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto overflow-x-auto sm:overflow-visible pb-2 sm:pb-0">
          {selectedIds.length > 0 && type === "waiting" && (
            <button
              onClick={() => handleMigrate(selectedIds)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white rounded-lg font-semibold shadow-md shadow-indigo-500/20 transition-all hover:shadow-indigo-500/40 group animate-in fade-in slide-in-from-right-4 whitespace-nowrap"
            >
              <Send className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              Migrate All ({selectedIds.length})
            </button>
          )}
          {type === "waiting" && canSeeSecrets && (
            <button
              onClick={syncCredentials}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 dark:bg-slate-800 dark:border-slate-700 dark:hover:bg-slate-700 dark:text-slate-300 rounded-lg font-medium shadow-sm transition-colors active:scale-95 whitespace-nowrap"
            >
              <RefreshCw className={`w-4 h-4 text-slate-500 ${isLoading ? "animate-spin" : ""}`} />
              Refresh
            </button>
          )}
        </div>
      </div>

      {/* Table */}
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

      {/* Streaming Log Modal */}
      {isLogModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#0D1117] border border-slate-700 w-full max-w-3xl rounded-xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden animate-in slide-in-from-bottom-8">
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#161B22]">
              <div className="flex items-center gap-3 text-emerald-400 font-semibold">
                <Terminal className="w-5 h-5" />
                <span>Credential Migration Logs</span>
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

            {/* Log output */}
            <div className="p-6 overflow-y-auto flex-1 font-mono text-sm leading-relaxed whitespace-pre-wrap text-slate-300 custom-scrollbar">
              {migrationLogs}
              {isMigrating && (
                <span className="animate-pulse w-2 h-4 bg-emerald-500/80 inline-block ml-0.5" />
              )}
            </div>

            {/* Close footer */}
            {!isMigrating && (
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
