import { useState, useEffect } from "react";
import { PlayCircle, GitCommit, Key, UserPlus, FileText, Download, Clock, ChevronRight } from "lucide-react";
import { HistorySkeleton } from "../components/Skeletons";
import { motion, AnimatePresence } from "framer-motion";

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
      if (!res.ok) console.error("History Fetch Error:", json.error || "Unknown");
      if (json.activities) setData(json.activities);
    } catch(err: any) {
      console.error(err);
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
    }, 400); 
  };

  return (
    <div className="p-4 sm:p-6 lg:p-10 max-w-4xl mx-auto w-full transition-all duration-500">
      <div className="mb-12">
        <h1 className="text-3xl sm:text-4xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-br from-slate-900 to-slate-500 dark:from-white dark:to-slate-500 mb-2">
          {type === "all" ? "Audit Ledger" : "Personal Timeline"}
        </h1>
        <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 font-medium tracking-tight">
          Trace back recent operations executed across the migration platform.
        </p>
      </div>

      {isLoading && data.length === 0 ? (
        <HistorySkeleton />
      ) : (
        <div className="relative border-l-2 border-slate-200 dark:border-white/5 ml-4 space-y-10 pb-16">
          <AnimatePresence mode="popLayout">
            {currentData.map((log, index) => (
              <motion.div 
                key={log.id} 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className="relative pl-10 group"
              >
                {/* Timeline Dot/Icon */}
                <div className="absolute -left-[21px] top-0 w-10 h-10 rounded-2xl bg-white dark:bg-[#080812] border-2 border-slate-200 dark:border-white/10 flex items-center justify-center shadow-xl group-hover:scale-110 group-hover:border-indigo-500/50 transition-all z-20">
                  {IconMap[log.type]}
                </div>

                <div className="bg-white/50 dark:bg-white/5 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-[2rem] p-6 shadow-2xl shadow-indigo-500/5 hover:shadow-indigo-500/10 transition-all relative">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3">
                      <h3 className="font-black text-slate-800 dark:text-white text-lg tracking-tight uppercase tracking-[0.05em]">{log.title}</h3>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
                      <Clock className="w-3 h-3 text-indigo-500" />
                      {log.timestamp}
                    </div>
                  </div>
                  
                  <p className="text-slate-600 dark:text-slate-300 font-medium leading-relaxed mb-6 pl-1 border-l-2 border-indigo-500/20">
                    {log.description}
                  </p>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-white/5">
                    <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                      <div className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-white/10 flex items-center justify-center font-black text-[10px] text-indigo-500">
                        {log.user.charAt(0).toUpperCase()}
                      </div>
                      <span>Initiated by <span className="text-slate-700 dark:text-slate-200">{log.user}</span></span>
                    </div>
                    
                    <button className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 p-2 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-all">
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {hasMore ? (
            <div className="relative pl-10 pt-4">
              <div className="absolute -left-[10px] top-10 w-4 h-4 rounded-full bg-indigo-500 shadow-[0_0_10px_rgba(79,70,229,0.5)] z-20" />
              <button 
                onClick={handleLoadMore}
                disabled={isAppending}
                className="flex items-center gap-2 px-8 py-3 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-indigo-600 dark:text-indigo-400 font-black uppercase text-xs tracking-widest rounded-2xl hover:bg-indigo-50 dark:hover:bg-white/10 shadow-lg shadow-indigo-500/5 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-wait group"
              >
                {isAppending ? (
                  <>
                    <Download className="w-4 h-4 animate-bounce" />
                    Syncing Records...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
                    Archive Fetch
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="relative pl-10 pt-4">
              <div className="absolute -left-[10px] top-6 w-4 h-4 rounded-full bg-slate-200 dark:bg-white/10" />
              <p className="text-slate-400 dark:text-slate-600 font-black uppercase text-[10px] tracking-[0.2em] italic ml-2">Sequence Terminated</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
