"use client";

import { motion } from "framer-motion";
import { Sparkles, Code2, Rocket, Users, Globe, ChevronRight, Zap, Coffee, Heart, Target } from "lucide-react";
import Link from "next/link";
import BackgroundBlobs from '@/components/BackgroundBlobs';
import GridPulse from '@/components/GridPulse';
import BentoGrid from '@/components/BentoGrid';

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-[#F8FAFC] dark:bg-transparent text-slate-900 dark:text-white font-sans selection:bg-teal-100 relative overflow-x-hidden">
            <div className="dark:hidden">
                <BackgroundBlobs />
            </div>
            <div className="fixed inset-0 z-0 pointer-events-none">
                <GridPulse />
                <BentoGrid />
            </div>

            <div className="relative z-10 pt-24 pb-20">

                {/* Hero Section - Matching Reference Style */}
                <section className="px-6 max-w-5xl mx-auto mb-24 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        {/* Optional Badge - Keeping it for context */}
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-50 dark:bg-teal-500/10 text-teal-700 dark:text-teal-400 text-xs font-black uppercase tracking-widest mb-10 border border-teal-100 dark:border-teal-500/20">
                            <Sparkles size={14} className="text-teal-500" /> Research Archive
                        </div>

                        <h1 className="text-2xl md:text-3xl lg:text-4xl font-medium tracking-tight text-slate-500 dark:text-slate-300 mb-8 leading-relaxed">
                            The Department Repository is an <span className="font-bold text-slate-900 dark:text-white">AI-powered research archive</span> designed to help students showcase their <span className="text-teal-500 font-bold">innovative potential</span>. We combine academic rigor, collaborative tools, and <span className="text-indigo-500 font-bold">global accessibility</span> to transform how projects are documented, discovered, and <span className="text-purple-500 font-bold">celebrated.</span>
                        </h1>
                    </motion.div>
                </section>

                {/* Mission / Vision Cards - Matching Reference Layout (2 Columns, Dark Cards) */}
                <section className="px-6 max-w-6xl mx-auto mb-32">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Mission Card */}
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5 }}
                            className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-3xl p-10 md:p-12 rounded-[2rem] border border-white/50 dark:border-slate-800/50 shadow-2xl shadow-teal-900/5 min-h-[300px] flex flex-col justify-center"
                        >
                            <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-6 flex items-center gap-4">
                                <span className="w-8 h-1 bg-teal-500 rounded-full"></span>
                                Our Mission
                            </h3>
                            <p className="text-slate-500 dark:text-slate-400 text-lg leading-relaxed font-medium">
                                To replace scattered project submissions with a structured, intelligent repository that ensures every student's hard work is preserved, accessible, and measurable.
                            </p>
                        </motion.div>

                        {/* Vision Card */}
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2, duration: 0.5 }}
                            className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-3xl p-10 md:p-12 rounded-[2rem] border border-white/50 dark:border-slate-800/50 shadow-2xl shadow-purple-900/5 min-h-[300px] flex flex-col justify-center"
                        >
                            <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-6 flex items-center gap-4">
                                <span className="w-8 h-1 bg-purple-500 rounded-full"></span>
                                Our Vision
                            </h3>
                            <p className="text-slate-500 dark:text-slate-400 text-lg leading-relaxed font-medium">
                                To become the central nervous system for departmental innovation — where education, technology, and opportunity intersect to launch the next generation of tech leaders.
                            </p>
                        </motion.div>
                    </div>
                </section>

                {/* Core Features - Matching Reference Style (4 Dark Cards) */}
                <section className="px-6 max-w-7xl mx-auto mb-32">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white mb-4">Core of this Project</h2>
                        <p className="text-slate-500 dark:text-slate-400 text-lg max-w-2xl mx-auto font-medium">
                            Built on a foundation of modern technology to provide a seamless research experience.
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            {
                                icon: Zap,
                                title: "AI Research Assistant",
                                desc: "Neural search engine capable of understanding context, semantic queries, and recommending relevant research papers.",
                                color: "text-blue-400",
                                bg: "bg-slate-800"
                            },
                            {
                                icon: Globe,
                                title: "Smart Repository",
                                desc: "Secure, centralized storage with Role-Level Security (RLS) ensuring your intellectual property is safe yet accessible.",
                                color: "text-teal-400",
                                bg: "bg-slate-800"
                            },
                            {
                                icon: Target, // Or BarChart3
                                title: "Real-time Analytics",
                                desc: "Live dashboards tracking project views, downloads, and engagement metrics to measure impact instantly.",
                                color: "text-indigo-400",
                                bg: "bg-slate-800"
                            },
                            {
                                icon: Rocket,
                                title: "Interactive Viz",
                                desc: "3D Knowledge Graphs and dynamic visualizations connecting unrelated projects through shared technologies.",
                                color: "text-purple-400",
                                bg: "bg-slate-800"
                            }
                        ].map((feature, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1, duration: 0.5 }}
                                className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-3xl p-8 rounded-[1.5rem] border border-white/50 dark:border-slate-800/50 hover:border-blue-500/50 transition-all duration-300 group min-h-[280px] flex flex-col relative overflow-hidden shadow-xl shadow-slate-900/5"
                            >
                                <div className="absolute top-0 right-0 w-20 h-20 bg-white/5 rounded-full blur-2xl pointer-events-none group-hover:bg-white/10 transition-colors"></div>
                                <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-6 bg-slate-800 dark:bg-slate-900 shadow-lg group-hover:scale-110 transition-transform duration-300 border border-slate-700`}>
                                    <feature.icon size={28} className={feature.color} />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                                <p className="text-slate-400 text-sm leading-relaxed font-medium">
                                    {feature.desc}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </section>

                {/* Team Section - Kept as is, fits well */}
                <section className="px-6 max-w-7xl mx-auto mb-32">
                    <div className="flex items-end justify-between mb-12 px-4">
                        <div>
                            <h2 className="text-4xl font-black text-slate-900 dark:text-white mb-2 flex items-center gap-3 tracking-tight">
                                <Users className="text-indigo-500" /> The Core Team
                            </h2>
                            <p className="text-slate-500 dark:text-slate-400 font-medium">The brilliant minds powering our research ecosystem.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[1, 2, 3, 4].map((item, idx) => (
                            <motion.div
                                key={item}
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1 }}
                                className="group relative"
                            >
                                <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-3xl p-6 rounded-[2rem] border border-white/50 dark:border-slate-800/50 shadow-xl shadow-indigo-900/5 hover:border-indigo-400/50 hover:-translate-y-2 transition-all duration-300">
                                    <div className="aspect-square rounded-2xl bg-slate-100 dark:bg-slate-800 mb-6 overflow-hidden relative">
                                        {/* Placeholder Avatar */}
                                        <div className="absolute inset-0 flex items-center justify-center text-slate-300 dark:text-slate-700">
                                            <UserIconPlaceholder />
                                        </div>
                                        <div className="absolute inset-0 bg-gradient-to-t from-indigo-900/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4">
                                            <div className="flex gap-2">
                                                <div className="p-2 bg-white/20 backdrop-blur-md rounded-full text-white cursor-pointer hover:bg-white hover:text-indigo-600 transition-colors"><Globe size={16} /></div>
                                                <div className="p-2 bg-white/20 backdrop-blur-md rounded-full text-white cursor-pointer hover:bg-white hover:text-indigo-600 transition-colors"><Code2 size={16} /></div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-center">
                                        <h4 className="font-black text-lg text-slate-900 dark:text-white mb-1">Dev Member {item}</h4>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-indigo-500">Full Stack Engineer</p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </section>

                {/* CTA Section */}
                <section className="px-6 max-w-5xl mx-auto text-center relative z-20">
                    <div className="bg-slate-900 dark:bg-slate-800 text-white rounded-[3rem] p-16 relative overflow-hidden group shadow-2xl shadow-indigo-500/20">
                        {/* Background Animated Gradient */}
                        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/20 rounded-full blur-[100px] pointer-events-none group-hover:scale-125 transition-transform duration-1000 -translate-y-1/2 translate-x-1/2"></div>
                        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-teal-500/20 rounded-full blur-[100px] pointer-events-none group-hover:scale-125 transition-transform duration-1000 translate-y-1/2 -translate-x-1/2"></div>

                        <div className="relative z-10">
                            <h2 className="text-4xl md:text-5xl font-black mb-6 tracking-tight">Ready to shape the future?</h2>
                            <p className="text-slate-400 text-lg mb-10 max-w-2xl mx-auto font-medium">
                                Join our research community, contribute to open-source projects, and build your academic legacy today.
                            </p>
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                <Link href="/signup" className="px-10 py-4 bg-white text-slate-900 rounded-2xl font-black uppercase tracking-widest hover:bg-teal-400 hover:scale-105 transition-all shadow-lg active:scale-95">
                                    Join the Team
                                </Link>
                                <Link href="/search" className="px-10 py-4 bg-slate-800/50 backdrop-blur-sm border border-white/10 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-slate-700/50 transition-all active:scale-95 flex items-center gap-2">
                                    Explore Projects <ChevronRight size={18} />
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}

// Simple placeholder icon
const UserIconPlaceholder = () => (
    <svg className="w-24 h-24 opacity-20" fill="currentColor" viewBox="0 0 24 24">
        <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
);
