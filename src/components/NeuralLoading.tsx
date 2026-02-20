"use client";

import { motion } from 'framer-motion';
import { Network } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import BackgroundBlobs from './BackgroundBlobs';
import GridPulse from './GridPulse';

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
            {/* Background Effects */}
            {!isDark && <BackgroundBlobs />}

            {isDark && (
                <>
                    <div className="bg-nebula"></div>
                    <div className="tech-grid opacity-30"></div>
                </>
            )}

            <div className={`fixed inset-0 z-0 pointer-events-none transition-opacity duration-500 ${isDark ? 'opacity-20' : 'opacity-100'}`}>
                <GridPulse />
            </div>

            <div className="relative z-10 flex flex-col items-center">
                <div className="relative w-32 h-32 mb-10">
                    {/* Outer Atmospheric Glow */}
                    <motion.div
                        animate={{
                            scale: [1, 1.3, 1],
                            opacity: [0.1, 0.25, 0.1],
                        }}
                        transition={{
                            duration: 3,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                        className={`absolute -inset-10 rounded-full blur-[60px] ${isDark ? 'bg-purple-500/30' : 'bg-teal-400'}`}
                    />

                    {/* Spinning Gradient Ring */}
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{
                            duration: 6,
                            repeat: Infinity,
                            ease: "linear"
                        }}
                        className={`absolute inset-0 rounded-full border-2 border-dashed ${isDark ? 'border-purple-400/30' : 'border-teal-200/50'}`}
                    />

                    {/* Neural Core */}
                    <motion.div
                        animate={{
                            scale: [0.95, 1.05, 0.95],
                        }}
                        transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                        className={`absolute inset-2 rounded-[2.5rem] backdrop-blur-2xl border flex items-center justify-center shadow-2xl overflow-hidden group 
                            ${isDark
                                ? 'bg-slate-900/40 border-slate-700/50'
                                : 'bg-white/40 border-white/50'
                            }`}
                    >
                        <div className={`absolute inset-0 opacity-50 bg-gradient-to-br ${isDark ? 'from-purple-500/20 to-blue-500/20' : 'from-teal-500/10 to-indigo-500/10'}`} />
                        <Network className={`w-12 h-12 relative z-10 transition-colors duration-500 ${isDark ? 'text-purple-400' : 'text-teal-600'}`} />

                        {/* Scanning Effect */}
                        <motion.div
                            animate={{ y: [-100, 100] }}
                            transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
                            className={`absolute inset-x-0 h-1 blur-sm z-20 bg-gradient-to-r from-transparent via-transparent to-transparent ${isDark ? 'via-purple-400/50' : 'via-teal-400/50'}`}
                        />
                    </motion.div>

                    {/* Orbiting Nodes */}
                    {[0, 72, 144, 216, 288].map((angle, i) => (
                        <motion.div
                            key={i}
                            animate={{ rotate: [angle, angle + 360] }}
                            transition={{
                                duration: 8 + i * 1.5,
                                repeat: Infinity,
                                ease: "linear"
                            }}
                            className="absolute inset-0"
                        >
                            <motion.div
                                animate={{
                                    scale: [0.8, 1.2, 0.8],
                                    opacity: [0.5, 1, 0.5]
                                }}
                                transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.3 }}
                                className={`absolute -top-1 left-1/2 w-3 h-3 rounded-lg shadow-lg border flex items-center justify-center
                                    ${isDark
                                        ? 'bg-slate-800 border-purple-500/30'
                                        : 'bg-white border-teal-100'
                                    }`}
                            >
                                <div className={`w-1 h-1 rounded-full ${isDark ? 'bg-purple-400' : 'bg-teal-500'}`} />
                            </motion.div>
                        </motion.div>
                    ))}
                </div>

                <div className="flex flex-col items-center text-center px-6">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="flex flex-col items-center"
                    >
                        <div className={`h-px w-12 mb-6 opacity-50 bg-gradient-to-r from-transparent to-transparent ${isDark ? 'via-purple-500' : 'via-teal-500'}`} />
                        <p className={`text-[10px] font-black uppercase tracking-[0.4em] mb-4 animate-pulse transition-colors duration-500 ${isDark ? 'text-purple-200' : 'text-slate-400'}`}>{message}</p>
                        <div className="flex items-center gap-2">
                            <span className={`w-1 h-1 rounded-full animate-bounce [animation-delay:-0.3s] shadow-[0_0_8px_rgba(20,184,166,0.5)] ${isDark ? 'bg-purple-400 shadow-purple-500/50' : 'bg-teal-500 shadow-teal-500/50'}`}></span>
                            <span className={`w-1 h-1 rounded-full animate-bounce [animation-delay:-0.15s] shadow-[0_0_8px_rgba(20,184,166,0.5)] ${isDark ? 'bg-purple-400 shadow-purple-500/50' : 'bg-teal-500 shadow-teal-500/50'}`}></span>
                            <span className={`w-1 h-1 rounded-full animate-bounce shadow-[0_0_8px_rgba(20,184,166,0.5)] ${isDark ? 'bg-purple-400 shadow-purple-500/50' : 'bg-teal-500 shadow-teal-500/50'}`}></span>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
