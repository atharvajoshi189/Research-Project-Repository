"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, User, Code, FileText, ArrowUpRight, Cpu, BrainCircuit, Coffee, Database, Cloud, FileType2, Terminal, Globe, Smartphone, Wifi, Layers, Box, Layout, Camera, Eye, Zap, Shield, Lock, Server, Link as LinkIcon, Smartphone as MobileIcon } from 'lucide-react';
import Link from 'next/link';

interface ProjectListViewProps {
    projects: any[];
}

const ProjectListView = React.memo(({ projects }: ProjectListViewProps) => {
    // Helper function to map tech stack strings to icons
    const getTechIcon = (tech: string) => {
        const t = tech.toLowerCase().trim();
        // Web & Frontend
        if (t.includes('react') || t.includes('next')) return <Code size={14} className="text-cyan-400" />;
        if (t.includes('vue') || t.includes('angular') || t.includes('html') || t.includes('css')) return <Layout size={14} className="text-pink-400" />;
        if (t.includes('javascript') || t.includes('typescript') || t.includes('js') || t.includes('ts')) return <Globe size={14} className="text-yellow-300" />;

        // Backend & Database
        if (t.includes('node') || t.includes('express') || t.includes('django') || t.includes('flask')) return <Server size={14} className="text-green-500" />;
        if (t.includes('java') || t.includes('spring')) return <Coffee size={14} className="text-orange-500" />;
        if (t.includes('database') || t.includes('sql') || t.includes('mongo') || t.includes('firebase')) return <Database size={14} className="text-blue-400" />;

        // AI & Data Science
        if (t.includes('python')) return <FileType2 size={14} className="text-blue-500" />;
        if (t.includes('tensor') || t.includes('learn') || t.includes('ai') || t.includes('ml') || t.includes('deep') || t.includes('network')) return <BrainCircuit size={14} className="text-rose-500" />;
        if (t.includes('vision') || t.includes('opencv') || t.includes('image')) return <Eye size={14} className="text-purple-400" />;

        // Mobile & IoT
        if (t.includes('android') || t.includes('flutter') || t.includes('ios') || t.includes('mobile')) return <MobileIcon size={14} className="text-teal-400" />;
        if (t.includes('arduino') || t.includes('iot') || t.includes('esp') || t.includes('raspberry') || t.includes('sensor')) return <Cpu size={14} className="text-red-400" />;
        if (t.includes('gsm') || t.includes('gps') || t.includes('wifi')) return <Wifi size={14} className="text-sky-500" />;

        // Infrastructure & Tools
        if (t.includes('cloud') || t.includes('aws') || t.includes('azure')) return <Cloud size={14} className="text-sky-400" />;
        if (t.includes('security') || t.includes('auth') || t.includes('crypto') || t.includes('block')) return <Shield size={14} className="text-emerald-400" />;
        if (t.includes('git') || t.includes('linux') || t.includes('bash')) return <Terminal size={14} className="text-slate-400" />;

        // Default
        return <Box size={14} className="text-slate-400" />;
    };

    return (
        <div className="w-full bg-slate-900 rounded-2xl shadow-xl border border-slate-800 overflow-hidden font-mono text-sm max-w-full relative group/table">
            {/* Ghost Scanning Line */}
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-lime-500 to-transparent opacity-0 group-hover/table:opacity-100 transition-opacity duration-300 pointer-events-none z-50 animate-scan" style={{
                boxShadow: '0 0 10px #84cc16, 0 0 20px #84cc16'
            }} />

            <style jsx global>{`
                @keyframes scan {
                    0% { top: 0%; opacity: 0; }
                    10% { opacity: 1; }
                    90% { opacity: 1; }
                    100% { top: 100%; opacity: 0; }
                }
                .animate-scan {
                    animation: scan 6s ease-in-out 1 forwards;
                }
            `}</style>

            {/* Terminal/Spreadsheet Header */}
            <div className="bg-slate-950 text-slate-400 px-4 md:px-6 py-3 text-[10px] md:text-xs uppercase tracking-widest border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="flex gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                        <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                        <div className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
                    </div>
                    <span className="hidden md:inline ml-3 font-semibold text-slate-300">PROJECT_DATABASE.v2</span>
                </div>
                <div>{projects.length} RECORDS FOUND</div>
            </div>

            <div className="overflow-x-auto custom-scrollbar bg-white" style={{ backgroundColor: 'white' }}>
                <table className="w-full text-left border-collapse" style={{ backgroundColor: 'white' }}>
                    <thead style={{ backgroundColor: 'white' }}>
                        <tr className="bg-white border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px] md:text-xs" style={{ backgroundColor: 'white' }}>
                            <th className="px-4 md:px-6 py-3 md:py-4 whitespace-nowrap sticky left-0 z-20 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]" style={{ backgroundColor: 'white' }}>
                                <div className="flex items-center gap-2"><FileText size={14} className="text-teal-500" /> Project Name</div>
                            </th>
                            <th className="px-4 md:px-6 py-3 md:py-4 whitespace-nowrap hidden md:table-cell" style={{ backgroundColor: 'white' }}>
                                <div className="flex items-center gap-2"><Code size={14} className="text-indigo-500" /> Tech Stack</div>
                            </th>
                            <th className="px-4 md:px-6 py-3 md:py-4 whitespace-nowrap hidden lg:table-cell" style={{ backgroundColor: 'white' }}>
                                <div className="flex items-center gap-2"><User size={14} className="text-rose-500" /> Leader</div>
                            </th>
                            <th className="px-4 md:px-6 py-3 md:py-4 whitespace-nowrap hidden sm:table-cell" style={{ backgroundColor: 'white' }}>
                                <div className="flex items-center gap-2"><Calendar size={14} className="text-amber-500" /> Year</div>
                            </th>
                            <th className="px-4 md:px-6 py-3 md:py-4 whitespace-nowrap text-right" style={{ backgroundColor: 'white' }}>Action</th>
                        </tr>
                    </thead>
                    <tbody style={{ backgroundColor: 'white' }}>
                        {projects.map((project, i) => {
                            const techStack = Array.isArray(project.tech_stack) ? project.tech_stack : (typeof project.tech_stack === 'string' ? project.tech_stack.split(',') : []);

                            return (
                                <tr
                                    key={project.id}
                                    className="group border-b border-slate-100 hover:bg-slate-50 transition-colors duration-200 relative"
                                    style={{ backgroundColor: 'white' }}
                                >
                                    <td className="px-4 md:px-6 py-3 sticky left-0 group-hover:bg-slate-50 transition-colors z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]" style={{ backgroundColor: 'white' }}>
                                        <div className="font-semibold text-slate-900 group-hover:text-teal-700 transition-colors truncate max-w-[150px] md:max-w-[250px]">
                                            {project.title}
                                        </div>
                                        <div className="text-[10px] text-slate-400 mt-0.5 truncate max-w-[150px] md:max-w-[250px]">
                                            {project.category}
                                        </div>
                                    </td>
                                    <td className="px-4 md:px-6 py-3 hidden md:table-cell group-hover:bg-slate-50 transition-colors bg-white" style={{ backgroundColor: 'white' }}>
                                        <div className="flex flex-wrap gap-2">
                                            {techStack.slice(0, 4).map((tech: string, idx: number) => (
                                                <div
                                                    key={idx}
                                                    className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-slate-100 border border-slate-200 opacity-60 grayscale group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-300 hover:bg-slate-200"
                                                >
                                                    {getTechIcon(tech)}
                                                    <span className="text-[10px] font-medium text-slate-700">{tech.trim()}</span>
                                                </div>
                                            ))}
                                            {techStack.length > 4 && (
                                                <span className="px-1.5 py-0.5 text-[10px] text-slate-400 font-medium self-center opacity-60 group-hover:opacity-100 transition-opacity">
                                                    +{techStack.length - 4}
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-4 md:px-6 py-3 hidden lg:table-cell group-hover:bg-slate-50 transition-colors bg-white" style={{ backgroundColor: 'white' }}>
                                        <div className="flex items-center gap-2">
                                            <div className="w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center text-[9px] font-bold text-indigo-700 border border-indigo-200 uppercase">
                                                {(Array.isArray(project.authors) && project.authors.length > 0 ? project.authors[0] : (typeof project.authors === 'string' ? project.authors : 'U')).charAt(0)}
                                            </div>
                                            <span className="text-slate-600 font-medium text-xs truncate max-w-[120px]">
                                                {Array.isArray(project.authors) && project.authors.length > 0 ? project.authors[0] : (typeof project.authors === 'string' ? project.authors : 'Unknown')}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-4 md:px-6 py-3 text-slate-500 font-medium text-xs hidden sm:table-cell group-hover:bg-slate-50 transition-colors bg-white" style={{ backgroundColor: 'white' }}>
                                        {project.academic_year || project.year}
                                    </td>
                                    <td className="px-4 md:px-6 py-3 text-right group-hover:bg-slate-50 transition-colors bg-white" style={{ backgroundColor: 'white' }}>
                                        <Link href={`/project/${project.id}`} className="inline-flex items-center gap-1 text-[10px] md:text-xs font-bold text-teal-600 hover:text-teal-800 hover:underline bg-teal-50 px-3 py-1.5 rounded-md border border-teal-100 hover:border-teal-200 transition-all">
                                            VIEW <ArrowUpRight size={12} />
                                        </Link>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
            <div className="px-4 md:px-6 py-2 bg-slate-50 border-t border-slate-200 text-[9px] text-slate-400 flex justify-between items-center">
                <span className="font-mono">SYS_STATUS: ONLINE</span>
                <span className="font-mono">UPDATED: TODAY</span>
            </div>
        </div>
    );
});

export default ProjectListView;
