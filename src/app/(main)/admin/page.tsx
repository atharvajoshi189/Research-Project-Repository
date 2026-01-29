"use client";

import { useEffect, useState, Suspense } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Sidebar from '@/components/admin/Sidebar';
import StatsCards from '@/components/admin/StatsCards';
import { Search, Filter, Download, Trash2, Check, MoreHorizontal, Bell, User as UserIcon, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';
import { useSearchParams } from 'next/navigation';
import { getSmartDownloadUrl } from '@/lib/utils';

function AdminContent() {
    const searchParams = useSearchParams();
    const filterStatus = searchParams.get('filter') || 'all';

    const [projects, setProjects] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    // Stats State
    const [stats, setStats] = useState({
        total: 0,
        pending: 0,
        users: 124, // Mocked for now
        storage: '0 MB',
    });

    useEffect(() => {
        fetchProjects();
        // Simulate fetching storage size (Mocking realistic data)
        setStats(prev => ({ ...prev, storage: '450 MB' }));
    }, [filterStatus]);

    const fetchProjects = async () => {
        setLoading(true);
        // Assuming guide_name exists as per user request
        let query = supabase.from('projects').select('*').order('created_at', { ascending: false });

        if (filterStatus === 'pending') {
            query = query.eq('status', 'pending');
        }

        const { data, error } = await query;

        if (error) {
            toast.error("Failed to fetch projects");
            console.error(error);
        } else {
            console.log("Fetched Projects:", data); // Debugging
            setProjects(data || []);
            const total = data?.length || 0;
            const pending = data?.filter((p: any) => p.status === 'pending').length || 0;
            setStats(prev => ({ ...prev, total, pending }));
        }
        setLoading(false);
    };

    // Filter Logic
    const filteredProjects = projects.filter(p => {
        const query = searchQuery.toLowerCase();
        const titleMatch = p.title?.toLowerCase().includes(query);
        const authorsMatch = Array.isArray(p.authors) && p.authors.some((a: string) => a.toLowerCase().includes(query));
        const authorsStringMatch = typeof p.authors === 'string' && p.authors.toLowerCase().includes(query);
        const guideMatch = p.guide_name?.toLowerCase().includes(query);

        return titleMatch || authorsMatch || authorsStringMatch || guideMatch;
    });

    // Bulk Actions
    const toggleSelectAll = () => {
        if (selectedIds.length === filteredProjects.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(filteredProjects.map(p => p.id));
        }
    };

    const toggleSelect = (id: string) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    const handleBulkAction = async (action: 'approve' | 'delete') => {
        if (!confirm(`Are you sure you want to ${action} ${selectedIds.length} projects?`)) return;

        if (action === 'approve') {
            const { error } = await supabase.from('projects').update({ status: 'approved' }).in('id', selectedIds);
            if (error) toast.error("Failed to approve");
            else toast.success("Projects approved!");
        } else {
            const { error } = await supabase.from('projects').delete().in('id', selectedIds);
            if (error) toast.error("Failed to delete");
            else toast.success("Projects deleted!");
        }

        setSelectedIds([]);
        fetchProjects();
    };

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
            fetchProjects();
        }
        setRejectId(null);
        setFeedback('');
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
            fetchProjects();
        }
    };

    // CSV Export
    const downloadCSV = () => {
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
        <div className="flex bg-[#F8FAFC] min-h-screen font-sans text-slate-900 relative">
            <Sidebar />

            <main className="ml-0 lg:ml-64 flex-1 p-8 lg:p-12 transition-all">

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

                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                            {filterStatus === 'pending' ? 'Pending Queue' : 'Dashboard Overview'}
                        </h1>
                        <p className="text-slate-500 mt-1">Manage departmental projects and submissions.</p>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="hidden md:flex items-center gap-3 px-4 py-2 bg-white/80 backdrop-blur-md rounded-full border border-white shadow-sm shadow-slate-200/50">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-teal-500 to-emerald-500 flex items-center justify-center text-white text-xs font-bold">
                                AD
                            </div>
                            <span className="text-sm font-semibold text-slate-700 pr-2">Admin User</span>
                        </div>
                        <button className="p-3 bg-white rounded-full text-slate-400 hover:text-teal-600 shadow-sm border border-slate-100 transition-all relative">
                            <Bell size={20} />
                            <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
                        </button>
                    </div>
                </div>

                <StatsCards
                    totalProjects={stats.total}
                    pendingProjects={stats.pending}
                    totalUsers={stats.users}
                    storageUsed={stats.storage}
                />

                {/* Toolbar */}
                <div className="bg-white p-5 rounded-t-3xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center z-10 relative">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search by Student Name, Title or Roll No..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-11 pr-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-teal-100 focus:bg-white transition-all text-sm font-medium text-slate-700 placeholder:text-slate-400"
                        />
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto">
                        {selectedIds.length > 0 ? (
                            <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right duration-200 bg-teal-50 px-4 py-2 rounded-xl">
                                <span className="text-xs font-bold text-teal-700 whitespace-nowrap">{selectedIds.length} Selected</span>
                                <div className="h-4 w-px bg-teal-200 mx-1"></div>
                                <button onClick={() => handleBulkAction('approve')} className="text-xs font-bold text-emerald-600 hover:text-emerald-700 hover:underline px-2">Approve</button>
                                <button onClick={() => handleBulkAction('delete')} className="text-xs font-bold text-red-600 hover:text-red-700 hover:underline px-2">Delete</button>
                            </div>
                        ) : (
                            <button onClick={downloadCSV} className="ml-auto flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 hover:border-teal-200 hover:text-teal-600 hover:shadow-lg hover:shadow-teal-50/50 font-semibold text-sm transition-all">
                                <Download size={18} />
                                <span className="hidden sm:inline">Export CSV</span>
                            </button>
                        )}
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white border-x border-b border-slate-100 rounded-b-3xl overflow-hidden shadow-sm shadow-slate-200/40">
                    <table className="w-full text-left">
                        <thead className="bg-[#fcfcfd] border-b border-slate-100">
                            <tr>
                                <th className="p-6 w-14">
                                    <input
                                        type="checkbox"
                                        onChange={toggleSelectAll}
                                        checked={filteredProjects.length > 0 && selectedIds.length === filteredProjects.length}
                                        className="w-4 h-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500 focus:ring-offset-0 cursor-pointer"
                                    />
                                </th>
                                <th className="py-5 px-6 text-xs font-extrabold text-slate-400 uppercase tracking-widest">Project Details</th>
                                <th className="py-5 px-6 text-xs font-extrabold text-slate-400 uppercase tracking-widest">Team & Guide</th>
                                <th className="py-5 px-6 text-xs font-extrabold text-slate-400 uppercase tracking-widest">Category</th>
                                <th className="py-5 px-6 text-xs font-extrabold text-slate-400 uppercase tracking-widest">Status</th>
                                <th className="py-5 px-6 text-xs font-extrabold text-slate-400 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                <tr><td colSpan={6} className="p-12 text-center text-slate-400 font-medium">Loading projects...</td></tr>
                            ) : filteredProjects.length === 0 ? (
                                <tr><td colSpan={6} className="p-12 text-center text-slate-400 font-medium">No projects found matching your search.</td></tr>
                            ) : (
                                filteredProjects.map((project) => (
                                    <tr key={project.id} className="hover:bg-teal-50/30 transition-colors group cursor-default">
                                        <td className="p-6">
                                            <input
                                                type="checkbox"
                                                checked={selectedIds.includes(project.id)}
                                                onChange={() => toggleSelect(project.id)}
                                                className="w-4 h-4 rounded border-slate-200 text-teal-600 focus:ring-teal-500 focus:ring-offset-0 cursor-pointer"
                                            />
                                        </td>
                                        <td className="p-6">
                                            <div className="font-bold text-slate-800 text-base mb-1">{project.title}</div>
                                            <div className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-500">
                                                {project.academic_year}
                                            </div>
                                        </td>
                                        <td className="p-6">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex -space-x-2 overflow-hidden">
                                                        {(Array.isArray(project.authors) ? project.authors : project.authors ? [project.authors] : []).map((author: string, i: number) => (
                                                            <div key={i} title={author} className="h-8 w-8 rounded-full ring-2 ring-white bg-gradient-to-br from-teal-100 to-emerald-100 flex items-center justify-center text-[10px] font-bold text-teal-800 shadow-sm">
                                                                {author.charAt(0)}
                                                            </div>
                                                        ))}
                                                    </div>
                                                    <div className="text-xs font-bold text-slate-700 truncate max-w-[120px]">
                                                        {/* Show first author name provided it exists */}
                                                        {Array.isArray(project.authors) && project.authors.length > 0 ? project.authors[0] : (typeof project.authors === 'string' ? project.authors : 'Unknown')}
                                                        {Array.isArray(project.authors) && project.authors.length > 1 && <span className="text-slate-400 font-medium"> +{project.authors.length - 1}</span>}
                                                    </div>
                                                </div>
                                                {project.guide_name && (
                                                    <span className="text-[10px] font-semibold text-slate-400">Guide: {project.guide_name}</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="p-6">
                                            <span className="px-3 py-1.5 bg-white border border-slate-100 rounded-lg text-xs font-semibold text-slate-600 shadow-sm">
                                                {project.category}
                                            </span>
                                        </td>
                                        <td className="p-6">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${project.status === 'approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                                project.status === 'rejected' ? 'bg-red-50 text-red-700 border-red-100' :
                                                    'bg-amber-50 text-amber-700 border-amber-100'
                                                }`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${project.status === 'approved' ? 'bg-emerald-500' :
                                                    project.status === 'rejected' ? 'bg-red-500' :
                                                        'bg-amber-500'
                                                    }`}></span>
                                                {project.status || 'pending'}
                                            </span>
                                        </td>
                                        <td className="p-6 text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                                                <button
                                                    onClick={() => handleDownloadReport(project.pdf_url)}
                                                    title="Download Report"
                                                    className="p-2 hover:bg-teal-50 text-slate-400 hover:text-teal-600 rounded-lg transition-colors"
                                                >
                                                    <Download size={18} strokeWidth={2.5} />
                                                </button>
                                                <button onClick={() => handleSingleAction(project.id, 'approve')} title="Approve" className="p-2 hover:bg-emerald-50 text-slate-400 hover:text-emerald-600 rounded-lg transition-colors">
                                                    <Check size={18} strokeWidth={2.5} />
                                                </button>
                                                <button onClick={() => handleSingleAction(project.id, 'reject')} title="Reject" className="p-2 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-lg transition-colors">
                                                    <Trash2 size={18} strokeWidth={2.5} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </main>
        </div>
    );
}

export default function AdminPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-[#F8FAFC] animate-pulse" />}>
            <AdminContent />
        </Suspense>
    );
}
