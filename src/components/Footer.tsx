"use client";

import Link from 'next/link';
import { Github, Linkedin, Twitter, Mail, MapPin, ExternalLink, BookOpen, FileText, Scale, GraduationCap } from 'lucide-react';
import { useAITheme } from '@/context/AIThemeContext';

export default function Footer() {
    const { isAIActive } = useAITheme();

    // In AI Mode, we keep distractions to absolute zero.
    if (isAIActive) return null;

    return (
        <footer className="relative bg-slate-50/80 backdrop-blur-md text-slate-600 font-sans border-t border-slate-200">
            {/* Formal Accent Line */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-slate-600"></div>

            <div className="max-w-7xl mx-auto px-6 py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 mb-16">

                    {/* Column 1: Department Identity (Span 4) */}
                    <div className="lg:col-span-4 space-y-6">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-12 h-12 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center">
                                <GraduationCap className="text-blue-700" size={24} />
                            </div>
                            <div>
                                <h3 className="text-slate-900 font-bold text-lg tracking-tight">Department of Computer Science and Engineering
                                </h3>
                                <p className="text-slate-500 text-xs uppercase tracking-wider font-semibold">St. Vincent Pallotti College of Engineering and Technology </p>
                            </div>
                        </div>
                        <p className="leading-relaxed text-sm text-slate-600 pr-4">
                            Recentering academic excellence through organized research archiving. AARS serves as the centralized digital repository for departmental theses, capstone projects, and scholarly publications.
                        </p>
                    </div>

                    {/* Column 2: Quick Access (Span 2) */}
                    <div className="lg:col-span-2">
                        <h4 className="text-slate-900 font-bold mb-6 text-sm uppercase tracking-wider">Quick Access</h4>
                        <ul className="space-y-3 text-sm">
                            <FooterLink href="/" label="Repository Home" />
                            <FooterLink href="/search" label="Browse Archive" />
                            <FooterLink href="/dashboard" label="My Dashboard" />
                            <FooterLink href="/login" label="Faculty Login" />
                        </ul>
                    </div>

                    {/* Column 3: Academic Resources (Span 3) */}
                    <div className="lg:col-span-3">
                        <h4 className="text-slate-900 font-bold mb-6 text-sm uppercase tracking-wider">Research Resources</h4>
                        <ul className="space-y-3 text-sm">
                            <FooterLink href="#" label="Thesis Guidelines (2025)" icon={FileText} />
                            <FooterLink href="#" label="Research Ethics Code" icon={Scale} />
                            <FooterLink href="#" label="Citation Standards" icon={BookOpen} />
                            <FooterLink href="#" label="University Library" icon={ExternalLink} />
                        </ul>
                    </div>

                    {/* Column 4: Contact (Span 3) */}
                    <div className="lg:col-span-3">
                        <h4 className="text-slate-900 font-bold mb-6 text-sm uppercase tracking-wider">Department Contact</h4>
                        <ul className="space-y-4 text-sm">
                            <li className="flex items-start gap-3 group">
                                <div className="mt-1 p-1.5 rounded bg-white border border-slate-200 text-slate-500 group-hover:text-blue-600 transition-colors shadow-sm">
                                    <MapPin size={14} />
                                </div>
                                <span className="text-slate-600">
                                    Wardha Road,<br />
                                    Gavsi-Manapur,Nagpur,<br />
                                    Maharashtra 441108
                                </span>
                            </li>
                            <li className="flex items-center gap-3 group">
                                <div className="p-1.5 rounded bg-white border border-slate-200 text-slate-500 group-hover:text-blue-600 transition-colors shadow-sm">
                                    <Mail size={14} />
                                </div>
                                <a href="mailto:hod.comps@moderncoe.edu.in" className="text-slate-600 hover:text-blue-600 transition-colors">
                                    hodce.@stvincentngp.edu.in
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-8 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-xs text-slate-500 font-medium">
                        &copy; St. Vincent Pallotti College of Engineering and Technology. All rights reserved. | <Link href="#" className="hover:text-slate-700">Privacy Policy</Link>
                    </p>
                    <div className="flex items-center gap-4">
                        <SocialLink icon={Github} href="#" />
                        <SocialLink icon={Linkedin} href="#" />
                        <SocialLink icon={Twitter} href="#" />
                    </div>
                </div>
            </div>
        </footer>
    );
}

const FooterLink = ({ href, label, icon: Icon }: { href: string, label: string, icon?: any }) => (
    <li>
        <Link href={href} className="flex items-center gap-2 text-slate-600 hover:text-blue-600 transition-colors duration-200">
            {Icon && <Icon size={14} className="opacity-70 text-slate-400 group-hover:text-blue-600" />}
            <span>{label}</span>
        </Link>
    </li>
);

const SocialLink = ({ icon: Icon, href }: { icon: any, href: string }) => (
    <a href={href} className="p-2 rounded-lg bg-white border border-slate-200 text-slate-500 hover:text-blue-600 hover:border-blue-200 hover:shadow-md transition-all">
        <Icon size={16} />
    </a>
);
