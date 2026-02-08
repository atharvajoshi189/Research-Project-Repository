"use client";

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { UploadCloud, FileText, Users, CheckCircle, X, Search, UserPlus, Info, ChevronUp, ChevronDown, Rocket, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import SuccessParticleBurst from "@/components/SuccessParticleBurst";

export default function UploadProject() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [isLoaded, setIsLoaded] = useState(false);

    // 3D Card Refs & Motion Values
    const cardRef = useRef<HTMLDivElement>(null);
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const mouseX = useSpring(x, { stiffness: 500, damping: 100 });
    const mouseY = useSpring(y, { stiffness: 500, damping: 100 });
    const rotateX = useTransform(mouseY, [-0.5, 0.5], ["7deg", "-7deg"]);
    const rotateY = useTransform(mouseX, [-0.5, 0.5], ["-7deg", "7deg"]);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!cardRef.current) return;
        const rect = cardRef.current.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;
        const mX = e.clientX - rect.left;
        const mY = e.clientY - rect.top;
        const xPct = mX / width - 0.5;
        const yPct = mY / height - 0.5;
        x.set(xPct);
        y.set(yPct);
    };

    const handleMouseLeave = () => {
        x.set(0);
        y.set(0);
    };

    // Form Data
    const [title, setTitle] = useState('');
    const [abstract, setAbstract] = useState('');
    const [category, setCategory] = useState('Final Year Project');
    const [techStack, setTechStack] = useState<string[]>([]);
    const [currentTech, setCurrentTech] = useState('');
    const [reportLink, setReportLink] = useState('');
    const [githubLink, setGithubLink] = useState('');
    const [guideName, setGuideName] = useState('');
    const [guideId, setGuideId] = useState(''); // New State for Guide ID
    const [academicYear, setAcademicYear] = useState('2024-2025');
    const [teachers, setTeachers] = useState<any[]>([]);
    const [loadingTeachers, setLoadingTeachers] = useState(false);
    const [isTeacherDropdownOpen, setIsTeacherDropdownOpen] = useState(false);

    // Collaborator State
    // Collaborator State
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [selectedMembers, setSelectedMembers] = useState<any[]>([]);

    // Transition State
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    // Animated Step Transition Handler
    const handleAppTransition = async (nextStep: number, callback?: () => void) => {
        if (callback) callback();
        setIsTransitioning(true);
        // Wait for animation (expand -> spin)
        await new Promise(resolve => setTimeout(resolve, 800));
        setStep(nextStep);
        setIsTransitioning(false);
    };

    // Load draft from localStorage on mount
    useEffect(() => {
        const savedDraft = localStorage.getItem('upload_project_draft');
        if (savedDraft) {
            try {
                const parsed = JSON.parse(savedDraft);
                if (parsed.step) setStep(parsed.step);
                if (parsed.title) setTitle(parsed.title);
                if (parsed.abstract) setAbstract(parsed.abstract);
                if (parsed.category) setCategory(parsed.category);
                if (parsed.techStack) setTechStack(parsed.techStack);
                if (parsed.reportLink) setReportLink(parsed.reportLink);
                if (parsed.githubLink) setGithubLink(parsed.githubLink);
                if (parsed.guideName) setGuideName(parsed.guideName);
                if (parsed.guideId) setGuideId(parsed.guideId);
                if (parsed.academicYear) setAcademicYear(parsed.academicYear);
                if (parsed.selectedMembers) setSelectedMembers(parsed.selectedMembers);
            } catch (e) {
                console.error("Failed to parse draft", e);
            }
        }
        setIsLoaded(true);
    }, []);

    // Save draft to localStorage on change
    useEffect(() => {
        if (!isLoaded) return;
        const draft = {
            step,
            title,
            abstract,
            category,
            techStack,
            reportLink,
            githubLink,
            guideName,
            guideId,
            academicYear,
            selectedMembers
        };
        localStorage.setItem('upload_project_draft', JSON.stringify(draft));
    }, [step, title, abstract, category, techStack, reportLink, githubLink, guideName, guideId, academicYear, selectedMembers, isLoaded]);

    // Scroll to top on step change
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [step]);

    useEffect(() => {
        const checkUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                toast.error("Please login to upload");
                router.push('/login');
                return;
            }
            setUser(session.user);

            // Fetch profile for name
            const { data: profile } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();

            // Always ensure the current user is in the list as Leader
            setSelectedMembers(prevMembers => {
                const isAlreadyAdded = prevMembers.some(m => m.id === session.user.id);
                if (!isAlreadyAdded && profile) {
                    return [profile, ...prevMembers];
                }
                return prevMembers;
            });
        };
        checkUser();
    }, [isLoaded]);

    // Fetch Teachers
    useEffect(() => {
        const fetchTeachers = async () => {
            try {
                setLoadingTeachers(true);
                const { data, error } = await supabase
                    .from('profiles')
                    .select('id, full_name, role')
                    .in('role', ['teacher', 'hod', 'HOD']);

                if (error) throw error;
                setTeachers(data || []);
            } catch (err: any) {
                console.error("Error fetching teachers:", err);
                toast.error("Failed to load teachers.");
            } finally {
                setLoadingTeachers(false);
            }
        };
        fetchTeachers();
    }, []);

    // Optimized Server-Side Search
    useEffect(() => {
        const searchUsers = async () => {
            if (!searchQuery.trim()) {
                setSearchResults([]);
                return;
            }

            try {
                const { data, error } = await supabase
                    .from('profiles')
                    .select('id, full_name, role')
                    .ilike('full_name', `%${searchQuery}%`)
                    .limit(5);

                if (error) {
                    console.error("Search query error:", error);
                    return;
                }

                const filtered = data?.filter((p: any) => !selectedMembers.some(m => m.id === p.id)) || [];
                setSearchResults(filtered);
            } catch (err) {
                console.error("Search exception:", err);
            }
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
        setLoading(true);
        try {
            const { data: { session }, error: sessionError } = await supabase.auth.getSession();
            if (sessionError || !session) {
                window.alert("Session Expired: Please login again.");
                router.push('/login');
                return;
            }

            const missingFields: string[] = [];
            if (!title.trim()) missingFields.push("Project Title");
            if (!abstract.trim()) missingFields.push("Abstract");
            if (!reportLink.trim()) missingFields.push("Project Report (Drive Link)");
            if (!guideId) missingFields.push("Project Guide");
            if (techStack.length === 0) missingFields.push("Tech Stack");

            if (missingFields.length > 0) {
                toast.error(`Missing required fields: ${missingFields.join(', ')}`);
                setLoading(false);
                return;
            }

            if (!reportLink.includes("drive.google.com")) {
                toast.error("Please provide a valid Google Drive link for the report.");
                setLoading(false);
                return;
            }

            const projectPayload = {
                title,
                abstract,
                category,
                authors: selectedMembers.map(m => m.full_name || m.email),
                tech_stack: techStack.map(t => t.trim()),
                pdf_url: reportLink,
                github_url: githubLink,
                guide_name: guideName,
                guide_id: guideId || null,
                status: "pending",
                student_id: session.user.id,
                academic_year: academicYear,
            };

            const insertPromise = supabase.from('projects').insert(projectPayload).select();
            const { data: projectResponse, error: projectError } = await insertPromise;

            if (projectError) throw new Error(projectError.message || "Database rejected the project insert.");

            const projectData = projectResponse?.[0];
            if (!projectData) throw new Error("Project created but no data returned.");

            if (projectData) {
                const collaborators = selectedMembers.map(member => ({
                    project_id: projectData.id,
                    student_id: member.id,
                    role: member.id === session.user.id ? 'leader' : 'contributor',
                    status: member.id === session.user.id ? 'accepted' : 'pending',
                }));

                const { error: collabError } = await supabase
                    .from('project_collaborators')
                    .insert(collaborators);

                if (collabError) {
                    console.error("Collaborator Insert Error:", collabError);
                    toast.error("Project created, but some team members might not be linked.");
                }
            }

            localStorage.removeItem('upload_project_draft');
            setIsSuccess(true); // Trigger Particle Burst
            toast.success("Project submitted successfully!");
            setTimeout(() => router.push('/dashboard'), 2500); // 2.5s delay for animation

        } catch (error: any) {
            console.error("CRITICAL UPLOAD ERROR:", error);
            window.alert('Upload Failed: ' + (error.message || 'Unknown error. Check console for details.'));
        } finally {
            setLoading(false);
        }
    };

    // Animation Variants
    const containerVariants = {
        hidden: { opacity: 0, scale: 0.95, y: 20 },
        visible: {
            opacity: 1,
            scale: 1,
            y: 0,
            transition: {
                type: "spring",
                stiffness: 100,
                damping: 20,
                duration: 0.6
            }
        }
    } as any;

    const stepVariants = {
        hidden: { opacity: 0, x: 20, filter: 'blur(10px)' },
        visible: {
            opacity: 1,
            x: 0,
            filter: 'blur(0px)',
            transition: { duration: 0.4, ease: "easeOut" }
        },
        exit: {
            opacity: 0,
            x: -20,
            filter: 'blur(10px)',
            transition: { duration: 0.3, ease: "easeIn" }
        }
    } as any;

    const listVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    } as any;

    const itemVariants = {
        hidden: { opacity: 0, y: 20, scale: 0.8 },
        visible: { opacity: 1, y: 0, scale: 1 },
        exit: { opacity: 0, scale: 0.5, transition: { duration: 0.2 } }
    } as any;

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4 font-sans text-slate-900 overflow-hidden relative">

            {/* Background Gradients & Floating Blobs */}
            {isSuccess && <SuccessParticleBurst />}
            <div className="fixed inset-0 pointer-events-none">
                <motion.div
                    animate={{
                        x: [0, 50, 0],
                        y: [0, 30, 0],
                        scale: [1, 1.1, 1],
                    }}
                    transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute -top-[20%] -right-[10%] w-[70vw] h-[70vw] bg-teal-50 rounded-full blur-[100px] opacity-60"
                />
                <motion.div
                    animate={{
                        x: [0, -50, 0],
                        y: [0, -30, 0],
                        scale: [1, 1.2, 1],
                    }}
                    transition={{ duration: 25, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                    className="absolute -bottom-[20%] -left-[10%] w-[70vw] h-[70vw] bg-blue-50 rounded-full blur-[100px] opacity-60"
                />
            </div>

            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                style={{ perspective: 1000 }}
                className="w-full max-w-4xl relative z-10"
            >
                {/* Header */}
                <div className="mb-10 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <h1 className="text-5xl font-black text-slate-900 mb-3 tracking-tight drop-shadow-sm">
                            Upload Project
                        </h1>
                        <p className="text-slate-500 font-medium text-lg flex items-center justify-center gap-2">
                            Share your innovation with the world <Sparkles size={20} className="text-yellow-500 fill-yellow-500 animate-pulse" />
                        </p>
                    </motion.div>
                </div>

                {/* Main Card with Glow Interaction */}
                <motion.div
                    ref={cardRef}
                    onMouseMove={handleMouseMove}
                    onMouseLeave={handleMouseLeave}
                    className="bg-white/60 backdrop-blur-3xl rounded-[2.5rem] shadow-2xl shadow-teal-900/5 border border-white/50 p-8 md:p-12 relative overflow-hidden group transition-all duration-300"
                >
                    {/* Dynamic Glare Effect - Stronger to match Home Page */}
                    <motion.div
                        className="absolute inset-0 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                        style={{
                            background: useTransform(
                                [mouseX, mouseY],
                                ([x, y]) => `radial-gradient(circle at ${(x as number + 0.5) * 100}% ${(y as number + 0.5) * 100}%, rgba(45, 212, 191, 0.1) 0%, rgba(45, 212, 191, 0) 60%)`
                            )
                        }}
                    />

                    {/* Bento Grid Pattern with Soft Reveal */}
                    <motion.div
                        initial={{
                            opacity: 0.04,
                            maskImage: 'radial-gradient(circle at center, black 0%, transparent 0%)',
                            WebkitMaskImage: 'radial-gradient(circle at center, black 0%, transparent 0%)'
                        } as any}
                        animate={{
                            opacity: 0.04,
                            maskImage: 'radial-gradient(circle at center, black 100%, transparent 100%)',
                            WebkitMaskImage: 'radial-gradient(circle at center, black 100%, transparent 100%)'
                        } as any}
                        transition={{ duration: 2, ease: "easeOut", delay: 0.2 }}
                        className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"
                    />

                    {/* Ambient Glow Elements - Dynamic on Hover */}
                    <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-teal-100/40 to-blue-100/40 rounded-full blur-[80px] pointer-events-none opacity-50 group-hover:opacity-100 transition-all duration-700 group-hover:scale-110" />
                    <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-purple-100/40 to-pink-100/40 rounded-full blur-[80px] pointer-events-none opacity-50 group-hover:opacity-100 transition-all duration-700 group-hover:scale-110" />

                    {/* Decorative Top Line */}
                    <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-teal-400 via-blue-500 to-purple-500"></div>

                    {/* Stepper */}
                    <div className="flex justify-between items-center mb-12 relative px-4 select-none">
                        <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-slate-100 -z-10"></div>
                        {/* Animated Liquid Fill Line */}
                        <motion.div
                            className="absolute left-0 top-1/2 h-0.5 bg-teal-500 -z-10 origin-left"
                            initial={{ width: "0%" }}
                            animate={{
                                width: step === 1 ? "0%" : step === 2 ? "50%" : "100%"
                            }}
                            transition={{ duration: 0.5, ease: "easeInOut" }}
                        />

                        {[1, 2, 3].map((s) => (
                            <div
                                key={s}
                                onClick={() => setStep(s)}
                                className={`relative flex flex-col items-center gap-2 cursor-pointer group ${step >= s ? 'text-teal-600' : 'text-slate-300'}`}
                            >
                                <motion.div
                                    layout
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.95 }}
                                    className={`w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-bold transition-all duration-500 ${step >= s ? 'bg-teal-500 text-white shadow-lg shadow-teal-200' : 'bg-white border-2 border-slate-100 text-slate-300 group-hover:border-teal-200 group-hover:text-teal-400'}`}
                                >
                                    {step > s ? <CheckCircle size={24} /> : s}
                                </motion.div>
                                <span className={`text-xs font-bold uppercase tracking-wider bg-white px-2 transition-colors duration-300 ${step >= s ? 'text-teal-600' : 'text-slate-300 group-hover:text-teal-400'}`}>
                                    {s === 1 ? 'Details' : s === 2 ? 'Team' : 'Submit'}
                                </span>
                            </div>
                        ))}
                    </div>

                    <AnimatePresence mode="wait">
                        {/* Step 1: Project Details */}
                        {step === 1 && (
                            <motion.div
                                key="step1"
                                variants={stepVariants}
                                initial="hidden"
                                animate="visible"
                                exit="exit"
                                className="space-y-6"
                            >
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Project Title</label>
                                    <motion.input
                                        whileFocus={{ scale: 1.01, borderColor: "#14b8a6", boxShadow: "0 0 0 4px rgba(20, 184, 166, 0.1)" }}
                                        type="text"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        className="w-full p-4 bg-slate-200/60 border-2 border-slate-300 rounded-2xl font-bold text-slate-800 placeholder:text-slate-300 outline-none transition-all"
                                        placeholder="e.g. AI Based Traffic Control"
                                    />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Category</label>
                                        <motion.div whileHover={{ scale: 1.02 }} className="relative">
                                            <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full p-4 bg-slate-200/60 border-2 border-slate-300 rounded-2xl focus:ring-2 focus:ring-teal-500/20 font-bold text-slate-800 outline-none cursor-pointer appearance-none">
                                                <option>Final Year Project</option>
                                                <option>Mini Project</option>
                                                <option>Research Paper</option>
                                                <option>Hackathon Submission</option>
                                            </select>
                                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={20} />
                                        </motion.div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Academic Year</label>
                                        <motion.div whileHover={{ scale: 1.02 }} className="relative">
                                            <select value={academicYear} onChange={(e) => setAcademicYear(e.target.value)} className="w-full p-4 bg-slate-200/60 border-2 border-slate-300 rounded-2xl focus:ring-2 focus:ring-teal-500/20 font-bold text-slate-800 outline-none cursor-pointer appearance-none">
                                                <option>2025-2026</option>
                                                <option>2024-2025</option>
                                                <option>2023-2024</option>
                                                <option>2022-2023</option>
                                            </select>
                                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={20} />
                                        </motion.div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                                    {/* Abstract Input */}
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Abstract</label>
                                        <motion.textarea
                                            whileFocus={{ scale: 1.01, borderColor: "#14b8a6", boxShadow: "0 0 0 4px rgba(20, 184, 166, 0.1)" }}
                                            value={abstract}
                                            onChange={(e) => setAbstract(e.target.value)}
                                            rows={8}
                                            className="w-full p-4 bg-slate-200/60 border-2 border-slate-300 rounded-2xl font-medium text-slate-700 placeholder:text-slate-300 outline-none transition-all resize-none h-full min-h-[200px]"
                                            placeholder="Brief description of your project..."
                                        ></motion.textarea>
                                    </div>

                                    {/* Terminal Live Preview */}
                                    <div className="hidden lg:block">
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Live Terminal Analysis</label>
                                        <div className="w-full h-full min-h-[200px] bg-slate-900 rounded-2xl p-4 font-mono text-xs text-green-400 overflow-hidden relative shadow-inner border border-slate-800">
                                            {/* Terminal Header */}
                                            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-green-900/50 text-[10px] text-green-600 uppercase tracking-widest">
                                                <div className="w-2 h-2 rounded-full bg-red-500/50"></div>
                                                <div className="w-2 h-2 rounded-full bg-yellow-500/50"></div>
                                                <div className="w-2 h-2 rounded-full bg-green-500/50"></div>
                                                <span className="ml-auto">AI_CORE // METADATA_EXTRACTION</span>
                                            </div>

                                            {/* Content */}
                                            <div className="relative z-10 break-words whitespace-pre-wrap leading-relaxed opacity-90 font-mono">
                                                <div className="mb-3 text-green-600/70 text-[10px]">
                                                    {">"} connecting_to_neural_net...<br />
                                                    {">"} analyzing_project_semantics...
                                                </div>

                                                {abstract ? (
                                                    <div className="space-y-3">
                                                        {(() => {
                                                            const sentences = abstract.match(/[^.!?]+[.!?]+/g) || [abstract];

                                                            // 1. Problem Heuristic: Explicit keywords -> First sentence
                                                            let problemSentence = sentences.find(s =>
                                                                /problem|issue|challenge|drawback|limitation|hard|difficult|expensive|slow|traditional|conventional/i.test(s)
                                                            );
                                                            if (!problemSentence) problemSentence = sentences[0];

                                                            // 2. Solution Heuristic: Explicit keywords -> Start tokens -> Last sentence
                                                            // MUST be different from problemSentence
                                                            const solutionKeywords = /propose|solution|method|system|approach|algorithm|model|develop|create|design|utilize|using|framework/i;

                                                            let solutionSentence = sentences.find(s => s !== problemSentence && solutionKeywords.test(s));

                                                            if (!solutionSentence) {
                                                                solutionSentence = sentences.find(s => s !== problemSentence && /^(We |This |The proposed)/.test(s.trim()));
                                                            }

                                                            if (!solutionSentence && sentences.length > 1) {
                                                                const last = sentences[sentences.length - 1];
                                                                if (last !== problemSentence) solutionSentence = last;
                                                            }

                                                            if (!solutionSentence) solutionSentence = "Analyzing methodology described in text...";

                                                            // Entity Extraction
                                                            const words = abstract.match(/\b[A-Z][a-zA-Z0-9]+\b/g) || [];
                                                            const entities = Array.from(new Set(words.filter(w => w.length > 2 && !['The', 'A', 'An', 'My', 'Our', 'In', 'To', 'We', 'This', 'It', 'For', 'On'].includes(w))));
                                                            const complexTerms = abstract.split(/\s+/).filter(w => w.length > 7 && !entities.includes(w)).map(w => w.replace(/[^a-zA-Z]/g, ''));
                                                            const allTags = [...entities, ...complexTerms].slice(0, 10);

                                                            return (
                                                                <>
                                                                    {/* Problem Extraction */}
                                                                    <div>
                                                                        <span className="text-red-400 font-bold border-b border-red-400/30">PROBLEM_CONTEXT:</span>
                                                                        <div className="text-slate-300 mt-1 pl-2 border-l-2 border-red-500/20 text-xs text-justify">
                                                                            "{problemSentence?.trim()}"
                                                                        </div>
                                                                    </div>

                                                                    {/* Solution Extraction */}
                                                                    <div>
                                                                        <span className="text-blue-400 font-bold border-b border-blue-400/30">DETECTED_SOLUTION:</span>
                                                                        <div className="text-slate-300 mt-1 pl-2 border-l-2 border-blue-500/20 text-xs text-justify">
                                                                            "{solutionSentence?.trim()}"
                                                                        </div>
                                                                    </div>

                                                                    {/* Key Entities & Tech */}
                                                                    <div>
                                                                        <span className="text-teal-400 font-bold border-b border-teal-400/30">CORE_KEYWORDS:</span>
                                                                        <div className="flex flex-wrap gap-1.5 mt-1.5 pl-1">
                                                                            {allTags.length > 0 ? allTags.map((tag, i) => (
                                                                                <span key={i} className="px-1.5 py-0.5 bg-teal-500/10 border border-teal-500/30 rounded text-[10px] text-teal-200">
                                                                                    {tag}
                                                                                </span>
                                                                            )) : <span className="text-slate-500 italic text-[10px]">scanning_lexicon...</span>}
                                                                        </div>
                                                                    </div>
                                                                </>
                                                            );
                                                        })()}

                                                        {/* System Status Footer */}
                                                        <div className="pt-2 mt-2 border-t border-slate-800 text-[10px] text-slate-500 flex justify-between">
                                                            <span>CONFIDENCE: {(Math.min(abstract.length / 5, 98) + Math.random()).toFixed(1)}%</span>
                                                            <span className="text-green-500 animate-pulse">● LIVE_ANALYSIS</span>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="animate-pulse text-slate-500 italic">
                                                        [Waiting for project abstract data stream...]
                                                    </div>
                                                )}

                                                <motion.span
                                                    animate={{ opacity: [1, 0, 1] }}
                                                    transition={{ duration: 0.8, repeat: Infinity }}
                                                    className="inline-block w-2 h-4 bg-green-400 align-middle ml-1 mt-1"
                                                />
                                            </div>

                                            {/* Scanline Effect */}
                                            <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0),rgba(255,255,255,0)_50%,rgba(0,0,0,0.2)_50%,rgba(0,0,0,0.2))] bg-[size:100%_4px] pointer-events-none opacity-20"></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex justify-end pt-4">
                                    <motion.button
                                        layout
                                        whileHover={!isTransitioning ? { scale: 1.05, boxShadow: "0 10px 30px -10px rgba(0,0,0,0.2)" } : {}}
                                        whileTap={!isTransitioning ? { scale: 0.95 } : {}}
                                        onClick={() => handleAppTransition(2)}
                                        disabled={isTransitioning}
                                        initial={{ width: "auto", borderRadius: "1rem" }}
                                        animate={{
                                            width: isTransitioning ? "60px" : "auto",
                                            borderRadius: isTransitioning ? "50px" : "1rem",
                                            padding: isTransitioning ? "0px" : "16px 32px"
                                        }}
                                        transition={{ duration: 0.3, type: "spring", stiffness: 200, damping: 20 }}
                                        className="bg-slate-900 text-white font-bold flex items-center justify-center gap-2 group overflow-hidden h-[60px] min-w-[60px]"
                                    >
                                        <AnimatePresence mode="wait">
                                            {isTransitioning ? (
                                                <motion.div
                                                    key="loading"
                                                    initial={{ opacity: 0, scale: 0.5 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    exit={{ opacity: 0, scale: 0.5 }}
                                                >
                                                    <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                                                </motion.div>
                                            ) : (
                                                <motion.div
                                                    key="text"
                                                    initial={{ opacity: 0, scale: 0.9 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    exit={{ opacity: 0, scale: 0.9 }}
                                                    className="flex items-center gap-2 whitespace-nowrap"
                                                >
                                                    Next Step <Users size={18} className="group-hover:translate-x-1 transition-transform" />
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </motion.button>
                                </div>
                            </motion.div>
                        )}

                        {/* Step 2: Team & Tech */}
                        {step === 2 && (
                            <motion.div
                                key="step2"
                                variants={stepVariants}
                                initial="hidden"
                                animate="visible"
                                exit="exit"
                                className="space-y-8"
                            >

                                {/* Team Members Search */}
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Add Team Members</label>
                                    <div className="relative">
                                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <motion.input
                                            whileFocus={{ scale: 1.01, borderColor: "#14b8a6", boxShadow: "0 0 0 4px rgba(20, 184, 166, 0.1)" }}
                                            type="text"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="w-full pl-12 pr-4 py-4 bg-slate-200/60 border-2 border-slate-300 rounded-2xl font-medium text-slate-800 placeholder:text-slate-300 outline-none transition-all"
                                            placeholder="Search by student name..."
                                        />

                                        <AnimatePresence>
                                            {searchResults.length > 0 && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: 10 }}
                                                    className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-slate-100 z-50 max-h-60 overflow-y-auto custom-scrollbar"
                                                >
                                                    {searchResults.map((member: any) => (
                                                        <motion.button
                                                            whileHover={{ backgroundColor: "#f0f9ff" }}
                                                            key={member.id}
                                                            onClick={() => addMember(member)}
                                                            className="w-full text-left px-4 py-3 flex items-center gap-3 transition-colors border-b border-slate-50 last:border-0"
                                                        >
                                                            <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-bold text-xs">
                                                                {member.full_name?.charAt(0) || member.email.charAt(0)}
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-bold text-slate-800">{member.full_name || 'Unknown'}</p>
                                                                <p className="text-xs text-slate-400">{member.role}</p>
                                                            </div>
                                                            <UserPlus size={16} className="ml-auto text-teal-500" />
                                                        </motion.button>
                                                    ))}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>

                                    {/* Selected Members Pills */}
                                    <motion.div
                                        layout
                                        className="flex flex-wrap gap-3 mt-4"
                                    >
                                        <AnimatePresence>
                                            {selectedMembers.map((member) => (
                                                <motion.div
                                                    key={member.id}
                                                    variants={itemVariants}
                                                    initial="hidden"
                                                    animate="visible"
                                                    exit="exit"
                                                    layout
                                                    className="flex items-center gap-2 pl-2 pr-4 py-1.5 bg-white border border-slate-200 rounded-full shadow-sm hover:shadow-md transition-shadow"
                                                >
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
                                                </motion.div>
                                            ))}
                                        </AnimatePresence>
                                    </motion.div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Project Guide</label>
                                    <div className="relative">
                                        <motion.button
                                            whileHover={{ scale: 1.01 }}
                                            whileTap={{ scale: 0.99 }}
                                            onClick={() => setIsTeacherDropdownOpen(!isTeacherDropdownOpen)}
                                            className="w-full p-4 bg-slate-200/60 rounded-2xl flex items-center justify-between font-bold text-slate-800 hover:bg-slate-200 transition-colors focus:ring-2 focus:ring-teal-500/20 outline-none border-2 border-slate-300"
                                        >
                                            <span className={guideId ? 'text-slate-800' : 'text-slate-400 font-medium'}>
                                                {guideName || "Select a Faculty Guide"}
                                            </span>
                                            <ChevronDown
                                                size={20}
                                                className={`text-slate-400 transition-transform duration-300 ${isTeacherDropdownOpen ? 'rotate-180' : ''}`}
                                            />
                                        </motion.button>

                                        <AnimatePresence>
                                            {isTeacherDropdownOpen && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                                    transition={{ duration: 0.2 }}
                                                    className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-2xl shadow-xl border border-slate-100 z-50 max-h-60 overflow-y-auto custom-scrollbar"
                                                >
                                                    {teachers.map((teacher: any) => (
                                                        <button
                                                            key={teacher.id}
                                                            onClick={() => {
                                                                setGuideId(teacher.id);
                                                                setGuideName(teacher.full_name);
                                                                setIsTeacherDropdownOpen(false);
                                                            }}
                                                            className="w-full text-left px-5 py-3 hover:bg-teal-50 flex items-center gap-3 transition-colors border-b border-slate-50 last:border-0"
                                                        >
                                                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs">
                                                                {teacher.full_name?.charAt(0) || "F"}
                                                            </div>
                                                            <span className="font-bold text-slate-700">{teacher.full_name}</span>
                                                        </button>
                                                    ))}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Tech Stack</label>
                                    <div className="flex flex-col gap-3">
                                        <div className="relative flex items-center gap-2">
                                            <motion.input
                                                whileFocus={{ scale: 1.01, borderColor: "#14b8a6", boxShadow: "0 0 0 4px rgba(20, 184, 166, 0.1)" }}
                                                type="text"
                                                value={currentTech}
                                                onChange={(e) => setCurrentTech(e.target.value)}
                                                onKeyDown={handleTechKeyDown}
                                                className="w-full p-4 pr-14 bg-slate-200/60 border-2 border-slate-300 rounded-2xl font-bold text-slate-800 placeholder:text-slate-300 outline-none transition-all"
                                                placeholder="Type and press Enter (e.g. React, Python)"
                                            />
                                            <motion.button
                                                whileHover={{ scale: 1.1, rotate: 90 }}
                                                whileTap={{ scale: 0.9 }}
                                                onClick={addPendingTech}
                                                className="absolute right-2 p-2 bg-white text-teal-600 rounded-xl shadow-sm hover:bg-teal-50 transition-colors"
                                                title="Add Tech"
                                            >
                                                <CheckCircle size={20} />
                                            </motion.button>
                                        </div>
                                        <motion.div layout className="flex flex-wrap gap-2">
                                            <AnimatePresence>
                                                {techStack.map(tech => (
                                                    <motion.span
                                                        key={tech}
                                                        variants={itemVariants}
                                                        initial="hidden"
                                                        animate="visible"
                                                        exit="exit"
                                                        layout
                                                        className="px-3 py-1 bg-teal-50 text-teal-700 rounded-lg text-sm font-bold flex items-center gap-2 border border-teal-100"
                                                    >
                                                        {tech}
                                                        <button onClick={() => removeTech(tech)} className="hover:text-red-500 transition-colors">
                                                            <X size={14} />
                                                        </button>
                                                    </motion.span>
                                                ))}
                                            </AnimatePresence>
                                        </motion.div>
                                    </div>
                                </div>

                                <div className="flex justify-between pt-4">
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => setStep(1)}
                                        className="px-8 py-4 text-slate-500 font-bold hover:bg-slate-50 rounded-2xl transition-all"
                                    >
                                        Back
                                    </motion.button>
                                    <motion.button
                                        layout
                                        whileHover={!isTransitioning ? { scale: 1.05, boxShadow: "0 10px 30px -10px rgba(0,0,0,0.2)" } : {}}
                                        whileTap={!isTransitioning ? { scale: 0.95 } : {}}
                                        onClick={() => handleAppTransition(3, addPendingTech)}
                                        disabled={isTransitioning}
                                        initial={{ width: "auto", borderRadius: "1rem" }}
                                        animate={{
                                            width: isTransitioning ? "60px" : "auto",
                                            borderRadius: isTransitioning ? "50px" : "1rem",
                                            padding: isTransitioning ? "0px" : "16px 32px"
                                        }}
                                        transition={{ duration: 0.3, type: "spring", stiffness: 200, damping: 20 }}
                                        className="bg-slate-900 text-white font-bold flex items-center justify-center gap-2 group overflow-hidden h-[60px] min-w-[60px]"
                                    >
                                        <AnimatePresence mode="wait">
                                            {isTransitioning ? (
                                                <motion.div
                                                    key="loading"
                                                    initial={{ opacity: 0, scale: 0.5 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    exit={{ opacity: 0, scale: 0.5 }}
                                                >
                                                    <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                                                </motion.div>
                                            ) : (
                                                <motion.div
                                                    key="text"
                                                    initial={{ opacity: 0, scale: 0.9 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    exit={{ opacity: 0, scale: 0.9 }}
                                                    className="flex items-center gap-2 whitespace-nowrap"
                                                >
                                                    Final Details <UploadCloud size={18} className="group-hover:-translate-y-1 transition-transform" />
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </motion.button>
                                </div>
                            </motion.div>
                        )}

                        {/* Step 3: Links & Submit */}
                        {step === 3 && (
                            <motion.div
                                key="step3"
                                variants={stepVariants}
                                initial="hidden"
                                animate="visible"
                                exit="exit"
                                className="space-y-6"
                            >
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex items-start gap-3"
                                >
                                    <Info className="text-blue-500 shrink-0 mt-0.5" size={20} />
                                    <p className="text-sm text-blue-700 font-medium">Please host your report on Google Drive (Public Link) and source code on GitHub. We only store links to save storage.</p>
                                </motion.div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Project Report (Drive Link)</label>
                                    <motion.input
                                        whileFocus={{ scale: 1.01, borderColor: "#14b8a6", boxShadow: "0 0 0 4px rgba(20, 184, 166, 0.1)" }}
                                        type="url"
                                        value={reportLink}
                                        onChange={(e) => setReportLink(e.target.value)}
                                        className="w-full p-4 bg-slate-200/60 border-2 border-slate-300 rounded-2xl font-bold text-slate-800 placeholder:text-slate-300 outline-none transition-all"
                                        placeholder="https://drive.google.com/..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">GitHub Repository</label>
                                    <motion.input
                                        whileFocus={{ scale: 1.01, borderColor: "#14b8a6", boxShadow: "0 0 0 4px rgba(20, 184, 166, 0.1)" }}
                                        type="url"
                                        value={githubLink}
                                        onChange={(e) => setGithubLink(e.target.value)}
                                        className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl font-bold text-slate-800 placeholder:text-slate-300 outline-none transition-all"
                                        placeholder="https://github.com/..."
                                    />
                                </div>

                                <div className="flex justify-between pt-8">
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => setStep(2)}
                                        className="px-8 py-4 text-slate-500 font-bold hover:bg-slate-50 rounded-2xl transition-all"
                                    >
                                        Back
                                    </motion.button>
                                    <motion.button
                                        whileHover={!loading ? { scale: 1.05, boxShadow: "0 10px 30px -10px rgba(20, 184, 166, 0.4)" } : {}}
                                        whileTap={!loading ? { scale: 0.95 } : {}}
                                        onClick={handleSubmit}
                                        disabled={loading}
                                        className="flex-1 ml-4 py-4 bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-bold rounded-2xl flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed transition-all relative overflow-hidden"
                                    >
                                        <AnimatePresence mode="wait">
                                            {loading ? (
                                                <motion.div
                                                    key="loading"
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: -20 }}
                                                    className="flex items-center gap-2"
                                                >
                                                    <span className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin"></span>
                                                    Publishing...
                                                </motion.div>
                                            ) : (
                                                <motion.div
                                                    key="idle"
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: -20 }}
                                                    className="flex items-center gap-2"
                                                >
                                                    Publish Project <Rocket size={20} className="animate-bounce" />
                                                </motion.div>
                                            )}
                                        </AnimatePresence>

                                        {/* Shiny effect */}
                                        {!loading && (
                                            <div className="absolute top-0 -left-[100%] w-1/2 h-full bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 animate-shimmer pointer-events-none"></div>
                                        )}
                                    </motion.button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                </motion.div>
            </motion.div>
        </div>
    );
}

// Add custom scrollbar styles to global css if needed, or inline here
// .custom-scrollbar::-webkit-scrollbar { width: 6px; }
// .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 10px; }
// .custom-scrollbar::-webkit-scrollbar-track { background-color: transparent; }
