"use client";

import React from 'react';
import { usePathname } from 'next/navigation';
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ParticleBackground from './ParticleBackground';
import { useAITheme } from "@/context/AIThemeContext";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
    const { isAIActive } = useAITheme();
    const pathname = usePathname();
    const isAIModePage = pathname?.startsWith('/ai-mode');

    return (
        <div className={`flex flex-col min-h-screen transition-all duration-800 ease-in-out ${(isAIActive || isAIModePage) ? 'ai-mode-active' : 'bg-white text-slate-900'}`}>

            {/* Background Effects */}
            {(isAIActive || isAIModePage) && (
                <>
                    <div className="bg-nebula"></div>
                    <div className="tech-grid"></div>
                    <ParticleBackground />
                </>
            )}

            <div className="relative z-10 flex flex-col min-h-screen">
                {!isAIActive && !isAIModePage && <Navbar />}
                <main className={`flex-grow w-full transition-all duration-500 ${!isAIActive && !isAIModePage ? 'pt-24' : ''} ${isAIActive ? 'opacity-95' : ''}`}>
                    {children}
                </main>
                {!isAIActive && !isAIModePage && <Footer />}
            </div>
        </div>
    );
}
