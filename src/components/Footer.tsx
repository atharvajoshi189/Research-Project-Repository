"use client";

import Link from 'next/link';
import { Github, Linkedin, Twitter, Mail, MapPin, ExternalLink } from 'lucide-react';
import { useAITheme } from '@/context/AIThemeContext';

export default function Footer() {
    const { isAIActive } = useAITheme();

    return (
        <footer className={`relative transition-all duration-800 border-t ${isAIActive ? 'bg-[#0f0c29]/80 backdrop-blur-md border-white/10 text-slate-200' : 'bg-slate-50 border-slate-200'}`}>
            {/* Gradient Top Line */}
            <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${isAIActive ? 'from-cyan-500 via-purple-500 to-indigo-500' : 'from-teal-400 via-blue-500 to-indigo-600'}`}></div>

            <div className="max-w-7xl mx-auto px-6 py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">

                    {/* Column 1: Brand */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-md ${isAIActive ? 'bg-gradient-to-br from-cyan-500 to-purple-600 shadow-cyan-500/20' : 'bg-gradient-to-br from-teal-400 to-blue-600'}`}>
                                <span className="font-bold text-white text-xl">A</span>
                            </div>
                            <span className={`font-extrabold text-2xl tracking-tight ${isAIActive ? 'text-white' : 'text-slate-900'}`}>AARS</span>
                        </div>
                        <p className={`leading-relaxed text-sm ${isAIActive ? 'text-slate-400' : 'text-slate-500'}`}>
                            Empowering the next generation of researchers with organized academic excellence. The centralized hub for departmental knowledge.
                        </p>
                    </div>

                    {/* Column 2: Quick Links */}
                    <div>
                        <h4 className={`font-bold mb-6 ${isAIActive ? 'text-white' : 'text-slate-900'}`}>Quick Links</h4>
                        <ul className="space-y-4">
                            <FooterLink href="/" label="Home" isAI={isAIActive} />
                            <FooterLink href="/search" label="Browse Projects" isAI={isAIActive} />
                            <FooterLink href="/upload" label="Upload Thesis" isAI={isAIActive} />
                            <FooterLink href="/admin" label="Admin Dashboard" isAI={isAIActive} />
                        </ul>
                    </div>

                    {/* Column 3: Resources */}
                    <div>
                        <h4 className={`font-bold mb-6 ${isAIActive ? 'text-white' : 'text-slate-900'}`}>Resources</h4>
                        <ul className="space-y-4">
                            <FooterLink href="#" label="Documentation" isAI={isAIActive} />
                            <FooterLink href="#" label="Research Guidelines" isAI={isAIActive} />
                            <FooterLink href="#" label="Citation Styles" isAI={isAIActive} />
                            <FooterLink href="#" label="College Website" icon={ExternalLink} isAI={isAIActive} />
                        </ul>
                    </div>

                    {/* Column 4: Contact */}
                    <div>
                        <h4 className={`font-bold mb-6 ${isAIActive ? 'text-white' : 'text-slate-900'}`}>Contact Us</h4>
                        <ul className={`space-y-4 text-sm ${isAIActive ? 'text-slate-400' : 'text-slate-500'}`}>
                            <li className="flex items-start gap-3">
                                <MapPin size={18} className={`flex-shrink-0 mt-1 ${isAIActive ? 'text-cyan-400' : 'text-teal-500'}`} />
                                <span>
                                    Dept. of Computer Science<br />
                                    Modern College of Engineering<br />
                                    Pune, India 411005
                                </span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Mail size={18} className={`flex-shrink-0 ${isAIActive ? 'text-cyan-400' : 'text-teal-500'}`} />
                                <a href="mailto:support@college.edu" className={`transition-colors ${isAIActive ? 'hover:text-cyan-400' : 'hover:text-teal-600'}`}>support@college.edu</a>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className={`pt-8 border-t flex flex-col md:flex-row justify-between items-center gap-4 ${isAIActive ? 'border-white/10' : 'border-slate-200'}`}>
                    <p className="text-sm text-slate-400 font-medium">
                        &copy; 2026 Academic Archive Repository System. All rights reserved.
                    </p>
                    <div className="flex items-center gap-6">
                        <SocialLink icon={Github} href="#" isAI={isAIActive} />
                        <SocialLink icon={Linkedin} href="#" isAI={isAIActive} />
                        <SocialLink icon={Twitter} href="#" isAI={isAIActive} />
                    </div>
                </div>
            </div>
        </footer>
    );
}

const FooterLink = ({ href, label, icon: Icon, isAI }: { href: string, label: string, icon?: any, isAI: boolean }) => (
    <li>
        <Link href={href} className={`text-sm flex items-center gap-2 group transition-colors ${isAI ? 'text-slate-400 hover:text-cyan-400' : 'text-slate-500 hover:text-teal-600'}`}>
            {label}
            {Icon && <Icon size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />}
        </Link>
    </li>
);

const SocialLink = ({ icon: Icon, href, isAI }: { icon: any, href: string, isAI: boolean }) => (
    <a href={href} className={`transition-all p-2 rounded-full ${isAI ? 'text-slate-400 hover:text-cyan-400 hover:bg-white/10' : 'text-slate-400 hover:text-teal-600 hover:scale-110 bg-slate-100 hover:bg-teal-50'}`}>
        <Icon size={18} />
    </a>
);
