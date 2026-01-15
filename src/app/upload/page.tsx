"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadCloud, FileText, Users, CheckCircle, X, Search, UserPlus, Info } from 'lucide-react';
import toast from 'react-hot-toast';

export default function UploadProject() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState<any>(null);

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

    // Collaborator State
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [selectedMembers, setSelectedMembers] = useState<any[]>([]);

    useEffect(() => {
        const checkUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                toast.error("Please login to upload");
                router.push('/login');
                return;
            }
            setUser(session.user);
            // Add self as first member (Leader)
            if (session.user) {
                // Fetch own profile to get the name
                const { data } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
                if (data) setSelectedMembers([data]);
            }
        };
        checkUser();
    }, []);

    // Search Users
    useEffect(() => {
        const searchUsers = async () => {
            if (searchQuery.length < 2) {
                setSearchResults([]);
                return;
            }
            const { data } = await supabase
                .from('profiles')
                .select('*')
                .ilike('full_name', `%${searchQuery}%`) // Search by name
                .limit(5);

            // Filter out already selected members
            const filtered = data?.filter((p: any) => !selectedMembers.some(m => m.id === p.id)) || [];
            setSearchResults(filtered);
        };
        const debounce = setTimeout(searchUsers, 300);
        return () => clearTimeout(debounce);
    }, [searchQuery, selectedMembers]);

    const addMember = (member: any) => {
        if (selectedMembers.length >= 9) {
            toast.error("Max 9 members allowed");
            return;
        }
        setSelectedMembers([...selectedMembers, member]);
        setSearchQuery('');
        setSearchResults([]);
    };

    const removeMember = (id: string) => {
        if (id === user?.id) {
            toast.error("You cannot remove yourself (Leader)");
            return;
        }
        setSelectedMembers(selectedMembers.filter(m => m.id !== id));
    };

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

    const handleSubmit = async () => {
        if (!title || !abstract || !reportLink || !guideName || selectedMembers.length === 0) {
            toast.error("Please fill all required fields");
            return;
        }

        setLoading(true);
        try {
            // 1. Insert Project
            // We map selected profile names to the 'authors' array for display
            const authorNames = selectedMembers.map(m => m.full_name || m.email);

            const { data: projectData, error: projectError } = await supabase
                .from('projects')
                .insert({
                    title,
                    abstract,
                    category,
                    authors: authorNames, // Backward compatibility
                    tech_stack: techStack,
                    pdf_url: reportLink,
                    github_url: githubLink,
                    guide_name: guideName,
                    status: 'pending', // Pending approval
                    student_id: user.id, // Original owner ID
                    academic_year: academicYear
                })
                .select()
                .single();

            if (projectError) throw projectError;

            // 2. Insert Collaborators
            if (projectData) {
                // Ensure leader is included
                const uniqueMembers = Array.from(new Map(selectedMembers.map(m => [m.id, m])).values());
                if (!uniqueMembers.some(m => m.id === user.id)) {
                    // Leader missing? Should not happen due to useEffect, but safety first
                    // We can't fetch easily here without async, best to rely on current 'user' object if profile missing
                    // But strictly speaking, we need the profile for compatibility?
                    // Actually, we only need user.id for the insert.
                }

                // Better strategy: Just map selectedMembers, assuming useEffect added the leader. 
                // But user explicitly asked "Ensure the Leader... is also inserted".

                const collaborators = selectedMembers.map(member => ({
                    project_id: projectData.id,
                    student_id: member.id, // Explicitly using student_id
                    role: member.id === user.id ? 'leader' : 'contributor',
                    status: member.id === user.id ? 'accepted' : 'pending'
                }));

                const { error: collabError } = await supabase
                    .from('project_collaborators')
                    .insert(collaborators);

                if (collabError) {
                    console.error("Collaborator error:", collabError);
                    toast.error("Project created but failed to add some team members.");
                }
            }

            toast.success("Project submitted successfully!");
            router.push('/dashboard');

        } catch (error: any) {
            toast.error(error.message || "Upload failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4 font-sans text-slate-900">

            {/* Background Gradients */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute -top-[20%] -right-[10%] w-[70vw] h-[70vw] bg-teal-50 rounded-full blur-[100px] opacity-60"></div>
                <div className="absolute -bottom-[20%] -left-[10%] w-[70vw] h-[70vw] bg-blue-50 rounded-full blur-[100px] opacity-60"></div>
            </div>

            <div className="w-full max-w-4xl relative z-10">
                {/* Header */}
                <div className="mb-10 text-center">
                    <h1 className="text-4xl font-black text-slate-900 mb-3 tracking-tight">Upload Project</h1>
                    <p className="text-slate-500 font-medium">Share your innovation with the world.</p>
                </div>

                {/* Main Card */}
                <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-white p-8 md:p-12">

                    {/* Stepper */}
                    <div className="flex justify-between items-center mb-12 relative px-4">
                        <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-slate-100 -z-10"></div>
                        <div className={`relative flex flex-col items-center gap-2 ${step >= 1 ? 'text-teal-600' : 'text-slate-300'}`}>
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-bold transition-all duration-500 ${step >= 1 ? 'bg-teal-500 text-white shadow-lg shadow-teal-200' : 'bg-white border-2 border-slate-100'}`}>1</div>
                            <span className="text-xs font-bold uppercase tracking-wider bg-white px-2">Details</span>
                        </div>
                        <div className={`relative flex flex-col items-center gap-2 ${step >= 2 ? 'text-teal-600' : 'text-slate-300'}`}>
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-bold transition-all duration-500 ${step >= 2 ? 'bg-teal-500 text-white shadow-lg shadow-teal-200' : 'bg-white border-2 border-slate-100'}`}>2</div>
                            <span className="text-xs font-bold uppercase tracking-wider bg-white px-2">Team</span>
                        </div>
                        <div className={`relative flex flex-col items-center gap-2 ${step >= 3 ? 'text-teal-600' : 'text-slate-300'}`}>
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-bold transition-all duration-500 ${step >= 3 ? 'bg-teal-500 text-white shadow-lg shadow-teal-200' : 'bg-white border-2 border-slate-100'}`}>3</div>
                            <span className="text-xs font-bold uppercase tracking-wider bg-white px-2">Submit</span>
                        </div>
                    </div>

                    {/* Step 1: Project Details */}
                    {step === 1 && (
                        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Project Title</label>
                                <input suppressHydrationWarning type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-teal-500/20 font-bold text-slate-800 placeholder:text-slate-300 outline-none transition-all" placeholder="e.g. AI Based Traffic Control" />
                            </div>
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
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Abstract</label>
                                <textarea value={abstract} onChange={(e) => setAbstract(e.target.value)} rows={5} className="w-full p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-teal-500/20 font-medium text-slate-700 placeholder:text-slate-300 outline-none transition-all resize-none" placeholder="Brief description of your project..."></textarea>
                            </div>
                            <div className="flex justify-end pt-4">
                                <button onClick={() => setStep(2)} className="px-8 py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 hover:scale-[1.02] transition-all flex items-center gap-2">
                                    Next Step <Users size={18} />
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {/* Step 2: Team & Tech */}
                    {step === 2 && (
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">

                            {/* Team Members Search */}
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Add Team Members</label>
                                <div className="relative">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <input
                                        suppressHydrationWarning
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-teal-500/20 font-medium text-slate-800 placeholder:text-slate-300 outline-none"
                                        placeholder="Search by student name..."
                                    />

                                    {/* Search Results Dropdown */}
                                    {searchResults.length > 0 && (
                                        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-slate-100 z-50 overflow-hidden">
                                            {searchResults.map((member: any) => (
                                                <button
                                                    key={member.id}
                                                    onClick={() => addMember(member)}
                                                    className="w-full text-left px-4 py-3 hover:bg-teal-50 flex items-center gap-3 transition-colors"
                                                >
                                                    <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-bold text-xs">
                                                        {member.full_name?.charAt(0) || member.email.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-slate-800">{member.full_name || 'Unknown'}</p>
                                                        <p className="text-xs text-slate-400">{member.email}</p>
                                                    </div>
                                                    <UserPlus size={16} className="ml-auto text-teal-500" />
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Selected Members Pills */}
                                <div className="flex flex-wrap gap-3 mt-4">
                                    {selectedMembers.map((member) => (
                                        <div key={member.id} className="flex items-center gap-2 pl-2 pr-4 py-1.5 bg-white border border-slate-200 rounded-full shadow-sm">
                                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white ${member.id === user?.id ? 'bg-slate-900' : 'bg-teal-500'}`}>
                                                {member.full_name?.charAt(0) || '?'}
                                            </div>
                                            <span className="text-sm font-bold text-slate-700">
                                                {member.full_name} {member.id === user?.id && '(Leader)'}
                                            </span>
                                            {member.id !== user?.id && (
                                                <button onClick={() => removeMember(member.id)} className="text-slate-400 hover:text-red-500 transition-colors">
                                                    <X size={14} />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                    {selectedMembers.length === 0 && (
                                        <span className="text-sm text-slate-400 italic">No members selected (You will be the leader)</span>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Project Guide Name</label>
                                <input suppressHydrationWarning type="text" value={guideName} onChange={(e) => setGuideName(e.target.value)} className="w-full p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-teal-500/20 font-bold text-slate-800 placeholder:text-slate-300 outline-none transition-all" placeholder="e.g. Prof. R. K. Patil" />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Tech Stack</label>
                                <div className="flex flex-col gap-3">
                                    <div className="relative flex items-center gap-2">
                                        <input
                                            suppressHydrationWarning
                                            type="text"
                                            value={currentTech}
                                            onChange={(e) => setCurrentTech(e.target.value)}
                                            onKeyDown={handleTechKeyDown}
                                            className="w-full p-4 pr-14 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-teal-500/20 font-bold text-slate-800 placeholder:text-slate-300 outline-none"
                                            placeholder="Type and press Enter (e.g. React, Python)"
                                        />
                                        <button
                                            onClick={addPendingTech}
                                            className="absolute right-2 p-2 bg-white text-teal-600 rounded-xl shadow-sm hover:bg-teal-50 transition-colors"
                                            title="Add Tech"
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

                            <div className="flex justify-between pt-4">
                                <button onClick={() => setStep(1)} className="px-8 py-4 text-slate-500 font-bold hover:bg-slate-50 rounded-2xl transition-all">Back</button>
                                <button
                                    onClick={() => {
                                        addPendingTech();
                                        setStep(3);
                                    }}
                                    className="px-8 py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 hover:scale-[1.02] transition-all flex items-center gap-2"
                                >
                                    Final Details <UploadCloud size={18} />
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {/* Step 3: Links & Submit */}
                    {step === 3 && (
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex items-start gap-3">
                                <Info className="text-blue-500 shrink-0 mt-0.5" size={20} />
                                <p className="text-sm text-blue-700 font-medium">Please host your report on Google Drive (Public Link) and source code on GitHub. We only store links to save storage.</p>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Project Report (Drive Link)</label>
                                <input suppressHydrationWarning type="url" value={reportLink} onChange={(e) => setReportLink(e.target.value)} className="w-full p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-teal-500/20 font-bold text-slate-800 placeholder:text-slate-300 outline-none" placeholder="https://drive.google.com/..." />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">GitHub Repository</label>
                                <input suppressHydrationWarning type="url" value={githubLink} onChange={(e) => setGithubLink(e.target.value)} className="w-full p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-teal-500/20 font-bold text-slate-800 placeholder:text-slate-300 outline-none" placeholder="https://github.com/..." />
                            </div>

                            <div className="flex justify-between pt-8">
                                <button onClick={() => setStep(2)} className="px-8 py-4 text-slate-500 font-bold hover:bg-slate-50 rounded-2xl transition-all">Back</button>
                                <button
                                    onClick={handleSubmit}
                                    disabled={loading}
                                    className="flex-1 ml-4 py-4 bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-bold rounded-2xl hover:shadow-xl hover:shadow-teal-200 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                                >
                                    {loading ? 'Publishing...' : 'Publish Project'} <CheckCircle size={20} />
                                </button>
                            </div>
                        </motion.div>
                    )}

                </div>
            </div>
        </div>
    );
}
