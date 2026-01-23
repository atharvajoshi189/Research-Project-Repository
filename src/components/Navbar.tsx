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
            if (window.scrollY > 50) {
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
            {/* Header Container - Floating & Dynamic */}
            <motion.header
                initial={{ y: -100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className={`fixed left-1/2 -translate-x-1/2 z-50 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]
                    ${isScrolled ? 'top-4 w-[90%] max-w-5xl rounded-full' : 'top-6 w-[95%] max-w-6xl rounded-full'}
                `}
            >
                {/* Unified Glass Background */}
                <div
                    className={`absolute inset-0 rounded-full transition-all duration-500 ease-in-out border
                        ${isAIActive
                            ? 'bg-[rgba(10,5,20,0.7)] border-cyan-500/50 shadow-[0_0_20px_rgba(6,182,212,0.15)] dark-glass-breathing'
                            : 'bg-[rgba(255,255,255,0.4)] border-white/20 shadow-lg shadow-black/5'
                        }
                    `}
                    style={{
                        backdropFilter: isScrolled ? 'blur(20px)' : 'blur(16px)',
                        boxShadow: isAIActive
                            ? `0 0 ${isScrolled ? '25px' : '40px'} -5px rgba(6,182,212,0.3)`
                            : `0 10px 40px -10px rgba(0,0,0,0.05)`,
                    }}
                >
                    {/* Inner Gradient Border for Detail */}
                    {!isAIActive && (
                        <div className="absolute inset-0 rounded-full border border-transparent [mask-image:linear-gradient(white,white)] pointer-events-none"
                            style={{ background: 'linear-gradient(to right, rgba(59,130,246,0.2), rgba(168,85,247,0.2)) border-box', WebkitMaskComposite: 'xor', maskComposite: 'exclude' }}
                        ></div>
                    )}
                </div>

                {/* Navbar Content */}
                <div className={`relative flex items-center justify-between px-6 transition-all duration-500
                    ${isScrolled ? 'h-14' : 'h-16'}
                `}>

                    {/* Left: Logo Area */}
                    <div className="flex items-center gap-4">
                        <Link href="/" className="relative flex items-center group">
                            {/* Standard Logo */}
                            {!isAIActive && (
                                <div className="relative h-8 w-auto aspect-[3/1] overflow-visible flex items-center">
                                    <img
                                        src="/logos/logo.png"
                                        className="h-full w-auto object-contain transition-transform duration-300 group-hover:scale-105"
                                        alt="College Logo"
                                    />
                                </div>
                            )}

                            {/* AI Mode Logo */}
                            {isAIActive && (
                                <div className="relative h-10 w-auto aspect-[3/1] overflow-visible flex items-center">
                                    <img
                                        src="/logo_2.png"
                                        className="h-[140%] w-auto object-contain transition-transform duration-300 group-hover:scale-105 drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]"
                                        alt="AI Assistant"
                                    />
                                </div>
                            )}
                        </Link>
                    </div>


                    {/* Center: Sliding Navigation (Desktop) */}
                    <nav className="hidden md:flex items-center gap-1 bg-transparent px-2">
                        {navItems.map((item, index) => {
                            const isActive = pathname === item.href;
                            const isHovered = hoveredIndex === index;

                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onMouseEnter={() => setHoveredIndex(index)}
                                    onMouseLeave={() => setHoveredIndex(null)}
                                    className={`relative px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 z-10 flex items-center gap-2
                                        ${isActive
                                            ? (isAIActive ? 'text-white' : 'text-slate-800')
                                            : (isAIActive ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900')
                                        }
                                    `}
                                >
                                    {/* Active "Sliding Pill" Indicator */}
                                    {isActive && (
                                        <motion.div
                                            layoutId="activeNavPill"
                                            className={`absolute inset-0 rounded-full -z-10
                                                ${isAIActive
                                                    ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/20 shadow-[0_0_15px_rgba(6,182,212,0.2)]'
                                                    : 'bg-white shadow-[0_2px_10px_rgba(0,0,0,0.05)]'
                                                }
                                            `}
                                            transition={{ type: "spring", stiffness: 350, damping: 30 }}
                                        />
                                    )}

                                    {/* Hover Scale Effect */}
                                    <span className={`relative flex items-center gap-2 transition-transform duration-200 ${isHovered ? 'scale-105' : 'scale-100'}`}>
                                        <item.icon
                                            size={16}
                                            strokeWidth={isActive ? 2.5 : 2}
                                            className={`transition-colors duration-300
                                                ${isActive
                                                    ? (isAIActive ? 'text-cyan-400 drop-shadow-[0_0_5px_rgba(6,182,212,0.8)]' : 'text-indigo-600')
                                                    : (isAIActive ? 'text-slate-500 group-hover:text-cyan-200' : 'text-slate-400 group-hover:text-indigo-500')
                                                }
                                            `}
                                        />
                                        {item.label}
                                    </span>
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Right: Auth Profile / Actions */}
                    <div className="flex items-center gap-3">
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
                                    className={`flex items-center gap-2 pl-1 pr-3 py-1 rounded-full transition-all border
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
                                    <span className="text-xs font-semibold">{user.user_metadata?.full_name?.split(' ')[0] || 'User'}</span>
                                    <ChevronDown size={12} className={`opacity-60 transition-transform duration-300 ${isProfileOpen ? 'rotate-180' : ''}`} />
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
                                            <div className="p-1">
                                                <Link href="/dashboard" className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${isAIActive ? 'text-slate-300 hover:bg-white/10 hover:text-white' : 'text-slate-600 hover:bg-slate-50 hover:text-indigo-600'}`}>
                                                    <LayoutDashboard size={16} /> Dashboard
                                                </Link>
                                                <Link href="/settings" className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${isAIActive ? 'text-slate-300 hover:bg-white/10 hover:text-white' : 'text-slate-600 hover:bg-slate-50 hover:text-indigo-600'}`}>
                                                    <Settings size={16} /> Settings
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
                            <div className="hidden md:flex items-center gap-2">
                                <Link
                                    href="/login"
                                    className={`px-5 py-2 rounded-full text-sm font-semibold transition-all
                                        ${isAIActive
                                            ? 'text-cyan-300 hover:text-white hover:bg-white/5'
                                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                                        }
                                    `}
                                >
                                    Log In
                                </Link>
                                <Link
                                    href="/signup"
                                    className={`px-5 py-2 rounded-full text-sm font-semibold shadow-lg transition-all hover:scale-105 active:scale-95
                                        ${isAIActive
                                            ? 'bg-cyan-500 text-black hover:bg-cyan-400 hover:shadow-cyan-500/50'
                                            : 'bg-black text-white hover:bg-slate-800'
                                        }
                                    `}
                                >
                                    Sign Up
                                </Link>
                            </div>
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
                            className={`md:hidden border-t overflow-hidden
                                ${isAIActive ? 'border-white/10 bg-[#0f0a1e]/90' : 'border-slate-100 bg-white/90'}
                            `}
                        >
                            <nav className="flex flex-col p-4 space-y-2">
                                {navItems.map((item) => (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold tracking-tight transition-colors
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
                                        <Link href="/login" onClick={() => setIsMobileMenuOpen(false)} className={`w-full text-center py-2 rounded-xl border ${isAIActive ? 'border-white/20 text-white' : 'border-slate-200 text-slate-700'}`}>Log In</Link>
                                        <Link href="/signup" onClick={() => setIsMobileMenuOpen(false)} className={`w-full text-center py-2 rounded-xl font-bold ${isAIActive ? 'bg-cyan-600 text-white' : 'bg-black text-white'}`}>Sign Up</Link>
                                    </div>
                                )}
                            </nav>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.header>

            {/* Neon Breathing Keyframes (CSS injection for the AI effect) */}
            <style jsx global>{`
                @keyframes neon-breathe {
                    0%, 100% { box-shadow: 0 0 15px -3px rgba(6,182,212,0.3), inset 0 0 10px rgba(6,182,212,0.05); border-color: rgba(6,182,212,0.4); }
                    50% { box-shadow: 0 0 25px -3px rgba(168,85,247,0.4), inset 0 0 20px rgba(168,85,247,0.1); border-color: rgba(168,85,247,0.5); }
                }
                .dark-glass-breathing {
                    animation: neon-breathe 4s ease-in-out infinite;
                }
            `}</style>
        </>
    );
}
