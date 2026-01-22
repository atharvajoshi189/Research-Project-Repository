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
    const { isAIActive, toggleAIMode } = useAITheme();

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
        <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-in-out`}>
            {/* Unified Glass Background for AI Mode */}
            <div
                className={`absolute inset-0 transition-opacity duration-300 pointer-events-none 
                    ${isAIActive ? 'ai-glass' : 'bg-white/90 backdrop-blur-md'}
                    ${isScrolled || isAIActive ? 'opacity-100' : 'opacity-100'} 
                 `}
                style={{ height: '100%' }} // Cover the whole header
            ></div>

            {/* --- DESKTOP VIEW --- */}
            <div className="hidden md:block relative z-20">

                {/* Row 1: Logo Gallery + Toggle + Auth */}
                <div
                    className={`w-full max-w-[90rem] mx-auto px-8 lg:px-12 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] flex justify-between items-center relative z-40
                ${isScrolled && !isAIActive ? 'h-20 py-2' : 'h-24 py-4'}
            `}
                >
                    {/* Removed Background Glow for Cleaner Look */}

                    {/* Left: CSI Logo */}
                    <div className="flex-shrink-0 group">
                        <img src="/logos/csi.png" className={`h-14 w-auto object-contain transition-all duration-300 group-hover:scale-105 ${isAIActive ? 'brightness-125' : ''}`} alt="CSI" />
                    </div>

                    {/* Center: Main Logo */}
                    {/* Center: Main Logo - Smooth Cross-Fade */}
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-30">
                        <Link href="/" className="relative flex items-center justify-center h-20 w-[30rem]">
                            {/* Standard Logo */}
                            <img
                                src="/logos/logo.png"
                                className={`h-20 w-auto object-contain transition-all duration-700 ease-[cubic-bezier(0.4,0,0.2,1)] absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
                                    ${isAIActive ? 'opacity-0 scale-75 blur-sm' : 'opacity-100 scale-100 blur-0 hover:scale-110 hover:drop-shadow-xl'}
                                `}
                                alt="College Logo"
                            />

                            {/* AI Mode Logo */}
                            <img
                                src="/logo_2.png"
                                className={`h-28 w-auto object-contain transition-all duration-700 ease-[cubic-bezier(0.4,0,0.2,1)] absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
                                    ${isAIActive ? 'opacity-100 scale-100 blur-0 hover:scale-110' : 'opacity-0 scale-125 blur-sm'}
                                `}
                                alt="AI Assistant"
                            />
                        </Link>
                    </div>

                    {/* Right: Toggle + ACM + Profile */}
                    <div className="flex items-center gap-6 relative z-50">


                        <img src="/logos/acm.png" className={`h-14 w-auto object-contain transition-all duration-300 hover:scale-105 ${isAIActive ? 'brightness-125' : ''}`} alt="ACM" />

                        {/* Auth Navigation */}
                        <div className="flex items-center gap-3">
                            {user ? (
                                <div className="relative">
                                    <button
                                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                                        className={`flex items-center gap-3 px-3 py-1.5 rounded-full border transition-all group
                                            ${isAIActive
                                                ? 'bg-transparent border-white/20 hover:bg-white/10 text-white'
                                                : 'bg-slate-50 border-slate-200 hover:bg-white hover:shadow-md text-slate-700'}
                                        `}
                                    >
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm
                                             ${isAIActive ? 'bg-cyan-500/20 text-cyan-300' : 'bg-teal-100 text-teal-700'}
                                        `}>
                                            {user.email?.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="text-left hidden lg:block">
                                            <p className={`text-xs font-bold leading-tight ${isAIActive ? 'text-sharp-white' : 'text-slate-700'}`}>
                                                {user.user_metadata?.full_name?.split(' ')[0] || 'Student'}
                                            </p>
                                        </div>
                                        <ChevronDown size={14} className={`transition-transform ${isProfileOpen ? 'rotate-180' : ''} ${isAIActive ? 'text-white/60' : 'text-slate-400'}`} />
                                    </button>

                                    <AnimatePresence>
                                        {isProfileOpen && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                                className={`absolute right-0 top-full mt-2 w-56 rounded-2xl shadow-xl border overflow-hidden z-[100] py-2
                                                    ${isAIActive ? 'bg-[#161221] border-white/10 text-slate-200' : 'bg-white border-slate-100 text-slate-600'}
                                                `}
                                            >
                                                <div className={`px-4 py-2 border-b mb-1 ${isAIActive ? 'border-white/5' : 'border-slate-50'}`}>
                                                    <p className={`text-xs font-bold truncate ${isAIActive ? 'text-sharp-white' : 'text-slate-900'}`}>{user.user_metadata?.full_name || 'User'}</p>
                                                    <p className="text-[10px] opacity-60 truncate">{user.email}</p>
                                                </div>

                                                <Link href="/dashboard" onClick={() => setIsProfileOpen(false)} className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors ${isAIActive ? 'hover:bg-white/5 text-slate-300 hover:text-cyan-400' : 'text-slate-600 hover:bg-slate-50 hover:text-teal-600'}`}>
                                                    <LayoutDashboard size={16} /> My Workspace
                                                </Link>
                                                <Link href="/settings" onClick={() => setIsProfileOpen(false)} className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors ${isAIActive ? 'hover:bg-white/5 text-slate-300 hover:text-cyan-400' : 'text-slate-600 hover:bg-slate-50 hover:text-teal-600'}`}>
                                                    <Settings size={16} /> Profile Settings
                                                </Link>

                                                <div className={`h-px my-1 ${isAIActive ? 'bg-white/5' : 'bg-slate-50'}`}></div>

                                                <button onClick={handleLogout} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-rose-600 hover:bg-rose-500/10 transition-colors">
                                                    <LogOut size={16} /> Sign Out
                                                </button>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            ) : (
                                <>
                                    <Link href="/login" className={`px-5 py-2.5 rounded-full border font-semibold text-sm transition-all duration-300
                                        ${isAIActive
                                            ? 'border-white/20 text-white hover:border-cyan-400 hover:text-cyan-400 hover:bg-white/5'
                                            : 'border-slate-200 text-slate-600 hover:border-teal-500 hover:text-teal-600 hover:bg-teal-50/50'}
                                    `}>
                                        Login
                                    </Link>
                                    <Link href="/signup" className={`px-5 py-2.5 rounded-full font-semibold text-sm shadow-md transition-all duration-300
                                        ${isAIActive
                                            ? 'bg-gradient-to-r from-cyan-600 to-purple-600 text-white shadow-none hover:brightness-110'
                                            : 'bg-gradient-to-r from-teal-500 to-blue-600 text-white hover:shadow-xl hover:shadow-teal-500/20 hover:scale-105'}
                                    `}>
                                        Signup
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Row 2: Navigation Links */}
                <div className={`w-full transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] relative z-10 
                    ${isScrolled || isAIActive
                        ? (isAIActive ? 'border-t border-white/5 py-2' : 'bg-white/80 backdrop-blur-xl border-b border-slate-200/50 py-2 shadow-sm')
                        : 'bg-white/50 backdrop-blur-md border-t border-b border-slate-100 py-3'}
                `}>
                    <nav className="flex justify-center items-center gap-2 relative">
                        <div className="flex bg-slate-100/0 rounded-full p-1 relative">
                            {navItems.map((item, index) => {
                                const isActive = pathname === item.href;
                                const isHovered = hoveredIndex === index;
                                return (
                                    <Link key={item.href} href={item.href} onMouseEnter={() => setHoveredIndex(index)} onMouseLeave={() => setHoveredIndex(null)}
                                        className={`relative px-6 py-2 rounded-full text-sm font-bold tracking-tight transition-colors duration-300 flex items-center gap-2 z-10 
                                        ${isActive
                                                ? (isAIActive ? 'text-cyan-400' : 'text-teal-700')
                                                : (isAIActive ? 'text-slate-300 hover:text-white' : 'text-slate-600 hover:text-slate-900')}
                                        `}
                                    >
                                        {isHovered && <motion.div layoutId="navHover" className={`absolute inset-0 rounded-full -z-10 ${isAIActive ? 'bg-white/5' : 'bg-slate-100'}`} transition={{ type: "spring", stiffness: 300, damping: 30 }} />}
                                        <span className="relative flex items-center gap-2"><item.icon size={16} strokeWidth={2.5} className={isActive ? (isAIActive ? 'text-cyan-400' : 'text-teal-600') : 'opacity-70'} />{item.label}</span>
                                        {isActive && <motion.div layoutId="navActive" className={`absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full ${isAIActive ? 'bg-cyan-500' : 'bg-teal-500'}`} transition={{ duration: 0.3 }} />}
                                    </Link>
                                );
                            })}
                        </div>
                    </nav>
                </div>
            </div>


            {/* --- MOBILE VIEW --- */}
            <div className={`md:hidden w-full px-6 py-4 flex justify-between items-center bg-white/95 backdrop-blur-md border-b border-slate-100 ${isAIActive ? 'bg-[#140028] border-white/10' : ''}`}>
                <Link href="/">
                    <img
                        src="/logos/logo.png"
                        className="h-10 w-auto object-contain"
                        alt="College Logo"
                    />
                </Link>

                <div className="flex items-center gap-4">


                    <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className={`p-2 ${isAIActive ? 'text-white' : 'text-slate-600'}`}>
                        <Menu size={24} />
                    </button>
                </div>
            </div>

            {/* Mobile Menu Dropdown */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className={`md:hidden overflow-hidden shadow-xl absolute top-full left-0 right-0 ${isAIActive ? 'bg-[#1f0d36] border-b border-white/10' : 'bg-white border-b border-slate-200'}`}
                    >
                        <nav className="flex flex-col p-4 space-y-2">
                            {navItems.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold tracking-tight
                                        ${isAIActive ? 'text-slate-300 hover:bg-white/10 hover:text-cyan-400' : 'text-slate-600 hover:bg-slate-50 hover:text-teal-600'}
                                    `}
                                >
                                    <item.icon size={18} />
                                    {item.label}
                                </Link>
                            ))}
                        </nav>
                    </motion.div>
                )}
            </AnimatePresence>

        </header>
    );
}
