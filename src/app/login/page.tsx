'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Loader2, Sparkles, ArrowRight } from 'lucide-react';
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
            const { user } = await signInUser(email, password);

            if (!user) {
                throw new Error('Login failed. Please try again.');
            }

            toast.success('Login successful!');
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
                className="relative z-10 w-full max-w-[480px] px-4"
            >
                {/* GLASS CARD */}
                <div className="relative overflow-hidden rounded-[32px] border border-white/20 bg-white/5 backdrop-blur-2xl shadow-[0_32px_128px_-16px_rgba(0,0,0,0.5)]">
                    {/* Inner Glow/Highlight */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/10 via-transparent to-transparent opacity-50" />

                    <div className="relative p-10 md:p-12">
                        {/* Header Area */}
                        <div className="mb-10 text-center">
                            <motion.div
                                initial={{ y: -20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.2 }}
                                className="inline-flex items-center justify-center p-2 mb-6 rounded-full bg-white shadow-xl border-4 border-white"
                            >
                                <img
                                    src="/logos/college-logo.jpg"
                                    alt="College Logo"
                                    className="w-24 h-24 object-contain rounded-full"
                                />
                            </motion.div>
                            <motion.h1
                                initial={{ y: -10, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.3 }}
                                className="text-4xl font-extrabold text-white tracking-tight"
                            >
                                Research Portal
                            </motion.h1>
                            <motion.p
                                initial={{ y: -10, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.4 }}
                                className="mt-2 text-blue-100/60 font-medium"
                            >
                                Welcome back! Please sign in.
                            </motion.p>
                        </div>

                        {/* Login Form */}
                        <form onSubmit={handleLogin} className="space-y-6">
                            <div className="space-y-5">
                                <motion.div
                                    initial={{ x: -20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ delay: 0.5 }}
                                >
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 px-1">College Email</label>
                                    <div className="group relative">
                                        <input
                                            type="email"
                                            required
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full px-6 py-4 rounded-2xl border border-white/5 bg-white/[0.02] text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40 transition-all duration-300 group-hover:bg-white/[0.05]"
                                            placeholder="name@college.edu"
                                        />
                                    </div>
                                </motion.div>

                                <motion.div
                                    initial={{ x: -20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ delay: 0.6 }}
                                >
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 px-1">Password</label>
                                    <div className="group relative">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            required
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full px-6 py-4 rounded-2xl border border-white/5 bg-white/[0.02] text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40 transition-all duration-300 group-hover:bg-white/[0.05]"
                                            placeholder="••••••••"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                                        >
                                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                        </button>
                                    </div>
                                </motion.div>
                            </div>

                            <div className="flex items-center justify-between px-1">
                                <label className="flex items-center cursor-pointer group">
                                    <input type="checkbox" className="hidden" />
                                    <div className="w-5 h-5 border-2 border-white/10 rounded-md mr-3 flex items-center justify-center transition-all group-hover:border-blue-500 bg-white/[0.02]">
                                        <div className="w-2 h-2 bg-gradient-to-tr from-blue-500 to-cyan-400 rounded-sm opacity-0 group-active:opacity-100 transition-opacity" />
                                    </div>
                                    <span className="text-sm font-medium text-slate-400 group-hover:text-blue-100 transition-colors">Remember me</span>
                                </label>
                                <Link href="#" className="text-sm font-semibold text-blue-400 hover:text-blue-300 transition-colors">
                                    Forgot?
                                </Link>
                            </div>

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
                                            Log In
                                            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                        </>
                                    )}
                                </div>
                            </motion.button>
                        </form>

                        {/* Footer Link */}
                        <div className="mt-10 text-center">
                            <p className="text-slate-500 font-medium whitespace-nowrap">
                                New here?{' '}
                                <Link href="/signup" className="text-white font-bold decoration-blue-500 hover:text-blue-400 transition-all ml-1">
                                    Create Account
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>

                {/* Decorative Bottom Glow */}
                <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-4/5 h-20 bg-blue-500/10 blur-[60px] rounded-full -z-1" />
            </motion.div>
        </div>
    );
}
