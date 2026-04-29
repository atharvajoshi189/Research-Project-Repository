"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, UserPlus, BookOpen, ChevronRight, CheckCircle, AlertCircle, Sparkles, Database, Loader2, X, Filter, Search, Wand2, Trash2, Settings2, Cpu, Edit2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import NeuralLoading from '@/components/NeuralLoading';
import BackgroundBlobs from '@/components/BackgroundBlobs';
import GridPulse from '@/components/GridPulse';
import BentoGrid from '@/components/BentoGrid';

export default function AllotmentPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [userRole, setUserRole] = useState<string | null>(null);

    // Data State
    const [students, setStudents] = useState<any[]>([]);
    const [teachers, setTeachers] = useState<any[]>([]);

    // Real-time Allotments State
    const [allotments, setAllotments] = useState<{ projects: any[], collaborators: any[] }>({ projects: [], collaborators: [] });
    const [allotmentsLoading, setAllotmentsLoading] = useState(true);
    const [allotmentsError, setAllotmentsError] = useState<string | null>(null);

    // Form State
    const [projectTitle, setProjectTitle] = useState('');
    const [projectCategory, setProjectCategory] = useState<'Micro Project' | 'Mini Project' | 'Final Year Project'>('Micro Project');
    const [selectedStudents, setSelectedStudents] = useState<string[]>([]); // Student IDs
    const [selectedGuide, setSelectedGuide] = useState<string>(''); // Teacher ID

    // Advanced Search & Filter State
    const [searchQuery, setSearchQuery] = useState('');
    const [filterYear, setFilterYear] = useState<string>('');
    const [filterSection, setFilterSection] = useState<string>('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const [recordsFilterYear, setRecordsFilterYear] = useState<string>('');
    const [recordsFilterSection, setRecordsFilterSection] = useState<string>('');

    // Auto-Allotment State
    const [allotmentMode, setAllotmentMode] = useState<'manual' | 'auto'>('manual');
    const [autoGroupSize, setAutoGroupSize] = useState<number>(4);
    const [ghostGroups, setGhostGroups] = useState<Array<{ id: string, title: string, guide_id: string, students: any[], category?: string, academic_year?: string }>>([]);
    const [unassignedPool, setUnassignedPool] = useState<any[]>([]);
    const [sessionProjectIds, setSessionProjectIds] = useState<string[]>([]);
    
    // Edit State
    const [editingProject, setEditingProject] = useState<any>(null);
    const [editProjectTitle, setEditProjectTitle] = useState('');
    const [editProjectCategory, setEditProjectCategory] = useState('');
    const [editProjectGuide, setEditProjectGuide] = useState('');
    
    // AI & Animation State
    const [generatingNames, setGeneratingNames] = useState(false);
    const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);

    useEffect(() => {
        let channel: any;

        const initializeData = async () => {
            try {
                // 1. Check Auth (Faculty Only)
                const { data: { session } } = await supabase.auth.getSession();
                if (!session) {
                    router.push('/login');
                    return;
                }
                const { data: profile } = await supabase.from('profiles').select('role').eq('id', session.user.id).single();
                if (profile?.role !== 'teacher' && profile?.role !== 'hod' && profile?.role !== 'faculty') {
                    toast.error("Access Denied: Faculty Only");
                    router.push('/');
                    return;
                }

                setUserRole(profile.role);

                // Fetch everything in parallel
                const promises = [
                    supabase.from('profiles').select('id, full_name, role, academic_year, section'),
                    supabase.from('projects').select('*').order('created_at', { ascending: false }),
                    supabase.from('project_collaborators').select('*')
                ];

                const results = await Promise.all(promises);
                
                const profilesRes = results[0];
                const projectsRes = results[1];
                const collabsRes = results[2];
                
                if (profilesRes.error) throw profilesRes.error;
                if (projectsRes.error) throw projectsRes.error;
                if (collabsRes.error) throw collabsRes.error;

                const allProfiles = profilesRes.data || [];
                setStudents(allProfiles.filter((p: any) => p.role === 'student'));
                setTeachers(allProfiles.filter((p: any) => ['teacher', 'faculty', 'hod'].includes(p.role)));

                setAllotments({
                    projects: projectsRes.data || [],
                    collaborators: collabsRes.data || []
                });

                // Setup real-time updates for all faculty/HOD
                const fetchLiveAllotments = async () => {
                    const [pRes, cRes] = await Promise.all([
                        supabase.from('projects').select('*').order('created_at', { ascending: false }),
                        supabase.from('project_collaborators').select('*')
                    ]);
                    if (!pRes.error && !cRes.error) {
                        setAllotments({ projects: pRes.data || [], collaborators: cRes.data || [] });
                    }
                };

                channel = supabase.channel('allotments_channel')
                    .on('postgres_changes', { event: '*', schema: 'public', table: 'projects' }, fetchLiveAllotments)
                    .on('postgres_changes', { event: '*', schema: 'public', table: 'project_collaborators' }, fetchLiveAllotments)
                    .subscribe();

            } catch (err: any) {
                console.error("Error fetching allotment data:", err);
                toast.error("Failed to load data.");
            } finally {
                setLoading(false);
                setAllotmentsLoading(false);
            }
        };

        initializeData();

        return () => {
            if (channel) supabase.removeChannel(channel);
        };
    }, [router]);

    const toggleStudent = (id: string) => {
        if (selectedStudents.includes(id)) {
            setSelectedStudents(prev => prev.filter(s => s !== id));
        } else {
            if (selectedStudents.length >= 4) {
                toast.error("Max 4 students per group");
                return;
            }
            setSelectedStudents(prev => [...prev, id]);
        }
    };

    // Advanced Search Filtering & Calculations
    const assignedStudentIds = new Set(allotments.collaborators.map(c => c.student_id));
    const pendingAllotmentsCount = students.length - assignedStudentIds.size;

    const availableStudents = students.filter(student => {
        if (selectedStudents.includes(student.id)) return false;
        if (filterYear && student.academic_year !== filterYear) return false;
        if (filterSection && student.section !== filterSection) return false;
        if (searchQuery && !student.full_name?.toLowerCase().includes(searchQuery.toLowerCase())) return false;
        return true;
    });

    const teacherLoad = teachers.map(t => {
        const assignedProjectsCount = allotments.projects.filter(p => p.guide_id === t.id).length;
        return { ...t, load: assignedProjectsCount };
    });

    const handleDragStart = (e: React.DragEvent, studentId: string) => {
        e.dataTransfer.setData('studentId', studentId);
    };

    const handleDropOnProject = async (e: React.DragEvent, targetProjectId: string) => {
        e.preventDefault();
        const studentId = e.dataTransfer.getData('studentId');
        if (!studentId) return;

        const currentAssignment = allotments.collaborators.find(c => c.student_id === studentId);
        if (currentAssignment && currentAssignment.project_id === targetProjectId) return; // Already here

        try {
            const { error } = await supabase
                .from('project_collaborators')
                .update({ project_id: targetProjectId })
                .eq('student_id', studentId);
                
            if (error) throw error;
            toast.success("Student reassigned successfully!");
        } catch (err: any) {
            console.error("Drag Drop Error:", err);
            toast.error("Failed to reassign student.");
        }
    };

    const suggestProjectName = async () => {
        setGeneratingNames(true);
        try {
            const res = await fetch('/api/grok', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'suggest_group_name',
                    context: { count: 1 }
                })
            });
            const { data } = await res.json();
            if (data?.names && data.names.length > 0) {
                setProjectTitle(data.names[0]);
                toast.success("AI suggested a name!", { icon: '✨' });
            }
        } catch (err) {
            toast.error("Failed to get AI suggestion.");
        } finally {
            setGeneratingNames(false);
        }
    };

    const handleAddManualGroup = () => {
        if (selectedStudents.length === 0 || !selectedGuide) {
            toast.error("Please select students and a guide.");
            return;
        }

        const studentObjects = students.filter(s => selectedStudents.includes(s.id));
        const title = projectTitle || `Project Group - ${studentObjects[0].full_name.split(' ')[0]} ${studentObjects.length > 1 ? '& Team' : ''}`;

        const newGroup = {
            id: `manual-${Date.now()}`,
            title: title,
            guide_id: selectedGuide,
            students: studentObjects,
            category: projectCategory,
            academic_year: filterYear || '2025-2026'
        };

        setGhostGroups(prev => [newGroup, ...prev]);
        toast.success("Group added to list!", { icon: '✨' });

        // Reset Form
        setProjectTitle('');
        setSelectedStudents([]);
        // Keep category, year, guide for faster sequential addition
    };

    // --- Auto Allotment Logic ---
    const generateMagicGroups = async () => {
        const unassigned = students.filter(s => {
            if (filterYear && s.academic_year !== filterYear) return false;
            if (filterSection && s.section !== filterSection) return false;
            return true;
        });

        if (unassigned.length === 0) {
            toast.error("No students available for selected filters.");
            return;
        }

        setGeneratingNames(true);
        
        // Shuffle array (Fisher-Yates)
        const shuffled = [...unassigned];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }

        const numGroups = Math.ceil(shuffled.length / autoGroupSize);
        let suggestedNames: string[] = [];

        try {
            const res = await fetch('/api/grok', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'suggest_group_name',
                    context: { count: numGroups }
                })
            });
            const { data } = await res.json();
            if (data?.names) {
                suggestedNames = data.names;
            }
        } catch (err) {
            console.error("Grok failed to fetch batch names");
        }

        const newGhostGroups = [];
        for (let i = 0; i < shuffled.length; i += autoGroupSize) {
            const groupIndex = i / autoGroupSize;
            newGhostGroups.push({
                id: `ghost-${Date.now()}-${i}`,
                title: suggestedNames[groupIndex] || `Auto Group ${groupIndex + 1}`,
                guide_id: '',
                students: shuffled.slice(i, i + autoGroupSize)
            });
        }

        setGhostGroups(newGhostGroups);
        setUnassignedPool([]);
        setGeneratingNames(false);
        toast.success(`Generated ${newGhostGroups.length} magic groups!`);
    };

    const updateGhostGroupGuide = (groupId: string, guideId: string) => {
        setGhostGroups(prev => prev.map(g => g.id === groupId ? { ...g, guide_id: guideId } : g));
    };

    const updateGhostGroupTitle = (groupId: string, newTitle: string) => {
        setGhostGroups(prev => prev.map(g => g.id === groupId ? { ...g, title: newTitle } : g));
    };

    const removeFromGhostGroup = (groupId: string, studentId: string) => {
        setGhostGroups(prev => {
            const newGroups = [...prev];
            const groupIndex = newGroups.findIndex(g => g.id === groupId);
            if (groupIndex === -1) return prev;
            
            const studentIndex = newGroups[groupIndex].students.findIndex(s => s.id === studentId);
            if (studentIndex !== -1) {
                const [removedStudent] = newGroups[groupIndex].students.splice(studentIndex, 1);
                setUnassignedPool(up => [...up, removedStudent]);
                
                // If group is empty, remove it
                if (newGroups[groupIndex].students.length === 0) {
                    newGroups.splice(groupIndex, 1);
                }
            }
            return newGroups;
        });
    };

    const addToGhostGroup = (groupId: string, studentId: string) => {
        const student = unassignedPool.find(s => s.id === studentId);
        if (!student) return;

        setGhostGroups(prev => prev.map(g => {
            if (g.id === groupId) {
                return { ...g, students: [...g.students, student] };
            }
            return g;
        }));
        setUnassignedPool(up => up.filter(s => s.id !== studentId));
    };

    const handleBulkAllotment = async () => {
        if (ghostGroups.length === 0) {
            toast.error("No groups to allot.");
            return;
        }

        setSubmitting(true);
        try {
            // Loop through each ghost group and create project + collaborators sequentially or Promise.all
            for (let i = 0; i < ghostGroups.length; i++) {
                const group = ghostGroups[i];
                if (group.students.length === 0) continue;

                const studentNames = group.students.map((s: any) => s.full_name).join(', ');
                const guideName = teachers.find(t => t.id === group.guide_id)?.full_name || 'Unassigned';

                // 1. Create Project
                const { data: projectData, error: projectError } = await supabase
                    .from('projects')
                    .insert({
                        title: group.title,
                        category: group.category || projectCategory,
                        guide_id: group.guide_id || null, 
                        guide_name: guideName === 'Unassigned' ? null : guideName,
                        status: 'approved',
                        team_members: studentNames,
                        academic_year: group.academic_year || filterYear || '2025-2026'
                    })
                    .select()
                    .single();

                if (projectError) throw projectError;
                if (!projectData) throw new Error("Failed to create project");

                // 2. Add Collaborators
                const collaborators = group.students.map((student, index) => ({
                    project_id: projectData.id,
                    student_id: student.id,
                    role: index === 0 ? 'leader' : 'member',
                    status: 'accepted'
                }));

                const { error: collabError } = await supabase
                    .from('project_collaborators')
                    .insert(collaborators);

                if (collabError) throw collabError;
                
                // Optimistic UI update
                setAllotments(prev => ({
                    projects: [projectData, ...prev.projects],
                    collaborators: [...prev.collaborators, ...collaborators]
                }));
                setSessionProjectIds(prev => [...prev, projectData.id]);
            }

            toast.success("Bulk Allotment Complete!", { icon: '🚀' });
            setGhostGroups([]);
            setUnassignedPool([]);
            
            // Trigger Neural Success Animation
            setShowSuccessAnimation(true);
            setTimeout(() => setShowSuccessAnimation(false), 3000);
        } catch (err: any) {
            console.error("Bulk Allotment Error:", err);
            toast.error("Failed to allot groups.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteProject = async (projectId: string) => {
        try {
            // Optimistic UI update
            setSessionProjectIds(prev => prev.filter(id => id !== projectId));
            setAllotments(prev => ({
                projects: prev.projects.filter(p => p.id !== projectId),
                collaborators: prev.collaborators.filter(c => c.project_id !== projectId)
            }));

            const { error: collabError } = await supabase.from('project_collaborators').delete().eq('project_id', projectId);
            if (collabError) throw collabError;
            
            const { error: projError } = await supabase.from('projects').delete().eq('id', projectId);
            if (projError) throw projError;
            
            toast.success("Group deleted successfully", { icon: '🗑️' });
        } catch (err: any) {
            console.error("Delete Project Error:", err);
            toast.error("Failed to delete group");
        }
    };

    const handleEditProjectClick = (project: any) => {
        setEditingProject(project);
        setEditProjectTitle(project.title);
        setEditProjectCategory(project.category);
        setEditProjectGuide(project.guide_id || '');
    };

    const handleSaveEdit = async () => {
        if (!editingProject) return;
        
        try {
            const guideName = teachers.find(t => t.id === editProjectGuide)?.full_name || 'Unassigned';
            
            const { error } = await supabase
                .from('projects')
                .update({
                    title: editProjectTitle,
                    category: editProjectCategory,
                    guide_id: editProjectGuide,
                    guide_name: guideName !== 'Unassigned' ? guideName : null
                })
                .eq('id', editingProject.id);

            if (error) throw error;
            
            // Update local state optimistically
            setAllotments(prev => ({
                ...prev,
                projects: prev.projects.map(p => p.id === editingProject.id ? {
                    ...p,
                    title: editProjectTitle,
                    category: editProjectCategory,
                    guide_id: editProjectGuide,
                    guide_name: guideName !== 'Unassigned' ? guideName : null
                } : p)
            }));
            
            toast.success("Project updated successfully");
            setEditingProject(null);
        } catch (err) {
            console.error("Update error:", err);
            toast.error("Failed to update project");
        }
    };

    const renderProjectCard = (project: any) => {
        const projectCollabs = allotments.collaborators.filter(c => c.project_id === project.id);
        const projectStudents = projectCollabs.map(c => {
            const sProfile = students.find(s => s.id === c.student_id);
            return {
                id: c.student_id,
                name: sProfile?.full_name || 'Unknown',
                year: sProfile?.academic_year || 'N/A',
                section: sProfile?.section || 'N/A'
            };
        });

        return (
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                key={project.id} 
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => handleDropOnProject(e, project.id)}
                className="bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-slate-900/20 relative overflow-hidden group hover:border-indigo-500/50 transition-colors"
            >
                <div className="absolute top-0 left-0 w-2 h-full bg-indigo-500"></div>
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h3 className="font-bold text-lg text-slate-900 dark:text-white leading-tight">{project.title}</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1 uppercase tracking-wider">{project.category}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${project.status === 'approved' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400'}`}>
                            {project.status}
                        </span>
                        {userRole === 'hod' && (
                            <>
                                <button 
                                    onClick={() => handleEditProjectClick(project)} 
                                    className="p-1.5 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-500 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 rounded-md transition-colors"
                                    title="Edit Group"
                                >
                                    <Edit2 size={16} />
                                </button>
                                <button 
                                    onClick={() => handleDeleteProject(project.id)} 
                                    className="p-1.5 bg-rose-50 dark:bg-rose-900/20 text-rose-500 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/40 rounded-md transition-colors"
                                    title="Delete Group"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </>
                        )}
                    </div>
                </div>
                
                <div className="mb-5 p-3 rounded-xl bg-slate-50 dark:bg-slate-950/50 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                        <BookOpen size={18} />
                    </div>
                    <div>
                        <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Assigned Guide</p>
                        <p className="font-bold text-sm text-slate-800 dark:text-slate-200">{project.guide_name || 'Unassigned'}</p>
                    </div>
                </div>

                <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 ml-1">Team Members ({projectStudents.length})</p>
                    <div className="space-y-2">
                        {projectStudents.map(student => (
                            <div 
                                key={student.id} 
                                draggable
                                onDragStart={(e) => handleDragStart(e, student.id)}
                                className="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 cursor-grab active:cursor-grabbing hover:bg-slate-50 dark:hover:bg-slate-700/80 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-600 dark:text-slate-300">
                                        {student.name[0] || 'U'}
                                    </div>
                                    <div>
                                        <p className="font-bold text-sm text-slate-800 dark:text-slate-200">{student.name}</p>
                                        <p className="text-[10px] text-slate-500 dark:text-slate-400">
                                            {student.year !== 'N/A' ? `${student.year} • Sec ${student.section}` : 'Details Pending'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {projectStudents.length === 0 && (
                            <p className="text-sm text-slate-500 italic p-2">No students assigned.</p>
                        )}
                    </div>
                </div>
            </motion.div>
        );
    };

    if (loading) return <NeuralLoading message="Initializing Allotment Matrix..." />;

    return (
        <div className="min-h-screen bg-[#F8FAFC] dark:bg-transparent font-sans pt-24 pb-12 px-6 relative overflow-hidden">
            
            {/* Neural Success Animation Overlay */}
            <AnimatePresence>
                {showSuccessAnimation && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center bg-indigo-900/40 backdrop-blur-md pointer-events-none"
                    >
                        <motion.div 
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 1.1, opacity: 0 }}
                            transition={{ type: "spring", bounce: 0.5 }}
                            className="flex flex-col items-center bg-white dark:bg-slate-900 p-12 rounded-[3rem] shadow-2xl border border-indigo-500/30 text-center"
                        >
                            <div className="relative mb-6">
                                <motion.div 
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                                    className="absolute -inset-4 rounded-full border-2 border-dashed border-indigo-500 opacity-50"
                                />
                                <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white shadow-[0_0_40px_rgba(99,102,241,0.5)]">
                                    <Cpu size={48} />
                                </div>
                            </div>
                            <h2 className="text-3xl font-black text-slate-800 dark:text-white mb-2">Neural Link Established</h2>
                            <p className="text-indigo-600 dark:text-indigo-400 font-medium">Allotments Synchronized to Matrix</p>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Background Effects */}
            <div className="dark:hidden">
                <BackgroundBlobs />
            </div>
            <div className="fixed inset-0 z-0 pointer-events-none">
                <GridPulse />
                <BentoGrid />
            </div>

            <div className="max-w-6xl mx-auto relative z-10">

                {/* Header */}
                <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="text-center md:text-left">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold uppercase tracking-widest mb-4 border border-indigo-100">
                            <UserPlus size={14} /> Faculty Tools
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-3 tracking-tight">
                            Allotment <span className="text-indigo-600 dark:text-indigo-400">Hub</span>
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 text-lg max-w-2xl">
                            Form student groups, assign topics, and allot faculty guides in one streamlined workflow.
                        </p>
                    </div>
                    {userRole === 'hod' && (
                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl shadow-indigo-500/10 p-6 rounded-3xl flex flex-col items-center justify-center min-w-[200px]">
                            <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-widest mb-2">Pending Allotments</p>
                            <div className="text-5xl font-black bg-gradient-to-br from-indigo-500 to-purple-600 text-transparent bg-clip-text">
                                {pendingAllotmentsCount}
                            </div>
                        </div>
                    )}
                </header>

                {/* Mode Toggle */}
                <div className="flex justify-center mb-8">
                    <div className="bg-slate-200 dark:bg-slate-800 p-1 rounded-2xl inline-flex shadow-inner">
                        <button
                            onClick={() => setAllotmentMode('manual')}
                            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${allotmentMode === 'manual' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                        >
                            Manual Allotment
                        </button>
                        <button
                            onClick={() => setAllotmentMode('auto')}
                            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${allotmentMode === 'auto' ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                        >
                            <Wand2 size={16} /> Smart Auto-Allotment
                        </button>
                    </div>
                </div>

                {allotmentMode === 'manual' ? (
                    <div className="bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl p-8 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-xl max-w-4xl mx-auto">
                        <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-6">Manual Project Grouping</h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            {/* Title & Category */}
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Project Type</label>
                                    <select
                                        value={projectCategory}
                                        onChange={(e) => setProjectCategory(e.target.value as any)}
                                        className="w-full p-3 bg-slate-50 dark:bg-slate-950/50 rounded-xl text-sm border-none focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-white cursor-pointer"
                                    >
                                        <option value="Micro Project">Micro Project</option>
                                        <option value="Mini Project">Mini Project</option>
                                        <option value="Final Year Project">Final Year Project</option>
                                    </select>
                                </div>
                            </div>
                            
                            {/* Year & Guide */}
                            <div className="space-y-4">
                                <div className="flex gap-4">
                                    <div className="flex-1">
                                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Academic Year</label>
                                        <select
                                            value={filterYear}
                                            onChange={(e) => setFilterYear(e.target.value)}
                                            className="w-full p-3 bg-slate-50 dark:bg-slate-950/50 rounded-xl text-sm border-none focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-white cursor-pointer"
                                        >
                                            <option value="">All Years</option>
                                            <option value="1st Year">1st Year</option>
                                            <option value="2nd Year">2nd Year</option>
                                            <option value="3rd Year">3rd Year</option>
                                            <option value="4th Year">4th Year</option>
                                        </select>
                                    </div>
                                    <div className="flex-1">
                                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Section</label>
                                        <select
                                            value={filterSection}
                                            onChange={(e) => setFilterSection(e.target.value)}
                                            className="w-full p-3 bg-slate-50 dark:bg-slate-950/50 rounded-xl text-sm border-none focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-white cursor-pointer"
                                        >
                                            <option value="">All Secs</option>
                                            <option value="Section A">Section A</option>
                                            <option value="Section B">Section B</option>
                                            <option value="Section C">Section C</option>
                                            <option value="Section D">Section D</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Faculty Guide</label>
                                    <select
                                        value={selectedGuide}
                                        onChange={(e) => setSelectedGuide(e.target.value)}
                                        className="w-full p-3 bg-slate-50 dark:bg-slate-950/50 rounded-xl text-sm border-none focus:ring-2 focus:ring-amber-500 text-slate-800 dark:text-white cursor-pointer"
                                    >
                                        <option value="" disabled>Select Faculty Guide...</option>
                                        {teacherLoad.map(t => (
                                            <option key={t.id} value={t.id}>{t.full_name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Student Search */}
                        <div className="mt-8 border-t border-slate-100 dark:border-slate-800 pt-6">
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Select Students</label>
                            <div className="relative mb-4">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onFocus={() => setIsDropdownOpen(true)}
                                    onBlur={() => setTimeout(() => setIsDropdownOpen(false), 200)}
                                    placeholder="Search students by name..."
                                    className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-950/50 rounded-xl text-sm border-none focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-white font-medium"
                                />
                                {isDropdownOpen && (
                                    <div className="absolute z-50 w-full mt-2 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl shadow-2xl max-h-60 overflow-y-auto">
                                        {availableStudents.map(student => (
                                            <div
                                                key={student.id}
                                                onMouseDown={(e) => { e.preventDefault(); toggleStudent(student.id); setSearchQuery(''); }}
                                                className="flex justify-between p-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer border-b border-slate-50 dark:border-slate-700/50"
                                            >
                                                <span className="font-bold text-sm text-slate-800 dark:text-slate-200">{student.full_name}</span>
                                                <span className="text-xs text-slate-500">{student.academic_year || 'No Year'} • Sec {student.section || 'N/A'}</span>
                                            </div>
                                        ))}
                                        {availableStudents.length === 0 && <div className="p-4 text-center text-slate-500 text-sm">No available students match.</div>}
                                    </div>
                                )}
                            </div>

                            {/* Tags */}
                            {selectedStudents.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                    {selectedStudents.map(id => {
                                        const s = students.find(x => x.id === id);
                                        return (
                                            <div key={id} className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/50 rounded-lg text-sm font-bold">
                                                <span>{s?.full_name || 'Unknown'}</span>
                                                <button onClick={() => toggleStudent(id)} className="hover:bg-indigo-200 dark:hover:bg-indigo-800/50 p-0.5 rounded-full"><X size={14} /></button>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Submit */}
                        <div className="mt-8 flex justify-end">
                            <button
                                onClick={handleAddManualGroup}
                                disabled={selectedStudents.length === 0 || !selectedGuide}
                                className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors disabled:opacity-50 shadow-lg shadow-indigo-500/30"
                            >
                                Add Group to List
                            </button>
                        </div>
                    </div>
                ) : (
                    /* Auto-Allotment Mode UI */
                    <div className="space-y-8 max-w-5xl mx-auto">
                        <div className="bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl p-8 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-xl">
                            <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-6">Smart Auto-Allotment Configuration</h2>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Year</label>
                                    <select value={filterYear} onChange={(e) => setFilterYear(e.target.value)} className="w-full p-3 bg-slate-50 dark:bg-slate-950/50 rounded-xl text-sm border-none focus:ring-2 focus:ring-indigo-500 cursor-pointer text-slate-800 dark:text-white">
                                        <option value="">Any</option>
                                        <option value="1st Year">1st Year</option>
                                        <option value="2nd Year">2nd Year</option>
                                        <option value="3rd Year">3rd Year</option>
                                        <option value="4th Year">4th Year</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Section</label>
                                    <select value={filterSection} onChange={(e) => setFilterSection(e.target.value)} className="w-full p-3 bg-slate-50 dark:bg-slate-950/50 rounded-xl text-sm border-none focus:ring-2 focus:ring-indigo-500 cursor-pointer text-slate-800 dark:text-white">
                                        <option value="">Any</option>
                                        <option value="Section A">Section A</option>
                                        <option value="Section B">Section B</option>
                                        <option value="Section C">Section C</option>
                                        <option value="Section D">Section D</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Project Type</label>
                                    <select value={projectCategory} onChange={(e) => setProjectCategory(e.target.value as any)} className="w-full p-3 bg-slate-50 dark:bg-slate-950/50 rounded-xl text-sm border-none focus:ring-2 focus:ring-indigo-500 cursor-pointer text-slate-800 dark:text-white">
                                        <option value="Micro Project">Micro</option>
                                        <option value="Mini Project">Mini</option>
                                        <option value="Final Year Project">Final Year</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Group Size</label>
                                    <input type="number" min="1" max="10" value={autoGroupSize} onChange={(e) => setAutoGroupSize(parseInt(e.target.value) || 4)} className="w-full p-3 bg-slate-50 dark:bg-slate-950/50 rounded-xl text-sm border-none focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-white font-bold" />
                                </div>
                            </div>
                            <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
                                <button onClick={generateMagicGroups} disabled={generatingNames} className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-indigo-500/30 transition-all disabled:opacity-50">
                                    {generatingNames ? <Loader2 size={18} className="animate-spin" /> : <Wand2 size={18} />} Generate Groups
                                </button>
                            </div>
                        </div>

                    </div>
                )}

                {/* Pending Groups Grid (Both Manual & Auto) */}
                {ghostGroups.length > 0 && (
                    <div className="bg-slate-900 rounded-[2rem] p-8 shadow-2xl relative overflow-hidden mt-12 max-w-5xl mx-auto">
                        <div className="absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full blur-3xl opacity-20 pointer-events-none"></div>
                        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 pb-4 border-b border-slate-800 relative z-10 gap-4">
                            <h3 className="text-xl font-bold text-white flex items-center gap-2"><Sparkles className="text-amber-400"/> Pending Groups</h3>
                            <button onClick={handleBulkAllotment} disabled={submitting} className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl font-bold flex items-center gap-2 transition-all disabled:opacity-50 shadow-lg shadow-emerald-500/30">
                                {submitting ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle size={18} />} Final Allotment
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
                            {ghostGroups.map((group, i) => (
                                <div key={group.id} className="bg-slate-800/80 rounded-2xl p-5 border border-slate-700 shadow-lg backdrop-blur-sm">
                                    <input 
                                        value={group.title} 
                                        onChange={(e) => updateGhostGroupTitle(group.id, e.target.value)} 
                                        className="w-full bg-slate-900/50 border border-slate-700/50 rounded-lg p-2.5 text-sm text-white font-bold mb-3 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all placeholder:text-slate-600" 
                                        placeholder="Project Title"
                                    />
                                    <select 
                                        value={group.guide_id} 
                                        onChange={(e) => updateGhostGroupGuide(group.id, e.target.value)} 
                                        className="w-full bg-slate-900/50 border border-slate-700/50 rounded-lg p-2.5 text-sm text-slate-300 mb-4 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all cursor-pointer"
                                    >
                                        <option value="" disabled>Select Faculty Guide...</option>
                                        {teacherLoad.map(t => (
                                            <option key={t.id} value={t.id}>{t.full_name}</option>
                                        ))}
                                    </select>
                                    <div className="space-y-2">
                                        {group.students.map(student => (
                                            <div key={student.id} className="flex justify-between items-center bg-slate-900/40 p-2.5 rounded-lg text-sm text-slate-300 group/student border border-slate-800/50">
                                                <span className="font-medium truncate pr-2">{student.full_name}</span>
                                                <button onClick={() => removeFromGhostGroup(group.id, student.id)} className="text-rose-400 opacity-0 group-hover/student:opacity-100 hover:bg-rose-500/20 p-1 rounded transition-all flex-shrink-0">
                                                    <X size={14}/>
                                                </button>
                                            </div>
                                        ))}
                                        
                                        {unassignedPool.length > 0 && (
                                            <select 
                                                onChange={(e) => {
                                                    if(e.target.value) addToGhostGroup(group.id, e.target.value);
                                                    e.target.value = "";
                                                }}
                                                className="w-full bg-slate-800/50 border border-slate-700 border-dashed rounded-lg p-2 text-sm text-slate-400 focus:outline-none focus:border-indigo-500 cursor-pointer appearance-none text-center mt-2 hover:bg-slate-800 transition-colors"
                                                defaultValue=""
                                            >
                                                <option value="" disabled>+ Add Student</option>
                                                {unassignedPool.map(s => (
                                                    <option key={s.id} value={s.id}>{s.full_name}</option>
                                                ))}
                                            </select>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Edit Modal */}
            <AnimatePresence>
                {editingProject && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm px-4"
                    >
                        <motion.div 
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white dark:bg-slate-900 rounded-[2rem] p-8 max-w-md w-full shadow-2xl border border-slate-100 dark:border-slate-800"
                        >
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Edit Allotment</h3>
                            
                            <div className="space-y-4 mb-6">
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Project Title</label>
                                    <input 
                                        type="text" 
                                        value={editProjectTitle}
                                        onChange={(e) => setEditProjectTitle(e.target.value)}
                                        className="w-full p-3 bg-slate-50 dark:bg-slate-950/50 rounded-xl text-sm border-none focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Category</label>
                                    <select 
                                        value={editProjectCategory}
                                        onChange={(e) => setEditProjectCategory(e.target.value)}
                                        className="w-full p-3 bg-slate-50 dark:bg-slate-950/50 rounded-xl text-sm border-none focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-white"
                                    >
                                        <option value="Micro Project">Micro Project</option>
                                        <option value="Mini Project">Mini Project</option>
                                        <option value="Final Year Project">Final Year Project</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Faculty Guide</label>
                                    <select 
                                        value={editProjectGuide}
                                        onChange={(e) => setEditProjectGuide(e.target.value)}
                                        className="w-full p-3 bg-slate-50 dark:bg-slate-950/50 rounded-xl text-sm border-none focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-white"
                                    >
                                        <option value="" disabled>Select Faculty Guide...</option>
                                        {teacherLoad.map(t => (
                                            <option key={t.id} value={t.id}>{t.full_name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            
                            <div className="flex justify-end gap-3">
                                <button 
                                    onClick={() => setEditingProject(null)}
                                    className="px-5 py-2.5 rounded-xl font-bold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={handleSaveEdit}
                                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-colors"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
