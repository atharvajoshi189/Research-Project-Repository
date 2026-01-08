"use client";

import Link from 'next/link';
import { Github, Linkedin, Twitter, Mail, MapPin, ExternalLink } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="bg-slate-50 border-t border-slate-200 relative">
            {/* Gradient Top Line */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-400 via-blue-500 to-indigo-600"></div>

            <div className="max-w-7xl mx-auto px-6 py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">

                    {/* Column 1: Brand */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-teal-400 to-blue-600 shadow-md">
                                <span className="font-bold text-white text-xl">A</span>
                            </div>
                            <span className="font-extrabold text-2xl text-slate-900 tracking-tight">AARS</span>
                        </div>
                        <p className="text-slate-500 leading-relaxed text-sm">
                            Empowering the next generation of researchers with organized academic excellence. The centralized hub for departmental knowledge.
                        </p>
                    </div>

                    {/* Column 2: Quick Links */}
                    <div>
                        <h4 className="font-bold text-slate-900 mb-6">Quick Links</h4>
                        <ul className="space-y-4">
                            <FooterLink href="/" label="Home" />
                            <FooterLink href="/search" label="Browse Projects" />
                            <FooterLink href="/upload" label="Upload Thesis" />
                            <FooterLink href="/admin" label="Admin Dashboard" />
                        </ul>
                    </div>

                    {/* Column 3: Resources */}
                    <div>
                        <h4 className="font-bold text-slate-900 mb-6">Resources</h4>
                        <ul className="space-y-4">
                            <FooterLink href="#" label="Documentation" />
                            <FooterLink href="#" label="Research Guidelines" />
                            <FooterLink href="#" label="Citation Styles" />
                            <FooterLink href="#" label="College Website" icon={ExternalLink} />
                        </ul>
                    </div>

                    {/* Column 4: Contact */}
                    <div>
                        <h4 className="font-bold text-slate-900 mb-6">Contact Us</h4>
                        <ul className="space-y-4 text-sm text-slate-500">
                            <li className="flex items-start gap-3">
                                <MapPin size={18} className="text-teal-500 mt-1 flex-shrink-0" />
                                <span>
                                    Dept. of Computer Science<br />
                                    Modern College of Engineering<br />
                                    Pune, India 411005
                                </span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Mail size={18} className="text-teal-500 flex-shrink-0" />
                                <a href="mailto:support@college.edu" className="hover:text-teal-600 transition-colors">support@college.edu</a>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-8 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-sm text-slate-400 font-medium">
                        &copy; 2026 Academic Archive Repository System. All rights reserved.
                    </p>
                    <div className="flex items-center gap-6">
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
        <Link href={href} className="text-sm text-slate-500 hover:text-teal-600 transition-colors flex items-center gap-2 group">
            {label}
            {Icon && <Icon size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />}
        </Link>
    </li>
);

const SocialLink = ({ icon: Icon, href }: { icon: any, href: string }) => (
    <a href={href} className="text-slate-400 hover:text-teal-600 hover:scale-110 transition-all p-2 bg-slate-100 rounded-full hover:bg-teal-50">
        <Icon size={18} />
    </a>
);
