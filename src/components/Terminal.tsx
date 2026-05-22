import React, { useState, useRef, useEffect } from 'react';
import { Terminal as TerminalIcon, X, Send, Command } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const cn = (...inputs: any[]) => twMerge(clsx(inputs));

export const Terminal: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState('');
    const [output, setOutput] = useState<{ type: 'cmd' | 'out' | 'err', text: string }[]>([]);
    const [history, setHistory] = useState<string[]>([]);
    const [historyIndex, setHistoryIndex] = useState(-1);
    const [isExecuting, setIsExecuting] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [output]);

    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    const handleCommand = async (e: React.FormEvent) => {
        e.preventDefault();
        const cmd = input.trim();
        if (!cmd) return;

        setHistory(prev => [cmd, ...prev]);
        setHistoryIndex(-1);
        setOutput(prev => [...prev, { type: 'cmd', text: cmd }]);
        setInput('');
        setIsExecuting(true);

        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/cli/execute/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ command: cmd })
            });

            if (!response.ok) {
                const errData = await response.json();
                setOutput(prev => [...prev, { type: 'err', text: errData.error || 'Execution failed' }]);
                setIsExecuting(false);
                return;
            }

            const reader = response.body?.getReader();
            if (!reader) {
                setOutput(prev => [...prev, { type: 'err', text: 'Failed to read response stream' }]);
                setIsExecuting(false);
                return;
            }

            const decoder = new TextDecoder();
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                const chunk = decoder.decode(value, { stream: true });
                setOutput(prev => [...prev, { type: 'out', text: chunk }]);
            }

        } catch (error: any) {
            setOutput(prev => [...prev, { type: 'err', text: error.message || 'Network error' }]);
        } finally {
            setIsExecuting(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (historyIndex < history.length - 1) {
                const newIndex = historyIndex + 1;
                setHistoryIndex(newIndex);
                setInput(history[newIndex]);
            }
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (historyIndex > 0) {
                const newIndex = historyIndex - 1;
                setHistoryIndex(newIndex);
                setInput(history[newIndex]);
            } else if (historyIndex === 0) {
                setHistoryIndex(-1);
                setInput('');
            }
        }
    };

    return (
        <div className="fixed bottom-0 left-0 right-0 z-[110] pointer-events-none">
            <div className="max-w-[1600px] mx-auto px-4 md:px-8 relative h-screen">
                <AnimatePresence>
                    {!isOpen ? (
                        <motion.div 
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.5, opacity: 0 }}
                            className="absolute bottom-6 right-24 pointer-events-auto"
                        >
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setIsOpen(true)}
                                className="w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 bg-[#1a1a2e] text-emerald-400 border border-zinc-700 hover:border-emerald-500 group relative overflow-hidden"
                                title="Open mv2gh Terminal (Cmd+K)"
                            >
                                <div className="absolute inset-0 bg-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                                <TerminalIcon size={24} className="group-hover:animate-pulse" />
                                <div className="absolute -top-2 -right-2 flex items-center gap-0.5 px-1.5 py-1 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-500 text-[10px] font-bold shadow-lg opacity-0 group-hover:opacity-100 transition-opacity translate-y-1 group-hover:translate-y-0">
                                    <Command size={10} /> K
                                </div>
                            </motion.button>
                        </motion.div>
                    ) : (
                        <motion.div
                            initial={{ y: '100%', opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: '100%', opacity: 0 }}
                            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                            className="absolute bottom-0 left-4 right-4 md:left-8 md:right-8 lg:left-[calc(260px+32px)] lg:right-32 pointer-events-auto bg-[#1e293b] border-x border-t border-slate-600 rounded-t-xl overflow-hidden shadow-[0_-20px_50px_-12px_rgba(0,0,0,0.5)] h-[45vh] max-h-[600px] flex flex-col"
                        >
                            {/* Title Bar */}
                            <div className="flex items-center justify-between px-4 py-2.5 bg-[#0f172a] border-b border-slate-700 select-none">
                                <div className="flex items-center gap-3">
                                    <div className="flex gap-1.5">
                                        <div className="w-3 h-3 rounded-full bg-red-400 shadow-[0_0_10px_rgba(248,113,113,0.4)]" />
                                        <div className="w-3 h-3 rounded-full bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.4)]" />
                                        <div className="w-3 h-3 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.4)]" />
                                    </div>
                                    <div className="h-4 w-px bg-slate-700 mx-1" />
                                    <div className="flex items-center gap-2 text-xs text-slate-300 font-mono">
                                        <span className="opacity-70 font-bold">mv2gh@cli</span>
                                        <span className="opacity-30">|</span>
                                        <span className="text-emerald-400 truncate max-w-[200px]">~/move-to-github</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-[10px] text-slate-400 font-mono font-bold">
                                        ESC to close
                                    </div>
                                    <button 
                                        onClick={() => setIsOpen(false)}
                                        className="p-1.5 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-all transform hover:rotate-90"
                                    >
                                        <X size={18} />
                                    </button>
                                </div>
                            </div>

                            {/* Output area */}
                            <div 
                                ref={scrollRef}
                                className="flex-1 p-8 font-mono text-xs md:text-sm overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 bg-[#050508] relative group"
                            >
                                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/[0.03] blur-[100px] pointer-events-none" />
                                <div className="flex flex-col gap-1 mb-8 opacity-80">
                                    <div className="text-emerald-400 font-black tracking-tight uppercase tracking-widest text-[10px]">Move to GitHub CLI v1.2.4 (stable)</div>
                                    <div className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">Auth_Mode: JWT_Bearer | Status: Connected</div>
                                </div>
                                
                                <div className="text-slate-400 mb-4 pb-2 border-b border-slate-800/50">
                                    Type <span className="text-sky-400 font-bold">help</span> to explore migration protocols.
                                </div>

                                {output.map((line, i) => (
                                    <div key={i} className={cn(
                                        "mb-3 whitespace-pre-wrap break-all leading-relaxed animate-in fade-in slide-in-from-left-1 duration-300",
                                        line.type === 'cmd' ? "text-sky-400 font-bold" : line.type === 'err' ? "text-rose-400 bg-rose-400/5 px-3 py-1.5 rounded-xl border border-rose-400/10" : "text-emerald-400/90 [text-shadow:0_0_20px_rgba(52,211,153,0.3)]"
                                    )}>
                                        {line.type === 'cmd' ? (
                                            <div className="flex gap-2">
                                                <span className="text-emerald-400 font-bold opacity-50">➜</span>
                                                <span className="text-slate-500 text-[10px] uppercase font-black tracking-widest mt-0.5">admin@pfe: ~ </span>
                                                <span className="text-white tracking-tight">{line.text}</span>
                                            </div>
                                        ) : (
                                            <div className="pl-4 border-l border-white/5">
                                                {line.text}
                                            </div>
                                        )}
                                    </div>
                                ))}
                                {isExecuting && (
                                    <div className="flex gap-2 text-slate-100 animate-pulse mt-2">
                                        <span className="text-emerald-400 font-bold">➜</span>
                                        <span className="text-slate-500">processing...</span>
                                        <div className="w-2 h-5 bg-emerald-400 mt-0.5" />
                                    </div>
                                )}
                            </div>

                            {/* Input line */}
                            <form onSubmit={handleCommand} className="flex items-center gap-3 p-5 bg-[#0f172a] border-t border-slate-700 focus-within:border-emerald-400/50 transition-colors">
                                <span className="text-emerald-400 font-bold font-mono">➜</span>
                                <span className="text-slate-500 font-mono text-sm hidden md:inline font-semibold">admin@mv2gh: ~</span>
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    disabled={isExecuting}
                                    className="flex-1 bg-transparent border-none outline-none text-white font-mono text-sm placeholder:text-slate-600"
                                    placeholder="mv2gh migrate repo <name> ..."
                                    autoFocus
                                />
                                {isExecuting ? (
                                    <div className="h-5 w-5 border-2 border-slate-700 border-t-emerald-400 rounded-full animate-spin" />
                                ) : (
                                    <div className="flex items-center gap-2 group cursor-pointer" onClick={handleCommand}>
                                        <span className="text-[10px] text-slate-500 font-mono opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-widest font-bold">Execute</span>
                                        <Send size={16} className="text-slate-500 group-hover:text-emerald-400 transition-colors" />
                                    </div>
                                )}
                            </form>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};
