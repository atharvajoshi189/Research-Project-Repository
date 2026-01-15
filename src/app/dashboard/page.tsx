"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { motion } from 'framer-motion';
import { Eye, Download, Share2, Edit, AlertCircle, CheckCircle, Clock, BookOpen, User, Users, BarChart3, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { getSmartDownloadUrl } from '@/lib/utils';

export default function StudentDashboard() {
    const router = useRouter();
    const [projects, setProjects] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);
    const [stats, setStats] = useState({ total: 0, approved: 0, pending: 0, views: 0, downloads: 0 });
    const [projectDistribution, setProjectDistribution] = useState<any[]>([]);
    const [invitations, setInvitations] = useState<any[]>([]);
    const [recommendedProjects, setRecommendedProjects] = useState<any[]>([]);

    useEffect(() => {
        const fetchUserData = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                router.push('/login');
                return;
            }
            setUser(session.user);
            fetchStudentProjects(session.user.id);
        };
        fetchUserData();
    }, []);

    const fetchStudentProjects = async (userId: string) => {
        try {
            setLoading(true);
            console.log("Fetching projects for user:", userId);

            // 1. Fetch EVERYTHING for this user from project_collaborators
            // This is the single source of truth for both invitations and active projects
            const { data, error } = await supabase
                .from('project_collaborators')
                .select('*, projects(*)') // Reverted to wildcard to ensure no column mismatch errors
                .eq('student_id', userId);

            if (error) {
                console.warn("Fetch error (likely schema mismatch or empty), defaulting to empty state:", error);
                setProjects([]);
                setInvitations([]);
                setProjectDistribution([]);
                setStats({ total: 0, approved: 0, pending: 0, views: 0, downloads: 0 });
                return;
            }

            if (!data || data.length === 0) {
                setProjects([]);
                setInvitations([]);
                setProjectDistribution([]);
                setStats({ total: 0, approved: 0, pending: 0, views: 0, downloads: 0 });
                return;
            }

            // 2. Separate Data locally
            const pendingInvites: any[] = [];
            const activeProjs: any[] = [];

            data.forEach((collab: any) => {
                // Ensure project data exists
                if (!collab.projects) return;

                // Flatten the structure for easier usage
                const projectWithRole = {
                    ...collab.projects,
                    userRole: collab.role,
                    collabStatus: collab.status
                };

                if (collab.status === 'pending') {
                    pendingInvites.push(projectWithRole);
                } else if (collab.status === 'accepted' || collab.role === 'leader') {
                    activeProjs.push(projectWithRole);
                }
            });

            setInvitations(pendingInvites);
            setProjects(activeProjs);

            // Trigger Recommendations based on the LATEST active project
            if (activeProjs.length > 0) {
                fetchRecommendations(activeProjs[0], userId);
            }

            // 3. Stats
            const total = activeProjs.length;
            const approved = activeProjs.filter((p: any) => p.status === 'approved').length;
            const pending = activeProjs.filter((p: any) => p.status === 'pending').length;
            const views = activeProjs.reduce((sum: number, p: any) => sum + (p.views || 0), 0);
            const downloads = activeProjs.reduce((sum: number, p: any) => sum + (p.downloads || 0), 0);

            setStats({ total, approved, pending, views, downloads });

            // 4. Tech Distribution
            const techCounts: Record<string, number> = {};
            activeProjs.forEach((p: any) => {
                const stacks = Array.isArray(p.tech_stack) ? p.tech_stack : (p.tech_stack ? p.tech_stack.split(',') : []);
                stacks.forEach((tech: string) => {
                    const t = tech.trim();
                    if (t) techCounts[t] = (techCounts[t] || 0) + 1;
                });
            });

            const distribution = Object.entries(techCounts)
                .map(([name, value]) => ({ name, value }))
                .sort((a, b) => b.value - a.value)
                .slice(0, 5);

            setProjectDistribution(distribution);

        } catch (err) {
            console.error("Unexpected error fetching projects:", err);
            // Fallback to empty state
            setProjects([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchRecommendations = async (lastProject: any, userId: string) => {
        if (!lastProject) return;

        try {
            // Find projects with same category OR overlapping tech stack
            // Supabase doesn't support complex OR across columns easily without RPC or .or()
            // We'll try simple category match first, then tech match if needed, or use .or() 

            // Query: Status=Approved, Not My Project, (Same Category OR Same Tech)
            // Tech stack is tricky as it's a string/array. 
            // We'll stick to Category for "Smart" recommendation simplicity for now, or use a broad .or()

            const { data } = await supabase
                .from('projects')
                .select('*')
                .eq('status', 'approved')
                .neq('student_id', userId) // This is correct (Projects table uses student_id)
                //.not('id', 'in', ...) // TODO: Ideally exclude projects where I'm a collaborator too, but less critical
                .or(`category.eq.${lastProject.category}`) // Simple category match
                .limit(4);

            if (data) setRecommendedProjects(data);

        } catch (err) {
            console.error("Error fetching recommendations:", err);
        }
    }
    const copyLink = (id: string) => {
        navigator.clipboard.writeText(`${window.location.origin}/project/${id}`);
        toast.success("Project link copied to clipboard!");
    };



    const handleViewReport = (url: string) => {
        const downloadUrl = getSmartDownloadUrl(url); // Use smart download logic or just open
        window.open(downloadUrl, '_blank');
    };

    const handleInvitation = async (projectId: string, status: 'accepted' | 'rejected') => {
        try {
            const { error } = await supabase
                .from('project_collaborators')
                .update({ status })
                .eq('project_id', projectId)
                .eq('student_id', user.id); // Fixed: Use student_id to identify collaborator

            if (error) throw error;

            toast.success(status === 'accepted' ? 'Invitation Accepted!' : 'Invitation Declined');

            // Optimistic UI Update (Instant Refresh)
            if (status === 'accepted') {
                // Find the accepted project from invitations
                const acceptedProject = invitations.find((i: any) => i.id === projectId || i.project_id === projectId);

                if (acceptedProject) {
                    const newProjectState = { ...acceptedProject, collabStatus: 'accepted' };
                    // Move from Invitations to Projects
                    setInvitations(prev => prev.filter(i => i.id !== acceptedProject.id));
                    setProjects(prev => [newProjectState, ...prev]);

                    // Update stats locally
                    setStats(prev => ({ ...prev, total: prev.total + 1 }));
                } else {
                    // Fallback if not found locally
                    fetchStudentProjects(user.id);
                }
            } else {
                // Rejected: Just remove from invitations
                setInvitations(prev => prev.filter(i => i.project_id !== projectId));
            }

            // Background refresh to ensure consistency
            fetchStudentProjects(user.id);

        } catch (err: any) {
            console.error('Error updating invitation:', err);
            console.error('Error Details:', err.details);
            console.error('Error Hint:', err.hint);
            console.error('Error Message:', err.message);
            toast.error(`Failed to update: ${err.message || 'Unknown error'}`);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen grid place-items-center bg-slate-50">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-slate-400 font-medium animate-pulse">Loading Workspace...</p>
                </div>
            </div>
        );
    }

    // Real Stats Logic
    const totalViews = stats.views;
    const totalDownloads = stats.downloads;

    // Tech Influence Calculation
    const topTechs = projectDistribution.slice(0, 3).map((tech, index) => ({
        label: tech.name,
        percent: stats.total > 0 ? Math.round((tech.value / stats.total) * 100) + '%' : '0%'
    }));

    return (
        <div className="min-h-screen bg-[#FAFAFA] text-slate-900 font-sans selection:bg-teal-100">


            <div className="fixed inset-0 w-full h-full -z-50 pointer-events-none opacity-40"
                style={{ backgroundImage: 'radial-gradient(#E2E8F0 1px, transparent 1px)', backgroundSize: '24px 24px' }}>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-12">

                {/* Header */}
                <header className="mb-12">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 text-teal-700 text-xs font-bold uppercase tracking-widest mb-4">
                        <BookOpen size={14} /> The Scholar's Hub
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-2">
                        Welcome back, <span className="text-teal-600">{user?.user_metadata?.full_name?.split(' ')[0] || user?.email?.split('@')[0]}</span>!
                    </h1>
                    <p className="text-slate-500 text-lg">Manage your academic legacy.</p>
                </header>

                {/* 0. Invitations Section */}
                {invitations.length > 0 && (
                    <motion.section
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-12"
                    >
                        <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                            Pending Invitations
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {invitations.map((invite: any) => (
                                <div key={invite.id} className="bg-white p-6 rounded-3xl border border-indigo-100 shadow-xl shadow-indigo-100/50 flex items-center justify-between group hover:border-indigo-200 transition-all">
                                    <div>
                                        <span className="text-xs font-bold text-indigo-500 uppercase tracking-wide mb-1 block">Project Invitation</span>
                                        <h3 className="font-bold text-slate-900 text-lg">{invite.projects?.title || 'Untitled Project'}</h3>
                                        <p className="text-slate-500 text-sm">
                                            Invited as <span className="font-semibold text-slate-700 capitalize">{invite.role}</span>
                                            {invite.projects?.authors?.[0] && (
                                                <span className="text-slate-400 font-normal"> by {invite.projects.authors[0]}</span>
                                            )}
                                        </p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleInvitation(invite.project_id || invite.id, 'accepted')}
                                            className="px-4 py-2 bg-slate-900 text-white rounded-lg font-bold text-sm hover:bg-teal-600 transition-colors"
                                        >
                                            Accept
                                        </button>
                                        <button
                                            onClick={() => handleInvitation(invite.project_id || invite.id, 'rejected')}
                                            className="px-4 py-2 bg-slate-100 text-slate-600 rounded-lg font-bold text-sm hover:bg-red-50 hover:text-red-600 transition-colors"
                                        >
                                            Decline
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.section>
                )}

                {/* 1. Project Status Tracker (The "Peace of Mind") */}
                <section className="mb-16">
                    <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                        <ActivityIcon /> Project Status Tracker
                    </h2>

                    {projects.length === 0 ? (
                        <div className="p-8 rounded-3xl border-2 border-dashed border-slate-200 text-center bg-white/50">
                            <p className="text-slate-500 mb-4">You haven't submitted any projects yet.</p>
                            <Link href="/upload" className="px-6 py-2 bg-slate-900 text-white rounded-xl font-bold hover:bg-teal-600 transition-colors">Submit Your First Project</Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {projects.map((project) => (
                                <StatusCard key={project.id} project={project} onShare={() => copyLink(project.id)} />
                            ))}
                        </div>
                    )}
                </section>

                {/* 1.5 Recommended For You */}
                {recommendedProjects.length > 0 && (
                    <section className="mb-16">
                        <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                            <span className="text-2xl">✨</span> Recommended for You
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {recommendedProjects.map((project) => (
                                <Link href={`/project/${project.id}`} key={project.id} className="group">
                                    <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all h-full flex flex-col">
                                        <div className="flex justify-between items-start mb-3">
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-teal-600 bg-teal-50 px-2 py-1 rounded-full">
                                                {project.category}
                                            </span>
                                        </div>
                                        <h3 className="font-bold text-slate-900 mb-2 group-hover:text-teal-600 transition-colors line-clamp-2">{project.title}</h3>
                                        <p className="text-slate-500 text-xs line-clamp-2 mb-4 flex-grow">{project.abstract}</p>
                                        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mt-auto pt-3 border-t border-slate-50">
                                            <span className="w-1.5 h-1.5 rounded-full bg-teal-400"></span>
                                            Recommended
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </section>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

                    {/* Left Column: Analytics & Timeline */}
                    <div className="lg:col-span-2 space-y-12">

                        {/* 2. Portfolio Analytics (The "Pride") */}
                        <section>
                            <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                                <BarChart3 className="text-indigo-500" /> Portfolio Analytics
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <StatCard
                                    label="Total Views"
                                    value={totalViews.toLocaleString()}
                                    icon={Eye}
                                    color="bg-blue-50 text-blue-600 border-blue-100"
                                />
                                <StatCard
                                    label="Downloads"
                                    value={totalDownloads.toLocaleString()}
                                    icon={Download}
                                    color="bg-emerald-50 text-emerald-600 border-emerald-100"
                                />
                            </div>

                            {/* Tech Influence Graph */}
                            <div className="mt-6 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden">
                                <h3 className="font-bold text-slate-700 mb-4 text-sm uppercase tracking-wide">Tech Domain Influence</h3>
                                {topTechs.length > 0 ? (
                                    <div className="space-y-4">
                                        {topTechs.map((tech, i) => (
                                            <TechBar
                                                key={tech.label}
                                                label={tech.label}
                                                percent={tech.percent}
                                                color={i === 0 ? "bg-indigo-500" : i === 1 ? "bg-purple-500" : "bg-teal-500"}
                                            />
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-slate-400 text-sm">Add projects with tech stacks to see analytics.</p>
                                )}
                            </div>
                        </section>

                        {/* 3. Submission Timeline */}
                        <section>
                            <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                                <Clock className="text-amber-500" /> Submission Timeline
                            </h2>
                            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                                <div className="relative border-l-2 border-slate-100 ml-3 space-y-8 pl-8 py-2">
                                    {projects.map((project, i) => (
                                        <div key={i} className="relative">
                                            <div className="absolute -left-[43px] top-1 w-6 h-6 rounded-full bg-white border-4 border-slate-200 flex items-center justify-center">
                                                <div className="w-2 h-2 bg-slate-400 rounded-full"></div>
                                            </div>
                                            <div>
                                                <span className="text-xs font-bold text-slate-400 block mb-1">
                                                    {new Date(project.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                                                </span>
                                                <h4 className="font-bold text-slate-800 text-lg">{project.title}</h4>
                                                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-500 mt-1 inline-block">
                                                    {project.category}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </section>

                    </div>

                    {/* Right Column: Team & Quick Actions */}
                    <div className="space-y-8">

                        {/* 4. "My Team & Guide" Card */}
                        <section>
                            <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                                <User className="text-rose-500" /> My Academic Network
                            </h2>
                            {projects[0] ? (
                                <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50 relative overflow-hidden group hover:-translate-y-1 transition-transform">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-rose-50 rounded-bl-[100px] -z-0 opacity-50 transition-transform group-hover:scale-110"></div>

                                    <div className="relative z-10">
                                        <div className="mb-6">
                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Project Guide</p>
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 font-bold text-lg">
                                                    {(projects[0].guide_name || 'Prof')[0]}
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-slate-900">{projects[0].guide_name || 'Prof. Not Assigned'}</h3>
                                                    <p className="text-xs text-slate-500">Faculty Mentor</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="border-t border-slate-50 pt-6">
                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Team Members</p>
                                            <div className="flex flex-col gap-3">
                                                {(Array.isArray(projects[0].authors) ? projects[0].authors : [projects[0].authors]).map((author: string, i: number) => (
                                                    <div key={i} className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xs border border-white shadow-sm from-slate-50 to-slate-100 bg-gradient-to-br">
                                                            {author[0]}
                                                        </div>
                                                        <span className="text-sm font-semibold text-slate-700">{author}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="p-6 bg-white rounded-2xl border border-slate-100 text-center text-slate-400">
                                    No team data available.
                                </div>
                            )}
                        </section>

                        <div className="bg-gradient-to-br from-teal-500 to-emerald-600 rounded-[2rem] p-8 text-white shadow-lg relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
                            <h3 className="text-2xl font-black mb-2">Build Your Legacy</h3>
                            <p className="text-teal-100 mb-6 font-medium">Upload another project to expand your portfolio.</p>
                            <Link href="/upload" className="block w-full text-center py-3 bg-white text-teal-600 rounded-xl font-bold hover:shadow-xl hover:scale-[1.02] transition-all">
                                Upload New Project
                            </Link>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}

// Sub-components

const StatusCard = ({ project, onShare }: { project: any, onShare: any }) => {
    const isPending = !project.status || project.status === 'pending';
    const isApproved = project.status === 'approved';
    const isRejected = project.status === 'rejected';

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`
                bg-white p-6 rounded-3xl border-2 transition-all group
                ${isPending ? 'border-amber-100 hover:border-amber-200' :
                    isApproved ? 'border-emerald-100 hover:border-emerald-200' :
                        'border-red-100 hover:border-red-200'}
            `}
        >
            <div className="flex justify-between items-start mb-4">
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5
                    ${isPending ? 'bg-amber-50 text-amber-600' :
                        isApproved ? 'bg-emerald-50 text-emerald-600' :
                            'bg-red-50 text-red-600'}
                `}>
                    <span className={`w-2 h-2 rounded-full ${isPending ? 'bg-amber-500' : isApproved ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                    {project.status || 'Pending'}
                </span>

                <div className="flex gap-2">
                    <button onClick={onShare} className="p-2 hover:bg-slate-50 text-slate-400 hover:text-teal-600 rounded-full transition-colors" title="Share Link">
                        <Share2 size={16} />
                    </button>
                    {isPending && (
                        <Link href={`/upload?edit=${project.id}`} className="p-2 hover:bg-slate-50 text-slate-400 hover:text-indigo-600 rounded-full transition-colors" title="Edit Project">
                            <Edit size={16} />
                        </Link>
                    )}
                </div>
            </div>

            <h3 className="font-bold text-slate-900 text-lg mb-2 line-clamp-1">{project.title}</h3>

            {/* User Role Badge */}
            <div className="mb-3">
                {project.userRole === 'leader' ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-700 uppercase tracking-wide border border-amber-200">
                        <User size={10} /> Leader
                    </span>
                ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-600 uppercase tracking-wide border border-blue-100">
                        <Users size={10} /> Contributor
                    </span>
                )}
            </div>

            <p className="text-slate-500 text-sm mb-4 line-clamp-2 min-h-[40px]">{project.abstract}</p>

            {isRejected && project.admin_feedback && (
                <div className="bg-red-50 p-3 rounded-xl border border-red-100 flex items-start gap-2 mt-4 animate-in fade-in slide-in-from-top-2">
                    <AlertCircle size={16} className="text-red-500 mt-0.5 flex-shrink-0" />
                    <div>
                        <p className="text-xs font-bold text-red-700 uppercase mb-1">Feedback from Guide</p>
                        <p className="text-xs text-red-600 leading-snug">"{project.admin_feedback}"</p>
                    </div>
                </div>
            )}

            {isApproved && (
                <div className="flex items-center gap-2 text-xs font-medium text-emerald-600 mt-4 bg-emerald-50/50 p-2 rounded-lg">
                    <CheckCircle size={14} /> LIVE on Repository
                </div>
            )}
        </motion.div>
    );
};

const StatCard = ({ label, value, icon: Icon, color }: any) => (
    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-5">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${color}`}>
            <Icon size={24} />
        </div>
        <div>
            <p className="text-3xl font-black text-slate-900">{value}</p>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{label}</p>
        </div>
    </div>
);

const ActivityIcon = () => (
    <div className="relative">
        <div className="absolute inset-0 bg-teal-400 blur opacity-40 rounded-full"></div>
        <Clock className="relative z-10 text-teal-600" />
    </div>
)

// New component for TechBar (assuming it's needed for the new UI)
const TechBar = ({ label, percent, color }: { label: string, percent: string, color: string }) => (
    <div className="flex items-center gap-4">
        <span className="text-sm font-semibold text-slate-700 w-24 flex-shrink-0">{label}</span>
        <div className="relative flex-grow h-2 rounded-full bg-slate-100">
            <div className={`absolute top-0 left-0 h-full rounded-full ${color}`} style={{ width: percent }}></div>
        </div>
        <span className="text-xs font-bold text-slate-500 w-10 text-right">{percent}</span>
    </div>
);
