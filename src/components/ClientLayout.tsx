"use client";

import React, { useState, useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ParticleBackground from './ParticleBackground';
import LoadingScreen from '@/components/LoadingScreen';
import { useAITheme } from "@/context/AIThemeContext";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
    const { isAIActive } = useAITheme();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [isLoading, setIsLoading] = useState(false);
    const isAIModePage = pathname?.startsWith('/ai-mode');
    const isAuthPage = pathname === '/login' || pathname === '/signup';

    return (
        <div className={`flex flex-col min-h-screen transition-all duration-800 ease-in-out ${(isAIActive || isAIModePage) ? 'ai-mode-active' : 'text-slate-900'}`}>
            <LoadingScreen isLoading={isLoading} />

            {/* Background Effects */}
            {(isAIActive || isAIModePage) && (
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
                    ${isAIActive ? 'opacity-95' : ''}
                `}>
                    {children}
                </main>

                {!isAIActive && !isAIModePage && !isAuthPage && <Footer />}
            </div>
        </div>
    );
}
