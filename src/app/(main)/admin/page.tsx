"use client";

import Link from 'next/link';
import { useEffect, useState, Suspense } from 'react';
import { supabase } from '@/lib/supabaseClient';
import StatsCards from '@/components/admin/StatsCards';
import {
    Search, Filter, Download, Trash2, Check, MoreHorizontal,
    Bell, User as UserIcon, LogOut, ChevronDown, LayoutGrid,
    FileText, Users, ShieldAlert, BadgeCheck, Ban,
    FileSpreadsheet, FileJson, FileType2
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useSearchParams, useRouter } from 'next/navigation';
import { getSmartDownloadUrl } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import NeuralLoading from '@/components/NeuralLoading';
import BackgroundBlobs from '@/components/BackgroundBlobs';
import GridPulse from '@/components/GridPulse';
import BentoGrid from '@/components/BentoGrid';

import { useRealtimeProjects } from '@/hooks/useRealtimeProjects';

// Export Libraries
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

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
            if (profile?.role !== 'hod' && profile?.role !== 'faculty' && profile?.role !== 'teacher' && profile?.role !== 'admin') {
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

        for (const p of unassigned) {
            const match = teachers.find(t => t.full_name?.toLowerCase().trim() === p.guide_name?.toLowerCase().trim());
            if (match) {
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

    // --- DATA EXPORT ---
    const [exportOpen, setExportOpen] = useState(false);

    const getExportData = () => {
        return filteredProjects.map(p => ({
            Title: p.title || 'Untitled',
            Category: p.category || 'Uncategorized',
            Academic_Year: p.academic_year || 'N/A',
            Guide_Name: p.guide_name || 'Unassigned',
            Authors: Array.isArray(p.authors) ? p.authors.join(', ') : (p.authors || ''),
            Status: p.status || 'Pending',
            Link: p.pdf_url || p.github_url || 'N/A'
        }));
    };

    const downloadCSV = () => {
        const data = getExportData();
        if (data.length === 0) return toast.error("No data to export");

        const headers = Object.keys(data[0]);
        const rows = data.map(obj => headers.map(header => {
            const val = obj[header as keyof typeof obj];
            return `"${String(val).replace(/"/g, '""')}"`;
        }));

        const csvContent = "data:text/csv;charset=utf-8,"
            + headers.join(",") + "\n"
            + rows.map(e => e.join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `department_report_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setExportOpen(false);
        toast.success("CSV Downloaded");
    };

    const downloadExcel = () => {
        const data = getExportData();
        if (data.length === 0) return toast.error("No data to export");

        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Projects");
        XLSX.writeFile(workbook, `department_report_${new Date().toISOString().split('T')[0]}.xlsx`);
        setExportOpen(false);
        toast.success("Excel Downloaded");
    };

    const downloadPDF = () => {
        if (filteredProjects.length === 0) return toast.error("No data to export");

        const doc = new jsPDF();

        // Header
        doc.setFillColor(79, 70, 229); // Indigo 600
        doc.rect(0, 0, 210, 20, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(14);
        doc.text("Departmental Projects Report", 14, 13);

        doc.setTextColor(50, 50, 50);
        doc.setFontSize(10);
        doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);
        doc.text(`Total Projects: ${filteredProjects.length}`, 14, 35);

        const tableData = filteredProjects.map(p => [
            p.title || 'Untitled',
            p.category || '-',
            p.guide_name || 'Unassigned',
            p.status || 'Pending'
        ]);

        autoTable(doc, {
            head: [['Title', 'Category', 'Guide', 'Status']],
            body: tableData,
            startY: 40,
            styles: { fontSize: 9, cellPadding: 3 },
            headStyles: { fillColor: [79, 70, 229], textColor: 255, fontStyle: 'bold' },
            alternateRowStyles: { fillColor: [249, 250, 251] }
        });

        doc.save(`department_report_${new Date().toISOString().split('T')[0]}.pdf`);
        setExportOpen(false);
        toast.success("PDF Downloaded");
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
        <div className="min-h-screen font-sans relative bg-[#F8FAFC] dark:bg-slate-950 overflow-hidden">
            {/* Background Effects */}
            <BackgroundBlobs />
            <div className="fixed inset-0 z-0 pointer-events-none">
                <GridPulse />
                <BentoGrid />
            </div>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 transition-all relative z-10 pt-24">

                {/* Header Phase */}
                <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 text-xs font-bold uppercase tracking-widest mb-3 border border-indigo-200 dark:border-indigo-800">
                            <ShieldAlert size={14} /> Control Room
                        </div>
                        <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white drop-shadow-sm">
                            HOD Dashboard
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg font-medium">
                            Manage your department's digital ecosystem.
                        </p>
                    </div>
                </header>

                {/* Tab Navigation */}
                <div className="flex items-center gap-8 border-b border-slate-200 dark:border-slate-800 mb-8 overflow-x-auto pb-1 no-scrollbar">
                    {['overview', 'projects', 'faculty', 'users'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab as any)}
                            className={`flex items-center gap-2 pb-3 text-sm font-bold transition-all border-b-2 whitespace-nowrap capitalize
                            ${activeTab === tab
                                    ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                                    : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
                        >
                            {tab === 'overview' && <LayoutGrid size={18} />}
                            {tab === 'projects' && <FileText size={18} />}
                            {tab === 'faculty' && <Users size={18} />}
                            {tab === 'users' && <ShieldAlert size={18} />}
                            {tab}
                        </button>
                    ))}
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
                                <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl p-6 rounded-3xl border border-white/20 dark:border-slate-800 shadow-lg">
                                    <div className="flex justify-between items-center mb-6">
                                        <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                            <Bell className="text-amber-500" size={20} /> Pending Approvals
                                        </h3>
                                        <button onClick={() => setActiveTab('projects')} className="text-xs font-bold text-indigo-600 hover:underline">View All</button>
                                    </div>
                                    <div className="space-y-4">
                                        {projects.filter(p => p.status === 'pending').slice(0, 3).map(project => (
                                            <div key={project.id} className="flex items-center justify-between p-4 bg-slate-50/50 dark:bg-slate-950/50 rounded-xl border border-slate-100 dark:border-slate-800 backdrop-blur-sm">
                                                <div>
                                                    <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm line-clamp-1">{project.title}</h4>
                                                    <p className="text-xs text-slate-500">{project.authors?.[0] || 'Unknown Author'}</p>
                                                </div>
                                                <button onClick={() => handleSingleAction(project.id, 'approve')} className="p-2 bg-white dark:bg-slate-800 shadow-sm rounded-lg text-emerald-600 hover:text-emerald-500 border border-slate-100 dark:border-slate-700">
                                                    <Check size={16} />
                                                </button>
                                            </div>
                                        ))}
                                        {projects.filter(p => p.status === 'pending').length === 0 && (
                                            <div className="flex flex-col items-center justify-center py-8 text-center">
                                                <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/20 rounded-full flex items-center justify-center mb-3">
                                                    <BadgeCheck size={24} className="text-emerald-500" />
                                                </div>
                                                <p className="text-slate-900 dark:text-white font-bold text-sm">All caught up!</p>
                                                <p className="text-slate-500 text-xs">No pending project approvals.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Faculty Overview Tiny */}
                                <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl p-6 rounded-3xl border border-white/20 dark:border-slate-800 shadow-lg">
                                    <div className="flex justify-between items-center mb-6">
                                        <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                            <Users className="text-blue-500" size={20} /> Top Guides
                                        </h3>
                                        <button onClick={() => setActiveTab('faculty')} className="text-xs font-bold text-indigo-600 hover:underline">View All</button>
                                    </div>
                                    <div className="space-y-4">
                                        {faculty.sort((a, b) => b.total_projects - a.total_projects).slice(0, 3).map(teacher => (
                                            <div key={teacher.id} className="flex items-center gap-3 p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl transition-colors">
                                                <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-700 dark:text-indigo-400 font-bold text-xs ring-2 ring-white dark:ring-slate-800">
                                                    {(teacher.full_name || 'T')[0]}
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">{teacher.full_name}</h4>
                                                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-1.5 overflow-hidden">
                                                        <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${(teacher.total_projects / (stats.total || 1)) * 100}%` }}></div>
                                                    </div>
                                                </div>
                                                <span className="font-black text-slate-900 dark:text-white text-sm bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg">{teacher.total_projects}</span>
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
                            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-4 rounded-2xl border border-white/20 dark:border-slate-800 shadow-lg mb-6 flex flex-wrap gap-4 items-center justify-between sticky top-24 z-20">
                                <div className="relative flex-1 min-w-[300px]">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <input
                                        type="text"
                                        placeholder="Search projects by title, author, or guide..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-medium text-slate-900 dark:text-white placeholder:text-slate-400"
                                    />
                                </div>
                                <div className="flex items-center gap-3 relative">

                                    {/* EXPORT DROPDOWN */}
                                    <div className="relative">
                                        <button
                                            onClick={() => setExportOpen(!exportOpen)}
                                            className="flex items-center gap-2 px-4 py-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 rounded-xl text-sm font-bold hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors border border-emerald-100 dark:border-emerald-900/30"
                                        >
                                            <Download size={16} /> Export Data <ChevronDown size={14} className={`transition-transform ${exportOpen ? 'rotate-180' : ''}`} />
                                        </button>

                                        <AnimatePresence>
                                            {exportOpen && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: 10 }}
                                                    className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-600 z-50 overflow-hidden"
                                                >
                                                    <button onClick={downloadCSV} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-left">
                                                        <FileText size={16} className="text-blue-500" /> Export CSV
                                                    </button>
                                                    <button onClick={downloadExcel} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-left">
                                                        <FileSpreadsheet size={16} className="text-emerald-500" /> Export Excel
                                                    </button>
                                                    <button onClick={downloadPDF} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-left border-t border-slate-100 dark:border-slate-700">
                                                        <FileType2 size={16} className="text-red-500" /> Export PDF
                                                    </button>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>

                                    <button onClick={handleSyncGuides} className="flex items-center gap-2 px-4 py-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400 rounded-xl text-sm font-bold hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-colors border border-indigo-100 dark:border-indigo-800">
                                        <Users size={16} /> Sync Legacy
                                    </button>
                                </div>
                            </div>

                            {/* Table */}
                            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/20 dark:border-slate-800 rounded-3xl overflow-hidden shadow-lg">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead className="bg-slate-50/80 dark:bg-slate-950/80 border-b border-slate-100 dark:border-slate-800">
                                            <tr>
                                                <th className="py-5 px-6 text-xs font-extrabold text-slate-400 uppercase tracking-widest">Project Details</th>
                                                <th className="py-5 px-6 text-xs font-extrabold text-slate-400 uppercase tracking-widest">Guide</th>
                                                <th className="py-5 px-6 text-xs font-extrabold text-slate-400 uppercase tracking-widest">Status</th>
                                                <th className="py-5 px-6 text-xs font-extrabold text-slate-400 uppercase tracking-widest text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                                            {filteredProjects.map((project) => (
                                                <tr key={project.id} className="group hover:bg-indigo-50/30 dark:hover:bg-indigo-900/10 transition-all duration-200">
                                                    <td className="p-6 max-w-sm">
                                                        <div className="font-bold text-slate-800 dark:text-slate-200 text-sm mb-1 line-clamp-2">{project.title}</div>
                                                        <div className="flex flex-wrap gap-2 mt-2">
                                                            <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 text-[10px] font-bold uppercase tracking-wider rounded border border-slate-200 dark:border-slate-700">{project.academic_year}</span>
                                                            <span className="px-2 py-0.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-[10px] font-bold uppercase tracking-wider rounded border border-blue-100 dark:border-blue-800">{project.category}</span>
                                                        </div>
                                                    </td>
                                                    <td className="p-6 text-sm text-slate-600 dark:text-slate-400 font-medium">
                                                        {project.guide_name ? (
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[10px] font-bold">
                                                                    {project.guide_name[0]}
                                                                </div>
                                                                {project.guide_name}
                                                            </div>
                                                        ) : (
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-slate-400 italic">Unassigned</span>
                                                                <button
                                                                    onClick={() => openAssignModal(project.id)}
                                                                    className="px-2 py-1 text-[10px] bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-bold rounded hover:bg-indigo-100 transition-colors"
                                                                >
                                                                    + Assign
                                                                </button>
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="p-6">
                                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wide border shadow-sm ${project.status === 'approved' ? 'bg-emerald-100/50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800' :
                                                                project.status === 'rejected' ? 'bg-red-100/50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800' :
                                                                    'bg-amber-100/50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800'
                                                            }`}>
                                                            {project.status === 'approved' && <Check size={12} strokeWidth={4} />}
                                                            {project.status === 'rejected' && <Ban size={12} strokeWidth={4} />}
                                                            {(!project.status || project.status === 'pending') && <MoreHorizontal size={12} strokeWidth={4} />}
                                                            {project.status || 'Pending'}
                                                        </span>
                                                    </td>
                                                    <td className="p-6 text-right">
                                                        <div className="flex items-center justify-end gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
                                                            {(project.pdf_url || project.github_url) && (
                                                                <button onClick={() => handleDownloadReport(project.pdf_url || project.github_url)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg transition-colors" title="Download Resource">
                                                                    <Download size={18} />
                                                                </button>
                                                            )}
                                                            {project.status !== 'approved' && (
                                                                <button onClick={() => handleSingleAction(project.id, 'approve')} className="p-2 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-500 rounded-lg transition-colors" title="Approve">
                                                                    <Check size={18} />
                                                                </button>
                                                            )}
                                                            <button onClick={() => handleSingleAction(project.id, 'reject')} className="p-2 hover:bg-red-50 dark:hover:bg-red-900/30 text-slate-400 hover:text-red-600 dark:hover:text-red-500 rounded-lg transition-colors" title="Reject">
                                                                <Trash2 size={18} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                {filteredProjects.length === 0 && (
                                    <div className="p-12 text-center text-slate-400">
                                        <p>No projects found matching your search.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* 3. FACULTY MONITOR TAB */}
                    {activeTab === 'faculty' && (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {faculty.map((teacher) => (
                                    <div key={teacher.id} className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl p-6 rounded-3xl border border-white/20 dark:border-slate-800 shadow-lg flex flex-col items-center text-center hover:shadow-xl hover:scale-[1.02] transition-all duration-300 group">
                                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/30 dark:to-purple-900/30 border-4 border-white dark:border-slate-800 shadow-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-black text-3xl mb-4 group-hover:rotate-6 transition-transform">
                                            {(teacher.full_name || 'T')[0]}
                                        </div>
                                        <h3 className="font-bold text-slate-900 dark:text-white text-lg">{teacher.full_name}</h3>
                                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">{teacher.email}</p>

                                        <div className="grid grid-cols-3 w-full gap-2 text-center mb-6">
                                            <div className="bg-slate-50 dark:bg-slate-950/50 p-3 rounded-2xl border border-slate-100 dark:border-slate-800">
                                                <span className="block text-xl font-black text-slate-900 dark:text-white">{teacher.total_projects}</span>
                                                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total</span>
                                            </div>
                                            <div className="bg-emerald-50 dark:bg-emerald-900/10 p-3 rounded-2xl border border-emerald-100 dark:border-emerald-900/20">
                                                <span className="block text-xl font-black text-emerald-600 dark:text-emerald-400">{teacher.active_projects}</span>
                                                <span className="block text-[10px] font-bold text-emerald-600/60 dark:text-emerald-400/60 uppercase tracking-wider">Active</span>
                                            </div>
                                            <div className="bg-amber-50 dark:bg-amber-900/10 p-3 rounded-2xl border border-amber-100 dark:border-amber-900/20">
                                                <span className="block text-xl font-black text-amber-600 dark:text-amber-400">{teacher.pending_reviews}</span>
                                                <span className="block text-[10px] font-bold text-amber-600/60 dark:text-amber-400/60 uppercase tracking-wider">Pending</span>
                                            </div>
                                        </div>

                                        <button className="w-full py-2.5 rounded-xl border-2 border-slate-100 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold text-sm hover:border-indigo-600 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                                            View Detailed Profile
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}


                    {/* 4. USER MANAGEMENT TAB */}
                    {activeTab === 'users' && (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-4 rounded-2xl border border-white/20 dark:border-slate-800 shadow-sm mb-6 max-w-lg">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <input
                                        type="text"
                                        placeholder="Search users..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 bg-transparent border-none focus:ring-0 text-sm font-medium text-slate-900 dark:text-white"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {filteredUsers.map((u) => (
                                    <div key={u.id} className="bg-white/70 dark:bg-slate-900/70 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center justify-between group hover:border-indigo-200 dark:hover:border-indigo-900 transition-colors shadow-sm">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg shadow-inner
                                                ${u.role === 'teacher' ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/40 dark:text-purple-300' : 'bg-teal-100 text-teal-600 dark:bg-teal-900/40 dark:text-teal-300'}
                                            `}>
                                                {(u.full_name || '?')[0]}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                                    {u.full_name}
                                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border
                                                         ${u.role === 'teacher' ? 'bg-purple-50 text-purple-700 border-purple-100 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-800' : 'bg-teal-50 text-teal-700 border-teal-100 dark:bg-teal-900/20 dark:text-teal-300 dark:border-teal-800'}
                                                    `}>{u.role}</span>
                                                </h4>
                                                <p className="text-sm text-slate-500 max-w-[200px] truncate">{u.email}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => handleUserAction(u.id, 'verify')} className="p-2 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 text-slate-400 hover:text-emerald-600 rounded-lg transition-colors" title="Verify User">
                                                <BadgeCheck size={18} />
                                            </button>
                                            <button onClick={() => handleUserAction(u.id, 'block')} className="p-2 hover:bg-red-50 dark:hover:bg-red-900/30 text-slate-400 hover:text-red-600 rounded-lg transition-colors" title="Block User">
                                                <Ban size={18} />
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
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
                        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200 border border-slate-200 dark:border-slate-800">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Reject Project</h3>
                            <p className="text-sm text-slate-500 mb-4">Please provide feedback for the student so they can improve.</p>

                            <textarea
                                value={feedback}
                                onChange={(e) => setFeedback(e.target.value)}
                                className="w-full h-32 p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border-none focus:ring-2 focus:ring-red-500 mb-4 text-sm font-medium resize-none dark:text-white"
                                placeholder="e.g. Please update the Abstract to include more technical details..."
                                autoFocus
                            ></textarea>

                            <div className="flex gap-3 justify-end">
                                <button
                                    onClick={() => { setRejectId(null); setFeedback(''); }}
                                    className="px-4 py-2 text-slate-500 font-bold hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleReject}
                                    disabled={!feedback.trim()}
                                    className="px-6 py-2 bg-red-500 text-white font-bold rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-red-500/30 transition-all"
                                >
                                    Reject Project
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Assign Modal */}
                {assignModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
                        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-200 border border-slate-200 dark:border-slate-800">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Assign Guide</h3>

                            <div className="mb-6">
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Select Faculty</label>
                                <select
                                    value={assignGuideId}
                                    onChange={(e) => setAssignGuideId(e.target.value)}
                                    className="w-full p-3 bg-slate-50 dark:bg-slate-950 border-none rounded-xl text-sm font-bold text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500"
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
                                    className="px-4 py-2 text-slate-500 font-bold hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-sm transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmAssign}
                                    disabled={!assignGuideId}
                                    className="px-6 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 disabled:opacity-50 text-sm shadow-lg shadow-indigo-600/30 transition-all"
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
        <Suspense fallback={<NeuralLoading message="Accessing Control Center..." />}>
            <AdminContent />
        </Suspense>
    );
}
