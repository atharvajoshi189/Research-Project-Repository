"use client";

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, Grid, UploadCloud, BarChart3, Menu, User, Search, LayoutDashboard, Settings, LogOut, ChevronDown } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
    const pathname = usePathname();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
    const [user, setUser] = useState<any>(null);
    const router = useRouter();

    useEffect(() => {
        const checkUser = async () => {
            const { data: { session }, error } = await supabase.auth.getSession();

            if (error) {
                console.error("Error checking session:", error.message);
                if (error.message.includes("Refresh Token")) {
                    // Token is invalid, force sign out to clear storage
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
        { label: 'Admin', href: '/admin', icon: LayoutDashboard }, // Assuming Admin is separate, or we can hide it for non-admins if we had role logic
    ];

    return (
        <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-in-out">
            <div
                className={`absolute inset-0 bg-white/90 backdrop-blur-md transition-opacity duration-300 pointer-events-none ${isScrolled ? 'opacity-0' : 'opacity-100'}`}
                style={{ height: '100px' }}
            ></div>

            {/* --- DESKTOP VIEW --- */}
            <div className="hidden md:block">

                {/* Row 1: Logo Gallery */}
                <div
                    className={`w-full max-w-[90rem] mx-auto px-8 lg:px-12 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] flex justify-between items-center relative z-20
                ${isScrolled ? '-translate-y-full opacity-0 h-0 py-0 overflow-hidden' : 'translate-y-0 opacity-100 h-28 py-4'}
            `}
                >
                    {/* ... logos ... */}
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-teal-200/20 to-blue-200/20 rounded-full blur-3xl -z-10 pointer-events-none"></div>

                    <div className="flex-shrink-0 group">
                        <img src="/logos/csi.png" className="h-16 w-auto object-contain transition-all duration-300 group-hover:scale-105 group-hover:drop-shadow-lg" alt="CSI" />
                    </div>

                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                        <Link href="/">
                            <img src="/logos/logo.png" className="h-24 w-auto object-contain transition-all duration-300 hover:scale-110 hover:drop-shadow-xl cursor-pointer" alt="Logo" />
                        </Link>
                    </div>

                    {/* Right: ACM Logo + Auth Buttons */}
                    <div className="flex items-center gap-6 relative z-50">
                        <img src="/logos/acm.png" className="h-16 w-auto object-contain transition-all duration-300 hover:scale-105 hover:drop-shadow-lg" alt="ACM" />

                        {/* Auth Navigation */}
                        <div className="flex items-center gap-3">
                            {user ? (
                                <div className="relative">
                                    <button
                                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                                        className="flex items-center gap-3 px-3 py-1.5 bg-slate-50 rounded-full border border-slate-200 hover:bg-white hover:shadow-md transition-all group"
                                    >
                                        <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-bold text-sm">
                                            {user.email?.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="text-left hidden lg:block">
                                            <p className="text-xs font-bold text-slate-700 leading-tight">
                                                {user.user_metadata?.full_name?.split(' ')[0] || 'Student'}
                                            </p>
                                            <p className="text-[10px] text-slate-400 font-medium">{user.email?.split('@')[0]}</p>
                                        </div>
                                        <ChevronDown size={14} className={`text-slate-400 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
                                    </button>

                                    <AnimatePresence>
                                        {isProfileOpen && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                                className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-20 py-2"
                                            >
                                                <div className="px-4 py-2 border-b border-slate-50 mb-1">
                                                    <p className="text-xs font-bold text-slate-900 truncate">{user.user_metadata?.full_name || 'User'}</p>
                                                    <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
                                                </div>

                                                <Link href="/dashboard" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-teal-600 transition-colors">
                                                    <LayoutDashboard size={16} /> My Workspace
                                                </Link>
                                                <Link href="/settings" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-teal-600 transition-colors">
                                                    <Settings size={16} /> Profile Settings
                                                </Link>

                                                <div className="h-px bg-slate-50 my-1"></div>

                                                <button onClick={handleLogout} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-rose-600 hover:bg-rose-50 transition-colors">
                                                    <LogOut size={16} /> Sign Out
                                                </button>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            ) : (
                                <>
                                    <Link href="/login" className="px-5 py-2.5 rounded-full border border-slate-200 text-slate-600 font-semibold text-sm hover:border-teal-500 hover:text-teal-600 hover:bg-teal-50/50 transition-all duration-300">
                                        Login
                                    </Link>
                                    <Link href="/signup" className="px-5 py-2.5 rounded-full bg-gradient-to-r from-teal-500 to-blue-600 text-white font-semibold text-sm shadow-md hover:shadow-xl hover:shadow-teal-500/20 hover:scale-105 transition-all duration-300">
                                        Signup
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Row 2: Premium Nav Bar */}
                <div className={`w-full transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] relative z-10 ${isScrolled ? 'bg-white/80 backdrop-blur-xl border-b border-slate-200/50 py-2 shadow-sm' : 'bg-white/50 backdrop-blur-md border-t border-b border-slate-100 py-3'}`}>
                    <nav className="flex justify-center items-center gap-2 relative">
                        <div className="flex bg-slate-100/0 rounded-full p-1 relative">
                            {navItems.map((item, index) => {
                                const isActive = pathname === item.href;
                                const isHovered = hoveredIndex === index;
                                return (
                                    <Link key={item.href} href={item.href} onMouseEnter={() => setHoveredIndex(index)} onMouseLeave={() => setHoveredIndex(null)} className={`relative px-6 py-2 rounded-full text-sm font-bold tracking-tight transition-colors duration-300 flex items-center gap-2 z-10 ${isActive ? 'text-teal-700' : 'text-slate-600 hover:text-slate-900'}`}>
                                        {isHovered && <motion.div layoutId="navHover" className="absolute inset-0 bg-slate-100 rounded-full -z-10" transition={{ type: "spring", stiffness: 300, damping: 30 }} />}
                                        <span className="relative flex items-center gap-2"><item.icon size={16} strokeWidth={2.5} className={isActive ? 'text-teal-600' : 'opacity-70'} />{item.label}</span>
                                        {isActive && <motion.div layoutId="navActive" className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-teal-500 rounded-full" transition={{ duration: 0.3 }} />}
                                    </Link>
                                );
                            })}
                        </div>
                    </nav>
                </div>
            </div>


            {/* --- MOBILE VIEW --- */}
            <div className="md:hidden w-full px-6 py-4 flex justify-between items-center bg-white/95 backdrop-blur-md border-b border-slate-100">
                <Link href="/">
                    <img
                        src="/logos/logo.png"
                        className="h-10 w-auto object-contain"
                        alt="College Logo"
                    />
                </Link>

                <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-slate-600">
                    <Menu size={24} />
                </button>
            </div>

            {/* Mobile Menu Dropdown */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="md:hidden bg-white border-b border-slate-200 overflow-hidden shadow-xl absolute top-full left-0 right-0"
                    >
                        <nav className="flex flex-col p-4 space-y-2">
                            {navItems.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-50 hover:text-teal-600 font-bold tracking-tight"
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