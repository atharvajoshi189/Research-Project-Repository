'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Loader2, GraduationCap, Building2, ArrowRight, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import { signInUser, signUpUser, getUserRole } from '@/lib/authService';
import Image from 'next/image';

function AuthContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isLogin, setIsLogin] = useState(true);
    const [isLoading, setIsLoading] = useState(false);

    // Check URL params to set initial state
    useEffect(() => {
        const view = searchParams.get('view');
        if (view === 'signup') {
            setIsLogin(false);
        }
    }, [searchParams]);

    // Login State
    const [loginEmail, setLoginEmail] = useState('');
    const [loginPassword, setLoginPassword] = useState('');
    const [showLoginPassword, setShowLoginPassword] = useState(false);

    // Signup State
    const [fullName, setFullName] = useState('');
    const [signupEmail, setSignupEmail] = useState('');
    const [signupPassword, setSignupPassword] = useState('');
    const [role, setRole] = useState<'student' | 'faculty'>('student');
    const [academicYear, setAcademicYear] = useState('');
    const [section, setSection] = useState('');
    const [collegeId, setCollegeId] = useState('');
    const [showSignupPassword, setShowSignupPassword] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const { user } = await signInUser(loginEmail, loginPassword);
            if (!user) throw new Error('Login failed. Please try again.');

            toast.success('Login successful!');
            const userRole = await getUserRole(user.id);
            router.push(userRole === 'admin' || userRole === 'faculty' ? '/admin' : '/');

        } catch (error: any) {
            console.error('Login Error:', error);
            toast.error(error.message || 'Something went wrong');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            // Map 'faculty' selection to 'teacher' role for DB consistency
            const dbRole = role === 'faculty' ? 'teacher' : role;

            const { user } = await signUpUser(
                signupEmail,
                signupPassword,
                fullName,
                dbRole,
                role === 'student' ? academicYear : undefined,
                role === 'student' ? section : undefined,
                role === 'student' ? collegeId : undefined
            );

            if (!user) throw new Error('Signup failed. Please try again.');

            toast.success('Account created successfully!');
            router.push(role === 'faculty' ? '/admin' : '/');
        } catch (error: any) {
            console.error('Signup Error:', error);
            toast.error(error.message || 'Something went wrong');
        } finally {
            setIsLoading(false);
        }
    };

    const toggleAuth = () => {
        setIsLogin(!isLogin);
    };

    // Custom Color: Professional Navy #0F172A
    const [showIntro, setShowIntro] = useState(true);
    const [isUnlocking, setIsUnlocking] = useState(false);

    // Lock Animation Sequence
    useEffect(() => {
        // Prefetch potential routes for faster navigation
        router.prefetch('/search');
        router.prefetch('/admin');

        // Start sequence
        const timer1 = setTimeout(() => {
            setIsUnlocking(true); // Trigger unlock animation
        }, 300);

        const timer2 = setTimeout(() => {
            setShowIntro(false); // Remove overlay (doors open)
        }, 800);

        return () => {
            clearTimeout(timer1);
            clearTimeout(timer2);
        };
    }, [router]);



    const navyColorClass = "text-[#0F172A]";
    const navyBgClass = "bg-[#0F172A]";
    const navyBorderClass = "border-[#0F172A]";
    const navyRingClass = "ring-[#0F172A]";

    return (
        <div className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden bg-[#F8FAFC]">

            {/* INTRO LOCK ANIMATION OVERLAY */}
            <AnimatePresence mode="wait">
                {showIntro && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none">
                        {/* Left Door */}
                        <motion.div
                            initial={{ x: 0 }}
                            exit={{ x: "-100%" }}
                            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                            className="absolute left-0 top-0 bottom-0 w-1/2 bg-[#0F172A] z-20 border-r border-white/10"
                        />
                        {/* Right Door */}
                        <motion.div
                            initial={{ x: 0 }}
                            exit={{ x: "100%" }}
                            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                            className="absolute right-0 top-0 bottom-0 w-1/2 bg-[#0F172A] z-20 border-l border-white/10"
                        />

                        {/* Lock Icon Container */}
                        <motion.div
                            className="relative z-30"
                            exit={{ scale: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            <div className="w-32 h-32 bg-white rounded-3xl shadow-2xl flex items-center justify-center">
                                {/* Lock Body */}
                                <motion.div
                                    animate={isUnlocking ? {
                                        rotate: [0, -10, 10, -5, 5, 0],
                                        transition: { duration: 0.5 }
                                    } : {}}
                                >
                                    {isUnlocking ? (
                                        <motion.div
                                            initial={{ scale: 0.8, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            className="text-[#0F172A]"
                                        >
                                            <Sparkles size={64} strokeWidth={2.5} />
                                        </motion.div>
                                    ) : (
                                        <div className="relative">
                                            {/* Shackle Animation */}
                                            <motion.div
                                                className="absolute -top-6 left-1/2 -translate-x-1/2 w-8 h-12 border-[6px] border-[#0F172A] rounded-t-full border-b-0"
                                                animate={isUnlocking ? { y: -10 } : {}}
                                            />
                                            {/* Lock Base */}
                                            <div className="w-16 h-14 bg-[#0F172A] rounded-xl relative z-10 flex items-center justify-center">
                                                <div className="w-4 h-4 bg-white rounded-full shadow-inner" />
                                            </div>
                                        </div>
                                    )}
                                </motion.div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Global Background Animations: Professional Navy Theme */}
            <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden bg-white">
                {/* Navy Blob */}
                <div className="absolute top-[-10%] left-[-10%] w-[50rem] h-[50rem] bg-[#0F172A] rounded-full mix-blend-multiply filter blur-[120px] opacity-10 animate-blob" />
                {/* Royal Blue Blob */}
                <div className="absolute bottom-[-10%] right-[-10%] w-[50rem] h-[50rem] bg-blue-800 rounded-full mix-blend-multiply filter blur-[120px] opacity-10 animate-blob animation-delay-2000" />
                {/* Central Glow */}
                <div className="absolute top-[30%] left-[30%] w-[30rem] h-[30rem] bg-indigo-200/40 rounded-full mix-blend-multiply filter blur-[90px] opacity-30 animate-blob animation-delay-4000" />

                {/* Grid Pattern */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-50"></div>
            </div>

            {/* Main Split Card Container: Removed main background to allow per-panel transparency */}
            <div className="relative z-10 flex flex-col md:flex-row w-full max-w-[1150px] h-[750px] rounded-[3rem] shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] overflow-hidden border border-white/40 ring-1 ring-white/50">

                {/* Left Side - Welcome Section: Navy Gradient */}
                <div className="md:w-1/2 relative p-12 lg:p-16 flex flex-col justify-between overflow-hidden z-20">
                    {/* Navy Background for Left Panel - Kept Solid/Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-br from-[#0F172A] to-[#1E3A8A] z-0"></div>

                    {/* Animated Shapes - Adjusted for Navy */}
                    <div className="absolute top-[-20%] left-[-20%] w-96 h-96 bg-white rounded-full mix-blend-overlay filter blur-3xl opacity-10 animate-float" />
                    <div className="absolute bottom-[-10%] right-[-10%] w-80 h-80 bg-blue-400 rounded-full mix-blend-overlay filter blur-3xl opacity-20 animate-float animation-delay-2000" />

                    {/* Content */}
                    <div className="relative z-10">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="w-32 h-32 bg-white rounded-3xl flex items-center justify-center border border-white/20 shadow-xl overflow-hidden p-6 mb-8 group"
                        >
                            <Image
                                src="/college_logo_white.png"
                                alt="College Logo"
                                width={120}
                                height={120}
                                className="object-contain w-full h-full drop-shadow-sm transform transition-transform group-hover:scale-110 duration-500"
                            />
                        </motion.div>

                        <div className="space-y-6">
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.4 }}
                            >
                                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-white text-xs font-bold tracking-widest uppercase mb-4 backdrop-blur-sm shadow-sm">
                                    <Sparkles size={12} className="text-yellow-300" /> {isLogin ? "Welcome Back" : "Future Begins Here"}
                                </span>
                                <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white leading-[1.1] tracking-tight font-[family-name:var(--font-playfair)] italic">
                                    {isLogin ?
                                        <>Access Your <br /><span className="text-blue-100 opacity-90">Dashboard.</span></> :
                                        <>Join the <br /><span className="text-blue-100 opacity-90">Revolution.</span></>
                                    }
                                </h1>
                            </motion.div>

                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.6 }}
                                className="text-blue-100 text-lg max-w-sm leading-relaxed font-medium mix-blend-plus-lighter"
                            >
                                {isLogin
                                    ? "Securely login to verify projects, manage deliverables, and track academic progress."
                                    : "Create your student or faculty account to start collaborating on next-gen research projects."}
                            </motion.p>
                        </div>
                    </div>

                    <div className="relative z-10 pt-10">
                        <div className="flex -space-x-4">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className={`w-10 h-10 rounded-full border-2 border-[#1E3A8A] bg-white/20 backdrop-blur-md flex items-center justify-center text-xs font-bold text-white shadow-sm`}>
                                    {i}
                                </div>
                            ))}
                            <div className={`w-10 h-10 rounded-full border-2 border-[#1E3A8A] bg-white flex items-center justify-center text-[10px] font-bold text-[#0F172A] shadow-sm`}>
                                500+
                            </div>
                        </div>
                        <p className="text-blue-100 text-xs mt-3 font-semibold tracking-wide pl-2 opacity-90">Joined by 500+ Innovators</p>
                    </div>
                </div>

                {/* Right Side - FLIP CARD Section */}
                <div className="md:w-1/2 relative perspective-[2000px] bg-transparent">
                    <motion.div
                        animate={{ rotateY: isLogin ? 0 : 180 }}
                        transition={{ duration: 0.7, type: "spring", stiffness: 200, damping: 25 }}
                        className="w-full h-full relative preserve-3d"
                        style={{ transformStyle: 'preserve-3d' }}
                    >
                        {/* FRONT FACE (LOGIN) - ULTRA GLASS EFFECT */}
                        <div
                            className="absolute inset-0 w-full h-full backface-hidden flex flex-col justify-center p-8 md:p-14 lg:p-16"
                            style={{
                                backfaceVisibility: 'hidden',
                                backgroundColor: 'rgba(255, 255, 255, 0.15)', // Very High Transparency
                                backdropFilter: 'blur(12px)', // Medium Blur to see shapes behind
                                WebkitBackdropFilter: 'blur(12px)',
                                borderLeft: '1px solid rgba(255,255,255,0.2)'
                            }}>
                            <div className="w-full max-w-sm mx-auto relative z-10">
                                <div className="mb-10">
                                    <h3 className="text-3xl font-black text-slate-800 tracking-tight font-[family-name:var(--font-playfair)] italic">Login Account</h3>
                                    <p className="text-slate-500 text-base mt-2 font-medium">Please sign in to continue.</p>
                                </div>

                                <form onSubmit={handleLogin} className="space-y-6">
                                    <div className="group">
                                        <label className={`block text-xs font-bold text-slate-500 uppercase mb-2 tracking-wider group-focus-within:${navyColorClass} transition-colors`}>Email Address</label>
                                        <input
                                            type="email"
                                            required
                                            value={loginEmail}
                                            onChange={(e) => setLoginEmail(e.target.value)}
                                            className={`w-full px-5 py-4 rounded-2xl bg-white/40 border-2 border-white/40 text-slate-900 font-semibold focus:border-[#0F172A] focus:bg-white/60 focus:ring-4 focus:ring-[#0F172A]/20 transition-all outline-none placeholder:text-slate-400 backdrop-blur-sm`}
                                            placeholder="student@college.edu"
                                        />
                                    </div>

                                    <div className="group">
                                        <div className="flex justify-between items-center mb-2">
                                            <label className={`block text-xs font-bold text-slate-500 uppercase tracking-wider group-focus-within:${navyColorClass} transition-colors`}>Password</label>
                                            <a href="#" className={`text-xs font-bold ${navyColorClass} hover:opacity-80 transition-opacity`}>Forgot Password?</a>
                                        </div>
                                        <div className="relative">
                                            <input
                                                type={showLoginPassword ? "text" : "password"}
                                                required
                                                value={loginPassword}
                                                onChange={(e) => setLoginPassword(e.target.value)}
                                                className={`w-full px-5 py-4 rounded-2xl bg-white/40 border-2 border-white/40 text-slate-900 font-semibold focus:border-[#0F172A] focus:bg-white/60 focus:ring-4 focus:ring-[#0F172A]/20 transition-all outline-none placeholder:text-slate-400 backdrop-blur-sm`}
                                                placeholder="••••••••"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowLoginPassword(!showLoginPassword)}
                                                className={`absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:${navyColorClass} transition-colors`}
                                            >
                                                {showLoginPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                            </button>
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="w-full py-4 bg-[#0F172A] hover:bg-[#1E293B] text-white rounded-2xl font-bold text-lg shadow-[0_10px_30px_-10px_rgba(15,23,42,0.4)] hover:shadow-[0_15px_40px_-5px_rgba(15,23,42,0.5)] transition-all transform hover:-translate-y-1 active:translate-y-0 disabled:opacity-70 flex justify-center items-center mt-2 border border-[#0F172A]/20"
                                    >
                                        {isLoading ? <Loader2 className="animate-spin h-6 w-6" /> : "Sign In Access"}
                                    </button>
                                </form>

                                <div className="mt-10 text-center">
                                    <p className="text-sm font-medium text-slate-500">
                                        New to the platform?
                                        <button onClick={toggleAuth} className={`${navyColorClass} font-black ml-1 hover:underline decoration-2 underline-offset-4`}>
                                            Create Account
                                        </button>
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* BACK FACE (SIGNUP) - ULTRA GLASS EFFECT */}
                        <div
                            className="absolute inset-0 w-full h-full backface-hidden flex flex-col justify-center p-8 md:p-14 lg:p-16"
                            style={{
                                backfaceVisibility: 'hidden',
                                transform: 'rotateY(180deg)',
                                backgroundColor: 'rgba(255, 255, 255, 0.15)', // Very High Transparency
                                backdropFilter: 'blur(12px)', // Visible shapes
                                WebkitBackdropFilter: 'blur(12px)',
                                borderLeft: '1px solid rgba(255,255,255,0.2)'
                            }}>
                            <div className="w-full max-w-sm mx-auto relative z-10">
                                <div className="mb-6">
                                    <h3 className="text-2xl font-black text-slate-900 tracking-tight font-[family-name:var(--font-playfair)] italic">Create Account</h3>
                                    <p className="text-slate-600 text-sm mt-1 font-medium">Join us to get started.</p>
                                </div>

                                <form onSubmit={handleSignup} className="space-y-4">
                                    <div className="grid grid-cols-2 gap-3 mb-4">
                                        <button
                                            type="button"
                                            onClick={() => setRole('student')}
                                            className={`flex items-center justify-center gap-2 p-3 rounded-2xl transition-all border-2 ${role === 'student' ? `bg-[#0F172A]/10 border-[#0F172A] text-[#0F172A] font-bold shadow-sm backdrop-blur-sm` : 'bg-white/30 border-white/50 text-slate-400 hover:border-slate-200/50 hover:bg-white/50 font-medium'}`}
                                        >
                                            <GraduationCap className="w-5 h-5" /> <span className="text-sm">Student</span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setRole('faculty')}
                                            className={`flex items-center justify-center gap-2 p-3 rounded-2xl transition-all border-2 ${role === 'faculty' ? 'bg-blue-900/10 border-blue-900 text-blue-900 font-bold shadow-sm backdrop-blur-sm' : 'bg-white/30 border-white/50 text-slate-400 hover:border-slate-200/50 hover:bg-white/50 font-medium'}`}
                                        >
                                            <Building2 className="w-5 h-5" /> <span className="text-sm">Faculty</span>
                                        </button>
                                    </div>

                                    <div className="space-y-3 max-h-[320px] overflow-y-auto pr-2 custom-scrollbar">
                                        <input
                                            type="text"
                                            required
                                            value={fullName}
                                            onChange={(e) => setFullName(e.target.value)}
                                            className={`w-full px-5 py-3.5 rounded-2xl bg-white/40 border-2 border-slate-100/50 text-slate-900 font-semibold focus:border-[#0F172A] focus:bg-white/60 focus:ring-4 focus:ring-[#0F172A]/20 transition-all outline-none text-sm placeholder:text-slate-400 backdrop-blur-sm`}
                                            placeholder="Full Name"
                                        />
                                        <input
                                            type="email"
                                            required
                                            value={signupEmail}
                                            onChange={(e) => setSignupEmail(e.target.value)}
                                            className={`w-full px-5 py-3.5 rounded-2xl bg-white/40 border-2 border-slate-100/50 text-slate-900 font-semibold focus:border-[#0F172A] focus:bg-white/60 focus:ring-4 focus:ring-[#0F172A]/20 transition-all outline-none text-sm placeholder:text-slate-400 backdrop-blur-sm`}
                                            placeholder="Email Address"
                                        />

                                        {role === 'student' && (
                                            <>
                                                <input
                                                    type="text"
                                                    required
                                                    value={collegeId}
                                                    onChange={(e) => setCollegeId(e.target.value)}
                                                    className={`w-full px-5 py-3.5 rounded-2xl bg-white/40 border-2 border-slate-100/50 text-slate-900 font-semibold focus:border-[#0F172A] focus:bg-white/60 focus:ring-4 focus:ring-[#0F172A]/20 transition-all outline-none text-sm placeholder:text-slate-400 backdrop-blur-sm`}
                                                    placeholder="College ID"
                                                />
                                                <div className="grid grid-cols-2 gap-3">
                                                    <select
                                                        required
                                                        value={academicYear}
                                                        onChange={(e) => setAcademicYear(e.target.value)}
                                                        className={`w-full px-4 py-3.5 rounded-2xl bg-white/40 border-2 border-slate-100/50 text-slate-900 font-semibold focus:border-[#0F172A] focus:bg-white/60 focus:ring-4 focus:ring-[#0F172A]/20 transition-all outline-none text-xs backdrop-blur-sm`}
                                                    >
                                                        <option value="" disabled>Year</option>
                                                        <option value="1st Year">1st</option>
                                                        <option value="2nd Year">2nd</option>
                                                        <option value="3rd Year">3rd</option>
                                                        <option value="4th Year">4th</option>
                                                    </select>
                                                    <select
                                                        required
                                                        value={section}
                                                        onChange={(e) => setSection(e.target.value)}
                                                        className={`w-full px-4 py-3.5 rounded-2xl bg-white/40 border-2 border-slate-100/50 text-slate-900 font-semibold focus:border-[#0F172A] focus:bg-white/60 focus:ring-4 focus:ring-[#0F172A]/20 transition-all outline-none text-xs backdrop-blur-sm`}
                                                    >
                                                        <option value="" disabled>Section</option>
                                                        <option value="Section A">A</option>
                                                        <option value="Section B">B</option>
                                                    </select>
                                                </div>
                                            </>
                                        )}

                                        <div className="relative">
                                            <input
                                                type={showSignupPassword ? "text" : "password"}
                                                required
                                                value={signupPassword}
                                                onChange={(e) => setSignupPassword(e.target.value)}
                                                className={`w-full px-5 py-3.5 rounded-2xl bg-white/40 border-2 border-slate-100/50 text-slate-900 font-semibold focus:border-[#0F172A] focus:bg-white/60 focus:ring-4 focus:ring-[#0F172A]/20 transition-all outline-none text-sm placeholder:text-slate-400 backdrop-blur-sm`}
                                                placeholder="Set Password"
                                            />
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="w-full py-3.5 bg-[#0F172A] hover:bg-[#1E293B] text-white rounded-2xl font-bold shadow-[0_10px_30px_-10px_rgba(15,23,42,0.4)] hover:shadow-[0_15px_40px_-5px_rgba(15,23,42,0.5)] transition-all transform hover:-translate-y-1 active:translate-y-0 disabled:opacity-70 flex justify-center items-center mt-2 border border-[#0F172A]/20"
                                    >
                                        {isLoading ? <Loader2 className="animate-spin h-5 w-5" /> : "Complete Registration"}
                                    </button>
                                </form>

                                <div className="mt-6 text-center pt-4 border-t border-slate-200/50">
                                    <p className="text-xs font-medium text-slate-500">
                                        Already have an account?
                                        <button onClick={toggleAuth} className={`${navyColorClass} font-black ml-1 hover:underline decoration-2 underline-offset-4`}>
                                            Sign In
                                        </button>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}

export default function AuthPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen w-full flex items-center justify-center bg-[#F8FAFC]">
                <Loader2 className="animate-spin h-10 w-10 text-[#0F172A]" />
            </div>
        }>
            <AuthContent />
        </Suspense>
    );
}
