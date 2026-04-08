import { useState, useEffect } from "react";
import { Activity, PlayCircle, GitCommit, Key, UserPlus, FileText, Download } from "lucide-react";
import { HistorySkeleton } from "../components/Skeletons";

interface ActivityLog {
  id: string;
  type: "pipeline" | "repository" | "credential" | "user" | "report";
  title: string;
  timestamp: string;
  description: string;
  user: string;
}



const IconMap = {
  pipeline: <PlayCircle className="w-5 h-5 text-indigo-500" />,
  repository: <GitCommit className="w-5 h-5 text-emerald-500" />,
  credential: <Key className="w-5 h-5 text-amber-500" />,
  user: <UserPlus className="w-5 h-5 text-blue-500" />,
  report: <FileText className="w-5 h-5 text-rose-500" />
};

export function HistoryPage({ type }: { type: "all" | "my" }) {
  const [isLoading, setIsLoading] = useState(true);
  const [isAppending, setIsAppending] = useState(false);
  const [itemsToShow, setItemsToShow] = useState(10);
  const [data, setData] = useState<ActivityLog[]>([]);
  
  const currentData = data.slice(0, itemsToShow);
  const hasMore = itemsToShow < data.length;

  const fetchHistory = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/history/?type=${type}`);
      const json = await res.json();
      if (!res.ok) alert("History Fetch Error: " + (json.error || "Unknown"));
      if (json.activities) setData(json.activities);
    } catch(err: any) {
      console.error(err);
      alert("Network Error: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setItemsToShow(10);
    fetchHistory();
  }, [type]);

  const handleLoadMore = () => {
    setIsAppending(true);
    setTimeout(() => {
      setItemsToShow(prev => prev + 10);
      setIsAppending(false);
    }, 400); // Small artificial delay simply for UI UX feel since the full list is already mapped 
  };

  return (
    <div className="p-8 max-w-4xl mx-auto w-full">
      <div className="mb-10">
        <h1 className="text-3xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400 mb-2">
          {type === "all" ? "Organization Activity log" : "My Recent Activity"}
        </h1>
        <p className="text-slate-500 dark:text-slate-400">
          Trace back recent operations executed across the migration platform.
        </p>
      </div>

      {isLoading ? (
        <HistorySkeleton />
      ) : (
        <div className="relative border-l border-slate-200 dark:border-slate-800 ml-4 space-y-8 pb-8">
          {currentData.map((log) => (
            <div key={log.id} className="relative pl-8 group animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="absolute -left-4 top-0 w-8 h-8 rounded-full bg-white dark:bg-[#1e1e2d] border border-slate-200 dark:border-slate-800 flex items-center justify-center shadow-sm group-hover:scale-110 group-hover:border-indigo-300 dark:group-hover:border-indigo-500 transition-all z-10">
                {IconMap[log.type]}
              </div>

              <div className="bg-white dark:bg-[#1e1e2d] border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm hover:shadow-md transition-all relative top-0.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <h3 className="font-semibold text-slate-800 dark:text-slate-200 text-lg">{log.title}</h3>
                  <span className="text-xs font-medium px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-md shrink-0 w-fit">
                    {log.timestamp}
                  </span>
                </div>
                <p className="text-slate-600 dark:text-slate-400 font-medium mb-3">{log.description}</p>
                
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2 text-sm text-slate-500 dark:text-slate-500">
                  <Activity className="w-4 h-4 text-slate-400 dark:text-slate-600" />
                  <span>Action by <strong className="text-slate-700 dark:text-slate-300">{log.user}</strong></span>
                </div>
              </div>
            </div>
          ))}

          {hasMore ? (
            <div className="relative pl-8 pt-4">
              <div className="absolute -left-2 top-10 w-4 h-4 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700" />
              <button 
                onClick={handleLoadMore}
                disabled={isAppending}
                className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-[#1e1e2d] border border-slate-200 dark:border-slate-700 text-indigo-600 dark:text-indigo-400 font-semibold rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-900/20 shadow-sm transition-all active:scale-95 disabled:opacity-70 disabled:cursor-wait"
              >
                {isAppending ? (
                  <>
                    <Download className="w-4 h-4 animate-bounce" />
                    Fetching records...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    Load 10 older activities
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="relative pl-8 pt-4">
              <div className="absolute -left-2 top-6 w-4 h-4 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700" />
              <p className="text-slate-400 dark:text-slate-500 font-medium italic text-sm">End of recent history</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
