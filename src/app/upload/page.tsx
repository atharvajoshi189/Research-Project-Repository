"use client";

import { useState, useEffect } from 'react';
import { UploadCloud, CheckCircle, FileText, Link as LinkIcon, AlertCircle, Info, Github } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import toast, { Toaster } from 'react-hot-toast';
import { useRouter } from 'next/navigation';

export default function UploadPage() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState<any>(null);

    // Form State
    const [formData, setFormData] = useState({
        category: '',
        title: '',
        year: '2025-2026',
        techStack: '',
        abstract: '',
        authors: '',
        projectLink: '',
        githubUrl: '', // New Field
    });

    const [file, setFile] = useState<File | null>(null);

    useEffect(() => {
        const getUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                setUser(session.user);
                // Pre-fill authors with current user if empty
                if (!formData.authors) {
                    setFormData(prev => ({ ...prev, authors: session.user.email || '' }));
                }
            }
        };
        getUser();
    }, []);

    const updateForm = (key: string, value: string) => {
        setFormData(prev => ({ ...prev, [key]: value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];

            if (selectedFile.type !== 'application/pdf') {
                toast.error("Only PDF files are allowed.");
                return;
            }

            if (selectedFile.size > 1024 * 1024) {
                toast.error("File too large! Max size is 1MB. Please use the External Link option.");
                setFile(null);
                return;
            }

            setFile(selectedFile);
            toast.success("File attached successfully!");
        }
    };

    const handleSubmit = async () => {
        if (!user) {
            toast.error("You must be logged in to submit.");
            return;
        }

        if (!formData.title || !formData.category || !formData.authors) {
            toast.error("Please fill in all required fields (Title, Category, Authors).");
            return;
        }

        if (!file && !formData.projectLink) {
            toast.error("Please provide either a File or a Project Link.");
            return;
        }

        setLoading(true);

        try {
            let finalFileUrl = formData.projectLink;

            // 1. Upload File if present
            if (file) {
                const fileName = `${Date.now()}_${file.name.replace(/\s+/g, '-')}`;
                const { data, error: uploadError } = await supabase.storage
                    .from('project-files')
                    .upload(fileName, file);

                if (uploadError) throw new Error(`Storage Error: ${uploadError.message}`);

                const { data: { publicUrl } } = supabase.storage
                    .from('project-files')
                    .getPublicUrl(fileName);

                finalFileUrl = publicUrl;
            }

            // 2. Insert into Database
            const authorsArray = formData.authors
                .split(',')
                .map(a => a.trim())
                .filter(a => a.length > 0);

            const { error: insertError } = await supabase
                .from('projects')
                .insert([
                    {
                        title: formData.title,
                        category: formData.category,
                        academic_year: parseInt(formData.year.split('-')[0]), // Renamed from year
                        github_url: formData.githubUrl, // New Field
                        pdf_url: finalFileUrl,
                        abstract: formData.abstract,
                        authors: authorsArray,
                        student_id: user.id,
                    }
                ]);

            if (insertError) {
                console.error("DB Insert Error Details:", insertError);
                throw new Error(`Database Error: ${insertError.message} (Code: ${insertError.code})`);
            }

            // Success Toast
            toast.success("Project submitted successfully!");

            setTimeout(() => {
                router.push('/');
            }, 1500);

        } catch (error: any) {
            console.error("Submission Error:", error);
            // Helper to show clearer DB errors
            if (error.code === '23502') { // Not null violation
                toast.error("Database Error: Missing required fields.");
            } else {
                toast.error(error.message || "Failed to submit project.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto py-10 px-4">
            <Toaster position="top-right" />

            {/* Progress Bar */}
            <div className="mb-12 relative">
                <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-200 -z-10 rounded-full"></div>
                <div className="flex justify-between">
                    <StepIndicator num={1} label="Category" current={step} />
                    <StepIndicator num={2} label="Details" current={step} />
                    <StepIndicator num={3} label="Upload" current={step} />
                </div>
            </div>

            {/* Step Content */}
            <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-100 min-h-[500px] flex flex-col justify-center">

                {/* STEP 1: CATEGORY */}
                {step === 1 && (
                    <div className="space-y-6 animate-in slide-in-from-right fade-in duration-300">
                        <h2 className="text-2xl font-bold text-slate-900 text-center">Select Project Category</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {['Research Paper', 'Micro-Project', 'Final Year Project', 'Hackathon Submission'].map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => {
                                        updateForm('category', cat);
                                        setStep(2);
                                    }}
                                    className={`p-6 border-2 rounded-xl transition-all text-left group ${formData.category === cat
                                            ? 'border-indigo-500 bg-indigo-50'
                                            : 'border-slate-100 hover:border-indigo-500 hover:bg-indigo-50'
                                        }`}
                                >
                                    <span className="font-bold text-slate-700 group-hover:text-indigo-700 block mb-1">{cat}</span>
                                    <span className="text-xs text-slate-400">Select this category</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* STEP 2: METADATA */}
                {step === 2 && (
                    <div className="space-y-6 animate-in slide-in-from-right fade-in duration-300">
                        <h2 className="text-2xl font-bold text-slate-900 mb-6">Project Metadata</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Project Title <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => updateForm('title', e.target.value)}
                                    className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    placeholder="e.g. AI Powered Chatbot"
                                />
                            </div>

                            {/* GITHUB LINK ADDED */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1">
                                    <Github size={16} /> GitHub Repository Link
                                </label>
                                <input
                                    type="url"
                                    value={formData.githubUrl}
                                    onChange={(e) => updateForm('githubUrl', e.target.value)}
                                    className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    placeholder="https://github.com/username/repo"
                                />
                            </div>

                            {/* AUTHORS FIELD */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Authors (comma separated) <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    value={formData.authors}
                                    onChange={(e) => updateForm('authors', e.target.value)}
                                    className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    placeholder="e.g. Alice Smith, Bob Jones"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Academic Year</label>
                                    <select
                                        value={formData.year}
                                        onChange={(e) => updateForm('year', e.target.value)}
                                        className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    >
                                        <option>2025-2026</option>
                                        <option>2024-2025</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Tech Stack</label>
                                    <input
                                        type="text"
                                        value={formData.techStack}
                                        onChange={(e) => updateForm('techStack', e.target.value)}
                                        className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        placeholder="React, Node, etc."
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Abstract</label>
                                <textarea
                                    value={formData.abstract}
                                    onChange={(e) => updateForm('abstract', e.target.value)}
                                    className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 h-32"
                                    placeholder="Brief description..."
                                ></textarea>
                            </div>
                            <div className="flex justify-end gap-3 pt-4">
                                <button onClick={() => setStep(1)} className="px-6 py-2 text-slate-500 font-medium hover:text-slate-700">Back</button>
                                <button onClick={() => setStep(3)} className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-indigo-700 transition">Next Step</button>
                            </div>
                        </div>
                    </div>
                )}

                {/* STEP 3: UPLOAD */}
                {step === 3 && (
                    <div className="space-y-8 animate-in slide-in-from-right fade-in duration-300">
                        <div className="text-center">
                            <h2 className="text-2xl font-bold text-slate-900">Submission Method</h2>
                            <p className="text-slate-500 text-sm">Choose how you want to submit your project files.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative">
                            {/* OPTION A: DIRECT UPLOAD */}
                            <div className={`
                                border-2 rounded-2xl p-6 transition-all relative
                                ${file ? 'border-emerald-500 bg-emerald-50' : 'border-teal-200 bg-slate-50 hover:border-teal-400'}
                            `}>
                                <div className="absolute -top-3 left-6 px-3 bg-white text-xs font-bold text-teal-600 border border-teal-100 rounded-full">
                                    OPTION A
                                </div>
                                <h3 className="font-bold text-slate-700 mb-2 flex items-center gap-2">
                                    <UploadCloud size={20} className="text-teal-500" />
                                    Direct PDF Upload
                                </h3>

                                <label className="cursor-pointer block">
                                    <input
                                        type="file"
                                        accept=".pdf"
                                        onChange={handleFileChange}
                                        className="hidden"
                                    />
                                    <div className="border-2 border-dashed border-slate-300 rounded-xl h-32 flex flex-col items-center justify-center p-4 hover:bg-white transition-colors">
                                        {file ? (
                                            <>
                                                <FileText size={32} className="text-emerald-500 mb-2" />
                                                <span className="text-sm font-medium text-emerald-700 truncate max-w-full px-2">{file.name}</span>
                                                <span className="text-xs text-emerald-500">{(file.size / 1024).toFixed(1)} KB</span>
                                            </>
                                        ) : (
                                            <>
                                                <span className="text-sm text-slate-500 font-medium mb-1">Click to Upload PDF</span>
                                                <span className="text-xs text-slate-400">Max size: 1MB</span>
                                            </>
                                        )}
                                    </div>
                                </label>
                            </div>

                            {/* OPTION B: EXTERNAL LINK */}
                            <div className={`
                                border-2 rounded-2xl p-6 transition-all relative
                                ${formData.projectLink ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200 bg-slate-50 hover:border-indigo-300'}
                            `}>
                                <div className="absolute -top-3 left-6 px-3 bg-white text-xs font-bold text-indigo-600 border border-indigo-100 rounded-full">
                                    OPTION B
                                </div>
                                <h3 className="font-bold text-slate-700 mb-2 flex items-center gap-2">
                                    <LinkIcon size={20} className="text-indigo-500" />
                                    External Link
                                </h3>

                                <div className="flex flex-col justify-center h-32">
                                    <label className="text-xs text-slate-500 mb-1">Drive / OneDrive / GitHub URL</label>
                                    <input
                                        type="url"
                                        value={formData.projectLink}
                                        onChange={(e) => updateForm('projectLink', e.target.value)}
                                        placeholder="https://..."
                                        className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm"
                                    />
                                    {!file && !formData.projectLink && (
                                        <p className="text-[10px] text-amber-600 mt-2 flex items-center gap-1">
                                            <AlertCircle size={10} />
                                            Required if no file uploaded
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* PRO TIP */}
                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-3">
                            <Info size={18} className="text-amber-500 mt-0.5 flex-shrink-0" />
                            <div className="text-xs text-amber-800">
                                <span className="font-bold">Pro-Tip:</span> Use <b>Option B</b> (External Link) for heavy reports ({'>'}1MB) or if you have multiple files to share. Direct upload is best for simple, lightweight PDFs.
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
                            <button onClick={() => setStep(2)} className="px-6 py-2 text-slate-500 font-medium hover:text-slate-700">Back</button>
                            <button
                                onClick={handleSubmit}
                                disabled={loading}
                                className={`
                                    bg-emerald-500 text-white px-8 py-2 rounded-lg font-bold transition shadow-lg shadow-emerald-200 flex items-center gap-2
                                    ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-emerald-600'}
                                `}
                            >
                                {loading && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>}
                                {loading ? 'Submitting...' : 'Submit Project'}
                            </button>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}

const StepIndicator = ({ num, label, current }: { num: number, label: string, current: number }) => {
    const isCompleted = current > num;
    const isActive = current === num;

    return (
        <div className="flex flex-col items-center relative z-10 w-24">
            <div className={`
                w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 border-2
                ${isActive ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg ring-4 ring-indigo-100' :
                    isCompleted ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-white text-slate-400 border-slate-200'}
            `}>
                {isCompleted ? <CheckCircle size={18} /> : num}
            </div>
            <span className={`mt-2 text-xs font-bold uppercase tracking-wider ${isActive ? 'text-indigo-600' : 'text-slate-400'}`}>{label}</span>
        </div>
    );
}
