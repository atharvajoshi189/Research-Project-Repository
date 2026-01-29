"use client";

import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { motion } from 'framer-motion';
import { ArrowLeft, Download, Github, Copy, FileText, Share2, Users, Calendar, Award, Code2, QrCode, BookOpen, ExternalLink, ChevronRight, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState, useCallback } from 'react';
import { getSmartDownloadUrl } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function ProjectDetails() {
    const params = useParams();
    const router = useRouter();
    const id = params?.id as string;

    const [project, setProject] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);
    const [similarProjects, setSimilarProjects] = useState<any[]>([]);
    const [isAbstractExpanded, setIsAbstractExpanded] = useState(false);

    const [collaborators, setCollaborators] = useState<any[]>([]);

    const fetchSimilarProjects = useCallback(async (category: string, currentId: string) => {
        if (!category) return;
        const { data } = await supabase
            .from('projects')
            .select('*')
            .eq('category', category)
            .neq('id', currentId)
            .eq('status', 'approved')
            .limit(3);

        if (data) setSimilarProjects(data);
    }, []);

    useEffect(() => {
        const fetchProjectAndIncrementViews = async () => {
            setLoading(true);
            const { data, error } = await supabase
                .from('projects')
                .select('*')
                .eq('id', id)
                .single();

            if (error) {
                console.error('Error fetching project:', error);
                setNotFound(true);
                setProject(null);
            } else {
                setProject(data);
                fetchSimilarProjects(data.category, data.id);

                // Fetch Collaborators
                const { data: collabData } = await supabase
                    .from('project_collaborators')
                    .select('*, profiles(full_name, email, avatar_url)')
                    .eq('project_id', id);

                if (collabData) setCollaborators(collabData);

                // Increment Views (RPC)
                await supabase.rpc('increment_views', { row_id: id });
            }
            setLoading(false);
        };

        if (id) {
            fetchProjectAndIncrementViews();
        }
    }, [id, fetchSimilarProjects]);

    const handleDownload = async () => {
        if (!project?.pdf_url) {
            toast.error("No document available");
            return;
        }

        // Increment Downloads (RPC)
        await supabase.rpc('increment_downloads', { row_id: id });

        const url = getSmartDownloadUrl(project.pdf_url);
        window.open(url, '_blank');
    };

    const handleViewSource = () => {
        if (!project?.github_url) {
            toast.error("No source code linked");
            return;
        }
        window.open(project.github_url, '_blank');
    };

    if (loading) {
        return (
            <div className="min-h-screen grid place-items-center bg-white">
                <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (notFound || !project) { // Updated condition to use notFound state
        return (
            <div className="min-h-screen grid place-items-center bg-white">
                <div className="text-center">
                    <h1 className="text-4xl font-bold text-slate-900 mb-4">Project Not Found</h1>
                    <p className="text-slate-500 mb-8">The project you are looking for does not exist in our archives.</p>
                    <button onClick={() => router.back()} className="px-6 py-3 bg-teal-500 text-white rounded-full font-bold hover:bg-teal-600 transition-colors">
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    const authors = Array.isArray(project.authors) ? project.authors : (project.authors ? [project.authors] : []);

    return (
        <div className="min-h-screen w-full relative overflow-hidden bg-slate-50/50">

            {/* 1. Aura Background */}
            <div className="fixed inset-0 w-full h-full -z-50 pointer-events-none overflow-hidden">
                <div className="absolute top-0 right-0 w-[50vw] h-[50vh] bg-teal-50 rounded-full blur-[120px] opacity-60"></div>
                <div className="absolute bottom-0 left-0 w-[50vw] h-[50vh] bg-indigo-50 rounded-full blur-[120px] opacity-60"></div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-12 md:py-20">

                {/* Back Button */}
                <button onClick={() => router.back()} className="mb-8 flex items-center gap-2 text-slate-500 hover:text-teal-600 transition-colors font-semibold group">
                    <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> Back to Search
                </button>

                {/* Top Section: Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-12"
                >
                    <div className="flex flex-wrap gap-3 mb-4">
                        <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider
                            ${project.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>
                            {project.status}
                        </span>
                        <span className="px-4 py-1.5 rounded-full bg-white border border-slate-200 text-slate-600 text-xs font-bold shadow-sm">
                            {project.category}
                        </span>
                    </div>

                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 mb-6 leading-tight">
                        {project.title}
                    </h1>

                    <div className="flex flex-wrap items-center gap-8 text-slate-600">
                        <div className="flex items-center gap-3">
                            <div className="flex -space-x-3">
                                {authors.map((author: string, i: number) => (
                                    <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-gradient-to-br from-teal-100 to-emerald-100 flex items-center justify-center text-xs font-bold text-teal-700 shadow-sm relative z-10">
                                        {author.charAt(0)}
                                    </div>
                                ))}
                            </div>
                            <span className="font-semibold text-sm">
                                {authors.join(', ')}
                            </span>
                        </div>
                        <div className="flex items-center gap-2 font-medium bg-white px-4 py-2 rounded-full border border-slate-200">
                            <Award size={18} className="text-amber-500" /> Guide: {project.guide_name || 'Prof. R. K. Patil'}
                        </div>
                        <div className="flex items-center gap-2 font-medium">
                            <Calendar size={18} className="text-slate-400" /> {project.academic_year || project.year || '2024-2025'}
                        </div>
                    </div>
                </motion.div>

                {/* Main Grid Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

                    {/* Left Column (65%) */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="lg:col-span-8 space-y-10"
                    >
                        {/* Abstract */}
                        <section className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm relative overflow-hidden">
                            <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                                <BookOpen className="text-teal-500" /> Abstract
                            </h2>
                            <div className={`relative transition-all duration-500 ease-in-out ${isAbstractExpanded ? 'max-h-none' : 'max-h-48 overflow-hidden'}`}>
                                <p className="text-lg text-slate-600 leading-8 font-medium whitespace-pre-line text-justify">
                                    {project.abstract}
                                </p>
                                {!isAbstractExpanded && (
                                    <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-white to-transparent" />
                                )}
                            </div>
                            <button
                                onClick={() => setIsAbstractExpanded(!isAbstractExpanded)}
                                className="mt-4 text-teal-600 font-bold text-sm flex items-center gap-2 hover:text-teal-700 transition-colors"
                            >
                                {isAbstractExpanded ? (
                                    <>Read Less <ChevronRight className="-rotate-90" size={16} /></>
                                ) : (
                                    <>Read More <ChevronRight className="rotate-90" size={16} /></>
                                )}
                            </button>
                        </section>

                        {/* Methodology Timeline */}
                        <section>
                            <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                                <Code2 className="text-indigo-500" /> Methodology
                            </h2>
                            <div className="space-y-6 relative border-l-2 border-slate-200 ml-4 pl-8 py-2">
                                {[
                                    { title: "Requirement Analysis", desc: "Detailed study of existing gaps and feasibility." },
                                    { title: "System Architecture", desc: "Designing high-level diagrams and database schemas." },
                                    { title: "Implementation", desc: "Core development using the selected tech stack." },
                                    { title: "Testing & Validation", desc: "Rigorous unit testing and performance benchmarking." }
                                ].map((step, i) => (
                                    <div key={i} className="relative">
                                        <div className="absolute -left-[41px] top-1 w-5 h-5 rounded-full bg-white border-4 border-teal-400"></div>
                                        <h3 className="text-lg font-bold text-slate-900">{step.title}</h3>
                                        <p className="text-slate-500">{step.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </section>



                        {/* Tech Stack - Added by Antigravity */}
                        {project.tech_stack && project.tech_stack.length > 0 && (
                            <section className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
                                <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                                    <Code2 className="text-teal-500" /> Technologies Used
                                </h2>
                                <div className="flex flex-wrap gap-3">
                                    {(Array.isArray(project.tech_stack) ? project.tech_stack : project.tech_stack.split(',')).map((tech: string, i: number) => (
                                        <span
                                            key={i}
                                            className="px-4 py-2 bg-teal-50 text-teal-700 rounded-xl font-bold text-sm border border-teal-100 shadow-md shadow-teal-50 hover:shadow-lg hover:-translate-y-0.5 transition-all text-center cursor-default"
                                        >
                                            {tech.trim()}
                                        </span>
                                    ))}
                                </div>
                            </section>
                        )}


                    </motion.div>

                    {/* Right Column (35%) */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="lg:col-span-4 space-y-8"
                    >
                        {/* Action Hub */}
                        <div className="bg-white rounded-3xl p-6 shadow-xl shadow-slate-200/50 border border-slate-100">
                            <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
                                <FileText size={20} className="text-slate-400" /> Actions
                            </h3>
                            <div className="space-y-4">
                                <button onClick={handleDownload} className="w-full py-4 rounded-xl bg-gradient-to-r from-teal-500 to-teal-400 text-white font-bold shadow-lg shadow-teal-200 hover:shadow-xl hover:scale-[1.02] transition-all flex items-center justify-center gap-3">
                                    <Download size={20} /> Download PDF
                                </button>
                                {project.github_url && (
                                    <button onClick={handleViewSource} className="w-full py-4 rounded-xl bg-slate-900 text-white font-bold shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all flex items-center justify-center gap-3">
                                        <Github size={20} /> View Source Code
                                    </button>
                                )}
                                <button className="w-full py-4 rounded-xl bg-white border-2 border-slate-100 text-slate-700 font-bold hover:bg-slate-50 transition-all flex items-center justify-center gap-3">
                                    <Copy size={20} /> Copy Citation
                                </button>
                            </div>

                            {/* QR Code */}
                            <div className="mt-8 pt-8 border-t border-slate-100 text-center">
                                <div className="bg-white p-4 rounded-2xl border-2 border-dashed border-slate-200 inline-block mb-3">
                                    <QrCode size={64} className="text-slate-800" />
                                </div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Scan to Share</p>
                            </div>
                        </div>

                        {/* Document Preview Placeholder */}
                        <div className="bg-slate-200 rounded-3xl aspect-[3/4] relative overflow-hidden group cursor-pointer border-4 border-white shadow-lg">
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400">
                                <FileText size={48} className="mb-2 opacity-50" />
                                <span className="font-bold text-sm uppercase tracking-wider">Preview Unavailable</span>
                            </div>
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                                <span className="px-4 py-2 bg-white/90 backdrop-blur rounded-lg shadow-lg font-bold text-sm">Read Online</span>
                            </div>
                        </div>

                        {/* Contributors Section - GitHub Style */}
                        {collaborators.length > 0 && (
                            <div className="bg-white rounded-3xl p-6 shadow-xl shadow-slate-200/50 border border-slate-100">
                                <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                                    <Users size={20} className="text-slate-400" /> Contributors
                                </h3>
                                <div className="space-y-3">
                                    {collaborators.filter(c => c.status === 'accepted' || c.role === 'leader').map((collab: any) => (
                                        <div key={collab.id} className="flex items-center gap-3 group">
                                            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold border-2 border-white nav-shadow group-hover:scale-110 transition-transform">
                                                {collab.profiles?.full_name?.charAt(0) || '?'}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-bold text-slate-800 truncate">
                                                    {collab.profiles?.full_name || 'Unknown'}
                                                </p>
                                                <div className="flex gap-2 mt-1">
                                                    {collab.role === 'leader' ? (
                                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-700 uppercase tracking-wide border border-amber-200">
                                                            Leader
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-600 uppercase tracking-wide border border-blue-100">
                                                            Contributor
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </motion.div>
                </div>

                {/* Similar Projects */}
                <section className="mt-32 border-t border-slate-200 pt-16">
                    <div className="flex justify-between items-end mb-10">
                        <div>
                            <h2 className="text-3xl font-bold text-slate-900 mb-2">Recommended for You</h2>
                            <p className="text-slate-500">Other projects in {project.category}</p>
                        </div>
                        <div className="flex gap-2">
                            <button className="p-3 rounded-full border border-slate-200 hover:bg-slate-50 transition-colors"><ChevronRight className="rotate-180" size={20} /></button>
                            <button className="p-3 rounded-full bg-slate-900 text-white hover:bg-slate-800 transition-colors"><ChevronRight size={20} /></button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {similarProjects.length > 0 ? similarProjects.map(p => (
                            <Link key={p.id} href={`/project/${p.id}`}>
                                <div className="bg-white p-6 rounded-3xl border border-slate-100 hover:shadow-xl hover:-translate-y-2 transition-all cursor-pointer group h-full flex flex-col">
                                    <div className="mb-4">
                                        <span className="text-xs font-bold text-teal-600 bg-teal-50 px-3 py-1 rounded-full uppercase tracking-wider">{p.category}</span>
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-teal-600 transition-colors">{p.title}</h3>
                                    <p className="text-slate-500 text-sm line-clamp-3 mb-4 flex-1">{p.abstract}</p>
                                    <div className="flex items-center justify-between text-xs font-semibold text-slate-400 pt-4 border-t border-slate-50">
                                        <span>{p.academic_year || p.year}</span>
                                        <span className="flex items-center gap-1 group-hover:translate-x-1 transition-transform text-teal-500">View <ArrowRight size={12} /></span>
                                    </div>
                                </div>
                            </Link>
                        )) : (
                            <p className="text-slate-400 italic col-span-3">No other recommendations available at this time.</p>
                        )}
                    </div>
                </section>
            </div>
        </div >
    );
}
