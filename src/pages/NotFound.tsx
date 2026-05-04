import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Home, ArrowLeft, Search, AlertCircle } from "lucide-react";

export function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-[#000] flex items-center justify-center p-6 selection:bg-indigo-100 dark:selection:bg-indigo-900/30">
      <div className="max-w-xl w-full text-center">
        {/* Animated 404 Graphic */}
        <div className="relative mb-8 flex justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="text-[120px] sm:text-[180px] font-black leading-none bg-clip-text text-transparent bg-gradient-to-b from-slate-200 to-slate-100 dark:from-slate-800 dark:to-slate-900 select-none"
          >
            404
          </motion.div>
          
          <motion.div
            animate={{ 
              y: [0, -10, 0],
              rotate: [0, 5, -5, 0]
            }}
            transition={{ 
              repeat: Infinity, 
              duration: 4,
              ease: "easeInOut"
            }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
          >
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-indigo-600 shadow-2xl shadow-indigo-500/40 flex items-center justify-center transform -rotate-12 outline outline-8 outline-[#fafafa] dark:outline-[#000]">
              <Search className="w-10 h-10 sm:w-12 h-12 text-white" />
            </div>
          </motion.div>
        </div>

        {/* Text Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <h1 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">
            Oops! Path Not Found
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-base sm:text-lg mb-10 max-w-md mx-auto leading-relaxed">
            The page you're looking for was either moved, deleted, or never existed in the first place.
          </p>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <button
            onClick={() => navigate(-1)}
            className="w-full sm:w-auto h-12 px-8 flex items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all active:scale-95 shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>
          
          <Link
            to="/"
            className="w-full sm:w-auto h-12 px-8 flex items-center justify-center gap-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold hover:bg-slate-800 dark:hover:bg-slate-100 transition-all active:scale-95 shadow-lg shadow-slate-200 dark:shadow-none"
          >
            <Home className="w-4 h-4" />
            Back to Home
          </Link>
        </motion.div>

        {/* Support Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-16 pt-8 border-t border-slate-100 dark:border-slate-900 flex flex-col items-center gap-4"
        >
          <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500 text-sm font-medium">
            <AlertCircle className="w-4 h-4" />
            <span>Need help? Contact our support team</span>
          </div>
          <div className="flex gap-6">
            <a href="#" className="text-xs font-bold text-slate-400 hover:text-indigo-500 transition-colors uppercase tracking-widest">Documentation</a>
            <a href="#" className="text-xs font-bold text-slate-400 hover:text-indigo-500 transition-colors uppercase tracking-widest">Status Page</a>
            <a href="#" className="text-xs font-bold text-slate-400 hover:text-indigo-500 transition-colors uppercase tracking-widest">Support</a>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
