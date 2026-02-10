"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { BrainCircuit, Building2, Cpu, Globe, ArrowRight, ChevronDown, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';

interface GrokPanelProps {
    data: any;
    loading: boolean;
}

export default function GrokPanel({ data, loading }: GrokPanelProps) {
    const [openSection, setOpenSection] = useState<string | null>('industry');

    const toggleSection = (id: string) => {
        setOpenSection(openSection === id ? null : id);
    };

    if (loading) {
        return (
            <div className="bg-white/40 backdrop-blur-xl rounded-3xl p-6 shadow-xl shadow-teal-900/5 border border-white/40 overflow-hidden relative min-h-[400px] flex flex-col justify-center items-center">
                <div className="absolute inset-0 bg-gradient-to-br from-teal-50/50 to-indigo-50/50 -z-10"></div>
                <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
                <p className="text-sm font-bold text-slate-500 animate-pulse">Consulting Grok AI...</p>
                <div className="mt-2 text-xs text-slate-400">Analyzing Market Fit & Tech Stack</div>
            </div>
        );
    }

    if (!data) return null;

    const sections = [
        {
            id: 'industry',
            title: 'Industry Application',
            icon: <Building2 size={18} className="text-teal-600" />,
            content: (
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-bold uppercase text-slate-400 tracking-wider">Sector</span>
                        <span className="text-sm font-bold text-slate-800 bg-teal-50 px-2 py-1 rounded-md border border-teal-100">
                            {data.industry?.sector || "General Tech"}
                        </span>
                    </div>
                    <div>
                        <span className="text-xs font-bold uppercase text-slate-400 tracking-wider block mb-1">Market Fit</span>
                        <p className="text-sm text-slate-600 leading-relaxed">
                            {data.industry?.commercial_potential || "Analysis unavailable."}
                        </p>
                    </div>
                </div>
            )
        },
        {
            id: 'tech',
            title: 'Tech Logic',
            icon: <Cpu size={18} className="text-indigo-600" />,
            content: (
                <div>
                    <span className="text-xs font-bold uppercase text-slate-400 tracking-wider block mb-2">Architecture Insight</span>
                    <p className="text-sm text-slate-600 leading-relaxed italic border-l-2 border-indigo-200 pl-3">
                        "{data.tech_architecture?.insight || "Standard structure."}"
                    </p>
                </div>
            )
        },
        {
            id: 'impact',
            title: 'Social Impact',
            icon: <Globe size={18} className="text-emerald-600" />,
            content: (
                <div className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                        {data.social_impact?.sdg_goals?.map((goal: string, i: number) => (
                            <span key={i} className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-1 rounded-full flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                {goal}
                            </span>
                        ))}
                    </div>
                    <p className="text-sm text-slate-600">
                        {data.social_impact?.description}
                    </p>
                </div>
            )
        },
        {
            id: 'roadmap',
            title: 'Future Roadmap',
            icon: <ArrowRight size={18} className="text-amber-600" />,
            content: (
                <div className="relative pl-4 border-l border-slate-200 space-y-4 py-1">
                    {data.roadmap?.map((item: any, i: number) => (
                        <div key={i} className="relative">
                            <div className="absolute -left-[21px] top-1.5 w-2.5 h-2.5 rounded-full bg-white border-2 border-amber-400"></div>
                            <h4 className="text-xs font-bold text-slate-800 uppercase">{item.step}</h4>
                            <p className="text-sm text-slate-600 font-medium">{item.feature}</p>
                        </div>
                    ))}
                </div>
            )
        }
    ];

    return (
        <div className="relative bg-white/60 backdrop-blur-xl rounded-3xl p-6 shadow-xl shadow-teal-900/5 border border-white/60 overflow-hidden">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg shadow-indigo-200">
                    <BrainCircuit size={20} className="text-white" />
                </div>
                <div>
                    <h3 className="font-extrabold text-slate-900 text-lg leading-none">Grok Intelligence</h3>
                    <p className="text-xs font-medium text-slate-400 mt-1">Deep Project Analysis</p>
                </div>
            </div>

            {/* Accordion */}
            <div className="space-y-3">
                {sections.map((section) => (
                    <div key={section.id} className="bg-white/50 border border-white/50 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                        <button
                            onClick={() => toggleSection(section.id)}
                            className="w-full flex items-center justify-between p-4 text-left group"
                        >
                            <div className="flex items-center gap-3">
                                {section.icon}
                                <span className="font-bold text-slate-700 text-sm group-hover:text-indigo-600 transition-colors">{section.title}</span>
                            </div>
                            <ChevronDown
                                size={16}
                                className={`text-slate-400 transition-transform duration-300 ${openSection === section.id ? 'rotate-180' : ''}`}
                            />
                        </button>
                        <AnimatePresence>
                            {openSection === section.id && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.3, ease: "easeInOut" }}
                                >
                                    <div className="px-4 pb-4 pt-0">
                                        {section.content}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                ))}
            </div>
        </div>
    );
}
