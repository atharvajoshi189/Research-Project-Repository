"use client";

import { useEffect, useState, Suspense } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter, useSearchParams } from 'next/navigation';
import { Users, FileClock, Search, MessageSquare, CheckCircle, Clock, ChevronRight, AlertCircle, BookOpen, Layers, LayoutGrid } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { getSmartDownloadUrl } from '@/lib/utils';

import { useRealtimeProjects } from '@/hooks/useRealtimeProjects';

const StatusBadge = ({ status }: { status: string }) => {
    const styles = {
        pending: 'bg-amber-100 text-amber-700 border-amber-200',
        approved: 'bg-emerald-100 text-emerald-700 border-emerald-200',
        guide_approved: 'bg-indigo-100 text-indigo-700 border-indigo-200',
        rejected: 'bg-rose-100 text-rose-700 border-rose-200'
    };
    const s = styles[status as keyof typeof styles] || styles.pending;

    return (
        <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${s}`}>
            {status?.replace('_', ' ') || 'Pending'}
        </span>
    );
}

function TeacherDashboardContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const initialTab = searchParams.get('tab') === 'reviews' ? 'reviews' : 'active';
    const [activeTab, setActiveTab] = useState(initialTab);
    const [viewMode, setViewMode] = useState<'mine' | 'all'>('mine');
    const [projectCategoryFilter, setProjectCategoryFilter] = useState<'All' | 'Micro Project' | 'Mini Project' | 'Final Year Project'>('All');

    const [user, setUser] = useState<any>(null);
    const [authLoading, setAuthLoading] = useState(true);
    const [teachers, setTeachers] = useState<any[]>([]);
    const [assigningLoading, setAssigningLoading] = useState<string | null>(null);

    // Auth Check
    useEffect(() => {
        const checkAccess = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                router.push('/login');
                return;
            }
            const { data: profile } = await supabase.from('profiles').select('role, email').eq('id', session.user.id).single();

            // HOD Specific Check
            const isHodEmail = session.user.email === 'hodce@stvincentngp.edu.in';

            if (profile?.role !== 'teacher' && profile?.role !== 'admin' && profile?.role !== 'faculty' && profile?.role !== 'hod' && !isHodEmail) {
                toast.error("Access Denied");
                router.push('/');
                return;
            }

            const effectiveRole = isHodEmail ? 'hod' : profile?.role;
            setUser({ ...session.user, role: effectiveRole });

            // OPTIMIZATION: Unblock UI immediately after verifying access
            setAuthLoading(false);

            // Default HOD to 'all' & Background Fetch Teachers
            if (effectiveRole === 'hod' || effectiveRole === 'admin') {
                setViewMode('all');
                supabase
                    .from('profiles')
                    .select('id, full_name')
                    .in('role', ['teacher', 'faculty', 'hod'])
                    .then(({ data }) => {
                        if (data) setTeachers(data);
                    });
            }
        };
        checkAccess();
    }, []);

    // Fetch Projects
    const { projects, loading: projectsLoading, refetch } = useRealtimeProjects(user?.id, user?.role || 'teacher');
    const loading = authLoading || projectsLoading;

    // Helper: Normalize Name (Smart Matching)
    const normalizeName = (name: string) => {
        if (!name) return "";
        return name
            .toLowerCase()
            .replace(/^(prof\.|dr\.|mr\.|mrs\.|ms\.|er\.)\s*/i, "") // Remove common prefixes
            .trim();
    };

    // Helper: Smart Guide Resolution
    const resolveGuide = (project: any) => {
        // 1. If guide_id exists, find the name from teachers list (or usage)
        if (project.guide_id) {
            const t = teachers.find(t => t.id === project.guide_id);
            return {
                id: project.guide_id,
                name: t ? t.full_name : "Unknown Guide",
                isAutoMapped: false
            };
        }
        // 2. Fallback: Try to find by guide_name string with Normalization
        if (project.guide_name && teachers.length > 0) {
            const normalizedProjectGuide = normalizeName(project.guide_name);

            const match = teachers.find(t => {
                const normalizedTeacherName = normalizeName(t.full_name);
                return normalizedTeacherName === normalizedProjectGuide;
            });

            if (match) {
                return {
                    id: match.id,     // We found a real ID!
                    name: match.full_name,
                    isAutoMapped: true
                };
            }
        }
        return null; // Truly unassigned
    };

    // Stats Calculation
    const totalProjects = projects.length;
    // Active Teachers: Count unique resolved IDs
    const activeTeachersCount = new Set(projects.map(p => {
        const g = resolveGuide(p);
        return g ? g.id : null;
    }).filter(Boolean)).size;

    // Pending Allotments: Projects where resolveGuide returns null
    const pendingAllotmentsCount = projects.filter(p => !resolveGuide(p)).length;

    const totalStudentsCount = projects.reduce((acc, p) => acc + (Array.isArray(p.authors) ? p.authors.length : 0), 0);
    // Note: totalStudentsCount is an approximation based on project authors array. For exact profile count we'd need another query.

    // Filter Logic
    const filteredProjects = projects.filter(p => {
        // HOD View Mode Logic
        if ((user?.role === 'hod' || user?.role === 'admin') && viewMode === 'all') {
            if (projectCategoryFilter !== 'All' && p.category !== projectCategoryFilter) return false;
            return true;
        }
        // Teacher / My Groups View
        if (projectCategoryFilter !== 'All' && p.category !== projectCategoryFilter) return false;
        return p.guide_id === user?.id;
    });

    const pendingReviews = projects.filter(p => p.status === 'pending');
    const unassignedProjects = projects.filter(p => !resolveGuide(p));


    // Review Logic
    const [reviewModalOpen, setReviewModalOpen] = useState(false);
    const [selectedProject, setSelectedProject] = useState<any>(null);
    const [feedback, setFeedback] = useState('');
    const [reviewAction, setReviewAction] = useState<'approved' | 'rejected' | null>(null);

    // Edit Logic
    const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
    const [editValues, setEditValues] = useState<{ title: string; guide_id: string }>({ title: '', guide_id: '' });

    const startEditing = (project: any) => {
        setEditingProjectId(project.id);
        setEditValues({ title: project.title, guide_id: project.guide_id || '' });
    };

    const saveEdit = async () => {
        if (!editingProjectId) return;
        try {
            const { error } = await supabase
                .from('projects')
                .update({
                    title: editValues.title,
                    guide_id: editValues.guide_id || null
                })
                .eq('id', editingProjectId);

            if (error) throw error;
            toast.success("Project updated successfully!");
            setEditingProjectId(null);
            refetch();
        } catch (err: any) {
            toast.error("Failed to update: " + err.message);
        }
    };

    const openReviewModal = (project: any, action: 'approved' | 'rejected') => {
        setSelectedProject(project);
        setReviewAction(action);
        // Pre-fill feedback if rejected before? No, fresh start for now.
        setFeedback(project.remarks || '');
        setReviewModalOpen(true);
    };

    const submitReview = async () => {
        if (!selectedProject || !reviewAction) return;
        try {
            const updates: any = {
                status: reviewAction === 'approved' ? 'approved' : 'rejected', // 'approved' directly for HOD
            };

            // If rejected, save remarks. If approved, maybe clear them?
            if (reviewAction === 'rejected') {
                updates.remarks = feedback;
                updates.admin_feedback = feedback; // Keep legacy column in sync if needed
            }

            const { error } = await supabase
                .from('projects')
                .update(updates)
                .eq('id', selectedProject.id);

            if (error) throw error;
            toast.success(`Project ${reviewAction === 'approved' ? 'approved' : 'rejected'} successfully!`);
            setReviewModalOpen(false);
            refetch();
        } catch (err: any) {
            toast.error(err.message);
        }
    };

    // HOD Assign Project Logic (Simplified Update)
    const handleAssignGuide = async (projectId: string, guideId: string) => {
        setAssigningLoading(projectId);
        try {
            const { error } = await supabase
                .from('projects')
                .update({ guide_id: guideId })
                .eq('id', projectId);
            if (error) throw error;
            toast.success("Guide assigned successfully!");
            refetch();
        } catch (err: any) {
            toast.error("Failed to assign guide: " + err.message);
        } finally {
            setAssigningLoading(null);
        }
    };

    // Get Guide Name helper
    const getGuideName = (guideId: string) => {
        if (!guideId) return null;
        const t = teachers.find(t => t.id === guideId);
        return t ? t.full_name : "Unknown Guide";
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] font-sans transition-colors duration-500 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">

                {/* Header */}
                <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold uppercase tracking-widest mb-3 border border-indigo-100">
                            <Layers size={14} /> Academic Control Center
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-2 tracking-tight">
                            Departmental <span className="text-indigo-600">Allotment Matrix</span>
                        </h1>
                        <p className="text-slate-500 font-medium">
                            {(user?.role === 'hod' || user?.role === 'admin')
                                ? "Master view for academic oversight and resource allocation."
                                : "Manage your student groups and review submissions."}
                        </p>
                    </div>

                    {/* HOD Toggle & Controls */}
                    {(user?.role === 'hod' || user?.role === 'admin') && (
                        <div className="flex flex-col items-end gap-3">
                            <div className="bg-white p-1 rounded-xl border border-slate-200 shadow-sm flex">
                                <button
                                    onClick={() => setViewMode('mine')}
                                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${viewMode === 'mine' ? 'bg-indigo-50 text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                                >
                                    My Groups
                                </button>
                                <button
                                    onClick={() => setViewMode('all')}
                                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${viewMode === 'all' ? 'bg-indigo-50 text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                                >
                                    Monitor All
                                </button>
                            </div>
                            <div className="flex gap-2 text-xs font-bold text-slate-400">
                                <span className="hover:text-indigo-600 cursor-pointer transition-colors">Monitoring</span> •
                                <span className="hover:text-indigo-600 cursor-pointer transition-colors">Allotment</span> •
                                <span className="hover:text-indigo-600 cursor-pointer transition-colors">Admin</span>
                            </div>
                        </div>
                    )}
                </header>

                {/* Loading State */}
                {loading ? (
                    <div className="py-20 text-center">
                        <div className="animate-spin w-8 h-8 border-4 border-indigo-500 rounded-full border-t-transparent mx-auto mb-4"></div>
                        <p className="text-slate-400 font-bold">Syncing Matrix...</p>
                    </div>
                ) : (
                    <>
                        {/* MASTER STATS CARDS (HOD Only) */}
                        {(user?.role === 'hod' || user?.role === 'admin') && viewMode === 'all' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Total Projects</p>
                                            <h3 className="text-3xl font-black text-slate-900">{totalProjects}</h3>
                                        </div>
                                        <div className="bg-blue-50 p-2 rounded-lg text-blue-600"><Layers size={20} /></div>
                                    </div>
                                </div>
                                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Active Teachers</p>
                                            <h3 className="text-3xl font-black text-slate-900">{activeTeachersCount}</h3>
                                        </div>
                                        <div className="bg-emerald-50 p-2 rounded-lg text-emerald-600"><Users size={20} /></div>
                                    </div>
                                </div>
                                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Pending Allotments</p>
                                            <h3 className="text-3xl font-black text-rose-500">{pendingAllotmentsCount}</h3>
                                        </div>
                                        <div className="bg-rose-50 p-2 rounded-lg text-rose-600"><AlertCircle size={20} /></div>
                                    </div>
                                </div>
                                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Total Students</p>
                                            <h3 className="text-3xl font-black text-slate-900">{totalStudentsCount}</h3>
                                        </div>
                                        <div className="bg-indigo-50 p-2 rounded-lg text-indigo-600"><BookOpen size={20} /></div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Global Filters & Tabs */}
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-200 mb-8 pb-1 gap-4 overflow-x-auto w-full">
                            <div className="flex gap-6">
                                <button
                                    onClick={() => setActiveTab('active')}
                                    className={`pb-4 px-2 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap
                                        ${activeTab === 'active' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400 hover:text-slate-600'}
                                    `}
                                >
                                    <LayoutGrid size={18} />
                                    {(user?.role === 'hod' || user?.role === 'admin') && viewMode === 'all' ? 'Master Matrix' : 'Active Allotments'}
                                    <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full text-[10px]">{filteredProjects.length}</span>
                                </button>
                                {(user?.role === 'hod' || user?.role === 'admin') && (
                                    <>
                                        <button
                                            onClick={() => setActiveTab('pending_reviews')}
                                            className={`pb-4 px-2 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap
                                                ${activeTab === 'pending_reviews' ? 'border-amber-500 text-amber-600' : 'border-transparent text-slate-400 hover:text-slate-600'}
                                            `}
                                        >
                                            <Clock size={18} /> Pending Reviews
                                            <span className="bg-amber-100 text-amber-600 px-2 py-0.5 rounded-full text-[10px]">{projects.filter(p => p.status === 'pending').length}</span>
                                        </button>
                                        <button
                                            onClick={() => setActiveTab('unassigned')}
                                            className={`pb-4 px-2 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap
                                                ${activeTab === 'unassigned' ? 'border-rose-500 text-rose-600' : 'border-transparent text-slate-400 hover:text-slate-600'}
                                            `}
                                        >
                                            <Users size={18} /> Unassigned
                                            <span className="bg-rose-100 text-rose-600 px-2 py-0.5 rounded-full text-[10px]">{unassignedProjects.length}</span>
                                        </button>
                                    </>
                                )}
                                {pendingReviews.length > 0 && user?.role === 'teacher' && (
                                    <button
                                        onClick={() => setActiveTab('reviews')}
                                        className={`pb-4 px-2 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap
                                            ${activeTab === 'reviews' ? 'border-purple-500 text-purple-600' : 'border-transparent text-slate-400 hover:text-slate-600'}
                                        `}
                                    >
                                        <AlertCircle size={18} /> Mentee Approvals
                                        <span className="bg-purple-100 text-purple-600 px-2 py-0.5 rounded-full text-[10px]">{pendingReviews.length}</span>
                                    </button>
                                )}
                            </div>

                            {/* Project Type Filter Tabs */}
                            <div className="flex bg-slate-100 p-1 rounded-lg">
                                {['All', 'Micro Project', 'Mini Project', 'Final Year Project'].map((cat) => (
                                    <button
                                        key={cat}
                                        onClick={() => setProjectCategoryFilter(cat as any)}
                                        className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all whitespace-nowrap
                                            ${projectCategoryFilter === cat ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}
                                        `}
                                    >
                                        {cat === 'Final Year Project' ? 'FYP' : cat.replace(' Project', '')}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="min-h-[400px]">

                            {/* ACTIVE ALLOTMENTS / MASTER MATRIX */}
                            {activeTab === 'active' && (
                                <div className="bg-white rounded-[2rem] border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left">
                                            <thead className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                                                <tr>
                                                    <th className="p-6">Project Title</th>
                                                    <th className="p-6">Student Group</th>
                                                    <th className="p-6">Category</th>
                                                    {(user?.role === 'hod' || user?.role === 'admin') && viewMode === 'all' ? (
                                                        <th className="p-6">Assigned Guide</th>
                                                    ) : (
                                                        <th className="p-6">Status</th>
                                                    )}
                                                    <th className="p-6 text-right">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100">
                                                {filteredProjects.map((project) => {
                                                    const guideInfo = resolveGuide(project);
                                                    const isEditing = editingProjectId === project.id;

                                                    return (
                                                        <tr key={project.id} className="hover:bg-slate-50/80 transition-colors group">
                                                            <td className="p-6 max-w-[300px]">
                                                                {isEditing ? (
                                                                    <input
                                                                        className="w-full border border-slate-300 rounded p-1 text-sm font-bold"
                                                                        value={editValues.title}
                                                                        onChange={(e) => setEditValues({ ...editValues, title: e.target.value })}
                                                                        autoFocus
                                                                    />
                                                                ) : (
                                                                    <>
                                                                        <div className="font-bold text-slate-900 truncate flex items-center gap-2">
                                                                            <span title={project.title}>{project.title}</span>
                                                                            {(user?.role === 'hod' || user?.role === 'admin') && viewMode === 'all' && (
                                                                                <button onClick={() => startEditing(project)} className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-indigo-600 transition-opacity">
                                                                                    {/* Pencil Icon */}
                                                                                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
                                                                                </button>
                                                                            )}
                                                                        </div>
                                                                        <div className="text-xs text-slate-400 font-mono mt-1">{project.academic_year}</div>
                                                                    </>
                                                                )}
                                                            </td>
                                                            <td className="p-6">
                                                                <div className="flex -space-x-2 mb-1">
                                                                    {(Array.isArray(project.authors) ? project.authors : project.authors ? [project.authors] : []).map((author: string, i: number) => (
                                                                        <div key={i} className="w-7 h-7 rounded-full bg-indigo-100 border-2 border-white flex items-center justify-center text-[9px] font-bold text-indigo-700 uppercase" title={author}>
                                                                            {author?.[0]}
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                                <div className="text-xs text-slate-500 truncate max-w-[200px]" title={Array.isArray(project.authors) ? project.authors.join(', ') : ''}>
                                                                    {Array.isArray(project.authors) ? project.authors.join(', ') : 'No members'}
                                                                </div>
                                                            </td>
                                                            <td className="p-6">
                                                                <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider
                                                                ${project.category === 'Micro Project' ? 'bg-cyan-50 text-cyan-700 border border-cyan-100' :
                                                                        project.category === 'Mini Project' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                                                                            'bg-rose-50 text-rose-700 border border-rose-100'}
                                                            `}>
                                                                    {project.category?.replace(' Project', '')}
                                                                </span>
                                                            </td>

                                                            {/* Guide / Status Column */}
                                                            {(user?.role === 'hod' || user?.role === 'admin') && viewMode === 'all' ? (
                                                                <td className="p-6">
                                                                    {isEditing ? (
                                                                        <select
                                                                            className="w-full border border-slate-300 rounded p-1 text-xs"
                                                                            value={editValues.guide_id}
                                                                            onChange={(e) => setEditValues({ ...editValues, guide_id: e.target.value })}
                                                                        >
                                                                            <option value="">No Guide</option>
                                                                            {teachers.map(t => (
                                                                                <option key={t.id} value={t.id}>{t.full_name}</option>
                                                                            ))}
                                                                        </select>
                                                                    ) : (
                                                                        guideInfo ? (
                                                                            <div className="flex items-center gap-2 group/guide cursor-pointer" onClick={() => startEditing(project)}>
                                                                                <div className={`w-2 h-2 rounded-full ${guideInfo.isAutoMapped ? 'bg-amber-400' : 'bg-emerald-400'}`}></div>
                                                                                <span className="text-sm font-semibold text-slate-700">{guideInfo.name}</span>
                                                                            </div>
                                                                        ) : (
                                                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-100 text-red-700 text-[10px] font-bold border border-red-200 cursor-pointer" onClick={() => startEditing(project)}>
                                                                                Unassigned
                                                                            </span>
                                                                        )
                                                                    )}
                                                                </td>
                                                            ) : (
                                                                <td className="p-6">
                                                                    <StatusBadge status={project.status} />
                                                                </td>
                                                            )}

                                                            <td className="p-6 text-right">
                                                                {isEditing ? (
                                                                    <div className="flex justify-end gap-2">
                                                                        <button onClick={() => setEditingProjectId(null)} className="text-xs font-bold text-slate-500 hover:text-slate-700">Cancel</button>
                                                                        <button onClick={saveEdit} className="text-xs font-bold bg-indigo-600 text-white px-2 py-1 rounded hover:bg-indigo-700">Save</button>
                                                                    </div>
                                                                ) : (
                                                                    <div className="flex justify-end items-center gap-2">
                                                                        {/* HOD Actions: Approve / Reject */}
                                                                        {(user?.role === 'hod' || user?.role === 'admin') && viewMode === 'all' ? (
                                                                            <div className="flex gap-2">
                                                                                {project.status !== 'approved' && (
                                                                                    <button
                                                                                        onClick={() => openReviewModal(project, 'approved')}
                                                                                        className="px-3 py-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-lg text-xs font-bold border border-emerald-200 transition-colors"
                                                                                    >
                                                                                        Approve
                                                                                    </button>
                                                                                )}
                                                                                <button
                                                                                    onClick={() => openReviewModal(project, 'rejected')}
                                                                                    className="px-3 py-1.5 bg-white text-slate-500 hover:bg-rose-50 hover:text-rose-600 rounded-lg text-xs font-bold border border-slate-200 hover:border-rose-200 transition-colors"
                                                                                >
                                                                                    {project.status === 'rejected' ? 'Edit Remarks' : 'Reject'}
                                                                                </button>
                                                                            </div>
                                                                        ) : (
                                                                            <Link href={`/project/${project.id}`} className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-white border border-slate-200 text-slate-400 hover:text-indigo-600 hover:border-indigo-200 transition-all shadow-sm">
                                                                                <ChevronRight size={16} />
                                                                            </Link>
                                                                        )}
                                                                    </div>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                                {filteredProjects.length === 0 && (
                                                    <tr>
                                                        <td colSpan={(user?.role === 'hod' || user?.role === 'admin') && viewMode === 'all' ? 5 : 5} className="p-12 text-center text-slate-400">
                                                            No projects found for this filter.
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {/* PENDING REVIEWS TAB (HOD) */}
                            {activeTab === 'pending_reviews' && (
                                <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                                    {projects.filter(p => p.status === 'pending').length === 0 ? (
                                        <div className="text-center p-12 bg-white rounded-[2rem] border border-slate-100 text-slate-400">
                                            No pending projects to review.
                                        </div>
                                    ) : (
                                        projects.filter(p => p.status === 'pending').map((project) => (
                                            <div key={project.id} className="bg-white p-6 rounded-3xl border border-amber-100 shadow-sm flex flex-col md:flex-row gap-6 items-center justify-between">
                                                <div>
                                                    <h3 className="font-bold text-slate-900 text-lg mb-1">{project.title}</h3>
                                                    <div className="flex gap-4 text-xs text-slate-500">
                                                        <span>{project.category}</span>
                                                        <span>•</span>
                                                        <span>{project.academic_year}</span>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => {
                                                            const url = getSmartDownloadUrl(project.pdf_url);
                                                            window.open(url, '_blank');
                                                        }}
                                                        className="px-4 py-2 border border-slate-200 rounded-xl font-bold text-sm text-slate-600 hover:bg-slate-50"
                                                    >
                                                        View PDF
                                                    </button>
                                                    <button
                                                        onClick={() => openReviewModal(project, 'rejected')}
                                                        className="px-4 py-2 bg-rose-50 text-rose-600 rounded-xl font-bold text-sm hover:bg-rose-100 border border-rose-100"
                                                    >
                                                        Reject
                                                    </button>
                                                    <button
                                                        onClick={() => openReviewModal(project, 'approved')}
                                                        className="px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold text-sm hover:bg-emerald-700 shadow-lg shadow-emerald-200"
                                                    >
                                                        Approve
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}


                            {/* UNASSIGNED TAB */}
                            {activeTab === 'unassigned' && (
                                <div className="bg-white rounded-[2rem] border border-amber-100 shadow-xl shadow-amber-500/5 overflow-hidden p-8 text-center animate-in fade-in slide-in-from-right-4 duration-300">
                                    <AlertCircle size={48} className="mx-auto text-amber-400 mb-4" />
                                    <h3 className="text-xl font-bold text-slate-900 mb-2">Unassigned Groups</h3>
                                    {unassignedProjects.length > 0 ? (
                                        <div className="text-left mt-6 space-y-4">
                                            {unassignedProjects.map(p => (
                                                <div key={p.id} className="p-4 border border-slate-100 rounded-xl flex flex-col sm:flex-row justify-between items-center gap-4">
                                                    <div>
                                                        <p className="font-bold text-slate-800">{p.title}</p>
                                                        <p className="text-xs text-slate-500">{p.category} • {p.academic_year}</p>
                                                    </div>

                                                    <div className="relative">
                                                        <select
                                                            className="appearance-none bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold py-2 pl-4 pr-10 rounded-lg hover:bg-indigo-100 focus:outline-none cursor-pointer min-w-[150px]"
                                                            onChange={(e) => handleAssignGuide(p.id, e.target.value)}
                                                            value=""
                                                        >
                                                            <option value="" disabled>Assign Guide...</option>
                                                            {teachers.map(t => (
                                                                <option key={t.id} value={t.id}>{t.full_name}</option>
                                                            ))}
                                                        </select>
                                                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-indigo-400">
                                                            <ChevronRight size={14} className="rotate-90" />
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-slate-500">All groups have been assigned guides.</p>
                                    )}
                                </div>
                            )}

                            {/* REVIEWS TAB (Teachers Only) */}
                            {activeTab === 'reviews' && (
                                <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                                    {pendingReviews.map((project) => (
                                        <div key={project.id} className="bg-white p-6 rounded-3xl border border-rose-100 shadow-sm flex flex-col md:flex-row gap-6 items-center justify-between">
                                            <div>
                                                <h3 className="font-bold text-slate-900 text-lg mb-1">{project.title}</h3>
                                                <p className="text-sm text-slate-500">Submitted for approval.</p>
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => {
                                                        const url = getSmartDownloadUrl(project.pdf_url);
                                                        window.open(url, '_blank');
                                                    }}
                                                    className="px-4 py-2 border border-slate-200 rounded-xl font-bold text-sm text-slate-600 hover:bg-slate-50"
                                                >
                                                    View PDF
                                                </button>
                                                <button
                                                    onClick={() => openReviewModal(project, 'approved')}
                                                    className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 shadow-lg shadow-indigo-200"
                                                >
                                                    Approve
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                        </div>
                    </>
                )}
            </div>

            {/* Review Modal */}
            <AnimatePresence>
                {reviewModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white w-full max-w-lg rounded-3xl shadow-2xl p-6"
                        >
                            <h3 className="text-xl font-bold text-slate-900 mb-2">
                                {reviewAction === 'approved' ? 'Approve Project' : 'Reject With Remarks'}
                            </h3>
                            <p className="text-sm text-slate-500 mb-4">
                                {reviewAction === 'approved'
                                    ? "Are you sure you want to approve this project? It will be visible to everyone."
                                    : "Please provide feedback for the student to improve."}
                            </p>

                            {reviewAction === 'rejected' && (
                                <textarea
                                    value={feedback}
                                    onChange={(e) => setFeedback(e.target.value)}
                                    placeholder="Enter your feedback here..."
                                    className="w-full h-32 p-4 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-indigo-500 mb-6 text-sm resize-none"
                                    autoFocus
                                ></textarea>
                            )}

                            <div className="flex justify-end gap-3">
                                <button
                                    onClick={() => setReviewModalOpen(false)}
                                    className="px-5 py-2.5 text-slate-500 font-bold hover:bg-slate-100 rounded-xl transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={submitReview}
                                    className={`px-6 py-2.5 text-white font-bold rounded-xl transition-colors shadow-lg
                                        ${reviewAction === 'approved' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-500 hover:bg-rose-600'}
                                    `}
                                >
                                    {reviewAction === 'approved' ? 'Unknown' : 'Send Remarks'}
                                    {reviewAction === 'approved' ? 'Confirm Approval' : 'Send Remarks'}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

        </div>
    );
}



export default function TeacherPage() {
    return (
        <Suspense fallback={<div className="min-h-screen grid place-items-center"><div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div></div>}>
            <TeacherDashboardContent />
        </Suspense>
    );
}
