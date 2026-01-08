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
            // 1. Sign up user
            const { user } = await signUpUser(email, password, fullName, role);

            if (!user) {
                throw new Error('Signup failed. Please try again.');
                return;
            }

            toast.success('Account created successfully!');

            // 2. Redirect based on role
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
        <div className="fixed inset-0 z-50 flex min-h-screen bg-white">
            {/* LEFT SIDE - BRANDING (60%) */}
            <div className="hidden lg:flex w-[60%] relative overflow-hidden bg-gradient-to-br from-indigo-600 via-blue-600 to-teal-500 items-center justify-center">
                {/* Slightly different gradient order for signup to distinguish but keep theme */}
                <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.2),transparent_70%)] animate-pulse" />

                <div className="relative z-10 flex flex-col items-center text-center p-12">
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="mb-8"
                    >
                        <div className="w-32 h-32 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-2xl mb-6 mx-auto border border-white/30">
                            <span className="text-4xl font-bold text-white">DP</span>
                        </div>
                    </motion.div>

                    <motion.h1
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2, duration: 0.8 }}
                        className="text-5xl font-bold text-white mb-4 tracking-tight"
                    >
                        Join the Community
                    </motion.h1>

                    <motion.p
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.4, duration: 0.8 }}
                        className="text-xl text-teal-50 font-light max-w-md"
                    >
                        Start contributing to the future of academic research today.
                    </motion.p>
                </div>
            </div>

            {/* RIGHT SIDE - FORM (40%) */}
            <div className="w-full lg:w-[40%] flex items-center justify-center p-8 bg-white relative overflow-y-auto">
                <motion.div
                    initial={{ x: 50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.6 }}
                    className="w-full max-w-md space-y-8 my-auto"
                >
                    <div className="text-center lg:text-left">
                        <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Create Account</h2>
                        <p className="mt-2 text-slate-500">Fill in your details to get started.</p>
                    </div>

                    <form onSubmit={handleSignup} className="space-y-5">

                        {/* Role Selector */}
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                type="button"
                                onClick={() => setRole('student')}
                                className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${role === 'student' ? 'border-cyan-500 bg-cyan-50 text-cyan-700' : 'border-slate-100 hover:border-cyan-200 text-slate-500 hover:bg-slate-50'}`}
                            >
                                <GraduationCap className={`mb-2 ${role === 'student' ? 'text-cyan-600' : 'text-slate-400'}`} />
                                <span className="font-semibold text-sm">Student</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setRole('faculty')}
                                className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${role === 'faculty' ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-slate-100 hover:border-indigo-200 text-slate-500 hover:bg-slate-50'}`}
                            >
                                <Building2 className={`mb-2 ${role === 'faculty' ? 'text-indigo-600' : 'text-slate-400'}`} />
                                <span className="font-semibold text-sm">Faculty / Admin</span>
                            </button>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                            <input
                                type="text"
                                required
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 transition-all outline-none bg-slate-50 hover:bg-white"
                                placeholder="John Doe"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">College Email</label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 transition-all outline-none bg-slate-50 hover:bg-white"
                                placeholder="student@college.edu"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 transition-all outline-none bg-slate-50 hover:bg-white"
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <Loader2 className="animate-spin h-5 w-5" />
                            ) : (
                                "Create Account"
                            )}
                        </button>

                        <div className="text-center mt-4">
                            <p className="text-sm text-slate-600">
                                Already have an account?{' '}
                                <Link href="/login" className="font-medium text-cyan-600 hover:text-cyan-500 transition-colors">
                                    Sign In
                                </Link>
                            </p>
                        </div>
                    </form>
                </motion.div>
            </div>
        </div>
    );
}
