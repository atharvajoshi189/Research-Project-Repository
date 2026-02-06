"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, GitCommit, GitPullRequest, Zap, Users, Code, Clock, Laptop } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

const LiveActivitySection = () => {
    // Real-time Supabase stats
    const [stats, setStats] = useState({
        projectsRecent: 0, // Used to be commits
        activeDevs: 1, // Start with 1 (current user)
        approvedProjects: 0, // Used to be PRs
        totalProjects: 0 // Used to be hours
    });

    useEffect(() => {
        const fetchInitialStats = async () => {
            // 1. Projects Updated in last 24h (Recent Activity)
            const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
            const { count: recentCount } = await supabase
                .from('projects')
                .select('*', { count: 'exact', head: true })
                .gt('updated_at', oneDayAgo);

            // 2. Approved Projects (Similar to Merged PRs)
            const { count: approvedCount } = await supabase
                .from('projects')
                .select('*', { count: 'exact', head: true })
                .eq('status', 'approved');

            // 3. Total Projects (Volume)
            const { count: totalCount } = await supabase
                .from('projects')
                .select('*', { count: 'exact', head: true });

            setStats(prev => ({
                ...prev,
                projectsRecent: recentCount || 0,
                approvedProjects: approvedCount || 0,
                totalProjects: totalCount || 0
            }));
        }

        fetchInitialStats();

        // 4. Real-time Presence for "Active Devs"
        const channel = supabase.channel('online-users');
        channel
            .on('presence', { event: 'sync' }, () => {
                const presenceState = channel.presenceState();
                const userCount = Object.keys(presenceState).length;
                // Ensure at least 1 (the current user) is shown if presence is slow to sync, 
                // but presenceState usually reflects accurate count.
                // Depending on tracking, we might just count random IDs if not auth'd.
                setStats(prev => ({ ...prev, activeDevs: userCount > 0 ? userCount : 1 }));
            })
            .subscribe(async (status) => {
                if (status === 'SUBSCRIBED') {
                    await channel.track({ online_at: new Date().toISOString() });
                }
            });

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    return (
        <section className="relative w-full py-24 bg-slate-50 overflow-hidden">
            <div className="max-w-7xl mx-auto px-6 relative z-10">

                {/* Section Header */}
                <div className="flex items-center justify-between mb-12">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <div className="relative flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-teal-500"></span>
                            </div>
                            <span className="text-teal-600 font-bold uppercase tracking-widest text-xs">Live Systems</span>
                        </div>
                        <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
                            Repository <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-blue-600">Pulse</span>
                        </h2>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Activity Dashboard Cards */}
                    <div className="lg:col-span-1 grid grid-cols-2 gap-4">
                        <StatCard
                            icon={<Zap size={20} />}
                            label="Activity (24h)"
                            value={stats.projectsRecent}
                            color="blue"
                            trend="Live"
                        />
                        <StatCard
                            icon={<Users size={20} />}
                            label="Online Users"
                            value={stats.activeDevs}
                            color="purple"
                            trend="Now"
                        />
                        <StatCard
                            icon={<GitPullRequest size={20} />}
                            label="Projects Approved"
                            value={stats.approvedProjects}
                            color="teal"
                            trend="Total"
                        />
                        <StatCard
                            icon={<Code size={20} />}
                            label="Total Projects"
                            value={stats.totalProjects}
                            color="amber"
                            trend="All Time"
                        />
                    </div>

                    {/* Right Column: Live Graph Area */}
                    <div className="lg:col-span-2 relative h-[300px] lg:h-auto bg-white rounded-3xl border border-slate-200 shadow-sm p-6 overflow-hidden flex flex-col">
                        <div className="flex items-center justify-between mb-6 z-10">
                            <h3 className="font-bold text-slate-700 flex items-center gap-2">
                                <Activity size={18} className="text-slate-400" />
                                Commit Velocity
                            </h3>
                            <div className="flex gap-2 text-xs font-medium text-slate-400">
                                <span className="px-2 py-1 rounded bg-slate-100 text-slate-600">24H</span>
                                <span className="px-2 py-1 rounded hover:bg-slate-50 cursor-pointer">7D</span>
                                <span className="px-2 py-1 rounded hover:bg-slate-50 cursor-pointer">30D</span>
                            </div>
                        </div>

                        {/* The Graph */}
                        <div className="relative flex-1 w-full">
                            <LiveGraph />
                        </div>
                    </div>
                </div>

            </div>
        </section>
    );
};

const StatCard = ({ icon, label, value, color, trend }: any) => {
    const colorClasses: Record<string, string> = {
        blue: "text-blue-600 bg-blue-50 border-blue-100",
        purple: "text-purple-600 bg-purple-50 border-purple-100",
        teal: "text-teal-600 bg-teal-50 border-teal-100",
        amber: "text-amber-600 bg-amber-50 border-amber-100",
    };

    return (
        <motion.div
            whileHover={{ y: -4 }}
            className={`p-4 rounded-2xl border bg-white shadow-sm flex flex-col justify-between h-32`}
        >
            <div className="flex items-start justify-between">
                <div className={`p-2 rounded-xl ${colorClasses[color]} bg-opacity-50`}>
                    {icon}
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${color === 'teal' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                    {trend}
                </span>
            </div>
            <div>
                <div className="text-2xl font-black text-slate-800 tracking-tight">{value}</div>
                <div className="text-xs font-semibold text-slate-400">{label}</div>
            </div>
        </motion.div>
    );
}

const LiveGraph = () => {
    // Generate some random data points for the path
    const points = [10, 25, 18, 30, 22, 45, 35, 55, 40, 60, 50, 75, 65, 80, 70, 90, 85, 60, 75, 50, 65, 40, 55, 30];
    const width = 1000;
    const height = 200;
    const gap = width / (points.length - 1);

    // Create the SVG path string
    const pathD = `M 0 ${height} ` + points.map((p, i) => {
        return `L ${i * gap} ${height - (p / 100) * height}`;
    }).join(' ') + ` L ${width} ${height} Z`;

    const linePathD = points.map((p, i) => {
        return `${i === 0 ? 'M' : 'L'} ${i * gap} ${height - (p / 100) * height}`;
    }).join(' ');

    return (
        <div className="absolute inset-0 w-full h-full">
            <svg className="w-full h-full" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
                <defs>
                    <linearGradient id="graphGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#0D9488" stopOpacity="0.2" />
                        <stop offset="100%" stopColor="#0D9488" stopOpacity="0" />
                    </linearGradient>
                </defs>

                {/* Area Fill */}
                <motion.path
                    d={pathD}
                    fill="url(#graphGradient)"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1 }}
                />

                {/* Line Path */}
                <motion.path
                    d={linePathD}
                    fill="none"
                    stroke="#0D9488"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 2, ease: "easeInOut" }}
                />
            </svg>

            {/* Scanning Line */}
            <motion.div
                className="absolute top-0 bottom-0 w-[2px] bg-teal-500/50 shadow-[0_0_10px_rgba(20,184,166,0.5)] z-20"
                animate={{ left: ["0%", "100%"] }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            />
        </div>
    );
}

export default LiveActivitySection;
