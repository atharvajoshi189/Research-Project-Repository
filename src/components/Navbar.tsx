"use client";

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, Grid, UploadCloud, BarChart3, Menu, User, Search, LayoutDashboard, Settings, LogOut, ChevronDown, Sparkles, Users, FileClock } from 'lucide-react';
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

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            // Fetch role from profiles
            if (session?.user) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('role')
                    .eq('id', session.user.id)
                    .single();

                setUser({ ...session.user, role: profile?.role });
            } else {
                setUser(null);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const handleLogout = async () => {
        // Optimistic UI updates - Instant Feedback
        setUser(null);
        router.push('/');
        toast.success('Logged out successfully');

        // Perform actual sign out in background
        await supabase.auth.signOut();
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
        // Role Specific
        ...(user?.role === 'student' ? [
            { label: 'Upload', href: '/upload', icon: UploadCloud },
            { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard }
        ] : []),
        ...(user?.role === 'teacher' || user?.role === 'faculty' ? [
            { label: 'Monitoring', href: '/teacher', icon: BarChart3 },
            { label: 'Allotment', href: '/allotment', icon: Users },
        ] : []),
        ...(user?.role === 'hod' || user?.role === 'admin' ? [
            { label: 'Admin', href: '/admin', icon: LayoutDashboard },
            { label: 'Monitoring', href: '/teacher', icon: BarChart3 }, // HOD also gets monitoring view
            { label: 'Allotment', href: '/allotment', icon: Users },
        ] : []),
    ];

    // Auth-Aware Logic: Hide on /login and /signup
    const isAuthPage = pathname === '/login' || pathname === '/signup';

    // If on Auth Page OR AI Active, Hide Navbar (Standard & AI Mode handling)
    // NOTE: We keep specific AI Mode logic too if needed, but 'isAIActive' generally hides it.
    // The prompt says "If the user is on /login or /signup, hide the header."
    if (isAuthPage) return null;

    return (
        <>
            {/* 
              ROYAL STACK ARCHITECTURE - DEFINITIVE FIX
              Wrapper: Fixed, High Z-Index, Pointer Events ONE
            */}
            {/* HIDE Navbar completely in AI Mode for Zero Distraction */}
            {!isAIActive && (
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
                                    <div className={`relative h-16 w-auto flex items-center transition-all duration-500 opacity-100 scale-100`}>
                                        <img
                                            src="/logos/logo.png"
                                            className="h-full w-auto object-contain drop-shadow-xl"
                                            alt="College Logo"
                                        />
                                    </div>
                                </Link>
                            </motion.div>
                        )}
                    </AnimatePresence>


                    {/* --- TIER 2: NAVIGATION (Floating Glass Pill) --- */}
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
                        }}
                    >
                        {/* Unified Glass Background */}
                        <div
                            className={`absolute inset-0 rounded-full transition-all duration-500 ease-in-out border bg-[rgba(255,255,255,0.65)] border-white/40 shadow-xl shadow-indigo-500/10`}
                            style={{
                                backdropFilter: 'blur(12px)',
                            }}
                        ></div>

                        {/* Navbar Content */}
                        <div className={`relative flex items-center justify-between px-6 transition-all duration-500
                        ${isScrolled ? 'h-14' : 'h-14'}
                    `}>

                            {/* Left: Spacer (Logo removed as per request) */}
                            <div className="flex items-center gap-4 w-24 pointer-events-auto">
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
                                            className={`relative px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 z-[10001] flex items-center gap-2 cursor-pointer text-slate-500 hover:text-slate-800
                                            ${isActive
                                                    ? 'text-slate-900'
                                                    : 'text-slate-500 hover:text-slate-800'
                                                }
                                        `}
                                        >
                                            {/* Active "Sliding Pill" Indicator */}
                                            {isActive && (
                                                <motion.div
                                                    layoutId="activeNavPill"
                                                    className={`absolute inset-0 rounded-full -z-10 pointer-events-none bg-white shadow-sm ring-1 ring-black/5`}
                                                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                                                />
                                            )}

                                            <span className={`relative flex items-center gap-2 transition-transform duration-200 ${isHovered ? 'scale-105' : 'scale-100'}`}>
                                                <item.icon
                                                    size={16}
                                                    strokeWidth={isActive ? 2.5 : 2}
                                                    className={`transition-colors duration-300
                                                    ${isActive
                                                            ? 'text-indigo-600'
                                                            : 'text-slate-400 group-hover:text-indigo-500'
                                                        }
                                                `}
                                                />
                                                <span className={isActive ? 'font-bold' : ''}>{item.label}</span>
                                            </span>
                                        </Link>
                                    );
                                })}

                                {/* Login/Signup for Non-Auth Users */}
                                {!user && (
                                    <>
                                        <div className="h-6 w-px bg-slate-200 mx-2"></div>
                                        <Link href="/login" className="text-sm font-bold text-slate-600 hover:text-indigo-600 px-3 py-2 transition-colors">
                                            Log In
                                        </Link>
                                        <Link href="/signup" className="text-sm font-bold text-white bg-slate-900 px-4 py-2 rounded-full hover:bg-slate-800 transition-colors shadow-lg shadow-slate-200">
                                            Sign Up
                                        </Link>
                                    </>
                                )}
                            </nav>

                            {/* Right: Auth Profile / Actions */}
                            <div className="flex items-center justify-end gap-3 w-24 pointer-events-auto">
                                {/* Mobile Menu Toggle */}
                                <button
                                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                    className={`md:hidden p-2 rounded-full transition-colors text-slate-700 hover:bg-slate-100`}
                                >
                                    <Menu size={20} />
                                </button>

                                {user ? (
                                    <div className="relative hidden md:block">
                                        <button
                                            onClick={() => setIsProfileOpen(!isProfileOpen)}
                                            className={`flex items-center gap-2 p-1 rounded-full transition-all border bg-white border-slate-200 hover:shadow-md text-slate-700`}
                                        >
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shadow-sm bg-gradient-to-br from-indigo-500 to-purple-600 text-white`}>
                                                {user.email?.charAt(0).toUpperCase()}
                                            </div>
                                        </button>

                                        <AnimatePresence>
                                            {isProfileOpen && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                                    className={`absolute right-0 top-full mt-3 w-56 rounded-2xl shadow-xl overflow-hidden border backdrop-blur-xl bg-white/90 border-slate-100`}
                                                >
                                                    <div className="p-3 border-b border-white/5">
                                                        <p className={`text-sm font-bold text-slate-800`}>{user.user_metadata?.full_name || 'User'}</p>
                                                        <p className="text-xs opacity-60 truncate">{user.email}</p>
                                                    </div>
                                                    <div className="p-1">
                                                        <Link href="/dashboard" className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors text-slate-600 hover:bg-slate-50 hover:text-indigo-600`}>
                                                            <LayoutDashboard size={16} /> Dashboard
                                                        </Link>
                                                        <div className={`h-px my-1 mx-2 bg-slate-100`}></div>
                                                        <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-rose-500 hover:bg-rose-500/10 transition-colors">
                                                            <LogOut size={16} /> Sign Out
                                                        </button>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                ) : (
                                    <Link href="/login" className={`hidden md:flex p-2 rounded-full transition-colors cursor-pointer text-slate-600 hover:bg-slate-100`}>
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
                                    className={`md:hidden border-t overflow-hidden pointer-events-auto border-slate-100 bg-white/95`}
                                >
                                    <nav className="flex flex-col p-4 space-y-2">
                                        {navItems.map((item) => (
                                            <Link
                                                key={item.href}
                                                href={item.href}
                                                onClick={() => setIsMobileMenuOpen(false)}
                                                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold tracking-tight transition-colors cursor-pointer text-slate-600 hover:bg-slate-50 hover:text-indigo-600`}
                                            >
                                                <item.icon size={18} />
                                                {item.label}
                                            </Link>
                                        ))}
                                        {!user && (
                                            <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-slate-100/10">
                                                <Link href="/login" onClick={() => setIsMobileMenuOpen(false)} className={`w-full text-center py-2 rounded-xl border cursor-pointer border-slate-200 text-slate-700`}>Log In</Link>
                                                <Link href="/signup" onClick={() => setIsMobileMenuOpen(false)} className={`w-full text-center py-2 rounded-xl font-bold cursor-pointer bg-black text-white`}>Sign Up</Link>
                                            </div>
                                        )}
                                    </nav>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.header>
                </div>
            )}

            {/* AI MODE EXIT BUTTON (Optional, if we want one) */}
            {isAIActive && (
                <div className="fixed top-6 right-6 z-[100]">
                    <button
                        onClick={() => router.push('/')} // Or toggleAIMode
                    // Just a small Exit X or "Exit AI"
                    // But the user prompt says "maybe just with a tiny 'Exit' button in the corner."
                    // and relies on Search Bar toggle. 
                    // Let's rely on Search Bar Toggle primarily as per prompt "Hide Navigation Entirely"
                    // But I will leave a tiny invisible layer or just rely on the search bar.
                    // Actually, sticking to the prompt: "The top of the screen should be clean."
                    ></button>
                </div>
            )}


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
