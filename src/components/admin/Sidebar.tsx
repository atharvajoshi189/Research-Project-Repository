"use client";

import Link from 'next/link';
import { LayoutDashboard, FileClock, FolderOpen, Users, Settings, LogOut, Menu } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

export default function Sidebar() {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);

    const links = [
        { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
        { name: 'Pending Approvals', href: '/admin?filter=pending', icon: FileClock },
        { name: 'All Projects', href: '/admin?filter=all', icon: FolderOpen },
        { name: 'User Management', href: '/admin/users', icon: Users },
    ];

    const toggleSidebar = () => setIsOpen(!isOpen);

    return (
        <>
            {/* Mobile Toggle Button */}
            <button
                onClick={toggleSidebar}
                className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md border border-slate-100 text-slate-700"
            >
                <Menu size={20} />
            </button>

            {/* Backdrop for Mobile */}
            {isOpen && (
                <div
                    onClick={() => setIsOpen(false)}
                    className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 lg:hidden"
                ></div>
            )}

            <aside className={`
                fixed top-0 left-0 h-full w-64 bg-white border-r border-slate-100 shadow-[4px_0_24px_rgba(0,0,0,0.02)]
                flex flex-col z-50 transition-transform duration-300 ease-in-out
                ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}>
                <div className="p-8 border-b border-slate-50">
                    <h2 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-teal-400 to-blue-500 rounded-lg flex items-center justify-center text-white font-bold shadow-lg shadow-blue-500/20">
                            A
                        </div>
                        DevRepo
                    </h2>
                </div>

                <nav className="flex-1 p-6 space-y-2 overflow-y-auto">
                    {links.map((link) => {
                        const isActive = pathname === link.href || (link.href.includes('?') && pathname === '/admin' && !pathname.includes('users'));

                        return (
                            <Link
                                key={link.name}
                                href={link.href}
                                onClick={() => setIsOpen(false)}
                                className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 group ${isActive
                                        ? 'bg-gradient-to-r from-teal-50 to-blue-50 text-teal-700 font-semibold shadow-sm border border-teal-100/50'
                                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                                    }`}
                            >
                                <link.icon size={20} className={`transition-colors ${isActive ? 'text-teal-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
                                <span className="text-sm">{link.name}</span>
                            </Link>
                        )
                    })}
                </nav>

                <div className="p-6 border-t border-slate-50 space-y-2">
                    <div className="px-4 py-2 mb-2">
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">System</p>
                    </div>
                    <button className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 hover:bg-slate-50 hover:text-slate-900 w-full transition-all">
                        <Settings size={20} />
                        <span className="font-medium text-sm">Settings</span>
                    </button>
                    <button className="flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 w-full transition-all">
                        <LogOut size={20} />
                        <span className="font-medium text-sm">Logout</span>
                    </button>
                </div>
            </aside>
        </>
    );
}
