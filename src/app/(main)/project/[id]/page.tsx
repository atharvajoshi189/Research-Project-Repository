"use client";

import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Download, Github, Copy, FileText, Share2, Users, Calendar, Award, Code2, Sparkles, BrainCircuit, Lightbulb, ChevronRight, ArrowRight, Zap, BookOpen } from 'lucide-react';
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

    // AI States
    const [aiInsights, setAiInsights] = useState<any>(null);
    const [aiAbstract, setAiAbstract] = useState<string | null>(null);
    const [isAiAbstract, setIsAiAbstract] = useState(false);
    const [loadingAiAbstract, setLoadingAiAbstract] = useState(false);
    const [techTooltips, setTechTooltips] = useState<Record<string, string>>({});
    const [activeTechTooltip, setActiveTechTooltip] = useState<string | null>(null);

    const [isAbstractExpanded, setIsAbstractExpanded] = useState(false);
    const [collaborators, setCollaborators] = useState<any[]>([]);
    const [projectLeader, setProjectLeader] = useState<any>(null);

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

    // AI Fetchers (No changes here)
    const fetchAiInsights = useCallback(async (proj: any) => {
        try {
            const res = await fetch('/api/grok', {
                method: 'POST',
                body: JSON.stringify({
                    action: 'insights',
                    context: {
                        title: proj.title,
                        abstract: proj.abstract,
                        tech_stack: proj.tech_stack
                    }
                })
            });
            const { data } = await res.json();
            if (data) setAiInsights(data);
        } catch (e) {
            console.error("AI Insights Error", e);
        }
    }, []);

    const toggleSmartSummary = async () => {
        if (isAiAbstract) {
            setIsAiAbstract(false);
            return;
        }

        if (aiAbstract) {
            setIsAiAbstract(true);
            return;
        }

        setLoadingAiAbstract(true);
        try {
            const res = await fetch('/api/grok', {
                method: 'POST',
                body: JSON.stringify({
                    action: 'simplify_abstract',
                    context: { abstract: project.abstract }
                })
            });
            const { data } = await res.json();
            setAiAbstract(data);
            setIsAiAbstract(true);
        } catch (e) {
            toast.error("Could not optimize abstract");
        } finally {
            setLoadingAiAbstract(false);
        }
    };

    const fetchTechSnippet = async (tech: string) => {
        if (techTooltips[tech]) {
            setActiveTechTooltip(activeTechTooltip === tech ? null : tech);
            return;
        }

        setActiveTechTooltip(tech);
        try {
            const res = await fetch('/api/grok', {
                method: 'POST',
                body: JSON.stringify({
                    action: 'tech_snippet',
                    context: {
                        tech,
                        title: project.title,
                        abstract: project.abstract
                    }
                })
            });
            const { data } = await res.json();
            setTechTooltips(prev => ({ ...prev, [tech]: data }));
        } catch (e) {
            // Silent fail
        }
    };


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
                fetchAiInsights(data); // Trigger AI

                // Fetch Project Leader Profile
                if (data.student_id) {
                    const { data: leaderData } = await supabase
                        .from('profiles')
                        .select('id, full_name')
                        .eq('id', data.student_id)
                        .single();
                    if (leaderData) setProjectLeader(leaderData);
                }

                // Fetch Collaborators (Robust 2-step)
                const { data: collabData, error: collabError } = await supabase
                    .from('project_collaborators')
                    .select('id, student_id, role, status')
                    .eq('project_id', id);

                if (collabData && collabData.length > 0) {
                    const studentIds = collabData.map(c => c.student_id);
                    const { data: profiles, error: profileError } = await supabase
                        .from('profiles')
                        .select('id, full_name')
                        .in('id', studentIds);

                    if (!profileError && profiles) {
                        const merged = collabData.map(c => ({
                            ...c,
                            profile: profiles.find(p => p.id === c.student_id)
                        }));
                        setCollaborators(merged);
                    }
                } else {
                    setCollaborators([]);
                }

                // Increment Views (RPC)
                await supabase.rpc('increment_views', { row_id: id });
            }
            setLoading(false);
        };

        if (id) {
            fetchProjectAndIncrementViews();
        }
    }, [id, fetchSimilarProjects, fetchAiInsights]);

    const handleDownload = async () => {
        if (!project?.pdf_url) {
            toast.error("No document available");
            return;
        }
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
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-slate-400 text-sm font-medium animate-pulse">Initializing Neural Hub...</p>
                </div>
            </div>
        );
    }

    if (notFound || !project) {
        return (
            <div className="min-h-screen grid place-items-center bg-white">
                <div className="text-center">
                    <h1 className="text-4xl font-bold text-slate-900 mb-4">Project Not Found</h1>
                    <button onClick={() => router.back()} className="px-6 py-3 bg-teal-500 text-white rounded-full font-bold hover:bg-teal-600 transition-colors">
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    // Combine Leader and Collaborators for Uniform Display
    const allTeamMembers: any[] = [];

    // Add Leader (priority from profiles, fallback to project.student_name)
    if (projectLeader) {
        allTeamMembers.push({
            id: projectLeader.id, // Ensure unique key
            name: projectLeader.full_name,
            role: 'Team Lead',
            initial: projectLeader.full_name.charAt(0),
            isLeader: true
        });
    } else if (project?.student_name) {
        allTeamMembers.push({
            id: 'legacy-leader',
            name: project.student_name,
            role: 'Team Lead',
            initial: project.student_name.charAt(0),
            isLeader: true
        });
    }

    // Add Collaborators
    collaborators.filter(c => c.status === 'accepted' || c.role === 'leader').forEach(c => {
        // Avoid duplicating the leader if they are listed as a collaborator (rare)
        if (!allTeamMembers.some(m => m.id === c.student_id)) {
            if (c.profile?.full_name) {
                allTeamMembers.push({
                    id: c.id,
                    name: c.profile.full_name,
                    role: 'Contributor', // Or c.role from DB if dynamic
                    initial: c.profile.full_name.charAt(0),
                    isLeader: false
                });
            }
        }
    });

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
                                {allTeamMembers.map((member, i) => (
                                    <div key={i} title={`${member.name} (${member.role})`} className="w-10 h-10 rounded-full border-2 border-white bg-gradient-to-br from-teal-100 to-emerald-100 flex items-center justify-center text-xs font-bold text-teal-700 shadow-sm relative z-10 cursor-help">
                                        {member.initial}
                                    </div>
                                ))}
                            </div>
                            <span className="font-semibold text-sm">
                                {allTeamMembers.map(t => t.name).join(', ')}
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
                        {/* Abstract with AI Toggle */}
                        <section className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm relative overflow-visible group">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                                    <BookOpen className="text-teal-500" /> Abstract
                                </h2>
                                {/* Smart Toggle */}
                                <button
                                    onClick={toggleSmartSummary}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all border ${isAiAbstract
                                        ? 'bg-indigo-100 text-indigo-700 border-indigo-200 shadow-indigo-100'
                                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-indigo-50 hover:text-indigo-600'
                                        }`}
                                >
                                    <Sparkles size={14} className={isAiAbstract ? "fill-current" : ""} />
                                    {isAiAbstract ? 'AI Optimized' : 'Optimize with AI'}
                                </button>
                            </div>

                            <div className={`relative transition-all duration-500 ease-in-out`}>
                                <motion.div
                                    initial={false}
                                    animate={{ height: isAbstractExpanded ? 'auto' : 100 }}
                                    className="overflow-hidden relative"
                                >
                                    <AnimatePresence mode="wait">
                                        {loadingAiAbstract ? (
                                            <motion.div
                                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                                className="h-full flex items-center justify-center gap-3 text-indigo-500 font-medium pt-8"
                                            >
                                                <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                                Optimizing for clarity...
                                            </motion.div>
                                        ) : (
                                            <motion.div
                                                key={isAiAbstract ? 'ai' : 'raw'}
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                            >
                                                <p className={`text-lg leading-8 font-medium whitespace-pre-line text-justify ${isAiAbstract ? 'text-indigo-900/80 font-semibold' : 'text-slate-600'}`}>
                                                    {isAiAbstract ? aiAbstract : project.abstract}
                                                </p>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>

                                {!isAbstractExpanded && !loadingAiAbstract && (
                                    <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-white to-transparent pointer-events-none" />
                                )}
                            </div>

                            {!isAiAbstract && (
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
                            )}
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

                        {/* Tech Stack - With Deep Dive */}
                        {project.tech_stack && project.tech_stack.length > 0 && (
                            <section className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
                                <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                                    <Code2 className="text-teal-500" /> Technologies Used
                                </h2>
                                <div className="flex flex-wrap gap-3">
                                    {(Array.isArray(project.tech_stack) ? project.tech_stack : project.tech_stack.split(',')).map((tech: string, i: number) => {
                                        const t = tech.trim();
                                        return (
                                            <div key={i} className="relative group/tech">
                                                <button
                                                    onClick={() => fetchTechSnippet(t)}
                                                    className={`px-4 py-2 rounded-xl font-bold text-sm border shadow-sm transition-all text-center flex items-center gap-2
                                                        ${activeTechTooltip === t
                                                            ? 'bg-teal-600 text-white border-teal-600 shadow-md'
                                                            : 'bg-teal-50 text-teal-700 border-teal-100 hover:shadow-md hover:-translate-y-0.5'
                                                        }`}
                                                >
                                                    {t}
                                                    {activeTechTooltip === t && <Zap size={12} className="fill-current animate-pulse" />}
                                                </button>

                                                {/* Tooltip */}
                                                <AnimatePresence>
                                                    {activeTechTooltip === t && (
                                                        <motion.div
                                                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                                            exit={{ opacity: 0, y: 5 }}
                                                            className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 w-64 bg-slate-900 text-white p-4 rounded-xl text-xs z-50 shadow-xl"
                                                        >
                                                            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-slate-900 rotate-45"></div>
                                                            {techTooltips[t] ? (
                                                                <>
                                                                    <div className="flex items-center gap-1 font-bold text-teal-400 mb-1">
                                                                        <Sparkles size={10} /> AI Context
                                                                    </div>
                                                                    {techTooltips[t]}
                                                                </>
                                                            ) : (
                                                                <div className="flex items-center justify-center py-2">
                                                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                                </div>
                                                            )}
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        );
                                    })}
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
                        {/* AI Insights Sidebar (Replacing QR) */}
                        <div className="relative bg-white/60 backdrop-blur-xl rounded-3xl p-6 shadow-xl shadow-teal-900/5 border border-white/60 overflow-hidden group">
                            {/* Pulse Effect */}
                            <div className="absolute inset-0 rounded-3xl border-2 border-teal-400/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-pulse-slow pointer-events-none"></div>

                            <div className="relative z-10">
                                <h3 className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-indigo-600 mb-6 flex items-center gap-2">
                                    <BrainCircuit size={20} className="text-teal-600" /> AI Insights
                                </h3>

                                {aiInsights ? (
                                    <div className="space-y-6">
                                        <div>
                                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">At a Glance</h4>
                                            <p className="text-sm font-medium text-slate-700 leading-6">{aiInsights.summary}</p>
                                        </div>

                                        {aiInsights.author_expertise && (
                                            <div>
                                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Lead Expertise</h4>
                                                <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-bold border border-indigo-100">
                                                    <Sparkles size={12} />
                                                    {aiInsights.author_expertise}
                                                </div>
                                            </div>
                                        )}

                                        <div>
                                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Key Innovations</h4>
                                            <ul className="space-y-3">
                                                {aiInsights.innovations.map((inv: string, i: number) => (
                                                    <li key={i} className="flex gap-2 text-sm text-slate-600">
                                                        <div className="mt-1 min-w-[6px] h-1.5 rounded-full bg-indigo-400"></div>
                                                        {inv}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="py-8 text-center space-y-3">
                                        <div className="w-10 h-10 mx-auto border-4 border-indigo-100 border-t-indigo-500 rounded-full animate-spin" />
                                        <p className="text-xs font-medium text-slate-400">Analyzing Project...</p>
                                    </div>
                                )}
                            </div>
                        </div>


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
                        </div>

                        {/* Contributors Section - Unified and Always Visible if any team member exists */}
                        {allTeamMembers.length > 0 && (
                            <div className="bg-white rounded-3xl p-6 shadow-xl shadow-slate-200/50 border border-slate-100">
                                <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                                    <Users size={20} className="text-slate-400" /> Contributors
                                </h3>
                                <div className="space-y-3">
                                    {allTeamMembers.map((collab: any, index: number) => {
                                        // Assign AI Badge
                                        let aiBadge = null;
                                        if (collab.isLeader && aiInsights?.author_expertise) {
                                            aiBadge = aiInsights.author_expertise;
                                        } else if (aiInsights?.key_roles && !collab.isLeader) {
                                            aiBadge = aiInsights.key_roles[index % aiInsights.key_roles.length];
                                        }

                                        return (
                                            <div key={collab.id || index} className="flex items-center gap-3 group">
                                                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold border-2 border-white nav-shadow group-hover:scale-110 transition-transform">
                                                    {collab.initial}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-baseline gap-2">
                                                        <p className="text-sm font-bold text-slate-800 truncate">
                                                            {collab.name}
                                                        </p>
                                                        {aiBadge && (
                                                            <span className="text-[10px] font-bold text-indigo-500 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100 flex items-center gap-1">
                                                                <Sparkles size={8} /> {aiBadge}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="flex gap-2 mt-1">
                                                        {collab.role === 'Team Lead' || collab.role === 'leader' ? (
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
                                        );
                                    })}
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
