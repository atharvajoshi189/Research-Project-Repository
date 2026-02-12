"use client";

import { motion } from 'framer-motion';
import { Network } from 'lucide-react';
import BackgroundBlobs from './BackgroundBlobs';
import GridPulse from './GridPulse';

interface NeuralLoadingProps {
    message?: string;
}

export default function NeuralLoading({ message = "Initializing Neural Hub..." }: NeuralLoadingProps) {
    return (
        <div className="min-h-screen relative overflow-hidden bg-[#F8FAFC] flex flex-col items-center justify-center">
            <BackgroundBlobs />
            <div className="fixed inset-0 z-0 pointer-events-none">
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
                        className="absolute -inset-10 rounded-full bg-teal-400 blur-[60px]"
                    />

                    {/* Spinning Gradient Ring */}
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{
                            duration: 6,
                            repeat: Infinity,
                            ease: "linear"
                        }}
                        className="absolute inset-0 rounded-full border-2 border-dashed border-teal-200/50"
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
                        className="absolute inset-2 rounded-[2.5rem] bg-white/40 backdrop-blur-2xl border border-white/50 flex items-center justify-center shadow-2xl overflow-hidden group"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 to-indigo-500/10 opacity-50" />
                        <Network className="text-teal-600 w-12 h-12 relative z-10" />

                        {/* Scanning Effect */}
                        <motion.div
                            animate={{ y: [-100, 100] }}
                            transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
                            className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-teal-400/50 to-transparent blur-sm z-20"
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
                                className="absolute -top-1 left-1/2 w-3 h-3 bg-white rounded-lg shadow-lg border border-teal-100 flex items-center justify-center"
                            >
                                <div className="w-1 h-1 bg-teal-500 rounded-full" />
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
                        <div className="h-px w-12 bg-gradient-to-r from-transparent via-teal-500 to-transparent mb-6 opacity-50" />
                        <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.4em] mb-4 animate-pulse">{message}</p>
                        <div className="flex items-center gap-2">
                            <span className="w-1 h-1 bg-teal-50 rounded-full animate-bounce [animation-delay:-0.3s] shadow-[0_0_8px_rgba(20,184,166,0.5)] bg-teal-500"></span>
                            <span className="w-1 h-1 bg-teal-50 rounded-full animate-bounce [animation-delay:-0.15s] shadow-[0_0_8px_rgba(20,184,166,0.5)] bg-teal-500"></span>
                            <span className="w-1 h-1 bg-teal-50 rounded-full animate-bounce shadow-[0_0_8px_rgba(20,184,166,0.5)] bg-teal-500"></span>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
