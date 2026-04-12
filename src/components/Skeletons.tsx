import { motion } from "framer-motion";

export function TableSkeleton() {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="rounded-xl overflow-hidden bg-white dark:bg-[#1e1e2d] border border-slate-200/50 dark:border-slate-800/50 shadow-sm"
    >
      <div className="h-14 bg-slate-50/50 dark:bg-slate-800/30 border-b border-slate-200 dark:border-slate-800 flex items-center px-6 gap-8 animate-pulse">
        <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded-md w-8"></div>
        {[1, 2, 3].map(i => (
          <div key={i} className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/4"></div>
        ))}
      </div>
      <div className="divide-y divide-slate-100 dark:divide-slate-800/50">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="p-4 px-6 flex items-center gap-8 animate-pulse bg-white dark:bg-[#1e1e2d]">
            <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-8"></div>
            <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-1/4"></div>
            <div className="h-5 bg-slate-100 dark:bg-slate-800 rounded w-1/3"></div>
            <div className="h-6 bg-slate-100 dark:bg-slate-800 rounded-full w-20 ml-auto"></div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

export function HistorySkeleton() {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="relative border-l border-slate-200 dark:border-slate-800 ml-4 space-y-8 pb-4"
    >
      {[1, 2, 3].map(i => (
        <div key={i} className="relative pl-8 group animate-pulse">
          <div className="absolute -left-4 top-0 w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 border-2 border-slate-50 dark:border-[#12121e]"></div>
          <div className="bg-white dark:bg-[#1e1e2d] border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
            <div className="flex justify-between mb-4">
              <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-1/3"></div>
              <div className="h-5 bg-slate-100 dark:bg-slate-800 rounded w-20"></div>
            </div>
            <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-full mb-2"></div>
            <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-2/3 mb-4"></div>
            
            <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-1/4 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800"></div>
          </div>
        </div>
      ))}
    </motion.div>
  );
}
export function RepositoryDetailSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="flex justify-between items-start">
        <div className="space-y-3 w-1/3">
          <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded-lg w-full"></div>
          <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-2/3"></div>
        </div>
        <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded-xl w-32"></div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-32 bg-white dark:bg-[#1e1e2d] border border-slate-200 dark:border-slate-800 rounded-2xl p-6"></div>
        ))}
      </div>
      <div className="h-96 bg-white dark:bg-[#1e1e2d] border border-slate-200 dark:border-slate-800 rounded-2xl"></div>
    </div>
  );
}

export function PipelineDetailSkeleton() {
  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-pulse">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-slate-200 dark:bg-slate-700 rounded-2xl"></div>
        <div className="space-y-2 flex-1">
          <div className="h-7 bg-slate-200 dark:bg-slate-700 rounded w-1/4"></div>
          <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-1/3"></div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="h-64 bg-white dark:bg-[#1e1e2d] border border-slate-200 dark:border-slate-800 rounded-2xl"></div>
        <div className="h-64 bg-white dark:bg-[#1e1e2d] border border-slate-200 dark:border-slate-800 rounded-2xl"></div>
      </div>
      <div className="h-48 bg-white dark:bg-[#1e1e2d] border border-slate-200 dark:border-slate-800 rounded-2xl"></div>
    </div>
  );
}

export function PipelineApprovalSkeleton() {
  return (
    <div className="animate-pulse space-y-8">
      <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded-lg w-1/4"></div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="h-[600px] bg-white dark:bg-[#1e1e2d] border border-slate-200 dark:border-slate-800 rounded-2xl"></div>
        <div className="space-y-6">
          <div className="h-64 bg-white dark:bg-[#1e1e2d] border border-slate-200 dark:border-slate-800 rounded-2xl"></div>
          <div className="h-80 bg-white dark:bg-[#1e1e2d] border border-slate-200 dark:border-slate-800 rounded-2xl"></div>
        </div>
      </div>
    </div>
  );
}

export function SettingsSkeleton() {
  return (
    <div className="max-w-4xl mx-auto space-y-10 animate-pulse">
      <div className="space-y-2">
        <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-1/4"></div>
        <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-1/2"></div>
      </div>
      <div className="space-y-8">
        {[1, 2].map(i => (
          <div key={i} className="bg-white dark:bg-[#1e1e2d] border border-slate-200 dark:border-slate-800 rounded-2xl p-8 space-y-6">
            <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-1/5"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map(j => (
                <div key={j} className="space-y-2">
                  <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-1/3"></div>
                  <div className="h-12 bg-slate-50 dark:bg-slate-900 rounded-xl"></div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
