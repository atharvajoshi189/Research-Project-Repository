"use client";

import React, { useState, useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ParticleBackground from './ParticleBackground';
import LoadingScreen from '@/components/LoadingScreen';
import { useAITheme } from "@/context/AIThemeContext";
import { useTheme } from "next-themes";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
    const { isAIActive } = useAITheme();
    const { resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [isLoading, setIsLoading] = useState(false);

    // Prevent hydration mismatch
    useEffect(() => {
        setMounted(true);
    }, []);

    const isAIModePage = pathname?.startsWith('/ai-mode');
    const isAuthPage = pathname === '/login' || pathname === '/signup';

    // Show nebula if AI mode is active OR if it's dark mode (and mounted)
    const showBackground = isAIActive || isAIModePage || (mounted && resolvedTheme === 'dark');

    return (
        <div className={`flex flex-col min-h-screen transition-all duration-800 ease-in-out ${showBackground ? 'ai-mode-active' : 'text-slate-900'}`}>
            <LoadingScreen isLoading={isLoading} />

            {/* Background Effects */}
            {showBackground && (
                <>
                    <div className="bg-nebula"></div>
                    <div className="tech-grid"></div>
                    <ParticleBackground />
                </>
            )}

            <div className="relative z-10 flex flex-col min-h-screen">
                {/* Navbar Logic: Hidden on Auth, Hidden on AI Mode *Page* (if desired, currently only Auth requested) */}
                {!isAIModePage && !isAuthPage && <Navbar />}

                {/* Main Content Padding Logic */}
                <main className={`flex-grow w-full transition-all duration-500 
                    ${!isAIModePage && !isAuthPage ? 'pt-40' : ''} 
                    ${showBackground ? 'opacity-95' : ''}
                `}>
                    {children}
                </main>

                {!showBackground && !isAIModePage && !isAuthPage && <Footer />}
            </div>
        </div>
    );
}
