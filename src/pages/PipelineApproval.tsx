import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, CheckCircle, AlertCircle, Loader2, Terminal } from "lucide-react";
import toast from "react-hot-toast";

interface LocationState {
  yaml: string;
  pipelineName: string;
}

import { PipelineApprovalSkeleton } from "../components/Skeletons";

export function PipelineApprovalPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState;

  const [yaml, setYaml] = useState(state?.yaml || "");
  const [pipelineName, setPipelineName] = useState(state?.pipelineName || "");
  const [isApproving, setIsApproving] = useState(false);
  const [isFetching, setIsFetching] = useState(!state?.yaml);

  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [migrationLogs, setMigrationLogs] = useState("");
  const [migratedResult, setMigratedResult] = useState<any>(null);

  useEffect(() => {
    if (!state?.yaml && id) {
      // If we directly navigated here without state, fetch it
      fetchYaml();
    }
  }, [id]);

  const fetchYaml = async () => {
    setIsFetching(true);
    try {
      // Note: In a real app, you might have a dedicated fetch endpoint, 
      // but here we reuse the dry-run stream to get the YAML if needed.
      const res = await fetch("/api/pipelines/dry-run/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      
      if (!res.ok) {
        toast.error("Failed to fetch pipeline details");
        navigate("/pipelines/waiting");
        return;
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error("No reader");
      const decoder = new TextDecoder();
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
          resultBuffer = parts[1];
          foundResultTag = true;
        }
      }

      if (foundResultTag) {
        const data = JSON.parse(resultBuffer);
        setYaml(data.yaml);
        setPipelineName(data.pipeline_name);
      }
    } catch (err) {
      toast.error("Network error");
      navigate("/pipelines/waiting");
    } finally {
      setIsFetching(false);
    }
  };

  const handleApprove = async () => {
    setMigrationLogs(`🚀 Initializing final migration for: ${pipelineName}\nEstablishing connection to GitHub push stream...\n`);
    setIsLogModalOpen(true);
    setIsApproving(true);
    
    try {
      const res = await fetch("/api/pipelines/approve/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, yaml }),
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        toast.error(errorData.error || "Approval failed");
        setIsLogModalOpen(false);
        setIsApproving(false);
        return;
      }

      const reader = res.body?.getReader();
      if (!reader) {
        toast.error("Stream reader not supported");
        setIsLogModalOpen(false);
        setIsApproving(false);
        return;
      }

      const decoder = new TextDecoder("utf-8");
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

      setIsApproving(false);

      if (foundResultTag) {
        try {
          const result = JSON.parse(resultBuffer);
          if (result?.success) {
            setMigratedResult(result);
            toast.success("Pipeline migrated successfully!");
            setTimeout(() => {
              navigate("/pipelines/migrated");
            }, 3000);
          }
        } catch (e) {
          console.error("Failed to parse result", e);
        }
      }
    } catch (err) {
      toast.error("Network error during approval");
      setIsApproving(false);
    }
  };

  if (isFetching) {
    return <PipelineApprovalSkeleton />;
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto w-full">
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors shrink-0"
          >
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold text-slate-900 dark:text-white">
              Review Pipeline Workflow
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Generated GitHub Actions workflow for <span className="font-semibold text-indigo-500">{pipelineName}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={() => navigate(-1)}
            className="flex-1 sm:flex-none px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleApprove}
            disabled={isApproving}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl font-semibold shadow-lg shadow-indigo-200 dark:shadow-none transition-all whitespace-nowrap"
          >
            {isApproving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <CheckCircle className="w-4 h-4" />
            )}
            Approve & Migrate
          </button>
        </div>
      </div>

      <div className="bg-slate-900 rounded-2xl shadow-2xl overflow-hidden border border-slate-800">
        <div className="flex items-center justify-between px-6 py-3 bg-slate-800/50 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500/80" />
              <div className="w-3 h-3 rounded-full bg-amber-500/80" />
              <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
            </div>
            <span className="ml-4 text-xs font-mono text-slate-400 uppercase tracking-widest">.github/workflows/{pipelineName}.yml</span>
          </div>
          <div className="flex items-center gap-3 text-slate-400">
            <span className="text-[10px] font-mono bg-slate-700/50 px-2 py-0.5 rounded">YAML</span>
          </div>
        </div>
        
        <div className="relative">
          <textarea
            value={yaml}
            onChange={(e) => setYaml(e.target.value)}
            className="w-full h-[600px] p-8 bg-transparent text-indigo-200 font-mono text-sm resize-none focus:outline-none scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent"
            spellCheck={false}
          />
          <div className="absolute top-8 left-0 w-6 flex flex-col items-end pr-2 text-slate-700 select-none pointer-events-none font-mono text-sm leading-[1.25rem]">
            {yaml.split('\n').map((_, i) => (
              <div key={i}>{i + 1}</div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 rounded-xl">
        <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="text-sm text-amber-800 dark:text-amber-200">
          <p className="font-semibold mb-1">Important Review</p>
          <p>Please ensure all environment variables and secrets are correctly mapped. You can edit the YAML directly above if any adjustments are needed before the final migration.</p>
        </div>
      </div>

      {/* Migration Log Modal */}
      {isLogModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#0D1117] border border-slate-700 w-full max-w-3xl rounded-xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden animate-in slide-in-from-bottom-8">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#161B22]">
              <div className="flex items-center gap-3 text-emerald-400 font-semibold">
                <Terminal className="w-5 h-5" />
                <span>Migration Execution Logs</span>
              </div>
              {!isApproving && (
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
              {isApproving && (
                <div className="flex gap-1 mt-4 items-center text-slate-500">
                  <span className="animate-pulse w-2 h-4 bg-emerald-500/80 inline-block"></span>
                </div>
              )}
            </div>
            
            {!isApproving && (
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

export const PipelineApprovalPageWrapped = PipelineApprovalPage;
