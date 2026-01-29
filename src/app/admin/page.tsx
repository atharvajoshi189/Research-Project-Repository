"use client";

import Link from 'next/link';
import { useEffect, useState, Suspense } from 'react';
import { supabase } from '@/lib/supabaseClient';
import StatsCards from '@/components/admin/StatsCards';
import { Search, Filter, Download, Trash2, Check, MoreHorizontal, Bell, User as UserIcon, LogOut, ChevronDown, LayoutGrid, FileText, Users, ShieldAlert, BadgeCheck, Ban } from 'lucide-react';
import toast from 'react-hot-toast';
import { useSearchParams, useRouter } from 'next/navigation';
import { getSmartDownloadUrl } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

import { useRealtimeProjects } from '@/hooks/useRealtimeProjects';

function AdminContent() {
    const searchParams = useSearchParams();
    const router = useRouter();

    // Tab State
    const [activeTab, setActiveTab] = useState<'overview' | 'projects' | 'faculty' | 'users'>('overview');

    const [faculty, setFaculty] = useState<any[]>([]);
    const [users, setUsers] = useState<any[]>([]);
    // const [loading, setLoading] = useState(true); // Handled by hook + local state

    // Auth Check
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const checkAccess = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                router.push('/login');
                return;
            }
            const { data: profile } = await supabase.from('profiles').select('role').eq('id', session.user.id).single();
            if (profile?.role !== 'hod' && profile?.role !== 'faculty') {
                toast.error("Access Denied: Admin Area");
                router.push('/dashboard');
                return;
            }
            setUser(session.user);
        };
        checkAccess();
        fetchProfiles(); // Fetch users separately
    }, []);


    // Real-time Hook
    const { projects, loading: projectsLoading, refetch } = useRealtimeProjects(user?.id, 'admin'); // Role 'admin' gets all

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    // Fetch Profiles & Calculate Derived Stats
    const fetchProfiles = async () => {
        try {
            const { data: profilesData, error: profilesError } = await supabase.from('profiles').select('*');
            if (profilesError) throw profilesError;

            const allUsers = profilesData || [];
            setUsers(allUsers);
        } catch (err: any) {
            console.error("Error fetching profiles:", err);
            toast.error("Failed to load user data");
        }
    };

    // Derived Stats
    const totalProjects = projects.length;
    const pendingProjects = projects.filter(p => p.status === 'pending').length;
    const studentsCount = users.filter(u => u.role === 'student').length;
    const teachersCount = users.filter(u => u.role === 'teacher').length;

    // Derived Faculty Stats
    useEffect(() => {
        if (users.length > 0 && projects.length > 0) {
            const teachers = users.filter(u => u.role === 'teacher');
            const facultyStats = teachers.map(teacher => {
                const guideProjects = projects.filter(p => p.guide_id === teacher.id) || [];
                return {
                    ...teacher,
                    total_projects: guideProjects.length,
                    active_projects: guideProjects.filter(p => p.status === 'approved' || p.status === 'guide_approved').length,
                    pending_reviews: guideProjects.filter(p => p.status === 'pending').length
                };
            });
            setFaculty(facultyStats);
        } else if (users.length > 0) {
            // Initial load of just users (0 projects)
            const teachers = users.filter(u => u.role === 'teacher');
            setFaculty(teachers.map(t => ({ ...t, total_projects: 0, active_projects: 0, pending_reviews: 0 })));
        }
    }, [users, projects]);

    const stats = {
        total: totalProjects,
        pending: pendingProjects,
        students: studentsCount,
        teachers: teachersCount
    };

    const loading = projectsLoading && users.length === 0;

    // --- Actions ---

    // 1. Sync Legacy Data
    const handleSyncGuides = async () => {
        const unassigned = projects.filter(p => !p.guide_id && p.guide_name);
        if (unassigned.length === 0) {
            toast("No legacy projects to sync.", { icon: 'ℹ️' });
            return;
        }

        const teachers = users.filter(u => u.role === 'teacher');
        let updatedCount = 0;
        const updates = [];

        for (const p of unassigned) {
            const match = teachers.find(t => t.full_name?.toLowerCase().trim() === p.guide_name?.toLowerCase().trim());
            if (match) {
                // updates.push({ id: p.id, guide_id: match.id }); 
                await supabase.from('projects').update({ guide_id: match.id }).eq('id', p.id);
                updatedCount++;
            }
        }

        if (updatedCount > 0) {
            toast.success(`Synced ${updatedCount} projects to guides!`);
            refetch(); // Refresh list
        } else {
            toast.error("No matching guide names found.", { duration: 4000 });
        }
    };

    // 2. Manual Assign
    const [assignModalOpen, setAssignModalOpen] = useState(false);
    const [assignTargetId, setAssignTargetId] = useState<string | null>(null);
    const [assignGuideId, setAssignGuideId] = useState('');

    const openAssignModal = (projectId: string) => {
        setAssignTargetId(projectId);
        setAssignGuideId('');
        setAssignModalOpen(true);
    };

    const confirmAssign = async () => {
        if (!assignTargetId || !assignGuideId) return;

        const teacher = users.find(u => u.id === assignGuideId);

        const { error } = await supabase
            .from('projects')
            .update({
                guide_id: assignGuideId,
                guide_name: teacher?.full_name // Ensure name is consistent
            })
            .eq('id', assignTargetId);

        if (error) {
            toast.error("Failed to assign guide");
        } else {
            toast.success(`Assigned to ${teacher?.full_name}`);
            setAssignModalOpen(false);
            refetch();
        }
    };

    const handleBulkAction = async (action: 'approve' | 'delete') => {
        if (!confirm(`Are you sure you want to ${action} ${selectedIds.length} projects?`)) return;

        if (action === 'approve') {
            const { error } = await supabase.from('projects').update({ status: 'approved' }).in('id', selectedIds);
            if (error) toast.error("Failed to approve");
            else {
                toast.success("Projects approved!");
                refetch();
            }
        } else {
            const { error } = await supabase.from('projects').delete().in('id', selectedIds);
            if (error) toast.error("Failed to delete");
            else {
                toast.success("Projects deleted!");
                refetch();
            }
        }

        setSelectedIds([]);
        // fetchInitialData(); // Removed, handled by refetch/RT
    };

    const handleSingleAction = async (id: string, action: 'approve' | 'reject') => {
        if (action === 'reject') {
            setRejectId(id);
            return;
        }

        const { error } = await supabase.from('projects').update({ status: 'approved' }).eq('id', id);
        if (error) toast.error("Action failed");
        else {
            toast.success("Project approved");
            refetch();
        }
    };

    const handleUserAction = async (userId: string, action: 'block' | 'verify') => {
        // Since we don't have explicit columns yet, we'll pretend or use metadata if available.
        // For now, let's assume we can update a metadata field or just show a toast for demonstration 
        // until schema is updated.
        // ACTUAL LOGIC: Update user_metadata or profiles table if columns exist.
        // Let's assume we toggle a 'status' column in profiles if it exists, otherwise just toast.

        // TODO: Ensure schema supports 'is_blocked' or similar.
        toast.custom((t) => (
            <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}>
                <div className="flex-1 w-0 p-4">
                    <div className="flex items-start">
                        <div className="flex-shrink-0 pt-0.5">
                            {action === 'block' ? <Ban className="h-10 w-10 text-red-500" /> : <BadgeCheck className="h-10 w-10 text-emerald-500" />}
                        </div>
                        <div className="ml-3 flex-1">
                            <p className="text-sm font-medium text-gray-900">User Action Simulation</p>
                            <p className="mt-1 text-sm text-gray-500">
                                {action === 'block' ? `Blocking User ${userId}...` : `Verifying User ${userId}...`}
                                (Schema update required for persistence)
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        ));
    };

    // --- Reject Logic ---
    const [rejectId, setRejectId] = useState<string | null>(null);
    const [feedback, setFeedback] = useState('');

    const handleReject = async () => {
        if (!rejectId) return;

        const { error } = await supabase
            .from('projects')
            .update({
                status: 'rejected',
                admin_feedback: feedback
            })
            .eq('id', rejectId);

        if (error) {
            toast.error("Action failed");
        } else {
            toast.success("Project rejected with feedback");
            refetch();
        }
        setRejectId(null);
        setFeedback('');
    };

    // --- Filtering ---
    const filteredProjects = projects.filter(p => {
        const query = searchQuery.toLowerCase();
        return p.title?.toLowerCase().includes(query) ||
            p.authors?.some((a: string) => a.toLowerCase().includes(query)) ||
            p.guide_name?.toLowerCase().includes(query);
    });

    const filteredUsers = users.filter(u => {
        const query = searchQuery.toLowerCase();
        return u.full_name?.toLowerCase().includes(query) ||
            u.email?.toLowerCase().includes(query) ||
            u.role?.toLowerCase().includes(query);
    });

    // --- CSV Export ---
    const downloadCSV = () => {
        // ... (Existing implementation) ...
        const headers = ["Title", "Category", "Academic Year", "Guide", "Authors", "Status", "Link"];
        const rows = projects.map(p => [
            `"${p.title.replace(/"/g, '""')}"`,
            p.category,
            p.academic_year,
            p.guide_name || 'N/A',
            `"${Array.isArray(p.authors) ? p.authors.join(', ') : p.authors}"`,
            p.status,
            p.pdf_url || p.github_url
        ]);

        const csvContent = "data:text/csv;charset=utf-8,"
            + headers.join(",") + "\n"
            + rows.map(e => e.join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "projects_report.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleDownloadReport = (url: string) => {
        if (!url) {
            toast.error("No report link available");
            return;
        }
        const downloadUrl = getSmartDownloadUrl(url);
        window.open(downloadUrl, '_blank');
    };

    return (
        <div className="min-h-screen font-sans relative bg-slate-50 dark:bg-slate-900 transition-colors duration-500">
            {/* Background Texture */}
            <div className="fixed inset-0 w-full h-full -z-0 pointer-events-none opacity-40"
                style={{ backgroundImage: 'radial-gradient(#94a3b8 1px, transparent 1px)', backgroundSize: '32px 32px' }}>
            </div>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 transition-all relative z-10 pt-24">

                {/* Header Phase */}
                <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold uppercase tracking-widest mb-3">
                            <ShieldAlert size={14} /> Control Room
                        </div>
                        <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white">
                            HOD Dashboard
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg">
                            Manage your department's digital ecosystem.
                        </p>
                    </div>
                </header>

                {/* Tab Navigation */}
                <div className="flex items-center gap-8 border-b border-slate-200 dark:border-slate-800 mb-8 overflow-x-auto pb-1">
                    <button onClick={() => setActiveTab('overview')} className={`flex items-center gap-2 pb-3 text-sm font-bold transition-all border-b-2 whitespace-nowrap ${activeTab === 'overview' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>
                        <LayoutGrid size={18} /> Overview
                    </button>
                    <button onClick={() => setActiveTab('projects')} className={`flex items-center gap-2 pb-3 text-sm font-bold transition-all border-b-2 whitespace-nowrap ${activeTab === 'projects' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>
                        <FileText size={18} /> Projects Repository
                    </button>
                    <button onClick={() => setActiveTab('faculty')} className={`flex items-center gap-2 pb-3 text-sm font-bold transition-all border-b-2 whitespace-nowrap ${activeTab === 'faculty' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>
                        <Users size={18} /> Faculty Monitor
                    </button>
                    <button onClick={() => setActiveTab('users')} className={`flex items-center gap-2 pb-3 text-sm font-bold transition-all border-b-2 whitespace-nowrap ${activeTab === 'users' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>
                        <ShieldAlert size={18} /> User Management
                    </button>
                </div>

                {/* CONTENT AREA */}
                <div className="min-h-[500px]">

                    {/* 1. OVERVIEW TAB */}
                    {activeTab === 'overview' && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
                            <StatsCards
                                totalProjects={stats.total}
                                pendingProjects={stats.pending}
                                totalStudents={stats.students}
                                totalTeachers={stats.teachers}
                            />

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Quick Pendings */}
                                <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm">
                                    <div className="flex justify-between items-center mb-6">
                                        <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                            <Bell className="text-amber-500" size={20} /> Pending Approvals
                                        </h3>
                                        <button onClick={() => setActiveTab('projects')} className="text-xs font-bold text-indigo-600 hover:underline">View All</button>
                                    </div>
                                    <div className="space-y-4">
                                        {projects.filter(p => p.status === 'pending').slice(0, 3).map(project => (
                                            <div key={project.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-700">
                                                <div>
                                                    <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm line-clamp-1">{project.title}</h4>
                                                    <p className="text-xs text-slate-500">{project.authors?.[0] || 'Unknown Author'}</p>
                                                </div>
                                                <button onClick={() => handleSingleAction(project.id, 'approve')} className="p-2 bg-white dark:bg-slate-700 shadow-sm rounded-lg text-emerald-600 hover:text-emerald-700">
                                                    <Check size={16} />
                                                </button>
                                            </div>
                                        ))}
                                        {projects.filter(p => p.status === 'pending').length === 0 && (
                                            <p className="text-slate-400 text-sm text-center py-4">No pending approvals.</p>
                                        )}
                                    </div>
                                </div>

                                {/* Faculty Overview Tiny */}
                                <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm">
                                    <div className="flex justify-between items-center mb-6">
                                        <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                            <Users className="text-blue-500" size={20} /> Top Guides
                                        </h3>
                                        <button onClick={() => setActiveTab('faculty')} className="text-xs font-bold text-indigo-600 hover:underline">View All</button>
                                    </div>
                                    <div className="space-y-4">
                                        {faculty.sort((a, b) => b.total_projects - a.total_projects).slice(0, 3).map(teacher => (
                                            <div key={teacher.id} className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-xs">
                                                    {(teacher.full_name || 'T')[0]}
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">{teacher.full_name}</h4>
                                                    <div className="w-full bg-slate-100 h-1.5 rounded-full mt-1.5 overflow-hidden">
                                                        <div className="bg-blue-500 h-full rounded-full" style={{ width: `${(teacher.total_projects / (stats.total || 1)) * 100}%` }}></div>
                                                    </div>
                                                </div>
                                                <span className="font-bold text-slate-900 text-sm">{teacher.total_projects}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}


                    {/* 2. PROJECTS REPOSITORY TAB */}
                    {activeTab === 'projects' && (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                            {/* Toolbar */}
                            <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm mb-6 flex flex-wrap gap-4 items-center justify-between">
                                <div className="relative flex-1 min-w-[300px]">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <input
                                        type="text"
                                        placeholder="Search projects..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                                    />
                                </div>
                                <div className="flex items-center gap-3">
                                    <button onClick={downloadCSV} className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl text-sm font-bold hover:bg-slate-200 transition-colors">
                                        <Download size={16} /> Export
                                    </button>
                                    <button onClick={handleSyncGuides} className="flex items-center gap-2 px-4 py-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 rounded-xl text-sm font-bold hover:bg-indigo-100 transition-colors">
                                        <Users size={16} /> Sync Legacy Data
                                    </button>
                                </div>
                            </div>

                            {/* Table */}
                            <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-3xl overflow-hidden shadow-sm">
                                <table className="w-full text-left">
                                    <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-700">
                                        <tr>
                                            <th className="py-4 px-6 text-xs font-extrabold text-slate-400 uppercase tracking-widest">Project</th>
                                            <th className="py-4 px-6 text-xs font-extrabold text-slate-400 uppercase tracking-widest">Guide</th>
                                            <th className="py-4 px-6 text-xs font-extrabold text-slate-400 uppercase tracking-widest">Status</th>
                                            <th className="py-4 px-6 text-xs font-extrabold text-slate-400 uppercase tracking-widest text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50 dark:divide-slate-700/50">
                                        {filteredProjects.map((project) => (
                                            <tr key={project.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                                                <td className="p-6">
                                                    <div className="font-bold text-slate-800 dark:text-slate-200 mb-1">{project.title}</div>
                                                    <div className="text-xs text-slate-400">{project.academic_year} • {project.category}</div>
                                                </td>
                                                <td className="p-6 text-sm text-slate-600 dark:text-slate-400 font-medium">
                                                    {project.guide_name || 'N/A'}
                                                    {!project.guide_id && (
                                                        <button
                                                            onClick={() => openAssignModal(project.id)}
                                                            className="ml-2 text-xs text-indigo-500 font-bold hover:underline"
                                                        >
                                                            + Assign
                                                        </button>
                                                    )}
                                                </td>
                                                <td className="p-6">
                                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${project.status === 'approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                                        project.status === 'rejected' ? 'bg-red-50 text-red-700 border-red-100' :
                                                            'bg-amber-50 text-amber-700 border-amber-100'
                                                        }`}>
                                                        {project.status || 'Pending'}
                                                    </span>
                                                </td>
                                                <td className="p-6 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button onClick={() => handleDownloadReport(project.pdf_url)} className="p-2 hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 rounded-lg transition-colors">
                                                            <Download size={18} />
                                                        </button>
                                                        {project.status !== 'approved' && (
                                                            <button onClick={() => handleSingleAction(project.id, 'approve')} className="p-2 hover:bg-emerald-50 text-slate-400 hover:text-emerald-600 rounded-lg transition-colors">
                                                                <Check size={18} />
                                                            </button>
                                                        )}
                                                        <button onClick={() => handleSingleAction(project.id, 'reject')} className="p-2 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-lg transition-colors">
                                                            <Trash2 size={18} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* 3. FACULTY MONITOR TAB */}
                    {activeTab === 'faculty' && (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {faculty.map((teacher) => (
                                    <div key={teacher.id} className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col items-center text-center hover:shadow-md transition-all">
                                        <div className="w-20 h-20 rounded-full bg-indigo-50 border-4 border-white dark:border-slate-700 shadow-lg flex items-center justify-center text-indigo-600 font-bold text-2xl mb-4">
                                            {(teacher.full_name || 'T')[0]}
                                        </div>
                                        <h3 className="font-bold text-slate-900 dark:text-white text-lg">{teacher.full_name}</h3>
                                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">{teacher.email}</p>

                                        <div className="grid grid-cols-3 w-full gap-2 text-center mb-6">
                                            <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl">
                                                <span className="block text-xl font-bold text-slate-900 dark:text-white">{teacher.total_projects}</span>
                                                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Guide</span>
                                            </div>
                                            <div className="bg-emerald-50 dark:bg-emerald-900/10 p-3 rounded-xl">
                                                <span className="block text-xl font-bold text-emerald-600">{teacher.active_projects}</span>
                                                <span className="block text-[10px] font-bold text-emerald-600/60 uppercase tracking-wider">Active</span>
                                            </div>
                                            <div className="bg-amber-50 dark:bg-amber-900/10 p-3 rounded-xl">
                                                <span className="block text-xl font-bold text-amber-600">{teacher.pending_reviews}</span>
                                                <span className="block text-[10px] font-bold text-amber-600/60 uppercase tracking-wider">Pending</span>
                                            </div>
                                        </div>

                                        <button className="w-full py-2.5 rounded-xl border-2 border-slate-100 dark:border-slate-600 text-slate-600 dark:text-slate-300 font-bold text-sm hover:border-indigo-600 hover:text-indigo-600 transition-colors">
                                            View Details
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}


                    {/* 4. USER MANAGEMENT TAB */}
                    {activeTab === 'users' && (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                            <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm mb-6">
                                <input
                                    type="text"
                                    placeholder="Search users..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-4 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                                />
                            </div>

                            <div className="space-y-4">
                                {filteredUsers.map((u) => (
                                    <div key={u.id} className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 flex items-center justify-between group hover:border-indigo-200 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg 
                                                ${u.role === 'teacher' ? 'bg-purple-50 text-purple-600' : 'bg-teal-50 text-teal-600'}
                                            `}>
                                                {(u.full_name || '?')[0]}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                                    {u.full_name}
                                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border
                                                         ${u.role === 'teacher' ? 'bg-purple-100 text-purple-700 border-purple-200' : 'bg-teal-100 text-teal-700 border-teal-200'}
                                                    `}>{u.role}</span>
                                                </h4>
                                                <p className="text-sm text-slate-500">{u.email}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => handleUserAction(u.id, 'verify')} className="px-4 py-2 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold hover:bg-emerald-50 hover:text-emerald-600 transition-colors">
                                                Verify
                                            </button>
                                            <button onClick={() => handleUserAction(u.id, 'block')} className="px-4 py-2 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold hover:bg-red-50 hover:text-red-600 transition-colors">
                                                Block
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                </div>

                {/* Reject Modal */}
                {rejectId && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                        <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
                            <h3 className="text-xl font-bold text-slate-900 mb-2">Reject Project</h3>
                            <p className="text-sm text-slate-500 mb-4">Please provide feedback for the student so they can improve.</p>

                            <textarea
                                value={feedback}
                                onChange={(e) => setFeedback(e.target.value)}
                                className="w-full h-32 p-4 bg-slate-50 rounded-xl border-none focus:ring-2 focus:ring-red-500 mb-4 text-sm font-medium"
                                placeholder="e.g. Please update the Abstract to include more technical details..."
                                autoFocus
                            ></textarea>

                            <div className="flex gap-3 justify-end">
                                <button
                                    onClick={() => { setRejectId(null); setFeedback(''); }}
                                    className="px-4 py-2 text-slate-500 font-bold hover:bg-slate-50 rounded-lg"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleReject}
                                    disabled={!feedback.trim()}
                                    className="px-6 py-2 bg-red-500 text-white font-bold rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Reject Project
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Assign Modal */}
                {assignModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-200">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Assign Guide</h3>

                            <div className="mb-6">
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Select Faculty</label>
                                <select
                                    value={assignGuideId}
                                    onChange={(e) => setAssignGuideId(e.target.value)}
                                    className="w-full p-3 bg-slate-50 dark:bg-slate-900 border-none rounded-xl text-sm font-bold text-slate-800 dark:text-white"
                                >
                                    <option value="">Choose a Teacher...</option>
                                    {users.filter(u => u.role === 'teacher').map(t => (
                                        <option key={t.id} value={t.id}>{t.full_name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex gap-3 justify-end">
                                <button
                                    onClick={() => setAssignModalOpen(false)}
                                    className="px-4 py-2 text-slate-500 font-bold hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg text-sm"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmAssign}
                                    disabled={!assignGuideId}
                                    className="px-6 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 disabled:opacity-50 text-sm"
                                >
                                    Confirm Assignment
                                </button>
                            </div>
                        </div>
                    </div>
                )}

            </main>
        </div>
    );
}

export default function AdminPage() {
    return (
        <Suspense fallback={<div className="min-h-screen grid place-items-center"><div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div></div>}>
            <AdminContent />
        </Suspense>
    );
}
