'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Loader2, GraduationCap, Building2, ArrowRight, UserPlus } from 'lucide-react';
import toast from 'react-hot-toast';
import { signUpUser } from '@/lib/authService';

export default function SignupPage() {
    const router = useRouter();
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState<'student' | 'faculty'>('student');
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const { user } = await signUpUser(email, password, fullName, role);

            if (!user) {
                throw new Error('Signup failed. Please try again.');
            }

            toast.success('Account created successfully!');

            if (role === 'faculty') {
                router.push('/admin');
            } else {
                router.push('/search');
            }

        } catch (error: any) {
            console.error('Signup Error:', error);
            toast.error(error.message || 'Something went wrong');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] w-full h-full flex items-center justify-center overflow-hidden bg-[#020617] font-sans">
            {/* VIBRANT ANIMATED BACKGROUND BLOBS - BLUE & WHITE TONES */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        x: [0, 50, 0],
                        y: [0, 100, 0],
                    }}
                    transition={{
                        duration: 8,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] bg-blue-600/30 rounded-full blur-[120px]"
                />
                <motion.div
                    animate={{
                        scale: [1.2, 1, 1.2],
                        x: [0, -70, 0],
                        y: [0, -50, 0],
                    }}
                    transition={{
                        duration: 10,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    className="absolute top-[20%] -right-[10%] w-[60%] h-[60%] bg-cyan-500/20 rounded-full blur-[150px]"
                />
                <motion.div
                    animate={{
                        scale: [1, 1.3, 1],
                        x: [0, 100, 0],
                        y: [0, -80, 0],
                    }}
                    transition={{
                        duration: 12,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    className="absolute -bottom-[20%] left-[10%] w-[70%] h-[70%] bg-indigo-600/20 rounded-full blur-[180px]"
                />
                <motion.div
                    animate={{
                        scale: [1.1, 1, 1.1],
                        rotate: [0, 360],
                    }}
                    transition={{
                        duration: 20,
                        repeat: Infinity,
                        ease: "linear"
                    }}
                    className="absolute top-[40%] left-[30%] w-[40%] h-[40%] bg-white/5 rounded-full blur-[100px]"
                />
            </div>

            {/* CONTENT WRAPPER */}
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="relative z-10 w-full max-w-[520px] px-4 perspective-1000"
            >
                {/* 3D Container */}
                <motion.div
                    animate={{ rotateY: role === 'faculty' ? 180 : 0 }}
                    transition={{ duration: 0.8, ease: "easeInOut" }}
                    className="relative w-full preserve-3d"
                >
                    {/* FRONT: STUDENT SIGNUP */}
                    <div
                        className="w-full relative"
                        style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
                    >
                        <GlassCard
                            title="Student Signup"
                            subtitle="Join the academic research community."
                            role="student"
                            otherRole="faculty"
                            onToggleRole={() => setRole('faculty')}
                            fullName={fullName}
                            email={email}
                            password={password}
                            setFullName={setFullName}
                            setEmail={setEmail}
                            setPassword={setPassword}
                            showPassword={showPassword}
                            setShowPassword={setShowPassword}
                            isLoading={isLoading}
                            handleSignup={handleSignup}
                        />
                    </div>

                    {/* BACK: FACULTY SIGNUP */}
                    <div
                        className="w-full absolute top-0 left-0"
                        style={{
                            backfaceVisibility: 'hidden',
                            transform: 'rotateY(180deg)',
                            WebkitBackfaceVisibility: 'hidden'
                        }}
                    >
                        <GlassCard
                            title="Faculty Portal"
                            subtitle="Elevate your academic management."
                            role="faculty"
                            otherRole="student"
                            onToggleRole={() => setRole('student')}
                            fullName={fullName}
                            email={email}
                            password={password}
                            setFullName={setFullName}
                            setEmail={setEmail}
                            setPassword={setPassword}
                            showPassword={showPassword}
                            setShowPassword={setShowPassword}
                            isLoading={isLoading}
                            handleSignup={handleSignup}
                        />
                    </div>
                </motion.div>

                {/* Decorative Bottom Glow */}
                <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-4/5 h-20 bg-blue-500/10 blur-[60px] rounded-full -z-1" />
            </motion.div>
        </div>
    );
}

function GlassCard({
    title, subtitle, role, otherRole, onToggleRole,
    fullName, email, password, setFullName, setEmail, setPassword,
    showPassword, setShowPassword, isLoading, handleSignup
}: any) {
    return (
        <div className="relative overflow-hidden rounded-[40px] border border-white/10 bg-white/[0.03] backdrop-blur-3xl shadow-[0_32px_128px_-16px_rgba(0,0,0,0.6)] px-8 py-10 md:px-12 md:py-12">
            {/* Inner Glow/Highlight */}
            <div className="absolute inset-0 bg-gradient-to-tr from-white/5 via-transparent to-transparent opacity-30" />

            <div className="relative">
                {/* Logo & Header */}
                <div className="text-center mb-8">
                    <motion.div
                        initial={{ y: -20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="inline-flex items-center justify-center p-2 mb-6 rounded-full bg-white shadow-xl border-4 border-white"
                    >
                        <img
                            src="/logos/college-logo.jpg"
                            alt="College Logo"
                            className="w-20 h-20 object-contain rounded-full"
                        />
                    </motion.div>
                    <motion.h1
                        initial={{ y: -10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="text-4xl font-extrabold text-white tracking-tight"
                    >
                        {title}
                    </motion.h1>
                    <motion.p
                        initial={{ y: -10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="mt-2 text-blue-100/60 font-medium"
                    >
                        {subtitle}
                    </motion.p>
                </div>

                {/* Role Switcher */}
                <div className="flex bg-white/5 p-1.5 rounded-2xl mb-8 border border-white/5">
                    <button
                        onClick={() => role === 'faculty' ? onToggleRole() : null}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all duration-300 ${role === 'student' ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}
                    >
                        <GraduationCap size={18} />
                        Student
                    </button>
                    <button
                        onClick={() => role === 'student' ? onToggleRole() : null}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all duration-300 ${role === 'faculty' ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}
                    >
                        <Building2 size={18} />
                        Faculty
                    </button>
                </div>

                {/* Signup Form */}
                <form onSubmit={handleSignup} className="space-y-5">
                    <div className="space-y-4 text-left">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 px-1">Full Name</label>
                            <input
                                type="text"
                                required
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                className="w-full px-6 py-4 rounded-2xl border border-white/5 bg-white/[0.02] text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40 transition-all duration-300 hover:bg-white/[0.05]"
                                placeholder="Enter your full name"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 px-1">College Email</label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-6 py-4 rounded-2xl border border-white/5 bg-white/[0.02] text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40 transition-all duration-300 hover:bg-white/[0.05]"
                                placeholder={role === 'faculty' ? 'faculty@college.edu' : 'student@college.edu'}
                            />
                        </div>

                        <div className="group relative">
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 px-1">Password</label>
                            <input
                                type={showPassword ? "text" : "password"}
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-6 py-4 rounded-2xl border border-white/5 bg-white/[0.02] text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40 transition-all duration-300 hover:bg-white/[0.05]"
                                placeholder="••••••••"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-5 top-[44px] text-slate-500 hover:text-white transition-colors"
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>

                    <div className="pt-4">
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            disabled={isLoading}
                            className="relative w-full overflow-hidden group py-5 rounded-2xl font-bold text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-900/20"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 bg-[length:200%_100%] group-hover:bg-[100%_0] transition-all duration-500" />
                            <div className="relative flex items-center justify-center gap-2">
                                {isLoading ? (
                                    <Loader2 className="animate-spin h-6 w-6" />
                                ) : (
                                    <>
                                        {role === 'faculty' ? 'Initialize Faculty Portal' : 'Create Student Account'}
                                        <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </div>
                        </motion.button>
                    </div>
                </form>

                {/* Footer Link */}
                <div className="mt-10 text-center">
                    <p className="text-slate-500 font-medium tracking-wide">
                        ALREADY AUTHORIZED?{' '}
                        <Link href="/login" className="text-white font-bold ml-1 hover:text-blue-400 transition-all decoration-blue-500 decoration-2 underline-offset-4">
                            LOG IN
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

