"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

interface ScrollBackgroundProps {
    activeSection: string;
}

export default function ScrollBackground({ activeSection }: ScrollBackgroundProps) {
    const { theme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const isDark = mounted && theme === 'dark';

    // Simplified static colors instead of heavy moving blobs
    const getBackgroundClass = () => {
        if (isDark) {
            switch (activeSection) {
                case "features": return "bg-slate-950";
                case "hall-of-fame": return "bg-slate-950";
                case "repo-pulse": return "bg-slate-950";
                default: return "bg-slate-900";
            }
        }
        
        switch (activeSection) {
            case "features": return "bg-emerald-50";
            case "hall-of-fame": return "bg-blue-50";
            case "repo-pulse": return "bg-teal-50";
            default: return "bg-slate-50";
        }
    };

    return (
        <div className={`fixed inset-0 w-full h-full z-0 pointer-events-none overflow-hidden transition-colors duration-700 ease-in-out ${getBackgroundClass()}`}>
            {/* Static subtle noise texture to keep the premium feel without the lag */}
            <div className={`absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] ${isDark ? 'mix-blend-screen' : 'mix-blend-multiply'}`} />
        </div>
    );
}
