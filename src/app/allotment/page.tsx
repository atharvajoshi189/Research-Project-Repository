"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { motion } from 'framer-motion';
import { Users, UserPlus, BookOpen, ChevronRight, CheckCircle, AlertCircle, Sparkles } from 'lucide-react';
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

    // Data State
    const [students, setStudents] = useState<any[]>([]);
    const [teachers, setTeachers] = useState<any[]>([]);

    // Form State
    const [projectTitle, setProjectTitle] = useState('');
    const [projectCategory, setProjectCategory] = useState<'Micro Project' | 'Mini Project' | 'Final Year Project'>('Micro Project');
    const [selectedStudents, setSelectedStudents] = useState<string[]>([]); // Student IDs
    const [selectedGuide, setSelectedGuide] = useState<string>(''); // Teacher ID

    useEffect(() => {
        const fetchData = async () => {
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

                // 2. Fetch Users
                const { data: allProfiles, error } = await supabase
                    .from('profiles')
                    .select('id, full_name, role, email');

                if (error) throw error;

                // Filter
                const studentList = allProfiles?.filter(p => p.role === 'student') || [];
                const teacherList = allProfiles?.filter(p => p.role === 'teacher' || p.role === 'faculty') || [];

                setStudents(studentList);
                setTeachers(teacherList);

            } catch (err: any) {
                console.error("Error fetching allotment data:", err);
                toast.error("Failed to load data.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

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

    const handleAllotment = async () => {
        if (!projectTitle.trim() || selectedStudents.length === 0 || !selectedGuide) {
            toast.error("Please fill all fields.");
            return;
        }

        setSubmitting(true);
        try {
            const guideName = teachers.find(t => t.id === selectedGuide)?.full_name || 'Unknown Guide';
            const studentNames = students.filter(s => selectedStudents.includes(s.id)).map(s => s.full_name);

            // 1. Create Project
            const { data: projectData, error: projectError } = await supabase
                .from('projects')
                .insert({
                    title: projectTitle,
                    category: projectCategory,
                    guide_id: selectedGuide,
                    guide_name: guideName,
                    status: 'approved', // Auto-approve as it's faculty created
                    authors: studentNames, // Legacy Array
                    academic_year: '2025-2026' // Default or Form Field
                })
                .select()
                .single();

            if (projectError) throw projectError;

            // 2. Add Collaborators (The actual linkage)
            const collaborators = selectedStudents.map(studentId => ({
                project_id: projectData.id,
                student_id: studentId,
                role: 'member', // First one could be leader, logic optional
                status: 'accepted' // Auto-accept
            }));

            // Mark first student as leader for simplicity
            if (collaborators[0]) collaborators[0].role = 'leader';

            const { error: collabError } = await supabase
                .from('project_collaborators')
                .insert(collaborators);

            if (collabError) throw collabError;

            toast.success("Allotment Complete!", { icon: '✨' });

            // Reset Form
            setProjectTitle('');
            setSelectedStudents([]);
            // Don't reset guide (might want to allot multiple to self)

        } catch (err: any) {
            console.error("Allotment Error:", err);
            toast.error("Failed to allot group.");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <NeuralLoading message="Initializing Allotment Matrix..." />;

    return (
        <div className="min-h-screen bg-[#F8FAFC] font-sans pt-24 pb-12 px-6 relative overflow-hidden">
            {/* Background Effects */}
            <BackgroundBlobs />
            <div className="fixed inset-0 z-0 pointer-events-none">
                <GridPulse />
                <BentoGrid />
            </div>

            <div className="max-w-6xl mx-auto relative z-10">

                {/* Header */}
                <header className="mb-10 text-center md:text-left">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold uppercase tracking-widest mb-4 border border-indigo-100">
                        <UserPlus size={14} /> Faculty Tools
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-3 tracking-tight">
                        Allotment <span className="text-indigo-600">Hub</span>
                    </h1>
                    <p className="text-slate-500 text-lg max-w-2xl">
                        Form student groups, assign topics, and allot faculty guides in one streamlined workflow.
                    </p>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* LEFT: FORM Form */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* 1. Project Details */}
                        <section className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50 relative overflow-hidden group">
                            <BentoGrid className="opacity-20" />
                            <div className="absolute top-0 left-0 w-2 h-full bg-indigo-500"></div>
                            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                                <span className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-sm">1</span>
                                Project Definition
                            </h2>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Project Title / Topic</label>
                                    <input
                                        type="text"
                                        value={projectTitle}
                                        onChange={(e) => setProjectTitle(e.target.value)}
                                        placeholder="e.g. AI Based Traffic Management System"
                                        className="w-full p-4 bg-slate-50 border-none rounded-xl text-slate-800 font-bold focus:ring-2 focus:ring-indigo-500 transition-all placeholder:font-normal"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Category</label>
                                    <div className="flex flex-wrap gap-3">
                                        {['Micro Project', 'Mini Project', 'Final Year Project'].map((cat) => (
                                            <button
                                                key={cat}
                                                onClick={() => setProjectCategory(cat as any)}
                                                className={`px-4 py-2 rounded-xl text-sm font-bold border-2 transition-all
                                                    ${projectCategory === cat
                                                        ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                                                        : 'border-slate-100 bg-white text-slate-500 hover:border-indigo-200'
                                                    }
                                                `}
                                            >
                                                {cat}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* 2. Group Formation */}
                        <section className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50 relative overflow-hidden">
                            <BentoGrid className="opacity-20" />
                            <div className="absolute top-0 left-0 w-2 h-full bg-teal-500"></div>
                            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                                <span className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center text-teal-600 text-sm">2</span>
                                Student Group
                            </h2>

                            <div className="mb-4">
                                <input
                                    type="text"
                                    placeholder="Search students..."
                                    className="w-full p-3 bg-slate-50 rounded-xl text-sm border-none focus:ring-2 focus:ring-teal-500"
                                />
                            </div>

                            <div className="max-h-60 overflow-y-auto pr-2 space-y-2 custom-scrollbar">
                                {students.map(student => (
                                    <div
                                        key={student.id}
                                        onClick={() => toggleStudent(student.id)}
                                        className={`flex items-center justify-between p-3 rounded-xl cursor-pointer border transition-all
                                            ${selectedStudents.includes(student.id)
                                                ? 'bg-teal-50 border-teal-500'
                                                : 'bg-white border-slate-100 hover:border-slate-300'
                                            }
                                        `}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">
                                                {student.full_name?.[0] || 'S'}
                                            </div>
                                            <div>
                                                <p className="font-bold text-sm text-slate-800">{student.full_name}</p>
                                                <p className="text-[10px] text-slate-400">{student.email}</p>
                                            </div>
                                        </div>
                                        {selectedStudents.includes(student.id) && <CheckCircle size={18} className="text-teal-600" />}
                                    </div>
                                ))}
                            </div>
                            <p className="text-right text-xs text-slate-400 mt-2 font-medium">Selected: {selectedStudents.length} / 4</p>
                        </section>

                    </div>


                    {/* RIGHT: Guide & Confirm */}
                    <div className="space-y-6">

                        {/* 3. Guide Selection */}
                        <section className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50 relative overflow-hidden">
                            <BentoGrid className="opacity-20" />
                            <div className="absolute top-0 left-0 w-2 h-full bg-amber-500"></div>
                            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                                <span className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 text-sm">3</span>
                                Faculty Guide
                            </h2>

                            <select
                                value={selectedGuide}
                                onChange={(e) => setSelectedGuide(e.target.value)}
                                className="w-full p-4 bg-slate-50 border-none rounded-xl text-slate-800 font-bold focus:ring-2 focus:ring-amber-500 appearance-none cursor-pointer"
                            >
                                <option value="" disabled>Select a Guide...</option>
                                {teachers.map(t => (
                                    <option key={t.id} value={t.id}>{t.full_name}</option>
                                ))}
                            </select>
                        </section>

                        {/* Summary & Action */}
                        <div className="bg-slate-900 p-8 rounded-[2rem] text-white shadow-2xl relative overflow-hidden">
                            <BentoGrid className="bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] opacity-10" />
                            <div className="absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full blur-3xl opacity-50"></div>

                            <h3 className="text-lg font-bold mb-4 relative z-10">Access Summary</h3>
                            <div className="space-y-2 mb-8 relative z-10 text-slate-300 text-sm">
                                <div className="flex justify-between">
                                    <span>Type</span>
                                    <span className="font-bold text-white">{projectCategory}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Team Size</span>
                                    <span className="font-bold text-white">{selectedStudents.length} Students</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Guide</span>
                                    <span className="font-bold text-white">{teachers.find(t => t.id === selectedGuide)?.full_name || 'Not Selected'}</span>
                                </div>
                            </div>

                            <button
                                onClick={handleAllotment}
                                disabled={submitting}
                                className="w-full py-4 bg-white text-slate-900 rounded-xl font-black text-lg hover:bg-indigo-50 transition-all flex items-center justify-center gap-2 shadow-lg relative z-10 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {submitting ? (
                                    <span className="animate-pulse">Allotting...</span>
                                ) : (
                                    <>
                                        <Sparkles size={18} className="text-amber-500" /> Confirm Allotment
                                    </>
                                )}
                            </button>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}
