"use client";

import { useAITheme } from '@/context/AIThemeContext';
import { useTheme } from 'next-themes';
import { useState, useEffect } from 'react';

interface LoadingScreenProps {
    isLoading: boolean;
}

export default function LoadingScreen({ isLoading }: LoadingScreenProps) {
    const { isAIActive } = useAITheme();
    const { resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!isLoading) return null;

    const isDark = mounted && (resolvedTheme === 'dark' || isAIActive);

    return (
        <div className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center transition-colors duration-300
            ${isDark ? 'bg-[#020617]' : 'bg-slate-50'}
        `}>
            <div className="relative z-10 flex flex-col items-center gap-4">
                <div className="relative w-24 h-24 flex items-center justify-center animate-pulse">
                    <img
                        src={(isAIActive || isDark) ? "/logo_2.png" : "/logos/logo.png"}
                        alt="Loading..."
                        className="relative w-full h-full object-contain drop-shadow-md"
                    />
                </div>
                <p className={`text-sm font-medium tracking-widest uppercase
                    ${isDark ? 'text-slate-400' : 'text-slate-500'}
                `}>
                    Loading...
                </p>
            </div>
        </div>
    );
}
