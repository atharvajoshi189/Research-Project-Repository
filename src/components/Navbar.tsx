"use client";

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, Grid, UploadCloud, BarChart3, Menu, User, Search, LayoutDashboard, Settings, LogOut, ChevronDown, Sparkles } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { useAITheme } from '@/context/AIThemeContext';

export default function Navbar() {
    const pathname = usePathname();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
    const [user, setUser] = useState<any>(null);
    const router = useRouter();
    const { isAIActive } = useAITheme();

    useEffect(() => {
        const checkUser = async () => {
            const { data: { session }, error } = await supabase.auth.getSession();
            if (error) {
                console.error("Error checking session:", error.message);
                if (error.message.includes("Refresh Token")) {
                    await supabase.auth.signOut();
                    setUser(null);
                    return;
                }
            }
            setUser(session?.user || null);
        };
        checkUser();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user || null);
        });

        return () => subscription.unsubscribe();
    }, []);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        setUser(null);
        router.push('/');
        toast.success('Logged out successfully');
    };

    useEffect(() => {
        const handleScroll = () => {
            // Sensitivity for "Royal Stack" transition
            if (window.scrollY > 80) {
                setIsScrolled(true);
            } else {
                setIsScrolled(false);
            }
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navItems = [
        { label: 'Home', href: '/', icon: Home },
        { label: 'Browse', href: '/search', icon: Search },
        { label: 'Upload', href: '/upload', icon: UploadCloud },
        ...(user ? [{ label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard }] : []),
        { label: 'Admin', href: '/admin', icon: LayoutDashboard },
    ];

    return (
        <>
            {/* 
              ROYAL STACK ARCHITECTURE - DEFINITIVE FIX
              Wrapper: Fixed, High Z-Index, Pointer Events ONE
            */}
            <div className="fixed inset-0 z-[100] pointer-events-none flex flex-col items-center">

                {/* --- TIER 1: IDENTITY (Centered Top Logo) --- */}
                {/* Container: Blue Debug Border */}
                <AnimatePresence>
                    {!isScrolled && (
                        <motion.div
                            initial={{ opacity: 0, y: -20, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -20, scale: 0.9, transition: { duration: 0.3 } }}
                            className="absolute top-6 w-full flex justify-center items-center pointer-events-none"
                        >
                            <Link href="/" className="pointer-events-auto relative group cursor-pointer">
                                {/* Standard Logo */}
                                <div className={`relative h-16 w-auto flex items-center transition-all duration-500 ${isAIActive ? 'opacity-0 scale-90 absolute' : 'opacity-100 scale-100'}`}>
                                    <img
                                        src="/logos/logo.png"
                                        className="h-full w-auto object-contain drop-shadow-xl"
                                        alt="College Logo"
                                    />
                                </div>

                                {/* AI Logo (Royal Glow) */}
                                <div className={`relative h-20 w-auto flex items-center transition-all duration-500 ${isAIActive ? 'opacity-100 scale-100' : 'opacity-0 scale-90 absolute'}`}>
                                    <img
                                        src="/logo_2.png"
                                        className="h-full w-auto object-contain drop-shadow-[0_0_25px_rgba(6,182,212,0.6)] animate-pulse-slow"
                                        alt="AI Assistant"
                                    />
                                </div>
                            </Link>
                        </motion.div>
                    )}
                </AnimatePresence>


                {/* --- TIER 2: NAVIGATION (Floating Glass Pill) --- */}
                {/* Nav Bar: Red Debug Border, Extreme Z-Index */}
                <motion.header
                    layout
                    initial={{ y: 50, opacity: 0 }}
                    animate={{
                        y: 0,
                        opacity: 1,
                        top: isScrolled ? '1rem' : '6rem'
                    }}
                    transition={{ duration: 0.5, type: "spring", bounce: 0, damping: 20 }}
                    className={`fixed left-1/2 -translate-x-1/2 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] pointer-events-auto
                        ${isScrolled
                            ? 'w-[92%] max-w-5xl rounded-full'
                            : 'w-[95%] max-w-4xl rounded-full'
                        }
                    `}
                    style={{
                        zIndex: 9999, // EXTREME Z-INDEX
                        border: '2px solid red' // DEBUG MODE
                    }}
                >
                    {/* Unified Glass Background */}
                    <div
                        className={`absolute inset-0 rounded-full transition-all duration-500 ease-in-out border
                            ${isAIActive
                                ? 'bg-[rgba(10,5,20,0.85)] border-cyan-500/50 shadow-[0_0_20px_rgba(6,182,212,0.15)] dark-glass-breathing'
                                : 'bg-[rgba(255,255,255,0.65)] border-white/40 shadow-xl shadow-indigo-500/10'
                            }
                        `}
                        style={{
                            backdropFilter: 'blur(24px)',
                        }}
                    ></div>

                    {/* Navbar Content */}
                    <div className={`relative flex items-center justify-between px-6 transition-all duration-500
                        ${isScrolled ? 'h-14' : 'h-14'}
                    `}>

                        {/* Left: Mini-Logo */}
                        <div className="flex items-center gap-4 w-24 pointer-events-auto">
                            <AnimatePresence>
                                {isScrolled && (
                                    <motion.div
                                        initial={{ opacity: 0, x: -10, scale: 0.8 }}
                                        animate={{ opacity: 1, x: 0, scale: 1 }}
                                        exit={{ opacity: 0, x: -10, scale: 0.8 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <Link href="/" className="block cursor-pointer">
                                            <img
                                                src={isAIActive ? "/logo_2.png" : "/logos/logo.png"}
                                                className={`h-8 w-auto object-contain ${isAIActive ? 'brightness-125 drop-shadow-[0_0_5px_rgba(6,182,212,0.8)]' : ''}`}
                                                alt="Logo"
                                            />
                                        </Link>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>


                        {/* Center: Sliding Navigation */}
                        <nav className="hidden md:flex flex-1 justify-center items-center gap-1 bg-transparent px-2 h-full z-[10000] pointer-events-auto">
                            {navItems.map((item, index) => {
                                const isActive = pathname === item.href;
                                const isHovered = hoveredIndex === index;

                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        onMouseEnter={() => setHoveredIndex(index)}
                                        onMouseLeave={() => setHoveredIndex(null)}
                                        className={`relative px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 z-[10001] flex items-center gap-2 cursor-pointer
                                            ${isActive
                                                ? (isAIActive ? 'text-white' : 'text-slate-900')
                                                : (isAIActive ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-800')
                                            }
                                        `}
                                    >
                                        {/* Active "Sliding Pill" Indicator */}
                                        {isActive && (
                                            <motion.div
                                                layoutId="activeNavPill"
                                                className={`absolute inset-0 rounded-full -z-10 pointer-events-none
                                                    ${isAIActive
                                                        ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/20 shadow-[0_0_15px_rgba(6,182,212,0.2)]'
                                                        : 'bg-white shadow-sm ring-1 ring-black/5'
                                                    }
                                                `}
                                                transition={{ type: "spring", stiffness: 350, damping: 30 }}
                                            />
                                        )}

                                        <span className={`relative flex items-center gap-2 transition-transform duration-200 ${isHovered ? 'scale-105' : 'scale-100'}`}>
                                            <item.icon
                                                size={16}
                                                strokeWidth={isActive ? 2.5 : 2}
                                                className={`transition-colors duration-300
                                                    ${isActive
                                                        ? (isAIActive ? 'text-cyan-400' : 'text-indigo-600')
                                                        : (isAIActive ? 'text-slate-500 group-hover:text-cyan-200' : 'text-slate-400 group-hover:text-indigo-500')
                                                    }
                                                `}
                                            />
                                            <span className={isActive ? 'font-bold' : ''}>{item.label}</span>
                                        </span>
                                    </Link>
                                );
                            })}
                        </nav>

                        {/* Right: Auth Profile / Actions */}
                        <div className="flex items-center justify-end gap-3 w-24 pointer-events-auto">
                            {/* Mobile Menu Toggle */}
                            <button
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                className={`md:hidden p-2 rounded-full transition-colors ${isAIActive ? 'text-white hover:bg-white/10' : 'text-slate-700 hover:bg-slate-100'}`}
                            >
                                <Menu size={20} />
                            </button>

                            {user ? (
                                <div className="relative hidden md:block">
                                    <button
                                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                                        className={`flex items-center gap-2 p-1 rounded-full transition-all border
                                            ${isAIActive
                                                ? 'bg-white/5 border-white/10 hover:bg-white/10 text-white'
                                                : 'bg-white border-slate-200 hover:shadow-md text-slate-700'
                                            }
                                        `}
                                    >
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shadow-sm
                                             ${isAIActive ? 'bg-gradient-to-br from-cyan-500 to-blue-600 text-white' : 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white'}
                                        `}>
                                            {user.email?.charAt(0).toUpperCase()}
                                        </div>
                                    </button>

                                    <AnimatePresence>
                                        {isProfileOpen && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                                className={`absolute right-0 top-full mt-3 w-56 rounded-2xl shadow-xl overflow-hidden border backdrop-blur-xl
                                                    ${isAIActive ? 'bg-[rgba(15,10,30,0.9)] border-white/10' : 'bg-white/90 border-slate-100'}
                                                `}
                                            >
                                                <div className="p-3 border-b border-white/5">
                                                    <p className={`text-sm font-bold ${isAIActive ? 'text-white' : 'text-slate-800'}`}>{user.user_metadata?.full_name || 'User'}</p>
                                                    <p className="text-xs opacity-60 truncate">{user.email}</p>
                                                </div>
                                                <div className="p-1">
                                                    <Link href="/dashboard" className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${isAIActive ? 'text-slate-300 hover:bg-white/10 hover:text-white' : 'text-slate-600 hover:bg-slate-50 hover:text-indigo-600'}`}>
                                                        <LayoutDashboard size={16} /> Dashboard
                                                    </Link>
                                                    <div className={`h-px my-1 mx-2 ${isAIActive ? 'bg-white/10' : 'bg-slate-100'}`}></div>
                                                    <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-rose-500 hover:bg-rose-500/10 transition-colors">
                                                        <LogOut size={16} /> Sign Out
                                                    </button>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            ) : (
                                <Link href="/login" className={`hidden md:flex p-2 rounded-full transition-colors cursor-pointer ${isAIActive ? 'text-white hover:bg-white/10' : 'text-slate-600 hover:bg-slate-100'}`}>
                                    <User size={20} />
                                </Link>
                            )}
                        </div>
                    </div>

                    {/* Mobile Menu Dropdown */}
                    <AnimatePresence>
                        {isMobileMenuOpen && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className={`md:hidden border-t overflow-hidden pointer-events-auto
                                    ${isAIActive ? 'border-white/10 bg-[#0f0a1e]/95' : 'border-slate-100 bg-white/95'}
                                `}
                            >
                                <nav className="flex flex-col p-4 space-y-2">
                                    {navItems.map((item) => (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            onClick={() => setIsMobileMenuOpen(false)}
                                            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold tracking-tight transition-colors cursor-pointer
                                                ${isAIActive
                                                    ? 'text-slate-300 hover:bg-white/10 hover:text-cyan-400'
                                                    : 'text-slate-600 hover:bg-slate-50 hover:text-indigo-600'
                                                }
                                            `}
                                        >
                                            <item.icon size={18} />
                                            {item.label}
                                        </Link>
                                    ))}
                                    {!user && (
                                        <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-slate-100/10">
                                            <Link href="/login" onClick={() => setIsMobileMenuOpen(false)} className={`w-full text-center py-2 rounded-xl border cursor-pointer ${isAIActive ? 'border-white/20 text-white' : 'border-slate-200 text-slate-700'}`}>Log In</Link>
                                            <Link href="/signup" onClick={() => setIsMobileMenuOpen(false)} className={`w-full text-center py-2 rounded-xl font-bold cursor-pointer ${isAIActive ? 'bg-cyan-600 text-white' : 'bg-black text-white'}`}>Sign Up</Link>
                                        </div>
                                    )}
                                </nav>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.header>
            </div>

            {/* Neon Breathing Global Styles */}
            <style jsx global>{`
                @keyframes neon-breathe {
                    0%, 100% { box-shadow: 0 0 15px -3px rgba(6,182,212,0.3), inset 0 0 10px rgba(6,182,212,0.05); border-color: rgba(6,182,212,0.4); }
                    50% { box-shadow: 0 0 25px -3px rgba(168,85,247,0.4), inset 0 0 20px rgba(168,85,247,0.1); border-color: rgba(168,85,247,0.5); }
                }
                .dark-glass-breathing {
                    animation: neon-breathe 4s ease-in-out infinite;
                }
                .animate-pulse-slow {
                    animation: pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite;
                }
            `}</style>
        </>
    );
}
