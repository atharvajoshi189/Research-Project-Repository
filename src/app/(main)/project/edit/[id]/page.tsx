"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Save, X, Info, CheckCircle, ArrowLeft, Plus, Trash2, Users, Search, UserPlus } from 'lucide-react';
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
    const [guideId, setGuideId] = useState('');
    const [academicYear, setAcademicYear] = useState('2024-2025');
    const [status, setStatus] = useState(''); // Added status state
    const [teachers, setTeachers] = useState<any[]>([]);

    // Collaborators
    const [collaborators, setCollaborators] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [loadingCollaborators, setLoadingCollaborators] = useState(false);

    useEffect(() => {
        const fetchTeachers = async () => {
            const { data } = await supabase
                .from('profiles')
                .select('id, full_name')
                .in('role', ['teacher', 'hod', 'HOD']);
            setTeachers(data || []);
        };
        fetchTeachers();
    }, []);

    // --- Persistence Logic ---
    const draftKey = `project_draft_${projectId}`;

    // Auto-save to localStorage
    useEffect(() => {
        if (!projectId || loading) return; // Don't save empty/loading state

        const draftData = {
            title,
            abstract,
            category,
            techStack,
            reportLink,
            githubLink,
            guideName,
            guideId,
            academicYear
        };

        localStorage.setItem(draftKey, JSON.stringify(draftData));
    }, [title, abstract, category, techStack, reportLink, githubLink, guideName, guideId, academicYear, projectId, loading]);

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

            // 3. Authorization Check
            if (project.student_id !== session.user.id) {
                setUnauthorized(true);
                setLoading(false);
                return;
            }

            // 4. Pre-fill Form (DB Data)
            let initialData = {
                title: project.title || '',
                abstract: project.abstract || '',
                category: project.category || 'Final Year Project',
                techStack: [] as string[],
                reportLink: project.pdf_url || '',
                githubLink: project.github_url || '',
                guideName: project.guide_name || '',
                guideId: project.guide_id || '',
                academicYear: project.academic_year || '2024-2025'
            };

            if (Array.isArray(project.tech_stack)) {
                initialData.techStack = project.tech_stack;
            } else if (typeof project.tech_stack === 'string') {
                initialData.techStack = project.tech_stack.split(',').map((t: string) => t.trim()).filter(Boolean);
            }

            // 5. Check LocalStorage for Draft
            const savedDraft = localStorage.getItem(draftKey);
            if (savedDraft) {
                try {
                    const parsedDraft = JSON.parse(savedDraft);
                    // Use draft data if available, otherwise fall back to DB data
                    // Note: We blindly prefer the draft here as per user request to "not lose changes"
                    initialData = { ...initialData, ...parsedDraft };
                    toast("Restored unsaved changes", { icon: '📝' });
                } catch (e) {
                    console.error("Failed to parse draft", e);
                }
            }

            // Apply Data to State
            setTitle(initialData.title);
            setAbstract(initialData.abstract);
            setCategory(initialData.category);
            setTechStack(initialData.techStack);
            setReportLink(initialData.reportLink);
            setGithubLink(initialData.githubLink);
            setGuideName(initialData.guideName);
            setGuideId(initialData.guideId);
            setAcademicYear(initialData.academicYear);
            setStatus(project.status || '');

            setStatus(project.status || '');

            // Fetch collaborators
            await fetchCollaborators(projectId);

            setLoading(false);
        };

        if (projectId) fetchProject();
    }, [projectId, router]);

    // Search Users
    useEffect(() => {
        const searchUsers = async () => {
            if (!searchQuery.trim()) {
                setSearchResults([]);
                return;
            }

            console.log("🔍 Searching users for:", searchQuery);

            const { data, error } = await supabase
                .from('profiles')
                .select('id, full_name, role')
                .ilike('full_name', `%${searchQuery}%`)
                .eq('role', 'student') // Only search students
                .limit(5);

            if (error) {
                console.error("❌ Search Error:", error);
                return;
            }

            console.log("✅ Search Results (Raw):", data);

            // Filter out existing collaborators and current user
            const filtered = (data || []).filter(u =>
                !collaborators.some(c => c.student_id === u.id) &&
                u.id !== params.id // Ideally check against current session user, but this is okay for now
            );

            console.log("✅ Search Results (Filtered):", filtered);
            setSearchResults(filtered);
        };

        const timeoutId = setTimeout(searchUsers, 300);
        return () => clearTimeout(timeoutId);
    }, [searchQuery, collaborators]);

    // Fetch collaborators - Robust 2-step approach
    const fetchCollaborators = async (pId: string) => {
        setLoadingCollaborators(true);
        console.log("🔄 Fetching collaborators for Project ID:", pId);
        try {
            // 1. Get IDs
            console.log("Step 1: Fetching collaborator IDs...");
            const { data, error } = await supabase
                .from('project_collaborators')
                .select('id, student_id, role')
                .eq('project_id', pId);

            if (error) {
                console.error("❌ Step 1 Error (project_collaborators):", error);
                // If it's the recursion error, provide a specific helpful message
                if (error.message?.includes('Infinite recursion')) {
                    toast.error("Database policy error: Infinite recursion detected. Please run the fix script.");
                }
                throw error;
            }
            console.log("✅ Step 1 Success, data:", data);

            if (data && data.length > 0) {
                const studentIds = data.map(c => c.student_id);
                console.log("Step 2: Fetching profiles for IDs:", studentIds);

                // 2. Get Profiles
                const { data: profileData, error: profileError } = await supabase
                    .from('profiles')
                    .select('id, full_name')
                    .in('id', studentIds);

                if (profileError) {
                    console.error("❌ Step 2 Error (profiles):", profileError);
                    throw profileError;
                }
                console.log("✅ Step 2 Success, profiles:", profileData);

                // 3. Merge
                const merged = data.map(collaborator => ({
                    ...collaborator,
                    profiles: profileData?.find(p => p.id === collaborator.student_id)
                }));

                setCollaborators(merged);
            } else {
                setCollaborators([]);
            }
        } catch (error: any) {
            console.error("💥 Failed to fetch collaborators FULL ERROR:", error);
            console.error("💥 Error Message:", error.message);
            console.error("💥 Error Details:", error.details);
            console.error("💥 Error Hint:", error.hint);
            toast.error("Failed to load collaborators");
        } finally {
            setLoadingCollaborators(false);
        }
    };

    // Add collaborator
    const handleAddCollaborator = async (user: any) => {
        setLoadingCollaborators(true);
        try {
            // Check if already a collaborator (double check)
            if (collaborators.some(c => c.student_id === user.id)) {
                toast.error("Already a collaborator");
                setLoadingCollaborators(false);
                return;
            }

            // Add collaborator
            const { error } = await supabase
                .from('project_collaborators')
                .insert({
                    project_id: projectId,
                    student_id: user.id,
                    role: 'contributor'
                });

            if (error) throw error;

            toast.success(`${user.full_name} added!`);
            setSearchQuery('');
            setSearchResults([]);
            await fetchCollaborators(projectId);
        } catch (error: any) {
            console.error("Error adding collaborator:", error);
            if (error.message?.includes('Infinite recursion')) {
                toast.error("Fixed needed: Infinite recursion in database policy.");
            } else {
                toast.error(error.message || "Failed to add collaborator");
            }
        } finally {
            setLoadingCollaborators(false);
        }
    };

    // Remove collaborator
    const handleRemoveCollaborator = async (collaboratorId: number) => {
        setLoadingCollaborators(true);
        try {
            const { error } = await supabase
                .from('project_collaborators')
                .delete()
                .eq('id', collaboratorId);

            if (error) throw error;

            toast.success("Collaborator removed");
            await fetchCollaborators(projectId);
        } catch (error: any) {
            console.error("Error removing collaborator:", error);
            toast.error(error.message || "Failed to remove collaborator");
        } finally {
            setLoadingCollaborators(false);
        }
    };

    // --- Form Handlers ---

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
        const loadingToast = toast.loading(status === 'rejected' ? 'Re-uploading project...' : 'Saving changes...');

        try {
            const updates: any = {
                title,
                abstract,
                category,
                tech_stack: techStack,
                pdf_url: reportLink,
                github_url: githubLink,
                guide_name: guideName,
                guide_id: guideId && guideId.trim() ? guideId : null,
                academic_year: academicYear
            };

            // IF the project was rejected, reset status to 'pending' so it goes back to HOD
            if (status === 'rejected') {
                updates.status = 'pending';
            }

            console.log("📤 Updating Project:", { projectId, updates });

            // Use simple update without .select() to avoid hang
            const { error } = await supabase
                .from('projects')
                .update(updates)
                .eq('id', projectId);

            if (error) {
                console.error("❌ Database Error:", error);
                throw error;
            }

            console.log("✅ Update successful!");

            // Clear draft on success
            localStorage.removeItem(draftKey);

            // Dismiss loading toast
            toast.dismiss(loadingToast);

            // Show success toast
            toast.success(status === 'rejected' ? "🎉 Project re-submitted for approval!" : "✅ Changes saved successfully!");

            // Redirect after short delay
            setTimeout(() => {
                router.push('/dashboard');
            }, 1500);

        } catch (error: any) {
            console.error("❌ Update error:", error);
            toast.dismiss(loadingToast);

            const errorMsg = error?.message || error?.error_description || "Failed to update project";
            console.error("Error details:", {
                message: errorMsg,
                code: error?.code,
                status: error?.status,
                fullError: error
            });

            toast.error(`Error: ${errorMsg}`);
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

                        {/* Team Members */}
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Team Members</label>

                            {/* Search Area */}
                            <div className="relative mb-4">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search student by name..."
                                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-teal-500/20 font-bold text-slate-800 placeholder:text-slate-300 outline-none"
                                />

                                {/* Dropdown */}
                                {searchResults.length > 0 && (
                                    <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-slate-100 z-50 max-h-60 overflow-y-auto">
                                        {searchResults.map((user: any) => (
                                            <button
                                                key={user.id}
                                                onClick={() => handleAddCollaborator(user)}
                                                className="w-full text-left px-4 py-3 hover:bg-teal-50 flex items-center gap-3 transition-colors"
                                            >
                                                <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-bold text-xs">
                                                    {user.full_name?.charAt(0) || '?'}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-slate-800">{user.full_name || 'Unknown'}</p>
                                                    <p className="text-xs text-slate-400">Student</p>
                                                </div>
                                                <UserPlus size={16} className="ml-auto text-teal-500" />
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Collaborators List */}
                            <div className="flex flex-wrap gap-3">
                                {collaborators.map((member) => (
                                    <div key={member.id} className="flex items-center gap-2 pl-2 pr-4 py-2 bg-white border border-slate-200 rounded-full shadow-sm">
                                        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs">
                                            {member.profiles?.full_name?.charAt(0) || '?'}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-xs font-bold text-slate-700 leading-tight">{member.profiles?.full_name}</span>
                                            <span className="text-[10px] text-slate-400 leading-tight">Contributor</span>
                                        </div>
                                        <button
                                            onClick={() => handleRemoveCollaborator(member.id)}
                                            disabled={loadingCollaborators}
                                            className="ml-2 text-slate-400 hover:text-red-500 transition-colors p-1"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                ))}
                                {collaborators.length === 0 && (
                                    <div className="w-full text-center p-4 border border-dashed border-slate-200 rounded-2xl text-slate-400 text-sm">
                                        No team members added yet.
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Guide Name */}
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Guide Name</label>
                            <select
                                value={guideId}
                                onChange={(e) => {
                                    const selectedId = e.target.value;
                                    setGuideId(selectedId);
                                    const selectedTeacher = teachers.find(t => t.id === selectedId);
                                    if (selectedTeacher) {
                                        setGuideName(selectedTeacher.full_name);
                                    }
                                }}
                                className="w-full p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-teal-500/20 font-bold text-slate-800 outline-none cursor-pointer appearance-none"
                            >
                                <option value="" disabled>Select a Faculty Guide</option>
                                {teachers.map((teacher: any) => (
                                    <option key={teacher.id} value={teacher.id}>
                                        {teacher.full_name}
                                    </option>
                                ))}
                            </select>
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
                                {saving ? (status === 'rejected' ? 'Re-uploading...' : 'Saving...') : (status === 'rejected' ? 'Re-upload Project' : 'Save Changes')} <Save size={20} />
                            </button>
                        </div>

                    </div>
                </motion.div>
            </div>
        </div>
    );
}
