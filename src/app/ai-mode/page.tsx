"use client";

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState, Suspense, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight, Github, FileText, Search, BrainCircuit, Code2, Cpu, X } from 'lucide-react';
import { searchProjectsWithAI } from '../actions/aiAction';
import { useAITheme } from '@/context/AIThemeContext';

// Helper for Typing Effect
function TypingText({ text }: { text: string }) {
    const [displayedText, setDisplayedText] = useState("");

    useEffect(() => {
        let i = 0;
        setDisplayedText("");
        const timer = setInterval(() => {
            if (i < text.length) {
                setDisplayedText((prev) => prev + text.charAt(i));
                i++;
            } else {
                clearInterval(timer);
            }
        }, 10); // Fast typing
        return () => clearInterval(timer);
    }, [text]);

    return <span>{displayedText}</span>;
}

function AIModeContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { isAIActive, toggleAIMode } = useAITheme();

    // State
    const [query, setQuery] = useState("");
    const [hasSearched, setHasSearched] = useState(false);
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState<any>(null);
    const [isThinking, setIsThinking] = useState(false);

    // Sync with URL query
    useEffect(() => {
        const urlQuery = searchParams.get('query');
        if (urlQuery) {
            setQuery(urlQuery);
            setHasSearched(true);
            handleSearch(urlQuery);
        } else {
            setHasSearched(false);
            setResults(null);
        }
    }, [searchParams]);

    const handleSearch = async (q: string) => {
        if (!q.trim()) return;
        setLoading(true);
        // Simulate "Thinking" delay for effect if strictly needed, otherwise straight call
        const data = await searchProjectsWithAI(q);
        setResults(data);
        setLoading(false);
    };

    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;

        setIsThinking(true);
        // Push to URL to trigger Effect -> efficient state management
        // Short delay for "Pulse" animation feedback
        setTimeout(() => {
            setIsThinking(false);
            router.replace(`/ai-mode?query=${encodeURIComponent(query)}`);
        }, 800);
    };

    return (
        <div className="relative w-full min-h-screen flex flex-col items-center">

            {/* Main Content Container */}
            <div className={`w-full max-w-7xl px-6 transition-all duration-700 ${hasSearched ? 'pt-8' : 'pt-[30vh]'}`}>

                {/* 1. Unified Search Bar - Animated Positioning */}
                <motion.div
                    layout
                    transition={{ type: "spring", bounce: 0.2, duration: 0.8 }}
                    className="w-full max-w-3xl mx-auto relative z-50 mb-12"
                >
                    <form onSubmit={onSubmit} className="relative group">

                        {/* Pulse Glow */}
                        <div className={`absolute -inset-1 rounded-full opacity-60 blur-xl transition-all duration-1000 bg-gradient-to-r from-cyan-500 via-purple-600 to-pink-500 group-hover:opacity-80 group-focus-within:opacity-100 ${isThinking ? 'animate-pulse' : ''}`}></div>

                        <div className={`relative rounded-full border transition-all duration-300 overflow-hidden
                            bg-[#0f0c29]/60 backdrop-blur-xl border-white/20 shadow-[0_0_40px_rgba(6,182,212,0.2)] neural-pulse
                        `}>
                            <div className="w-full h-full flex items-center pr-3 pl-6 py-4">
                                <BrainCircuit className="w-6 h-6 text-cyan-400 mr-4 animate-pulse" />

                                <input
                                    type="text"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    className="w-full bg-transparent text-xl font-medium text-white placeholder-slate-400 focus:outline-none"
                                    placeholder="Ask Grok... (e.g., 'Analyze Blockchain trends')"
                                    autoComplete="off"
                                />

                                {/* Exit / Actions */}
                                <div className="flex items-center gap-3 pl-4 border-l border-white/10">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            toggleAIMode();
                                            router.push('/');
                                        }}
                                        className="group flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-all border border-red-500/20"
                                        title="Exit AI Mode"
                                    >
                                        <X size={16} />
                                        <span className="text-[10px] font-bold uppercase tracking-wider hidden sm:block">Exit</span>
                                    </button>

                                    <button
                                        type="submit"
                                        disabled={isThinking}
                                        className="w-10 h-10 rounded-full bg-cyan-600/20 text-cyan-400 flex items-center justify-center hover:bg-cyan-500 hover:text-white transition-all transform hover:scale-105"
                                    >
                                        {isThinking ? <Sparkles className="animate-spin" size={18} /> : <ArrowRight size={18} />}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </form>
                </motion.div>

                {/* 2. Loading State */}
                {loading && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex flex-col items-center justify-center py-12"
                    >
                        <div className="relative">
                            <div className="absolute -inset-4 bg-cyan-500/20 rounded-full blur-xl animate-pulse"></div>
                            <Cpu size={48} className="text-cyan-400 relative z-10 animate-spin-slow" />
                        </div>
                        <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 mt-6 animate-pulse">
                            Neural Processing...
                        </h2>
                    </motion.div>
                )}

                {/* 3. Results Content */}
                <AnimatePresence>
                    {!loading && hasSearched && results && (
                        <motion.div
                            initial={{ opacity: 0, y: 40 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, ease: "easeOut" }}
                            className="w-full pb-20"
                        >

                            {/* Grok Insights Box - Heavy Glass */}
                            {results.summary && (
                                <div className="mb-16 relative overflow-hidden rounded-3xl p-[1px] bg-gradient-to-r from-cyan-500/30 via-purple-500/30 to-pink-500/30">
                                    <div className="bg-[#0f0c29]/40 backdrop-blur-[25px] rounded-3xl p-8 md:p-10 relative">

                                        <div className="flex items-center gap-4 mb-6">
                                            <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                                                <Sparkles size={24} />
                                            </div>
                                            <h2 className="text-2xl font-bold text-white tracking-wide">
                                                {/* Dynamic Title Logic */}
                                                {query.length < 50 ? (
                                                    <span className="capitalize">
                                                        {query.toLowerCase().includes('project') ? 'Project Insights' :
                                                            query.toLowerCase().includes('insight') ? query :
                                                                `${query.replace(/'s|'|"/g, '')}'s Insights`}
                                                    </span>
                                                ) : "Grok Insights"}
                                                <span className="ml-3 px-2 py-0.5 rounded text-[10px] bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 uppercase tracking-wider align-middle">Beta</span>
                                            </h2>
                                        </div>

                                        <div className="prose prose-invert max-w-none">
                                            <p className="text-lg md:text-xl text-slate-100 leading-relaxed font-light text-shadow-sm whitespace-pre-wrap">
                                                <TypingText text={results.summary} />
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Project Cards Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {results.projects?.map((project: any, i: number) => (
                                    <motion.div
                                        key={project.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.1 }}
                                    >
                                        <div
                                            onClick={() => router.push(`/project/${project.id}`)}
                                            className="group h-full cursor-pointer ai-card rounded-3xl p-6 relative overflow-hidden flex flex-col"
                                        >
                                            {/* Top Metadata */}
                                            <div className="flex justify-between items-start mb-4">
                                                <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/5 text-cyan-300 border border-white/10">
                                                    {project.status || 'Active'}
                                                </span>
                                                <Github className="text-slate-500 group-hover:text-white transition-colors" size={18} />
                                            </div>

                                            {/* Title */}
                                            <h3 className="text-xl font-bold text-white mb-3 group-hover:text-cyan-400 transition-colors leading-tight">
                                                {project.title}
                                            </h3>

                                            {/* Abstract */}
                                            <p className="text-slate-300 text-sm line-clamp-3 mb-6 bg-transparent">
                                                {project.abstract}
                                            </p>

                                            {/* Tech Stack */}
                                            <div className="mt-auto flex flex-wrap gap-2">
                                                {project.tech_stack?.slice(0, 3).map((t: string, idx: number) => (
                                                    <span key={idx} className="text-[10px] font-medium px-2 py-1 rounded bg-cyan-950/30 text-cyan-200 border border-cyan-500/20">
                                                        {t}
                                                    </span>
                                                ))}
                                            </div>

                                            {/* Match Reason */}
                                            {project.aiReason && (
                                                <div className="mt-4 pt-4 border-t border-white/10">
                                                    <p className="text-xs text-purple-200 italic flex items-center gap-2">
                                                        <BrainCircuit size={12} className="text-purple-400" />
                                                        {project.aiReason}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                ))}
                            </div>

                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

export default function AIModePage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-cyan-500">Loading Neural Interface...</div>}>
            <AIModeContent />
        </Suspense>
    );
}
