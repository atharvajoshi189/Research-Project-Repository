"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { motion } from 'framer-motion';
import { Eye, Download, Share2, Edit, AlertCircle, CheckCircle, Clock, BookOpen, User, Users, BarChart3, ExternalLink, Sparkles, ArrowRight, BrainCircuit } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { getSmartDownloadUrl } from '@/lib/utils';
import NeuralLoading from '@/components/NeuralLoading';
import BackgroundBlobs from '@/components/BackgroundBlobs';
import GridPulse from '@/components/GridPulse';
import BentoGrid from '@/components/BentoGrid';

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
                // 1. Fetch ALL projects (RLS is now open for collaborators too)
                const { data: allProjects, error: projectsError } = await supabase
                    .from('projects')
                    .select('*')
                    .order('created_at', { ascending: false });

                if (projectsError) console.warn("Fetch Projects error:", projectsError);

                // 2. Fetch MY collaborations including project details for invitations
                const { data: myCollabs, error: collabError } = await supabase
                    .from('project_collaborators')
                    .select('*, projects(*)')
                    .eq('student_id', userId);

                if (collabError) console.warn("Fetch Collabs error:", collabError);

                const myCollabsList = myCollabs || [];
                const myAcceptedCollabProjectIds = myCollabsList
                    .filter(c => c.status === 'accepted')
                    .map(c => c.project_id);

                // Identify Pending Invitations
                pendingInvites = myCollabsList.filter(c => c.status === 'pending');

                if (allProjects && allProjects.length > 0) {
                    allProjects.forEach((project: any) => {
                        const isLeader = project.student_id === userId;
                        const isCollaborator = myAcceptedCollabProjectIds.includes(project.id);

                        // FILTER: Only show if I am Leader OR Accepted Collaborator
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
        return <NeuralLoading message="Loading Workspace..." />;
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
        <div className="min-h-screen bg-[#F8FAFC] dark:bg-transparent text-slate-900 dark:text-white font-sans selection:bg-teal-100 relative overflow-x-hidden">
            <div className="dark:hidden">
                <BackgroundBlobs />
            </div>
            <div className="fixed inset-0 z-0 pointer-events-none">
                <GridPulse />
                <BentoGrid />
            </div>

            <div className="max-w-[95rem] mx-auto px-6 py-12 relative z-10">

                {/* Header */}
                <header className="mb-12 relative">
                    <div className="flex justify-between items-start">
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 text-teal-700 text-xs font-bold uppercase tracking-widest mb-4">
                                <BookOpen size={14} /> The Scholar's Hub
                            </div>
                            <div className="flex items-center gap-4 mb-2">
                                <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white">
                                    Welcome back, <span className="text-teal-600">{user?.full_name?.split(' ')[0] || user?.user_metadata?.full_name?.split(' ')[0] || user?.email?.split('@')[0]}</span>!
                                </h1>
                            </div>
                            <p className="text-slate-500 dark:text-slate-400 text-lg mb-2">Manage your academic legacy.</p>

                            <div className="inline-block px-3 py-1 bg-slate-900 text-green-400 font-mono text-xs rounded border border-slate-800 shadow-inner opacity-80">
                                <span className="text-slate-500 dark:text-slate-400 mr-2">$ system_access:</span>
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
                                <div key={mentee.id} className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-8 rounded-[1.5rem] border border-white dark:border-slate-800 text-center shadow-[0_10px_40px_-15px_rgba(0,0,0,0.05)] dark:shadow-2xl dark:shadow-teal-900/10 hover:-translate-y-1.5 hover:border-teal-400/50 transition-all duration-300 group">
                                    <div className="w-16 h-16 mx-auto bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-2xl flex items-center justify-center text-indigo-600 font-black text-2xl mb-4 group-hover:scale-110 transition-transform">
                                        {(mentee.full_name || 'S')[0]}
                                    </div>
                                    <h3 className="font-black text-slate-800 dark:text-slate-200 text-lg mb-1">{mentee.full_name}</h3>
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-4">{mentee.college_id || 'No ID'}</p>
                                    <div className="text-[10px] font-bold uppercase tracking-tighter bg-slate-900/5 dark:bg-white/5 py-1.5 px-3 rounded-lg inline-block text-slate-500 dark:text-slate-400 border border-slate-100 dark:border-slate-800">
                                        {mentee.section} • {mentee.academic_year}
                                    </div>
                                </div>
                            )) : (
                                <div className="col-span-4 p-20 text-center text-slate-400 border-2 border-dashed border-slate-200/50 rounded-[2rem] bg-white/30 backdrop-blur-xl">
                                    <p className="font-medium text-lg">No students assigned yet.</p>
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
                                <div key={proj.id} className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-8 rounded-[2rem] border border-white dark:border-slate-800 shadow-[0_10px_50px_-15px_rgba(0,0,0,0.08)] flex items-center justify-between group hover:border-amber-400/50 transition-all">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                                            <span className="text-[10px] font-black uppercase tracking-widest text-amber-600">Review Required</span>
                                        </div>
                                        <h3 className="font-black text-slate-900 dark:text-white text-2xl mb-2 group-hover:text-amber-600 transition-colors uppercase tracking-tight">{proj.title}</h3>
                                        <p className="text-slate-500 dark:text-slate-400 text-sm line-clamp-1 max-w-2xl font-medium">{proj.abstract}</p>
                                    </div>
                                    <Link href={`/upload?edit=${proj.id}`} className="px-8 py-4 bg-slate-900 text-white font-black rounded-xl hover:bg-amber-500 transition-all shadow-xl shadow-slate-900/10 active:scale-95 flex items-center gap-2">
                                        Open Review <ArrowRight size={18} />
                                    </Link>
                                </div>
                            )) : (
                                <div className="p-20 text-center text-slate-400 border-2 border-dashed border-slate-200/50 rounded-[2rem] bg-white/30 backdrop-blur-xl">
                                    <p className="font-medium text-lg">Your queue is clear. No pending approvals.</p>
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
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="mb-16"
                            >
                                <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-8 flex items-center gap-3">
                                    <div className="p-2 bg-rose-50 rounded-xl text-rose-500">
                                        <Users size={20} />
                                    </div>
                                    Team Invitations
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {invitations.map((invite: any) => (
                                        <div key={invite.id} className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-8 rounded-[1.5rem] border border-white dark:border-slate-800 shadow-[0_10px_50px_-15px_rgba(0,0,0,0.08)] flex items-center justify-between group hover:border-indigo-400/50 transition-all">
                                            <div>
                                                <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-2 block">Collaboration Request</span>
                                                <h3 className="font-black text-slate-900 dark:text-white text-xl mb-1 uppercase tracking-tight">{invite.projects?.title || 'Untitled Project'}</h3>
                                                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
                                                    As <span className="text-indigo-600 capitalize font-bold">{invite.role}</span>
                                                    {invite.projects?.authors?.[0] && (
                                                        <span className="text-slate-400"> • Inviter: {invite.projects.authors[0]}</span>
                                                    )}
                                                </p>
                                            </div>
                                            <div className="flex gap-3">
                                                <button
                                                    onClick={() => handleInvitation(invite.project_id || invite.id, 'accepted')}
                                                    className="px-6 py-3 bg-slate-900 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-teal-500 transition-all shadow-lg active:scale-95"
                                                >
                                                    Accept
                                                </button>
                                                <button
                                                    onClick={() => handleInvitation(invite.project_id || invite.id, 'rejected')}
                                                    className="px-6 py-3 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-rose-50 hover:text-rose-600 transition-all active:scale-95"
                                                >
                                                    Decline
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </motion.section>
                        )}

                        <section className="mb-20">
                            <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-8 flex items-center gap-3">
                                <div className="relative">
                                    <div className="absolute inset-0 bg-teal-400 blur-lg opacity-40 rounded-full"></div>
                                    <Clock className="relative z-10 text-teal-600" />
                                </div>
                                {user?.role === 'teacher' ? 'Active Projects' : 'Project Status Tracker'}
                            </h2>

                            {projects.length === 0 ? (
                                <div className="p-20 rounded-[2rem] border-2 border-dashed border-slate-200/60 text-center bg-white/30 backdrop-blur-xl">
                                    <p className="text-slate-500 dark:text-slate-400 text-lg font-medium mb-8">No active projects found in your workspace.</p>
                                    {user?.role === 'student' && (
                                        <Link href="/upload" className="px-10 py-5 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest shadow-2xl shadow-slate-900/20 hover:scale-105 transition-all inline-flex items-center gap-3 group">
                                            Start Your Submission <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                        </Link>
                                    )}
                                </div>
                            ) : (
                                <motion.div
                                    variants={{
                                        hidden: { opacity: 0 },
                                        visible: {
                                            opacity: 1,
                                            transition: {
                                                staggerChildren: 0.1
                                            }
                                        }
                                    }}
                                    initial="hidden"
                                    whileInView="visible"
                                    viewport={{ once: true, margin: "-50px" }}
                                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 auto-rows-[350px]"
                                >
                                    {projects.map((project, i) => (
                                        <motion.div
                                            key={project.id}
                                            variants={{
                                                hidden: {
                                                    opacity: 0,
                                                    y: -100,
                                                    x: -200 + (i * 20),
                                                    scale: 0.9,
                                                    rotate: -10 + (i * 2)
                                                },
                                                visible: {
                                                    opacity: 1,
                                                    y: 0,
                                                    scale: 1,
                                                    x: 0,
                                                    rotate: 0,
                                                    transition: {
                                                        type: "spring",
                                                        stiffness: 100,
                                                        damping: 15
                                                    }
                                                }
                                            }}
                                            className="h-full"
                                        >
                                            <StatusCard
                                                project={project}
                                                onShare={() => copyLink(project.id)}
                                                onClick={() => router.push(`/project/${project.id}`)}
                                            />
                                        </motion.div>
                                    ))}
                                </motion.div>
                            )}
                        </section>
                    </>
                )}


                {/* Recommended For You - Only Student */}
                {user?.role === 'student' && recommendedProjects.length > 0 && (
                    <section className="mb-20">
                        <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-8 flex items-center gap-3">
                            <Sparkles className="text-yellow-500 fill-yellow-500" /> AI Insights & Recommendations
                        </h2>
                        <motion.div
                            variants={{
                                hidden: { opacity: 0 },
                                visible: {
                                    opacity: 1,
                                    transition: {
                                        staggerChildren: 0.1
                                    }
                                }
                            }}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, margin: "-50px" }}
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 auto-rows-[350px]"
                        >
                            {recommendedProjects.map((project, i) => (
                                <motion.div
                                    key={project.id}
                                    variants={{
                                        hidden: {
                                            opacity: 0,
                                            y: -100,
                                            x: -200 + (i * 20),
                                            scale: 0.9,
                                            rotate: -10 + (i * 2)
                                        },
                                        visible: {
                                            opacity: 1,
                                            y: 0,
                                            scale: 1,
                                            x: 0,
                                            rotate: 0,
                                            transition: {
                                                type: "spring",
                                                stiffness: 100,
                                                damping: 15
                                            }
                                        }
                                    }}
                                    className="h-full"
                                >
                                    <Link href={`/project/${project.id}`} className="group h-full block">
                                        <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-3xl p-8 rounded-[2rem] border border-white/50 dark:border-slate-800/50 shadow-2xl shadow-teal-900/5 dark:shadow-teal-900/20 hover:border-teal-400/50 hover:-translate-y-2 transition-all flex flex-col h-full relative overflow-hidden">
                                            <div className="absolute -top-10 -right-10 w-32 h-32 bg-teal-500/5 rounded-full blur-2xl group-hover:scale-150 transition-transform"></div>
                                            <div className="mb-6">
                                                <span className="px-3 py-1 rounded-full bg-teal-500/10 text-teal-600 text-[10px] font-black uppercase tracking-widest border border-teal-500/20">
                                                    {project.category}
                                                </span>
                                            </div>
                                            <h3 className="font-black text-slate-900 dark:text-white text-xl mb-3 line-clamp-2 leading-tight group-hover:text-teal-600 transition-colors uppercase tracking-tight">{project.title}</h3>
                                            <p className="text-slate-500 dark:text-slate-400 text-sm line-clamp-3 mb-6 font-medium leading-relaxed opacity-80">{project.abstract}</p>
                                            <div className="mt-auto pt-6 border-t border-slate-50 flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse"></div>
                                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Match Accuracy: 98%</span>
                                            </div>
                                        </div>
                                    </Link>
                                </motion.div>
                            ))}
                        </motion.div>
                    </section>
                )}

                {/* Common Stats Area */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    <div className="lg:col-span-2 space-y-20">
                        <section>
                            <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-8 flex items-center gap-3">
                                <BarChart3 className="text-indigo-500" /> Portfolio Analytics
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <StatCard label="Total Reach" value={totalViews.toLocaleString()} icon={Eye} color="bg-indigo-500/10 text-indigo-600 border-indigo-500/20" />
                                <StatCard label="Citations" value={totalDownloads.toLocaleString()} icon={Download} color="bg-teal-500/10 text-teal-600 border-teal-500/20" />
                            </div>
                            <div className="mt-8 bg-white/60 dark:bg-slate-900/60 backdrop-blur-3xl p-10 rounded-[3rem] border border-white/50 dark:border-slate-800/50 shadow-2xl shadow-indigo-900/5 relative overflow-hidden group">
                                <div className="absolute -top-20 -right-20 w-60 h-60 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none group-hover:scale-150 transition-transform"></div>
                                <h3 className="font-black text-slate-900 dark:text-white mb-8 text-sm uppercase tracking-widest flex items-center gap-2">
                                    <Sparkles size={16} className="text-indigo-400" /> Domain expertise scale
                                </h3>
                                {topTechs.length > 0 ? (
                                    <div className="space-y-6">
                                        {topTechs.map((tech, i) => (
                                            <TechBar key={tech.label} label={tech.label} percent={tech.percent} color={i === 0 ? "bg-indigo-500" : i === 1 ? "bg-teal-500" : "bg-purple-500"} />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="p-10 text-center text-slate-400 italic">
                                        No domain data detected. Upload your first research project.
                                    </div>
                                )}
                            </div>
                        </section>

                        {/* Submission Timeline */}
                        <section>
                            <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-8 flex items-center gap-3">
                                <Clock className="text-amber-500" /> Research Roadmap
                            </h2>
                            <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-3xl p-10 rounded-[3rem] border border-white/50 dark:border-slate-800/50 shadow-2xl shadow-amber-900/5">
                                <div className="relative border-l-4 border-slate-100/50 ml-4 space-y-12 pl-10 py-4">
                                    {projects.map((project, i) => (
                                        <div key={i} className="relative group">
                                            <div className="absolute -left-[54px] top-1 w-10 h-10 rounded-full bg-white border-[6px] border-slate-100 flex items-center justify-center shadow-lg group-hover:border-teal-500 transition-all duration-500 group-hover:scale-110">
                                                <div className="w-2.5 h-2.5 bg-slate-200 rounded-full group-hover:bg-teal-200 transition-colors"></div>
                                            </div>
                                            <div>
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 group-hover:text-teal-600 transition-colors">
                                                    {new Date(project.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                                                </span>
                                                <h4 className="font-black text-slate-900 dark:text-white text-2xl mb-2 group-hover:translate-x-1 transition-transform">{project.title}</h4>
                                                <div className="flex gap-2">
                                                    <span className="text-[10px] font-bold uppercase px-3 py-1 rounded-lg bg-slate-900/5 dark:bg-white/5 text-slate-600 border border-slate-900/10">
                                                        {project.category}
                                                    </span>
                                                    <span className={`text-[10px] font-bold uppercase px-3 py-1 rounded-lg border
                                                        ${project.status === 'approved' ? 'bg-teal-500/10 text-teal-700 border-teal-500/20' : 'bg-amber-500/10 text-amber-700 border-amber-500/20'}
                                                    `}>
                                                        {project.status || 'Pending Review'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </section>
                    </div>

                    <div className="space-y-12">
                        {/* Profile/Network Card */}
                        <section>
                            <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-8 flex items-center gap-3">
                                <User className="text-rose-500" /> Identity Profile
                            </h2>
                            {user?.role === 'teacher' ? (
                                <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-3xl p-10 rounded-[3rem] border border-white/50 dark:border-slate-800/50 shadow-2xl shadow-rose-900/5 text-center">
                                    <div className="w-24 h-24 mx-auto bg-gradient-to-br from-rose-500/10 to-orange-500/10 rounded-[2rem] flex items-center justify-center text-rose-500 font-black text-4xl mb-6 shadow-xl shadow-rose-500/5">
                                        {(user?.full_name || 'F')[0]}
                                    </div>
                                    <h3 className="font-black text-2xl text-slate-900 dark:text-white mb-1">{user?.full_name}</h3>
                                    <p className="text-slate-500 dark:text-slate-400 font-black uppercase tracking-widest text-[10px] mb-8">Faculty Research Mentor</p>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-slate-900/5 dark:bg-white/5 p-4 rounded-2xl">
                                            <p className="text-2xl font-black text-slate-900 dark:text-white">{mentees.length}</p>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Mentees</p>
                                        </div>
                                        <div className="bg-slate-900/5 dark:bg-white/5 p-4 rounded-2xl">
                                            <p className="text-2xl font-black text-slate-900 dark:text-white">{projects.length}</p>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Ongoing Labs</p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                projects[0] ? (
                                    <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-3xl p-10 rounded-[3rem] border border-white/50 dark:border-slate-800/50 shadow-2xl shadow-rose-900/5 relative overflow-hidden group hover:-translate-y-2 transition-all">
                                        <div className="absolute -top-10 -right-10 w-40 h-40 bg-rose-500/5 rounded-full blur-3xl pointer-events-none group-hover:scale-150 transition-transform"></div>
                                        <div className="relative z-10">
                                            <div className="mb-10">
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Research Mentor</p>
                                                <div className="flex items-center gap-5">
                                                    <div className="w-16 h-16 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-600 font-black text-2xl shadow-xl shadow-rose-500/5 border border-rose-500/10">
                                                        {(projects[0].guide_name || 'P')[0]}
                                                    </div>
                                                    <div>
                                                        <h3 className="font-black text-slate-900 dark:text-white text-lg group-hover:text-rose-500 transition-colors">{projects[0].guide_name || 'Mentor TBD'}</h3>
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Senior Faculty Advisor</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="border-t border-slate-50/50 pt-10">
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Collaborators</p>
                                                <div className="space-y-4">
                                                    {(Array.isArray(projects[0].authors) ? projects[0].authors : [projects[0].authors]).map((author: string, i: number) => (
                                                        <div key={i} className="flex items-center gap-4 group/item">
                                                            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center text-xs font-black shadow-lg border border-white/20 group-hover/item:scale-110 transition-transform">
                                                                {author[0]}
                                                            </div>
                                                            <span className="text-sm font-black text-slate-700 group-hover/item:text-slate-900 dark:text-white transition-colors">{author}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="p-10 bg-white/60 dark:bg-slate-900/60 backdrop-blur-3xl rounded-[3rem] border border-white/50 dark:border-slate-800/50 text-center text-slate-400 font-medium">
                                        No active network detected.
                                    </div>
                                )
                            )}
                        </section>

                        {user?.role === 'student' && (
                            <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-3xl rounded-[3rem] p-10 border border-white/50 dark:border-slate-800/50 shadow-2xl shadow-teal-900/5 dark:shadow-teal-900/20 relative overflow-hidden group hover:-translate-y-2 transition-all hover:shadow-teal-900/20">
                                <div className="absolute top-0 right-0 w-60 h-60 bg-gradient-to-br from-teal-500/10 to-indigo-500/10 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2 group-hover:scale-150 transition-transform"></div>
                                <div className="relative z-10">
                                    <div className="w-16 h-16 bg-white/50 rounded-2xl flex items-center justify-center mb-8 border border-white/60 shadow-lg shadow-teal-900/5 dark:shadow-teal-900/20 group-hover:scale-110 transition-transform duration-500">
                                        <Sparkles className="text-teal-500" size={28} />
                                    </div>
                                    <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-4 leading-tight group-hover:text-teal-600 transition-colors">Build your <br />academic legacy.</h3>
                                    <p className="text-slate-500 dark:text-slate-400 mb-10 font-medium leading-relaxed">Expand your portfolio by contributing new research and innovations.</p>
                                    <Link href="/upload" className="block w-full text-center py-5 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-teal-500 hover:text-white hover:scale-[1.02] transition-all shadow-xl shadow-slate-900/20 active:scale-95 flex items-center justify-center gap-3">
                                        New Submission <ArrowRight size={18} />
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

// Sub-components

const StatusCard = ({ project, onShare, onClick }: { project: any, onShare: any, onClick: () => void }) => {
    const isPending = !project.status || project.status === 'pending';
    const isApproved = project.status === 'approved';
    const isRejected = project.status === 'rejected';

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={onClick}
            className={`
                bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-7 rounded-[2rem] border border-white dark:border-slate-800 transition-all group shadow-[0_10px_40px_-15px_rgba(0,0,0,0.06)] dark:shadow-2xl dark:shadow-teal-900/10 hover:shadow-[0_15px_60px_-20px_rgba(0,0,0,0.12)] hover:-translate-y-1 cursor-pointer relative overflow-hidden h-full flex flex-col min-h-[340px]
                ${isPending ? 'hover:border-amber-400/50' :
                    isApproved ? 'hover:border-teal-400/50' :
                        'hover:border-rose-400/50'}
            `}
        >
            {/* Header: Status and Actions */}
            <div className="flex justify-between items-center mb-6">
                <span className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-2 border shadow-sm
                    ${isPending ? 'bg-amber-50 text-amber-700 border-amber-100' :
                        isApproved ? 'bg-teal-50 text-teal-700 border-teal-100' :
                            'bg-rose-50 text-rose-700 border-rose-100'}
                `}>
                    <div className={`w-1.5 h-1.5 rounded-full animate-pulse transition-all ${isPending ? 'bg-amber-500' : isApproved ? 'bg-teal-500 shadow-[0_0_8px_rgba(20,184,166,0.6)]' : 'bg-rose-500'}`}></div>
                    {project.status || 'Pending Review'}
                </span>

                <div className="flex gap-2">
                    <button
                        onClick={(e) => { e.stopPropagation(); onShare(); }}
                        className="w-9 h-9 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-400 hover:bg-slate-900 hover:text-white dark:hover:bg-white dark:hover:text-slate-900 transition-all shadow-sm active:scale-95 border border-slate-100 dark:border-slate-700"
                    >
                        <Share2 size={14} />
                    </button>
                    {(isPending || project.userRole === 'leader') && (
                        <Link
                            onClick={(e) => e.stopPropagation()}
                            href={isPending ? `/upload?edit=${project.id}` : `/project/edit/${project.id}`}
                            className="w-9 h-9 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-400 hover:bg-slate-900 hover:text-white dark:hover:bg-white dark:hover:text-slate-900 transition-all shadow-sm active:scale-95 border border-slate-100 dark:border-slate-700"
                        >
                            <Edit size={14} />
                        </Link>
                    )}
                </div>
            </div>

            {/* Title */}
            <h3 className="font-black text-slate-900 dark:text-white text-xl mb-4 line-clamp-2 leading-tight group-hover:text-teal-600 transition-colors uppercase tracking-tight">
                {project.title}
            </h3>

            {/* Badges Section */}
            <div className="flex flex-wrap gap-2 mb-5">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider border shadow-sm transition-all
                    ${project.userRole === 'leader' ? 'bg-indigo-600 text-white border-indigo-500 shadow-indigo-100 dark:shadow-none' : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-100 dark:border-slate-700'}
                `}>
                    {project.userRole === 'leader' ? <User size={10} className="fill-white" /> : <Users size={10} />}
                    {project.userRole === 'leader' ? 'Leader' : 'Contributor'}
                </span>
                <span className="px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-100 dark:border-slate-700 text-[9px] font-black uppercase tracking-wider shadow-sm">
                    {project.category}
                </span>
            </div>

            {/* Abstract */}
            <p className="text-slate-500 dark:text-slate-400 text-xs mb-8 line-clamp-2 font-medium leading-relaxed opacity-80 group-hover:opacity-100 transition-opacity">
                {project.abstract}
            </p>

            {/* Feedback / Footer */}
            <div className="mt-auto">
                {(isRejected || project.remarks) && (project.remarks || project.admin_feedback) && (
                    <div className="bg-rose-500/5 p-4 rounded-xl border border-rose-500/10 flex items-start gap-3 mb-3">
                        <AlertCircle size={16} className="text-rose-500 flex-shrink-0" />
                        <p className="text-[10px] text-rose-600/80 font-medium italic leading-relaxed line-clamp-1">"{project.remarks || project.admin_feedback}"</p>
                    </div>
                )}

                {isApproved && (
                    <div className="flex items-center gap-2.5 text-[9px] font-black uppercase tracking-widest text-teal-600 bg-teal-500/5 p-3.5 rounded-xl border border-teal-500/10">
                        <div className="w-5 h-5 bg-teal-500 rounded flex items-center justify-center text-white shadow-lg shadow-teal-500/20">
                            <CheckCircle size={12} />
                        </div>
                        Synchronized
                    </div>
                )}
            </div>

            {/* Hover Decor */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-700"></div>
        </motion.div>
    );
};

const StatCard = ({ label, value, icon: Icon, color }: any) => (
    <div className="bg-white/80 backdrop-blur-xl p-10 rounded-[2rem] border border-white dark:border-slate-800 shadow-[0_15px_60px_-20px_rgba(0,0,0,0.06)] flex items-center gap-8 hover:-translate-y-2 transition-all duration-500 group">
        <div className={`w-20 h-20 rounded-2xl flex items-center justify-center text-3xl shadow-xl transition-all group-hover:scale-110 group-hover:rotate-3 ${color}`}>
            <Icon size={32} />
        </div>
        <div>
            <p className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter mb-1">{value}</p>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">{label}</p>
        </div>
    </div>
);

const TechBar = ({ label, percent, color }: { label: string, percent: string, color: string }) => (
    <div className="group/bar">
        <div className="flex items-center justify-between mb-3 px-1">
            <span className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest group-hover/bar:text-indigo-600 transition-colors">{label}</span>
            <span className="text-[10px] font-black text-slate-400 uppercase tabular-nums">{percent}</span>
        </div>
        <div className="h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: percent }}
                transition={{ duration: 1, ease: "easeOut" }}
                className={`h-full rounded-full ${color}`}
            ></motion.div>
        </div>
    </div>
);

