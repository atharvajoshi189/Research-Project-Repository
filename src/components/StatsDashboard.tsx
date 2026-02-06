"use client";

import { useEffect, useState, useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform, useInView } from "framer-motion";
import { FileText, Activity, Users } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

export default function StatsDashboard() {
    const [stats, setStats] = useState({
        papers: 0,
        ongoing: 0,
        faculty: 0,
        users: 0,
    });

    const fetchStats = async () => {
        // 1. Total Papers (Approved Projects)
        const { count: papersCount } = await supabase
            .from("projects")
            .select("*", { count: "exact", head: true })
            .eq("status", "approved");

        // 2. Ongoing Projects (Pending)
        const { count: ongoingCount } = await supabase
            .from("projects")
            .select("*", { count: "exact", head: true })
            .eq("status", "pending");

        // 3. Faculty Contributors (Unique Guide Names)
        const { data: facultyData } = await supabase
            .from("projects")
            .select("guide_name");

        const uniqueFaculty = new Set(facultyData?.map((p: any) => p.guide_name).filter(Boolean)).size;

        // 4. Total Users (Researchers/Students)
        const { count: usersCount } = await supabase
            .from("profiles")
            .select("*", { count: "exact", head: true });

        setStats({
            papers: papersCount || 0,
            ongoing: ongoingCount || 0,
            faculty: uniqueFaculty || 0,
            users: usersCount || 0,
        });
    };

    useEffect(() => {
        fetchStats();

        // Real-time Subscriptions
        const channel = supabase
            .channel('stats-db-changes')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'projects' },
                () => {
                    console.log('Projects changed, refreshing stats...');
                    fetchStats();
                }
            )
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'profiles' },
                () => {
                    console.log('Profiles changed, refreshing stats...');
                    fetchStats();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    return (
        <div className="w-full max-w-7xl mx-auto perspective-1000">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 px-4">
                <Stat3DCard
                    icon={FileText}
                    label="Papers"
                    value={stats.papers}
                    color="from-blue-500 via-indigo-500 to-violet-500"
                    glow="bg-blue-500"
                    delay={0}
                />
                <Stat3DCard
                    icon={Activity}
                    label="Ongoing"
                    value={stats.ongoing}
                    color="from-fuchsia-500 via-pink-500 to-rose-500"
                    glow="bg-fuchsia-500"
                    delay={0.1}
                />
                <Stat3DCard
                    icon={Users}
                    label="Faculty"
                    value={stats.faculty}
                    color="from-emerald-500 via-teal-500 to-cyan-500"
                    glow="bg-emerald-500"
                    delay={0.2}
                />
                <Stat3DCard
                    icon={Users}
                    label="Researchers"
                    value={stats.users}
                    color="from-amber-500 via-orange-500 to-red-500"
                    glow="bg-amber-500"
                    delay={0.3}
                />
            </div>
        </div>
    );
}

const Stat3DCard = ({ icon: Icon, label, value, color, glow, delay }: any) => {
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const rotateX = useTransform(y, [-0.5, 0.5], ["10deg", "-10deg"]);
    const rotateY = useTransform(x, [-0.5, 0.5], ["-10deg", "10deg"]);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        x.set((e.clientX - rect.left) / rect.width - 0.5);
        y.set((e.clientY - rect.top) / rect.height - 0.5);
    };

    const handleMouseLeave = () => {
        x.set(0);
        y.set(0);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay, duration: 0.5, type: "spring" }}
            className="perspective-1000 group relative"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
        >
            <motion.div
                style={{ rotateX, rotateY }}
                className="relative h-32 rounded-2xl bg-white/60 backdrop-blur-xl border border-white/60 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] overflow-hidden flex items-center p-4 transition-transform duration-200 group-hover:shadow-[0_20px_50px_-10px_rgba(0,0,0,0.15)]"
            >
                {/* Fantastic Flux Background */}
                <motion.div
                    className={`absolute inset-0 opacity-20 bg-gradient-to-r ${color}`}
                    animate={{
                        backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                    }}
                    transition={{
                        duration: 5,
                        repeat: Infinity,
                        ease: "linear",
                        repeatType: "reverse"
                    }}
                    style={{ backgroundSize: "200% 200%" }}
                />

                {/* Holographic Border Shine */}
                <div className={`absolute inset-0 bg-gradient-to-r ${color} opacity-0 group-hover:opacity-50 transition-opacity duration-500 mix-blend-overlay`} style={{ maskImage: "linear-gradient(black, black), linear-gradient(black, black)", maskClip: "content-box, border-box", maskComposite: "exclude", padding: "2px" }} />

                {/* Content Container (Horizontal Compact) */}
                <div className="relative z-10 flex items-center gap-5 w-full" style={{ transform: "translateZ(20px)" }}>
                    {/* Glowing Icon Box */}
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300 shadow-${glow}/30 ring-4 ring-white/50`}>
                        <Icon size={28} strokeWidth={2} />
                    </div>

                    {/* Stats Text */}
                    <div className="flex flex-col">
                        <h4 className="text-5xl font-black text-slate-800 tracking-tighter leading-none drop-shadow-sm">
                            <Counter end={value} />
                        </h4>
                        <span className={`text-xs font-bold uppercase tracking-widest bg-gradient-to-r ${color} bg-clip-text text-transparent opacity-80 group-hover:opacity-100 transition-opacity`}>
                            {label}
                        </span>
                    </div>
                </div>

                {/* Particle Glow */}
                <div className={`absolute -right-10 -bottom-10 w-32 h-32 ${glow} blur-[60px] opacity-30 group-hover:opacity-50 transition-opacity duration-300 pointer-events-none`} />
            </motion.div>
        </motion.div>
    );
};

const Counter = ({ end }: { end: number }) => {
    const nodeRef = useRef<HTMLSpanElement>(null);
    const inView = useInView(nodeRef, { once: false }); // Reset every time it enters view

    // Use a motion value for the number
    const count = useSpring(0, { stiffness: 50, damping: 20 });
    const rounded = useTransform(count, (latest) => Math.round(latest));

    useEffect(() => {
        if (inView) {
            count.set(end);
        } else {
            count.set(0); // Reset to 0 when out of view to re-animate on scroll
        }
    }, [inView, end, count]);

    return (
        <motion.span ref={nodeRef}>
            {rounded}
        </motion.span>
    );
};
