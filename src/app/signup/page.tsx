'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Loader2, GraduationCap, Building2 } from 'lucide-react';
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
        <div className="fixed inset-0 z-50 flex min-h-screen bg-slate-950 font-sans">
            {/* LEFT SIDE - BRANDING (60%) */}
            <div className="hidden lg:flex w-[60%] relative overflow-hidden items-center justify-center">
                {/* Rich Teal Gradient Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-teal-950 to-slate-900 animate-gradient-x"></div>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(20,184,166,0.15),transparent_60%)]"></div>

                <div className="relative z-10 flex flex-col items-center text-center p-12">
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="mb-8"
                    >
                        {/* 3D Glass Logo Placeholder - Teal Tint */}
                        <div className="w-40 h-40 bg-teal-500/10 backdrop-blur-xl rounded-2xl flex items-center justify-center shadow-2xl border border-white/10 transform rotate-3 hover:rotate-0 transition-all duration-500 group relative">
                            <div className="absolute inset-0 bg-gradient-to-br from-teal-400/20 to-transparent opacity-50 rounded-2xl"></div>
                            <span className="text-6xl font-black text-white/90 drop-shadow-lg group-hover:text-white transition-colors">DP</span>
                        </div>
                    </motion.div>

                    <motion.h1
                        initial={{ y: 30, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.3, duration: 0.8 }}
                        className="text-6xl font-black text-white mb-2 tracking-tighter uppercase"
                    >
                        Join the <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-500 text-glow-teal">Community</span>
                    </motion.h1>

                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: "100px" }}
                        transition={{ delay: 0.8, duration: 1 }}
                        className="h-1 bg-teal-500 rounded-full mb-6"
                    />

                    <motion.p
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.5, duration: 0.8 }}
                        className="text-lg text-slate-300 font-medium max-w-md tracking-wide"
                    >
                        INNOVATING FOR TOMORROW
                    </motion.p>
                </div>
            </div>

            {/* RIGHT SIDE - FORM (40%) */}
            <div className="w-full lg:w-[40%] flex items-center justify-center p-8 bg-slate-900 relative perspective-1000">
                {/* Gradient Overlay for Right Side */}
                <div className="absolute inset-0 bg-gradient-to-b from-slate-900 to-slate-950"></div>

                <motion.div
                    initial={{ x: 50, opacity: 0 }}
                    animate={{
                        x: 0,
                        opacity: 1,
                        rotateY: role === 'faculty' ? 180 : 0
                    }}
                    transition={{
                        delay: 0.2,
                        duration: 0.8,
                        rotateY: { duration: 0.8, ease: "easeInOut" }
                    }}
                    className="w-full max-w-md relative z-10 group preserve-3d"
                >
                    {/* Inner Card - Front (Student) */}
                    <div className={`w-full space-y-8 backface-hidden ${role === 'faculty' ? 'pointer-events-none opacity-0' : 'pointer-events-auto opacity-100'}`}>
                        {/* Glass Panel Background */}
                        <div className="absolute -inset-6 bg-slate-800/60 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl -z-10 transition-all duration-500 ease-out group-hover:scale-[1.02] group-hover:bg-slate-800/80 group-hover:border-teal-500/30 group-hover:shadow-[0_0_40px_rgba(20,184,166,0.2)]"></div>

                        <div className="text-center lg:text-left mb-8">
                            <h2 className="text-3xl font-bold text-white tracking-tight uppercase border-l-4 border-teal-500 pl-4">Student Access</h2>
                            <p className="mt-2 text-slate-400 pl-4 text-sm font-medium">Join the research network</p>
                        </div>

                        <div className="space-y-5">
                            {/* Role Toggle Snippet - Repurposed as triggers */}
                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <button
                                    type="button"
                                    onClick={() => setRole('student')}
                                    className="flex items-center justify-center py-3 px-4 rounded-lg border border-teal-500 bg-teal-500/20 text-teal-400 font-medium text-sm"
                                >
                                    <GraduationCap className="mr-2 w-4 h-4" /> Student
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setRole('faculty')}
                                    className="flex items-center justify-center py-3 px-4 rounded-lg border border-slate-700 bg-slate-800/50 text-slate-500 hover:border-slate-600 font-medium text-sm"
                                >
                                    <Building2 className="mr-2 w-4 h-4" /> Faculty
                                </button>
                            </div>

                            <SignupForm
                                role="student"
                                fullName={fullName} setFullName={setFullName}
                                email={email} setEmail={setEmail}
                                password={password} setPassword={setPassword}
                                showPassword={showPassword} setShowPassword={setShowPassword}
                                isLoading={isLoading}
                                onSubmit={handleSignup}
                            />
                        </div>
                    </div>

                    {/* Inner Card - Back (Faculty) */}
                    <div className={`w-full space-y-8 backface-hidden rotate-y-180 absolute top-0 left-0 ${role === 'student' ? 'pointer-events-none opacity-0' : 'pointer-events-auto opacity-100'}`}>
                        {/* Glass Panel Background */}
                        <div className="absolute -inset-6 bg-slate-800/60 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl -z-10 transition-all duration-500 ease-out group-hover:scale-[1.02] group-hover:bg-slate-800/80 group-hover:border-teal-500/30 group-hover:shadow-[0_0_40px_rgba(20,184,166,0.2)]"></div>

                        <div className="text-center lg:text-left mb-8">
                            <h2 className="text-3xl font-bold text-white tracking-tight uppercase border-l-4 border-teal-500 pl-4">Faculty Portal</h2>
                            <p className="mt-2 text-slate-400 pl-4 text-sm font-medium">Elevate academic management</p>
                        </div>

                        <div className="space-y-5">
                            {/* Role Toggle Snippet - Repurposed as triggers */}
                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <button
                                    type="button"
                                    onClick={() => setRole('student')}
                                    className="flex items-center justify-center py-3 px-4 rounded-lg border border-slate-700 bg-slate-800/50 text-slate-500 hover:border-slate-600 font-medium text-sm"
                                >
                                    <GraduationCap className="mr-2 w-4 h-4" /> Student
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setRole('faculty')}
                                    className="flex items-center justify-center py-3 px-4 rounded-lg border border-teal-500 bg-teal-500/20 text-teal-400 font-medium text-sm"
                                >
                                    <Building2 className="mr-2 w-4 h-4" /> Faculty
                                </button>
                            </div>

                            <SignupForm
                                role="faculty"
                                fullName={fullName} setFullName={setFullName}
                                email={email} setEmail={setEmail}
                                password={password} setPassword={setPassword}
                                showPassword={showPassword} setShowPassword={setShowPassword}
                                isLoading={isLoading}
                                onSubmit={handleSignup}
                            />
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}

