"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { useAITheme } from '@/context/AIThemeContext';

interface LoadingScreenProps {
    isLoading: boolean;
}

export default function LoadingScreen({ isLoading }: LoadingScreenProps) {
    const { isAIActive } = useAITheme();

    return (
        <AnimatePresence>
            {isLoading && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4, ease: "easeInOut" }}
                    className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center backdrop-blur-xl transition-colors duration-500
                        ${isAIActive
                            ? 'bg-[#0f0a1e]/80'
                            : 'bg-white/80'
                        }
                    `}
                >
                    {/* Top Progress Bar */}
                    <motion.div
                        initial={{ width: "0%" }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 0.8, ease: "easeInOut" }}
                        className={`absolute top-0 left-0 h-1 shadow-[0_0_10px_currentColor]
                            ${isAIActive ? 'bg-cyan-400 text-cyan-400' : 'bg-indigo-600 text-indigo-600'}
                        `}
                    />

                    {/* Centered Pulsing Logo */}
                    <motion.div
                        animate={{
                            scale: [1, 1.1, 1],
                            opacity: [0.8, 1, 0.8]
                        }}
                        transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                        className="relative z-10 flex flex-col items-center gap-4"
                    >
                        <div className="relative w-32 h-32 flex items-center justify-center">
                            {/* Glow Effect */}
                            <div className={`absolute inset-0 rounded-full blur-3xl opacity-40
                                ${isAIActive ? 'bg-cyan-500' : 'bg-indigo-500'}
                            `}></div>

                            {/* Logo Image */}
                            <img
                                src={isAIActive ? "/logo_2.png" : "/logos/logo.png"}
                                alt="Loading..."
                                className={`relative w-full h-full object-contain drop-shadow-2xl
                                    ${isAIActive ? 'brightness-125' : ''}
                                `}
                            />
                        </div>

                        {/* Status Text (Optional, keeps generic "Loading") */}
                        <motion.p
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`text-sm font-medium tracking-widest uppercase
                                ${isAIActive ? 'text-cyan-200' : 'text-slate-500'}
                            `}
                        >
                            Loading
                        </motion.p>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
