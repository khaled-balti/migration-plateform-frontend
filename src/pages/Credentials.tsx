import { useState, useEffect } from "react";
import { DataTable } from "../components/DataTable";
import { TableSkeleton } from "../components/Skeletons";
import type { Column } from "../components/DataTable";
import {
  Send, RefreshCw, ArrowRightCircle, Globe,
  Eye, EyeOff, Lock, ShieldCheck, Fingerprint
} from "lucide-react";
import { useAuth } from "../providers/AuthContext";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

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
    return <span className="text-slate-300 dark:text-slate-600 text-[10px] font-black uppercase tracking-widest italic ml-1">None</span>;
  }

  if (!canSee) {
    return (
      <div className="flex items-center gap-1.5 text-slate-400 dark:text-slate-600">
        <Lock className="w-3.5 h-3.5" />
        <span className="text-[10px] font-black uppercase tracking-widest italic">Restricted</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 min-w-0">
      <div className="px-3 py-1 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg flex items-center gap-2">
        <span className="font-mono text-xs text-indigo-600 dark:text-indigo-400 font-bold truncate max-w-[160px]">
          {visible ? (row.secret ?? "••••••••") : "••••••••"}
        </span>
      </div>
      <button
        onClick={() => setVisible((v) => !v)}
        className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all active:scale-90"
        title={visible ? "Hide secret" : "Reveal secret"}
      >
        {visible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
      </button>
    </div>
  );
}

// ─── Column Builders ─────────────────────────────────────────────────────────
const getSharedColumns = (canSeeSecrets: boolean): Column<Credential>[] => [
  {
    header: "Asset ID",
    accessorKey: "credential_id",
    cell: (row) => (
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-emerald-500/5 dark:bg-emerald-500/10 flex items-center justify-center border border-emerald-500/10">
          <Fingerprint className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
        </div>
        <div>
          <p className="text-sm font-black text-slate-900 dark:text-white tracking-tight uppercase tracking-[0.05em]">{row.credential_id}</p>
          {row.name && row.name !== row.credential_id && (
            <p className="text-xs text-slate-400 font-medium truncate max-w-[200px]">{row.name}</p>
          )}
        </div>
      </div>
    ),
  },
  {
    header: "Type",
    accessorKey: "type",
    cell: (row) => (
      <div className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest w-fit">
        {row.type || "—"}
      </div>
    ),
  },
  {
    header: "Scope",
    accessorKey: "scope",
    cell: (row) => (
      <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-indigo-500/5 dark:bg-indigo-500/10 border border-indigo-500/10 w-fit">
        <Globe className="w-3 h-3 text-indigo-500" />
        <span className="text-indigo-700 dark:text-indigo-400 text-[10px] font-black uppercase tracking-widest">{row.scope || "GLOBAL"}</span>
      </div>
    ),
  },
  {
    header: "Secret",
    accessorKey: "secret",
    cell: (row) => <SecretCell row={row} canSee={canSeeSecrets} />,
  },
  {
    header: "Synced",
    accessorKey: "created_at",
    cell: (row) => (
      <span className="text-slate-500 dark:text-slate-400 font-mono text-[10px] uppercase">{row.created_at}</span>
    ),
  },
];

const getMigratedColumns = (canSeeSecrets: boolean): Column<Credential>[] => [
  ...getSharedColumns(canSeeSecrets),
];

const getWaitingColumns = (canSeeSecrets: boolean, onMigrateOne: (id: string) => void): Column<Credential>[] => [
  ...getSharedColumns(canSeeSecrets),
  {
    header: "Actions",
    accessorKey: "id",
    cell: (row) => (
      <button
        onClick={() => onMigrateOne(row.id)}
        className="group flex items-center gap-2 px-4 py-1.5 rounded-xl text-xs font-black text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 transition-all active:scale-95 uppercase tracking-wider"
      >
        <ArrowRightCircle className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
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
    setIsLoading(true);
    try {
      const res = await fetch("/api/credentials/sync/", { method: "POST" });
      const json = await res.json();
      if (!res.ok) {
        toast.error("Sync Error: " + (json.error || "Failed"));
      }
      await fetchCredentials();
    } catch (err: any) {
      toast.error("Network Error: " + err.message);
      setIsLoading(false);
    }
  };

  const handleMigrate = async (idsToMigrate: (string | number)[]) => {
    if (!idsToMigrate.length) return;
    setIsMigrating(true);
    setIsLogModalOpen(true);
    setMigrationLogs("🔐 Initializing secure cryptographic vault migration...\nPushing to GitHub Secrets...\n\n");

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
    syncCredentials();
  }, [type]);

  const columns =
    type === "migrated"
      ? getMigratedColumns(canSeeSecrets)
      : getWaitingColumns(canSeeSecrets, (id) => handleMigrate([id]));

  return (
    <div className="p-4 sm:p-6 lg:p-10 max-w-7xl mx-auto w-full transition-all duration-500">
      <div className="mb-10 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl sm:text-4xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-br from-slate-900 to-slate-500 dark:from-white dark:to-slate-500 mb-2">
            {type === "migrated" ? "Vault Assets" : "Legacy Secrets"}
          </h1>
          <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 font-medium tracking-tight">
            {type === "migrated"
              ? "Jenkins credentials successfully pushed to GitHub Actions Secrets."
              : "Jenkins credentials synced from your server — ready to migrate."}
          </p>
          {!canSeeSecrets && (
            <div className="mt-2 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/5 border border-amber-500/20 w-fit">
              <Lock className="w-3.5 h-3.5 text-amber-500" />
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-600 dark:text-amber-400">Restricted Access Mode</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto overflow-x-auto sm:overflow-visible pb-2 sm:pb-0">
          {selectedIds.length > 0 && type === "waiting" && (
            <button
              onClick={() => handleMigrate(selectedIds)}
              className="flex items-center gap-2 px-5 py-3 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-[0.1em] shadow-xl shadow-indigo-500/30 hover:bg-indigo-700 transition-all active:scale-95 group animate-in fade-in slide-in-from-right-4 whitespace-nowrap"
            >
              <Send className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              Migrate Selected ({selectedIds.length})
            </button>
          )}
          {canSeeSecrets && (
            <button
              onClick={syncCredentials}
              className="flex items-center gap-2 px-5 py-3 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 rounded-2xl font-black text-xs uppercase tracking-[0.1em] shadow-sm transition-all active:scale-95 whitespace-nowrap"
            >
              <RefreshCw className={`w-4 h-4 text-indigo-500 ${isLoading ? "animate-spin" : ""}`} />
              Refresh Vault
            </button>
          )}
        </div>
      </div>

      <div className="relative group">
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-emerald-500/5 blur-[80px] rounded-full pointer-events-none" />
        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-indigo-500/5 blur-[80px] rounded-full pointer-events-none" />

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

      {/* Streaming Log Modal */}
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
                  <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                    <ShieldCheck className="w-5 h-5 text-indigo-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-black text-lg tracking-tight uppercase tracking-[0.1em]">Cryptographic Bridge</h3>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Secure Handshake Protocol</p>
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
