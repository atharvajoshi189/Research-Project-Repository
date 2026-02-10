
import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface ProjectListViewProps {
    projects: any[];
}

const ProjectListView = ({ projects }: ProjectListViewProps) => {
    if (!projects || projects.length === 0) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full overflow-x-auto rounded-3xl border border-slate-200 bg-white/50 backdrop-blur-xl shadow-xl shadow-slate-200/50"
        >
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="border-b border-slate-200/60 bg-slate-50/50 text-xs font-bold text-slate-500 uppercase tracking-widest font-mono">
                        <th className="p-4 pl-6 w-16 text-center">#</th>
                        <th className="p-4">Project Name</th>
                        <th className="p-4">Tech Stack</th>
                        <th className="p-4">Category</th>
                        <th className="p-4">Year</th>
                        <th className="p-4 text-right pr-6">Date</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono text-sm">
                    {projects.map((project, i) => {
                        const techs = Array.isArray(project.tech_stack) ? project.tech_stack : (project.tech_stack || '').split(',');
                        return (
                            <tr
                                key={project.id}
                                className="group hover:bg-teal-50/40 transition-colors duration-200"
                            >
                                <td className="p-4 pl-6 text-slate-400 font-mono text-xs text-center">{(i + 1).toString().padStart(2, '0')}</td>
                                <td className="p-4 font-bold text-slate-800 group-hover:text-teal-600 transition-colors">
                                    <Link href={`/project/${project.id}`} className="block w-full h-full hover:underline decoration-teal-400 decoration-2 underline-offset-4">
                                        {project.title}
                                    </Link>
                                </td>
                                <td className="p-4">
                                    <div className="flex flex-wrap gap-2">
                                        {techs.slice(0, 3).map((tech: string, idx: number) => (
                                            <span key={idx} className="px-2 py-0.5 bg-white text-slate-600 text-[10px] rounded border border-slate-200 font-medium shadow-sm">
                                                {tech.trim()}
                                            </span>
                                        ))}
                                        {techs.length > 3 && (
                                            <span className="px-1 py-0.5 text-[10px] text-slate-400 font-bold">+{techs.length - 3}</span>
                                        )}
                                    </div>
                                </td>
                                <td className="p-4">
                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wide
                                        ${project.category === 'Final Year Project' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' :
                                            project.category === 'Research Paper' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                                                'bg-amber-50 text-amber-600 border-amber-100'
                                        }`}>
                                        {project.category}
                                    </span>
                                </td>
                                <td className="p-4 text-slate-500 font-medium">{project.academic_year || project.year}</td>
                                <td className="p-4 text-right pr-6 text-slate-400 text-xs font-mono">
                                    {project.created_at ? new Date(project.created_at).toLocaleDateString(undefined, { year: '2-digit', month: '2-digit', day: '2-digit' }) : '-'}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </motion.div>
    );
};

export default ProjectListView;
