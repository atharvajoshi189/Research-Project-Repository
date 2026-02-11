"use client";

import { motion } from 'framer-motion';
import { Calendar, User, Code, FileText, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';

interface ProjectListViewProps {
    projects: any[];
}

const ProjectListView = ({ projects }: ProjectListViewProps) => {
    // Animation variants for table rows
    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.05
            }
        }
    };

    const item = {
        hidden: { opacity: 0, x: -10 },
        show: { opacity: 1, x: 0 }
    };

    return (
        <div className="w-full bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden font-mono text-sm max-w-full">
            {/* Terminal/Spreadsheet Header */}
            <div className="bg-slate-900 text-slate-400 px-4 md:px-6 py-3 text-[10px] md:text-xs uppercase tracking-widest border-b border-slate-800 flex items-center justify-between">
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

            <div className="overflow-x-auto custom-scrollbar" style={{ backgroundColor: 'white' }}>
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
                                    className="group border-b border-slate-100 hover:bg-slate-50 transition-colors duration-200"
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
                                        <div className="flex flex-wrap gap-1">
                                            {techStack.slice(0, 3).map((tech: string, idx: number) => (
                                                <span key={idx} className="px-1.5 py-0.5 bg-slate-100 text-slate-600 text-[10px] rounded border border-slate-200 whitespace-nowrap">
                                                    {tech.trim()}
                                                </span>
                                            ))}
                                            {techStack.length > 3 && (
                                                <span className="px-1.5 py-0.5 text-[10px] text-slate-400 bg-slate-50 rounded border border-slate-100">
                                                    +{techStack.length - 3}
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
                <span className="font-mono">UPDATED: {new Date().toLocaleDateString()}</span>
            </div>
        </div>
    );
};

export default ProjectListView;
