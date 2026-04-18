import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Bot, Loader2, Maximize2, Minimize2 } from 'lucide-react';
import { useParams, useLocation } from 'react-router-dom';
import { twMerge } from 'tailwind-merge';
import clsx from 'clsx';

interface Message {
  role: 'user' | 'bot';
  content: string;
}

export function ChatbotPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [input, setInput] = useState('');
  const [token, setToken] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'bot', content: "Hello! I'm your Migration Assistant. How can I help you today?" }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const { id: routeId } = useParams();
  const location = useLocation();

  // Extract ID from path if routeId is not available (common in parent layouts)
  const pathParts = location.pathname.split('/').filter(Boolean);
  const id = routeId || pathParts[pathParts.length - 1];

  // Determine context from URL
  const isRepoPage = location.pathname.includes('/repositories/details/');
  const isPipelinePage = location.pathname.includes('/pipelines/details/');

  useEffect(() => {
    const fetchToken = async () => {
      try {
        const res = await fetch('/api/users/me/');
        if (res.ok) {
          const data = await res.json();
          setToken(data.token);
        }
      } catch (err) {
        console.error("Failed to fetch token for chatbot", err);
      }
    };
    fetchToken();
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userToken = token || localStorage.getItem('token');
    if (!userToken) {
      setMessages(prev => [...prev, { role: 'bot', content: "Authentication error. Your session might have expired." }]);
      return;
    }

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:5005/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`
        },
        body: JSON.stringify({
          message: userMessage,
          repo_id: isRepoPage ? id : undefined,
          pipeline_id: isPipelinePage ? id : undefined
        })
      });

      const data = await response.json();
      if (data.table_data) {
        setMessages(prev => [...prev, { role: 'bot', content: data.table_data }]);
      } else {
        setMessages(prev => [...prev, { role: 'bot', content: "Sorry, I couldn't process that request." }]);
      }
    } catch (error) {
      setMessages(prev => [...prev, { role: 'bot', content: "Error connecting to the chatbot service. Please ensure it is running on port 5005." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95, transformOrigin: 'bottom right' }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className={twMerge(
              "mb-4 bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-[#333] rounded-2xl shadow-2xl overflow-hidden flex flex-col transition-all duration-300",
              isExpanded ? "w-[90vw] h-[85vh] max-w-5xl" : "w-[440px] h-[600px]"
            )}
          >
            {/* Header */}
            <div className="p-4 bg-gradient-to-r from-indigo-600 to-violet-600 dark:from-indigo-900 dark:to-violet-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-md">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm tracking-tight">Migration Assistant</h3>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[10px] text-indigo-100 uppercase tracking-widest font-semibold">Online</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                >
                  {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </button>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-[#050505]"
            >
              {messages.map((msg, i) => (
                <div 
                  key={i} 
                  className={clsx(
                    "flex flex-col",
                    msg.role === 'user' ? "items-end" : "items-start"
                  )}
                >
                  <div className={clsx(
                    "max-w-[85%] p-3 rounded-2xl text-sm shadow-sm",
                    msg.role === 'user' 
                      ? "bg-indigo-600 text-white rounded-tr-none" 
                      : "bg-white dark:bg-[#1a1a1a] text-slate-800 dark:text-slate-200 border border-slate-100 dark:border-[#333] rounded-tl-none"
                  )}>
                    <div className="whitespace-pre-wrap">
                      {msg.content.includes('|') ? (
                        <MarkdownTable content={msg.content} />
                      ) : (
                        msg.content
                      )}
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 px-1">
                    {msg.role === 'bot' ? 'Assistant' : 'You'}
                  </span>
                </div>
              ))}
              {isLoading && (
                <div className="flex items-start gap-2">
                  <div className="p-3 bg-white dark:bg-[#1a1a1a] border border-slate-100 dark:border-[#333] rounded-2xl rounded-tl-none shadow-sm">
                    <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-4 bg-white dark:bg-[#0a0a0a] border-t border-slate-100 dark:border-[#333]">
              <div className="relative flex items-center gap-2">
                <input 
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask about complexity, risk..."
                  className="flex-1 bg-slate-100 dark:bg-[#111] border-none rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 transition-all dark:text-white"
                />
                <button 
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className="p-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl transition-all"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={twMerge(
          "w-14 h-14 rounded-full flex items-center justify-center shadow-xl transition-all duration-500 bg-gradient-to-tr from-indigo-600 to-violet-500 text-white",
          isOpen && "rotate-90 scale-90"
        )}
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
      </motion.button>
    </div>
  );
}

function MarkdownTable({ content }: { content: string }) {
  // Simple table parser for Markdown
  const lines = content.trim().split('\n');
  const tableLines = lines.filter(l => l.includes('|'));
  
  if (tableLines.length < 2) return <>{content}</>;

  const headers = tableLines[0].split('|').filter(s => s.trim()).map(s => s.trim());
  const rows = tableLines.slice(2).map(row => 
    row.split('|').filter(s => s.trim()).map(s => s.trim())
  );

  return (
    <div className="overflow-x-auto my-2 rounded-lg border border-slate-100 dark:border-[#333]">
      <table className="w-full text-sm text-left border-collapse">
        <thead>
          <tr className="bg-slate-50 dark:bg-[#222]">
            {headers.map((h, i) => (
              <th key={i} className="px-3 py-2 border-b border-slate-100 dark:border-[#333] font-bold text-slate-700 dark:text-slate-300 whitespace-nowrap">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors">
              {row.map((cell, j) => (
                <td key={j} className="px-3 py-2 border-b border-slate-100 dark:border-[#333] text-slate-600 dark:text-slate-400">
                  {cell.includes('🔒') ? (
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-100 dark:bg-[#333] text-[9px] font-medium text-slate-500">
                      {cell}
                    </span>
                  ) : cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
