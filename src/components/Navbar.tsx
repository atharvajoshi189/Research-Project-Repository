"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Grid, UploadCloud, BarChart3, Menu, User, Search, LayoutDashboard } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
    const pathname = usePathname();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

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
        { label: 'Admin', href: '/admin', icon: LayoutDashboard },
    ];

    return (
        // Header is absolute so it overlays content initially, OR relative if we want it to push content down.
        // User requested "Sticky Logic... bottom row should stick". 
        // Usually "Apple-like" means the top bar is fixed or sticky. 
        // To allow Row 1 to scroll away, we use standard flow.
        // But layout.tsx has pt-48. This implies fixed header.
        // We will make the WHOLE header fixed for smooth premium feel, but maybe hide Row 1 on scroll?
        // No, simpler: Row 1 is fixed top-0. Row 2 is below it. 
        // Actually, to make "bottom row stick", we can use `sticky top-0` on Row 2 and let Row 1 scroll.
        // But if we want "Premium", fixed is better.
        // Let's go with: Header is FIXED. On scroll, we create a negative margin or transform to hide Row 1.
        <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-in-out">

            {/* Background layer for Row 1 - fades out on scroll */}
            <div
                className={`absolute inset-0 bg-white/90 backdrop-blur-md transition-opacity duration-300 pointer-events-none ${isScrolled ? 'opacity-0' : 'opacity-100'}`}
                style={{ height: '100px' }} // Approximate height of Row 1
            ></div>

            {/* --- DESKTOP VIEW --- */}
            <div className="hidden md:block">

                {/* Row 1: Logo Gallery - Translates up on scroll to hide */}
                <div
                    className={`w-full max-w-[90rem] mx-auto px-8 lg:px-12 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] overflow-hidden flex justify-between items-center relative
                ${isScrolled ? '-translate-y-full opacity-0 h-0 py-0' : 'translate-y-0 opacity-100 h-28 py-4'}
            `}
                >
                    {/* Radial Glow for Center Logo */}
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-teal-200/20 to-blue-200/20 rounded-full blur-3xl -z-10 pointer-events-none"></div>

                    {/* Left: CSI Logo */}
                    <div className="flex-shrink-0 group">
                        <img
                            src="/logos/csi.png"
                            className="h-16 w-auto object-contain transition-all duration-300 group-hover:scale-105 group-hover:drop-shadow-lg"
                            alt="CSI"
                        />
                    </div>

                    {/* Center: College Logo */}
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                        <Link href="/">
                            <img
                                src="/logos/logo.png"
                                className="h-24 w-auto object-contain transition-all duration-300 hover:scale-110 hover:drop-shadow-xl cursor-pointer"
                                alt="College Logo"
                            />
                        </Link>
                    </div>

                    {/* Right: ACM Logo + Profile */}
                    <div className="flex items-center gap-8 group">
                        <img
                            src="/logos/acm.png"
                            className="h-16 w-auto object-contain transition-all duration-300 group-hover:scale-105 group-hover:drop-shadow-lg"
                            alt="ACM"
                        />

                        <div className="w-10 h-10 rounded-full bg-slate-50 border border-slate-200 hover:border-teal-200 flex items-center justify-center cursor-pointer transition-all hover:shadow-md">
                            <User size={20} className="text-slate-600" />
                        </div>
                    </div>
                </div>

                {/* Row 2: Premium Nav Bar - Permanent Sticky */}
                <div
                    className={`w-full transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]
                ${isScrolled ? 'bg-white/80 backdrop-blur-xl border-b border-slate-200/50 py-2 shadow-sm' : 'bg-white/50 backdrop-blur-md border-t border-b border-slate-100 py-3'}
            `}
                >
                    <nav className="flex justify-center items-center gap-2 relative">
                        {/* Floating Capsule Background */}
                        <div className="flex bg-slate-100/0 rounded-full p-1 relative">
                            {navItems.map((item, index) => {
                                const isActive = pathname === item.href;
                                const isHovered = hoveredIndex === index;

                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        onMouseEnter={() => setHoveredIndex(index)}
                                        onMouseLeave={() => setHoveredIndex(null)}
                                        className={`
                                       relative px-6 py-2 rounded-full text-sm font-bold tracking-tight transition-colors duration-300 flex items-center gap-2 z-10
                                       ${isActive ? 'text-teal-700' : 'text-slate-600 hover:text-slate-900'}
                                   `}
                                    >
                                        {/* Hover Slide Effect */}
                                        {isHovered && (
                                            <motion.div
                                                layoutId="navHover"
                                                className="absolute inset-0 bg-slate-100 rounded-full -z-10"
                                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                            />
                                        )}

                                        {/* Active Dot & Link Content */}
                                        <span className="relative flex items-center gap-2">
                                            <item.icon size={16} strokeWidth={2.5} className={isActive ? 'text-teal-600' : 'opacity-70'} />
                                            {item.label}
                                        </span>

                                        {isActive && (
                                            <motion.div
                                                layoutId="navActive"
                                                className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-teal-500 rounded-full"
                                                transition={{ duration: 0.3 }}
                                            />
                                        )}
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
