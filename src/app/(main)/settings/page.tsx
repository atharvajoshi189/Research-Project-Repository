"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { User, Lock, Mail, Save, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import BackgroundBlobs from '@/components/BackgroundBlobs';
import GridPulse from '@/components/GridPulse';
import BentoGrid from '@/components/BentoGrid';

export default function SettingsPage() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    // Form States
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');

    // Password States
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        const getUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                router.push('/login');
                return;
            }
            setUser(session.user);
            setEmail(session.user.email || '');
            setFullName(session.user.user_metadata?.full_name || '');
            setLoading(false);
        };
        getUser();
    }, []);

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        const { error } = await supabase.auth.updateUser({
            data: { full_name: fullName }
        });

        if (error) {
            toast.error(error.message);
        } else {
            toast.success("Profile updated successfully!");
            router.refresh();
        }
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }
        if (newPassword.length < 6) {
            toast.error("Password must be at least 6 characters");
            return;
        }

        const { error } = await supabase.auth.updateUser({
            password: newPassword
        });

        if (error) {
            toast.error(error.message);
        } else {
            toast.success("Password updated successfully!");
            setNewPassword('');
            setConfirmPassword('');
        }
    };

    if (loading) return null;

    return (
        <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans selection:bg-teal-100 flex justify-center items-center p-6 relative overflow-hidden">
            {/* Background Effects */}
            <BackgroundBlobs />
            <div className="fixed inset-0 z-0 pointer-events-none">
                <GridPulse />
                <BentoGrid />
            </div>


            <div className="max-w-4xl w-full bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 overflow-hidden border border-slate-100 flex flex-col md:flex-row">

                {/* Sidebar / Info Panel */}
                <div className="bg-slate-900 text-white p-10 md:w-1/3 flex flex-col justify-between relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500 rounded-full blur-[80px] opacity-20 -translate-y-1/2 translate-x-1/2"></div>

                    <div className="relative z-10">
                        <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-sm border border-white/10">
                            <User size={32} className="text-teal-400" />
                        </div>
                        <h1 className="text-3xl font-bold mb-2">Account Settings</h1>
                        <p className="text-slate-400 text-sm">Manage your personal information and security preferences.</p>
                    </div>

                    <div className="relative z-10 mt-10 space-y-4">
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 text-sm">
                            <ShieldCheck size={18} className="text-emerald-400" />
                            <span className="text-slate-300">Secure Environment</span>
                        </div>
                        <p className="text-xs text-slate-500">
                            Your data is encrypted and stored securely. Changes to your password will require you to log in again on other devices.
                        </p>
                    </div>
                </div>

                {/* Forms Panel */}
                <div className="p-10 md:w-2/3 space-y-10">

                    {/* Section A: General */}
                    <section>
                        <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                            <User size={20} className="text-teal-600" /> General Information
                        </h2>
                        <form onSubmit={handleUpdateProfile} className="space-y-5">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Email Address</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-3.5 text-slate-400" size={18} />
                                    <input
                                        type="email"
                                        value={email}
                                        disabled
                                        className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 text-slate-500 font-bold rounded-xl cursor-not-allowed"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Full Name</label>
                                <input
                                    type="text"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    className="w-full px-4 py-3 bg-white border border-slate-200 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 rounded-xl font-semibold text-slate-700 transition-all outline-none"
                                    placeholder="Enter your full name"
                                />
                            </div>
                            <button type="submit" className="px-6 py-2.5 bg-slate-900 text-white font-bold rounded-xl hover:bg-teal-600 transition-colors flex items-center gap-2 text-sm">
                                <Save size={16} /> Update Profile
                            </button>
                        </form>
                    </section>

                    <div className="h-px bg-slate-100"></div>

                    {/* Section B: Security */}
                    <section>
                        <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                            <Lock size={20} className="text-rose-500" /> Security
                        </h2>
                        <form onSubmit={handleChangePassword} className="space-y-5">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">New Password</label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            className="w-full px-4 py-3 bg-white border border-slate-200 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 rounded-xl font-semibold text-slate-700 transition-all outline-none"
                                            placeholder="••••••••"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 transition-colors"
                                        >
                                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Confirm Password</label>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="w-full px-4 py-3 bg-white border border-slate-200 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 rounded-xl font-semibold text-slate-700 transition-all outline-none"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={!newPassword || !confirmPassword}
                                className="px-6 py-2.5 bg-rose-50 text-rose-600 border border-rose-100 font-bold rounded-xl hover:bg-rose-100 hover:border-rose-200 transition-colors flex items-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Lock size={16} /> Change Password
                            </button>
                        </form>
                    </section>

                </div>
            </div>
        </div>
    );
}
