'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { signInUser, getUserRole } from '@/lib/authService';

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            // 1. Authenticate user
            const { user } = await signInUser(email, password);

            if (!user) {
                throw new Error('Login failed. Please try again.');
                return;
            }

            toast.success('Login successful!');

            // 2. Fetch role and redirect
            const role = await getUserRole(user.id);

            if (role === 'admin' || role === 'faculty') {
                router.push('/admin');
            } else {
                router.push('/search');
            }

        } catch (error: any) {
            console.error('Login Error:', error);
            toast.error(error.message || 'Something went wrong');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex min-h-screen bg-white">
            {/* LEFT SIDE - BRANDING (60%) */}
            <div className="hidden lg:flex w-[60%] relative overflow-hidden bg-gradient-to-br from-[#6b031c] via-[#911161] to-[#c2185b] items-center justify-center">
                {/* Mesh Gradient Effect Overlay */}
                <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.2),transparent_70%)] animate-pulse" />

                <div className="relative z-10 flex flex-col items-center text-center p-12">
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="mb-8"
                    >
                        {/* Placeholder for Logo if image not available, user can replace src */}
                        <div className="w-32 h-32 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-2xl mb-6 mx-auto border border-white/30">
                            <span className="text-4xl font-bold text-white">DP</span>
                        </div>
                        {/* <img src="/logos/logo.png" alt="Logo" className="w-48 h-auto mb-6 drop-shadow-2xl" /> */}
                    </motion.div>

                    <motion.h1
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2, duration: 0.8 }}
                        className="text-5xl font-bold text-white mb-4 tracking-tight"
                    >
                        Research Portal
                    </motion.h1>

                    <motion.p
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.4, duration: 0.8 }}
                        className="text-xl text-pink-50 font-light max-w-md"
                    >
                        Empowering Research, One Project at a Time.
                    </motion.p>
                </div>
            </div>

            {/* RIGHT SIDE - FORM (40%) */}
            {/* RIGHT SIDE - FORM (40%) */}
            <div className="w-full lg:w-[40%] flex items-center justify-center p-8 bg-white relative">
                <motion.div
                    initial={{ x: 50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.6 }}
                    className="w-full max-w-md space-y-8"
                >
                    <div className="text-center lg:text-left">
                        <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Welcome Back</h2>
                        <p className="mt-2 text-slate-500">Please enter your details to sign in.</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">College Email</label>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full px-4 py-3.5 rounded-xl border border-slate-200 focus:border-pink-500 focus:ring-4 focus:ring-pink-500/10 transition-all outline-none bg-slate-50/50 hover:bg-white focus:bg-white backdrop-blur-sm"
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
                                        className="w-full px-4 py-3.5 rounded-xl border border-slate-200 focus:border-pink-500 focus:ring-4 focus:ring-pink-500/10 transition-all outline-none bg-slate-50/50 hover:bg-white focus:bg-white backdrop-blur-sm"
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
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <input id="remember-me" name="remember-me" type="checkbox" className="h-4 w-4 text-pink-600 focus:ring-pink-500 border-slate-300 rounded" />
                                <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-600">Remember me</label>
                            </div>
                            <div className="text-sm">
                                <a href="#" className="font-medium text-pink-600 hover:text-pink-500">Forgot password?</a>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-lg shadow-pink-500/20 text-sm font-bold text-white bg-gradient-to-r from-[#6b031c] to-[#911161] hover:from-[#800422] hover:to-[#a3126d] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed hover:shadow-pink-500/40"
                        >
                            {isLoading ? (
                                <Loader2 className="animate-spin h-5 w-5" />
                            ) : (
                                "Sign In"
                            )}
                        </button>

                        <div className="text-center mt-4">
                            <p className="text-sm text-slate-600">
                                Don't have an account?{' '}
                                <Link href="/signup" className="font-medium text-pink-600 hover:text-pink-500 transition-colors">
                                    Create an account
                                </Link>
                            </p>
                        </div>
                    </form>
                </motion.div>
            </div>
        </div>
    );
}