// Sub-component for the form fields to avoid duplication
function SignupForm({ role, fullName, setFullName, email, setEmail, password, setPassword, showPassword, setShowPassword, isLoading, onSubmit }: any) {
    return (
        <form onSubmit={onSubmit} className="space-y-5">
            <div className="space-y-4">
                <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Full Name</label>
                    <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-950/60 border border-slate-700 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all rounded-lg font-medium"
                        placeholder="Enter full name"
                    />
                </div>

                <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">College Email</label>
                    <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-950/60 border border-slate-700 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all rounded-lg font-medium"
                        placeholder={role === 'faculty' ? "faculty@college.edu" : "student@college.edu"}
                    />
                </div>

                <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Password</label>
                    <div className="relative">
                        <input
                            type={showPassword ? "text" : "password"}
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 bg-slate-950/60 border border-slate-700 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all rounded-lg font-medium"
                            placeholder="••••••••"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                        >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                </div>
            </div>

            <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-4 px-4 mt-6 border border-transparent rounded-lg shadow-lg shadow-teal-900/20 text-sm font-bold text-white bg-teal-600 hover:bg-teal-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-all transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed uppercase tracking-widest shadow-glow-teal"
            >
                {isLoading ? (
                    <Loader2 className="animate-spin h-5 w-5" />
                ) : (
                    "Initiate Access"
                )}
            </button>

            <div className="text-center mt-6 pt-6 border-t border-white/5">
                <p className="text-xs text-slate-500 font-medium">
                    ALREADY AUTHORIZED?{' '}
                    <Link href="/login" className="font-bold text-teal-500 hover:text-teal-400 transition-colors uppercase">
                        Sign In
                    </Link>
                </p>
            </div>
        </form>
    );
}

