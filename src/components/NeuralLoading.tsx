"use client";

import { Network } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';

interface NeuralLoadingProps {
    message?: string;
}

export default function NeuralLoading({ message = "Initializing Neural Hub..." }: NeuralLoadingProps) {
    const { resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const isDark = mounted && resolvedTheme === 'dark';

    return (
        <div className={`min-h-screen relative overflow-hidden flex flex-col items-center justify-center transition-colors duration-500 ${isDark ? 'bg-[#020617]' : 'bg-[#F8FAFC]'}`}>
            <div className="relative z-10 flex flex-col items-center">
                {/* Simplified Neural Core */}
                <div className="relative w-24 h-24 mb-8 flex items-center justify-center animate-pulse">
                    <div className={`absolute inset-0 rounded-[2rem] border flex items-center justify-center shadow-md
                        ${isDark
                            ? 'bg-slate-900/40 border-slate-700/50'
                            : 'bg-white border-teal-100/50'
                        }`}
                    >
                        <Network className={`w-10 h-10 transition-colors duration-500 ${isDark ? 'text-purple-400' : 'text-teal-600'}`} />
                    </div>
                </div>

                <div className="flex flex-col items-center text-center px-6">
                    <div className={`h-px w-12 mb-6 opacity-30 bg-gradient-to-r from-transparent to-transparent ${isDark ? 'via-purple-500' : 'via-teal-500'}`} />
                    
                    <p className={`text-[10px] font-black uppercase tracking-[0.4em] mb-4 transition-colors duration-500 ${isDark ? 'text-purple-200' : 'text-slate-400'}`}>
                        {message}
                    </p>
                    
                    {/* Simple bouncy dots */}
                    <div className="flex items-center gap-2">
                        <span className={`w-1.5 h-1.5 rounded-full animate-bounce [animation-delay:-0.3s] ${isDark ? 'bg-purple-400' : 'bg-teal-500'}`}></span>
                        <span className={`w-1.5 h-1.5 rounded-full animate-bounce [animation-delay:-0.15s] ${isDark ? 'bg-purple-400' : 'bg-teal-500'}`}></span>
                        <span className={`w-1.5 h-1.5 rounded-full animate-bounce ${isDark ? 'bg-purple-400' : 'bg-teal-500'}`}></span>
                    </div>
                </div>
            </div>
        </div>
    );
}
