"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { motion } from 'framer-motion';
import { Eye, Download, Share2, Edit, AlertCircle, CheckCircle, Clock, BookOpen, User, Users, BarChart3, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { getSmartDownloadUrl } from '@/lib/utils';
import BackgroundBlobs from '@/components/BackgroundBlobs';
import GridPulse from '@/components/GridPulse';
import BentoGrid from '@/components/BentoGrid';
import { AnimatePresence } from 'framer-motion';

export default function StudentDashboard() {
    const router = useRouter();
    const [projects, setProjects] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);
    const [stats, setStats] = useState({ total: 0, approved: 0, pending: 0, views: 0, downloads: 0 });
    const [projectDistribution, setProjectDistribution] = useState<any[]>([]);
    const [invitations, setInvitations] = useState<any[]>([]);
    const [recommendedProjects, setRecommendedProjects] = useState<any[]>([]);
    const [mentees, setMentees] = useState<any[]>([]);
    const [approvalRequests, setApprovalRequests] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState('active'); // 'mentees', 'active', 'approvals'
    const [lastLogin, setLastLogin] = useState<string>('');

    useEffect(() => {
        // Set Last Login (Simulated or Real if available)
        const now = new Date();
        const formatted = now.toLocaleDateString('en-US', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        });
        setLastLogin(formatted);

        const fetchUserData = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                router.push('/login');
                return;
            }

            // Fetch Profile Data
            const { data: profile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .single();

            // Merge profile data with session user
            setUser({ ...session.user, ...profile });

            // Set Tab from URL if present
            const params = new URLSearchParams(window.location.search);
            const tabParam = params.get('tab');
            if (tabParam) setActiveTab(tabParam);
            else if (profile?.role === 'teacher') setActiveTab('mentees'); // Default for Teachers

            fetchStudentProjects(session.user.id); // Unified Fetch

            // Smart Recommendations only for Students
            if (profile?.role === 'student' || !profile?.role) {
                fetchRecommendationsFromAPI(session.access_token);
            }
        };
        fetchUserData();
    }, []);

    const fetchStudentProjects = async (userId: string) => {
        try {
            setLoading(true);

            // Fetch user role first
            const { data: profile } = await supabase.from('profiles').select('role').eq('id', userId).single();
            const role = profile?.role;

            let activeProjs: any[] = [];
            let pendingInvites: any[] = [];
            let approvalReqs: any[] = [];
            let myMenteesList: any[] = [];

            if (role === 'teacher') {
                // TEACHER VIEW
                const { data: guideProjects, error: guideError } = await supabase
                    .from('projects')
                    .select('*')
                    .eq('guide_id', userId);

                if (guideError) throw guideError;

                const allGuideProjects = guideProjects || [];

                // Active: Approved or Guide Approved
                activeProjs = allGuideProjects.filter(p => p.status === 'approved' || p.status === 'guide_approved');

                // Approvals: Pending (Waiting for Guide)
                approvalReqs = allGuideProjects.filter(p => p.status === 'pending');

                // Mentees Logic
                const projectIds = allGuideProjects.map(p => p.id);
                if (projectIds.length > 0) {
                    const { data: collaborators } = await supabase
                        .from('project_collaborators')
                        .select('student_id, profiles:student_id(*)')
                        .in('project_id', projectIds)
                        .eq('role', 'leader');

                    const uniqueStudents = new Map();
                    collaborators?.forEach((c: any) => {
                        if (c.profiles) {
                            uniqueStudents.set(c.student_id, c.profiles);
                        }
                    });
                    myMenteesList = Array.from(uniqueStudents.values());
                }

            } else {
                // STUDENT VIEW
                // 1. Fetch ALL projects (RLS is open)
                const { data: allProjects, error: projectsError } = await supabase
                    .from('projects')
                    .select('*')
                    .order('created_at', { ascending: false });

                // 2. Fetch MY collaborations (to know which projects I'm part of)
                const { data: myCollabs, error: collabError } = await supabase
                    .from('project_collaborators')
                    .select('project_id')
                    .eq('student_id', userId)
                    .eq('status', 'accepted');

                if (projectsError) console.warn("Fetch error:", projectsError);

                const myCollabProjectIds = (myCollabs || []).map((c: any) => c.project_id);

                if (allProjects && allProjects.length > 0) {
                    allProjects.forEach((project: any) => {
                        const isLeader = project.student_id === userId;
                        const isCollaborator = myCollabProjectIds.includes(project.id);

                        // FILTER: Only show if I am Leader OR Collaborator
                        if (isLeader || isCollaborator) {
                            const projectWithRole = {
                                ...project,
                                userRole: isLeader ? 'leader' : 'contributor',
                                collabStatus: 'accepted'
                            };
                            activeProjs.push(projectWithRole);
                        }
                    });
                }
            }

            setInvitations(pendingInvites);
            setProjects(activeProjs);
            setMentees(myMenteesList);
            setApprovalRequests(approvalReqs);

            // Stats Logic
            const total = activeProjs.length;
            const approved = activeProjs.filter((p: any) => p.status === 'approved').length;
            const pending = activeProjs.filter((p: any) => p.status === 'pending').length;
            const views = activeProjs.reduce((sum: number, p: any) => sum + (p.views || 0), 0);
            const downloads = activeProjs.reduce((sum: number, p: any) => sum + (p.downloads || 0), 0);
            setStats({ total, approved, pending, views, downloads });

            // Tech Distribution
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
            setProjects([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchRecommendationsFromAPI = async (token: string) => {
        try {
            // setRecommendedProjects([]) // Optional: clear or show skeleton
            const res = await fetch('/api/recommendations', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!res.ok) throw new Error("Failed to fetch recommendations");

            const data = await res.json();
            if (data.recommendations) {
                setRecommendedProjects(data.recommendations);
            }
        } catch (err) {
            console.error("Error fetching smart recommendations:", err);
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
                .eq('student_id', user.id); // Reverted to student_id

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
        <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans selection:bg-teal-100 relative overflow-x-hidden">
            <BackgroundBlobs />
            <div className="fixed inset-0 z-0 pointer-events-none">
                <GridPulse />
                <BentoGrid />
            </div>

            <div className="max-w-7xl mx-auto px-6 py-12 relative z-10">

                {/* Header */}
                <header className="mb-12 relative">
                    <div className="flex justify-between items-start">
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 text-teal-700 text-xs font-bold uppercase tracking-widest mb-4">
                                <BookOpen size={14} /> The Scholar's Hub
                            </div>
                            <div className="flex items-center gap-4 mb-2">
                                <h1 className="text-4xl md:text-5xl font-black text-slate-900">
                                    Welcome back, <span className="text-teal-600">{user?.full_name?.split(' ')[0] || user?.user_metadata?.full_name?.split(' ')[0] || user?.email?.split('@')[0]}</span>!
                                </h1>
                            </div>
                            <p className="text-slate-500 text-lg mb-2">Manage your academic legacy.</p>

                            <div className="inline-block px-3 py-1 bg-slate-900 text-green-400 font-mono text-xs rounded border border-slate-800 shadow-inner opacity-80">
                                <span className="text-slate-500 mr-2">$ system_access:</span>
                                {lastLogin || '...'}
                            </div>
                        </div>
                    </div>
                </header>

                {/* TEACHER TABS (Only for Teacher Role) */}
                {user?.role === 'teacher' && (
                    <div className="mb-8 border-b border-slate-200 flex gap-6">
                        <button onClick={() => setActiveTab('mentees')} className={`pb-3 font-bold text-sm transition-all ${activeTab === 'mentees' ? 'border-b-2 border-teal-500 text-teal-600' : 'text-slate-400 hover:text-slate-600'}`}>My Mentees</button>
                        <button onClick={() => setActiveTab('active')} className={`pb-3 font-bold text-sm transition-all ${activeTab === 'active' ? 'border-b-2 border-teal-500 text-teal-600' : 'text-slate-400 hover:text-slate-600'}`}>Active Projects</button>
                        <button onClick={() => setActiveTab('approvals')} className={`pb-3 font-bold text-sm transition-all ${activeTab === 'approvals' ? 'border-b-2 border-amber-500 text-amber-600' : 'text-slate-400 hover:text-slate-600'}`}>
                            Approvals {approvalRequests.length > 0 && <span className="ml-1 px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded text-[10px]">{approvalRequests.length}</span>}
                        </button>
                    </div>
                )}

                {/* 1. Mentees Tab Content */}
                {user?.role === 'teacher' && activeTab === 'mentees' && (
                    <section className="mb-16 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {mentees.length > 0 ? mentees.map((mentee) => (
                                <div key={mentee.id} className="bg-white/40 backdrop-blur-xl p-6 rounded-3xl border border-white/40 text-center shadow-lg shadow-teal-900/5 hover:-translate-y-1 transition-all duration-300">
                                    <div className="w-16 h-16 mx-auto bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center text-indigo-600 font-bold text-xl mb-3">
                                        {(mentee.full_name || 'S')[0]}
                                    </div>
                                    <h3 className="font-bold text-slate-800">{mentee.full_name}</h3>
                                    <p className="text-xs text-slate-400 mb-4">{mentee.college_id || 'No ID'}</p>
                                    <div className="text-xs bg-slate-50 py-1 px-2 rounded-lg inline-block text-slate-500">
                                        {mentee.section} - {mentee.academic_year}
                                    </div>
                                </div>
                            )) : (
                                <div className="col-span-4 p-8 text-center text-slate-400 border-2 border-dashed border-slate-100 rounded-2xl">
                                    No students assigned yet.
                                </div>
                            )}
                        </div>
                    </section>
                )}

                {/* 2. Approvals Tab Content */}
                {user?.role === 'teacher' && activeTab === 'approvals' && (
                    <section className="mb-16 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="space-y-4">
                            {approvalRequests.length > 0 ? approvalRequests.map((proj) => (
                                <div key={proj.id} className="bg-white/40 backdrop-blur-xl p-6 rounded-3xl border border-amber-100/50 shadow-lg shadow-amber-900/5 flex items-center justify-between">
                                    <div>
                                        <h3 className="font-bold text-slate-900 text-lg mb-1">{proj.title}</h3>
                                        <p className="text-sm text-slate-500">{proj.abstract?.substring(0, 100)}...</p>
                                    </div>
                                    <Link href={`/upload?edit=${proj.id}`} className="px-5 py-2.5 bg-amber-500 text-white font-bold rounded-xl hover:bg-amber-600 transition-colors shadow-lg shadow-amber-500/20">
                                        Review
                                    </Link>
                                </div>
                            )) : (
                                <div className="p-8 text-center text-slate-400 border-2 border-dashed border-slate-200/50 rounded-3xl bg-white/30 backdrop-blur-sm">
                                    No pending approvals.
                                </div>
                            )}
                        </div>
                    </section>
                )}

                {/* 3. Helper Logic: Show Active Projects if Tab is Active OR if User is Student */}
                {(user?.role === 'student' || activeTab === 'active') && (
                    <>
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
                                        <div key={invite.id} className="bg-white/80 backdrop-blur-xl p-6 rounded-3xl border border-indigo-100/50 shadow-xl shadow-indigo-100/20 flex items-center justify-between group hover:border-indigo-200 transition-all">
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

                        <section className="mb-16">
                            <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                                <ActivityIcon /> {user?.role === 'teacher' ? 'Active Projects' : 'Project Status Tracker'}
                            </h2>

                            {projects.length === 0 ? (
                                <div className="p-8 rounded-3xl border-2 border-dashed border-slate-200 text-center bg-white/50">
                                    <p className="text-slate-500 mb-4">You have no active projects.</p>
                                    {user?.role === 'student' && (
                                        <Link href="/upload" className="px-6 py-2 bg-slate-900 text-white rounded-xl font-bold hover:bg-teal-600 transition-colors">Submit Your First Project</Link>
                                    )}
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {projects.map((project) => (
                                        <StatusCard key={project.id} project={project} onShare={() => copyLink(project.id)} />
                                    ))}
                                </div>
                            )}
                        </section>
                    </>
                )}


                {/* Recommended For You - Only Student */}
                {user?.role === 'student' && recommendedProjects.length > 0 && (
                    <section className="mb-16">
                        <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                            <span className="text-2xl animate-pulse">✨</span> Recommended for You (Powered by Grok)
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {recommendedProjects.map((project) => (
                                <Link href={`/project/${project.id}`} key={project.id} className="group">
                                    <div className="bg-white/40 backdrop-blur-xl p-5 rounded-3xl border border-white/40 shadow-lg shadow-teal-900/5 hover:shadow-2xl hover:shadow-teal-900/10 hover:-translate-y-1 transition-all h-full flex flex-col relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 w-24 h-24 bg-teal-50/50 rounded-bl-full -z-0 opacity-50 group-hover:scale-110 transition-transform"></div>
                                        <div className="flex justify-between items-start mb-3 relative z-10">
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-teal-600 bg-teal-50 px-2 py-1 rounded-full border border-teal-100">
                                                {project.category}
                                            </span>
                                        </div>
                                        <h3 className="font-bold text-slate-900 mb-2 group-hover:text-teal-600 transition-colors line-clamp-2 relative z-10">{project.title}</h3>
                                        <p className="text-slate-500 text-xs line-clamp-2 mb-4 flex-grow relative z-10">{project.abstract}</p>
                                        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mt-auto pt-3 border-t border-slate-50 relative z-10">
                                            <span className="w-1.5 h-1.5 rounded-full bg-teal-400"></span>
                                            AI Selected
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </section>
                )}

                {/* Common Stats Area */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    <div className="lg:col-span-2 space-y-12">
                        <section>
                            <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                                <BarChart3 className="text-indigo-500" /> Portfolio Analytics
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <StatCard label="Total Views" value={totalViews.toLocaleString()} icon={Eye} color="bg-blue-50 text-blue-600 border-blue-100" />
                                <StatCard label="Downloads" value={totalDownloads.toLocaleString()} icon={Download} color="bg-emerald-50 text-emerald-600 border-emerald-100" />
                            </div>
                            <div className="mt-6 bg-white/40 backdrop-blur-xl p-6 rounded-3xl border border-white/40 shadow-lg shadow-teal-900/5 relative overflow-hidden">
                                <h3 className="font-bold text-slate-700 mb-4 text-sm uppercase tracking-wide">Tech Domain Influence</h3>
                                {topTechs.length > 0 ? (
                                    <div className="space-y-4">
                                        {topTechs.map((tech, i) => (
                                            <TechBar key={tech.label} label={tech.label} percent={tech.percent} color={i === 0 ? "bg-indigo-500" : i === 1 ? "bg-purple-500" : "bg-teal-500"} />
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-slate-400 text-sm">Add projects with tech stacks to see analytics.</p>
                                )}
                            </div>
                        </section>
                        {/* Submission Timeline */}
                        <section>
                            <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                                <Clock className="text-amber-500" /> Submission Timeline
                            </h2>
                            <div className="bg-white/40 backdrop-blur-xl p-8 rounded-3xl border border-white/40 shadow-lg shadow-teal-900/5">
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

                    <div className="space-y-8">
                        {/* My Team / Network - Different for Teacher vs Student */}
                        <section>
                            <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                                <User className="text-rose-500" /> {user?.role === 'teacher' ? 'My Profile' : 'My Academic Network'}
                            </h2>
                            {user?.role === 'teacher' ? (
                                <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50">
                                    <p className="text-slate-500 text-center">You are logged in as Teacher.</p>
                                </div>
                            ) : (
                                // Existing Team Card for Student
                                projects[0] ? (
                                    <div className="bg-white/40 backdrop-blur-xl p-6 rounded-[2rem] border border-white/40 shadow-xl shadow-slate-200/50 relative overflow-hidden group hover:-translate-y-1 transition-transform">
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
                                )
                            )}
                        </section>

                        {user?.role === 'student' && (
                            <div className="bg-gradient-to-br from-teal-500 to-emerald-600 rounded-[2rem] p-8 text-white shadow-lg relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
                                <h3 className="text-2xl font-black mb-2">Build Your Legacy</h3>
                                <p className="text-teal-100 mb-6 font-medium">Upload another project to expand your portfolio.</p>
                                <Link href="/upload" className="block w-full text-center py-3 bg-white text-teal-600 rounded-xl font-bold hover:shadow-xl hover:scale-[1.02] transition-all">
                                    Upload New Project
                                </Link>
                            </div>
                        )}
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
                bg-white/40 backdrop-blur-xl p-6 rounded-3xl border border-white/40 transition-all group shadow-lg shadow-teal-900/5 hover:shadow-2xl hover:shadow-teal-900/10 hover:-translate-y-1
                ${isPending ? 'hover:border-amber-200/60' :
                    isApproved ? 'hover:border-emerald-200/60' :
                        'hover:border-red-200/60'}
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
                        <Link href={`/upload?edit=${project.id}`} className="p-2 hover:bg-slate-50 text-slate-400 hover:text-indigo-600 rounded-full transition-colors" title="Edit Pending Project">
                            <Edit size={16} />
                        </Link>
                    )}
                    {/* Add Edit Button for Leaders (Always visible if leader) */}
                    {project.userRole === 'leader' && !isPending && (
                        <Link href={`/project/edit/${project.id}`} className="p-2 hover:bg-slate-50 text-slate-400 hover:text-indigo-600 rounded-full transition-colors" title="Edit Project">
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

            {(isRejected || project.remarks) && (project.remarks || project.admin_feedback) && (
                <div className="bg-red-50 p-3 rounded-xl border border-red-100 flex items-start gap-2 mt-4 animate-in fade-in slide-in-from-top-2">
                    <AlertCircle size={16} className="text-red-500 mt-0.5 flex-shrink-0" />
                    <div>
                        <p className="text-xs font-bold text-red-700 uppercase mb-1">Feedback / Remarks</p>
                        <p className="text-xs text-red-600 leading-snug">"{project.remarks || project.admin_feedback}"</p>
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
    <div className="bg-white/40 backdrop-blur-xl p-6 rounded-3xl border border-white/40 shadow-lg shadow-teal-900/5 flex items-center gap-5 hover:scale-105 transition-transform duration-300">
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
