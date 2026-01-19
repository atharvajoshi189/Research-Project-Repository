"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Save, X, Info, CheckCircle, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function EditProjectPage() {
    const router = useRouter();
    const params = useParams();
    const projectId = params.id as string;

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [unauthorized, setUnauthorized] = useState(false);

    // Form Data
    const [title, setTitle] = useState('');
    const [abstract, setAbstract] = useState('');
    const [category, setCategory] = useState('Final Year Project');
    const [techStack, setTechStack] = useState<string[]>([]);
    const [currentTech, setCurrentTech] = useState('');
    const [reportLink, setReportLink] = useState('');
    const [githubLink, setGithubLink] = useState('');
    const [guideName, setGuideName] = useState('');
    const [academicYear, setAcademicYear] = useState('2024-2025');

    useEffect(() => {
        const fetchProject = async () => {
            setLoading(true);

            // 1. Auth Check
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                toast.error("Please login first");
                router.push('/login');
                return;
            }

            // 2. Fetch Project
            const { data: project, error } = await supabase
                .from('projects')
                .select('*')
                .eq('id', projectId)
                .single();

            if (error || !project) {
                toast.error("Project not found");
                router.push('/dashboard');
                return;
            }

            // 3. Authorization Check (Must be Leader/Owner)
            // Note: Currently 'student_id' on project table is the owner/leader
            if (project.student_id !== session.user.id) {
                setUnauthorized(true);
                setLoading(false);
                return;
            }

            // 4. Pre-fill Form
            setTitle(project.title || '');
            setAbstract(project.abstract || '');
            setCategory(project.category || 'Final Year Project');
            setReportLink(project.pdf_url || '');
            setGithubLink(project.github_url || '');
            setGuideName(project.guide_name || '');
            setAcademicYear(project.academic_year || '2024-2025');

            // Tech stack can be string or array in DB
            if (Array.isArray(project.tech_stack)) {
                setTechStack(project.tech_stack);
            } else if (typeof project.tech_stack === 'string') {
                setTechStack(project.tech_stack.split(',').map((t: string) => t.trim()).filter(Boolean));
            }

            setLoading(false);
        };

        if (projectId) fetchProject();
    }, [projectId, router]);

    // --- Form Handlers ---

    const addPendingTech = () => {
        if (!currentTech.trim()) return;
        const newTags = currentTech.split(',').map(t => t.trim()).filter(t => t && !techStack.includes(t));
        if (newTags.length > 0) {
            setTechStack(prev => [...prev, ...newTags]);
        }
        setCurrentTech('');
    };

    const handleTechKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addPendingTech();
        }
    };

    const removeTech = (tech: string) => {
        setTechStack(techStack.filter(t => t !== tech));
    };

    const handleSave = async () => {
        if (!title || !abstract || !reportLink || !guideName) {
            toast.error("Please fill all required fields");
            return;
        }

        setSaving(true);
        try {
            const { error } = await supabase
                .from('projects')
                .update({
                    title,
                    abstract,
                    category,
                    tech_stack: techStack,
                    pdf_url: reportLink,
                    github_url: githubLink,
                    guide_name: guideName,
                    academic_year: academicYear
                })
                .eq('id', projectId);

            if (error) throw error;

            toast.success("Project updated successfully!");
            router.push('/dashboard');

        } catch (error: any) {
            console.error("Update error:", error);
            toast.error(error.message || "Failed to update project");
        } finally {
            setSaving(false);
        }
    };

    // --- Loading & Auth States ---

    if (loading) {
        return (
            <div className="min-h-screen grid place-items-center bg-slate-50">
                <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (unauthorized) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4">
                <div className="bg-white p-8 rounded-3xl shadow-xl text-center max-w-md w-full">
                    <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <X size={32} />
                    </div>
                    <h1 className="text-2xl font-black text-slate-900 mb-2">Access Denied</h1>
                    <p className="text-slate-500 mb-6">You do not have permission to edit this project. Only the project leader can make changes.</p>
                    <Link href="/dashboard" className="inline-block px-6 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors">
                        Back to Dashboard
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F8FAFC] py-12 px-4 font-sans text-slate-900">
            {/* Background Gradients */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-0 right-0 w-[50vw] h-[50vw] bg-teal-50 rounded-full blur-[100px] opacity-60"></div>
                <div className="absolute bottom-0 left-0 w-[50vw] h-[50vw] bg-blue-50 rounded-full blur-[100px] opacity-60"></div>
            </div>

            <div className="max-w-3xl mx-auto relative z-10">

                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <Link href="/dashboard" className="p-2 bg-white rounded-full shadow-sm hover:shadow-md text-slate-500 hover:text-slate-900 transition-all">
                        <ArrowLeft size={20} />
                    </Link>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Edit Project</h1>
                </div>

                {/* Form Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-white p-8 md:p-10"
                >
                    <div className="space-y-6">

                        {/* Title */}
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Project Title</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-teal-500/20 font-bold text-slate-800 placeholder:text-slate-300 outline-none transition-all"
                            />
                        </div>

                        {/* Category & Year */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Category</label>
                                <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-teal-500/20 font-bold text-slate-800 outline-none cursor-pointer">
                                    <option>Final Year Project</option>
                                    <option>Mini Project</option>
                                    <option>Research Paper</option>
                                    <option>Hackathon Submission</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Academic Year</label>
                                <select value={academicYear} onChange={(e) => setAcademicYear(e.target.value)} className="w-full p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-teal-500/20 font-bold text-slate-800 outline-none cursor-pointer">
                                    <option>2025-2026</option>
                                    <option>2024-2025</option>
                                    <option>2023-2024</option>
                                    <option>2022-2023</option>
                                </select>
                            </div>
                        </div>

                        {/* Abstract */}
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Abstract</label>
                            <textarea
                                value={abstract}
                                onChange={(e) => setAbstract(e.target.value)}
                                rows={5}
                                className="w-full p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-teal-500/20 font-medium text-slate-700 placeholder:text-slate-300 outline-none transition-all resize-none"
                            ></textarea>
                        </div>

                        {/* Tech Stack */}
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Tech Stack</label>
                            <div className="flex flex-col gap-3">
                                <div className="relative flex items-center gap-2">
                                    <input
                                        type="text"
                                        value={currentTech}
                                        onChange={(e) => setCurrentTech(e.target.value)}
                                        onKeyDown={handleTechKeyDown}
                                        className="w-full p-4 pr-14 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-teal-500/20 font-bold text-slate-800 placeholder:text-slate-300 outline-none"
                                        placeholder="Add technology..."
                                    />
                                    <button
                                        onClick={addPendingTech}
                                        className="absolute right-2 p-2 bg-white text-teal-600 rounded-xl shadow-sm hover:bg-teal-50 transition-colors"
                                    >
                                        <CheckCircle size={20} />
                                    </button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {techStack.map(tech => (
                                        <span key={tech} className="px-3 py-1 bg-teal-50 text-teal-700 rounded-lg text-sm font-bold flex items-center gap-2">
                                            {tech} <button onClick={() => removeTech(tech)}><X size={14} /></button>
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Guide Name */}
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Guide Name</label>
                            <input
                                type="text"
                                value={guideName}
                                onChange={(e) => setGuideName(e.target.value)}
                                className="w-full p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-teal-500/20 font-bold text-slate-800 placeholder:text-slate-300 outline-none"
                            />
                        </div>

                        {/* Links */}
                        <div className="grid grid-cols-1 gap-6">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Project Report (Drive Link)</label>
                                <input
                                    type="url"
                                    value={reportLink}
                                    onChange={(e) => setReportLink(e.target.value)}
                                    className="w-full p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-teal-500/20 font-bold text-slate-800 placeholder:text-slate-300 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">GitHub Repository</label>
                                <input
                                    type="url"
                                    value={githubLink}
                                    onChange={(e) => setGithubLink(e.target.value)}
                                    className="w-full p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-teal-500/20 font-bold text-slate-800 placeholder:text-slate-300 outline-none"
                                />
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex justify-end pt-6 border-t border-slate-100 mt-4">
                            <Link href="/dashboard" className="px-8 py-4 text-slate-500 font-bold hover:bg-slate-50 rounded-2xl transition-all mr-4">
                                Cancel
                            </Link>
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="px-8 py-4 bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-bold rounded-2xl hover:shadow-xl hover:shadow-teal-200 transition-all flex items-center gap-3 disabled:opacity-50"
                            >
                                {saving ? 'Saving...' : 'Save Changes'} <Save size={20} />
                            </button>
                        </div>

                    </div>
                </motion.div>
            </div>
        </div>
    );
}