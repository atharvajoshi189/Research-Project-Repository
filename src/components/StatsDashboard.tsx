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
    });

    useEffect(() => {
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

            setStats({
                papers: papersCount || 0,
                ongoing: ongoingCount || 0,
                faculty: uniqueFaculty || 0,
            });
        };

        fetchStats();
    }, []);

    return (
        <div className="w-full max-w-5xl mx-auto perspective-1000">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-4">
                <Stat3DCard
                    icon={FileText}
                    label="Total Papers"
                    value={stats.papers}
                    color="from-blue-400 to-indigo-600"
                    glow="bg-blue-500"
                    delay={0}
                />
                <Stat3DCard
                    icon={Activity}
                    label="Ongoing Projects"
                    value={stats.ongoing}
                    color="from-amber-400 to-orange-600"
                    glow="bg-amber-500"
                    delay={0.2}
                />
                <Stat3DCard
                    icon={Users}
                    label="Faculty Contributors"
                    value={stats.faculty}
                    color="from-emerald-400 to-teal-600"
                    glow="bg-emerald-500"
                    delay={0.4}
                />
            </div>
        </div>
    );
}

const Stat3DCard = ({ icon: Icon, label, value, color, glow, delay }: any) => {
    const ref = useRef<HTMLDivElement>(null);
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const mouseX = useSpring(x, { stiffness: 500, damping: 100 });
    const mouseY = useSpring(y, { stiffness: 500, damping: 100 });

    const rotateX = useTransform(mouseY, [-0.5, 0.5], ["15deg", "-15deg"]);
    const rotateY = useTransform(mouseX, [-0.5, 0.5], ["-15deg", "15deg"]);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!ref.current) return;
        const rect = ref.current.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;
        const mX = e.clientX - rect.left;
        const mY = e.clientY - rect.top;
        const xPct = mX / width - 0.5;
        const yPct = mY / height - 0.5;
        x.set(xPct);
        y.set(yPct);
    };

    const handleMouseLeave = () => {
        x.set(0);
        y.set(0);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay, duration: 0.8, type: "spring" }}
            className="relative"
            style={{ perspective: 1000 }}
        >
            {/* Floating Animation Wrapper */}
            <motion.div
                animate={{ y: [0, -15, 0] }}
                transition={{
                    duration: 6,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: delay * 2 // Stagger the bobbing
                }}
            >
                <motion.div
                    ref={ref}
                    onMouseMove={handleMouseMove}
                    onMouseLeave={handleMouseLeave}
                    style={{
                        rotateX,
                        rotateY,
                        transformStyle: "preserve-3d",
                    }}
                    className="relative w-full aspect-[4/3] rounded-3xl bg-white/40 backdrop-blur-2xl border border-white/60 shadow-xl overflow-hidden group cursor-pointer"
                >
                    {/* Interior Glow / Spotlight */}
                    <div
                        className={`absolute inset-0 opacity-20 bg-gradient-to-br ${color} mix-blend-overlay`}
                    />
                    <motion.div
                        className="absolute inset-0 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                        style={{
                            background: useTransform(
                                [mouseX, mouseY],
                                ([x, y]) => `radial-gradient(circle at ${(x as number + 0.5) * 100}% ${(y as number + 0.5) * 100}%, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0) 50%)`
                            )
                        }}
                    />

                    {/* Content Layer (Parallax) */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-6 z-20" style={{ transform: "translateZ(30px)" }}>

                        {/* Icon Container */}
                        <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center text-white shadow-lg mb-4 transform group-hover:scale-110 transition-transform duration-300`}>
                            <Icon size={28} strokeWidth={2.5} />
                        </div>

                        {/* Animated Counter */}
                        <h4 className="text-5xl font-black text-slate-800 tracking-tight mb-2 drop-shadow-sm">
                            <Counter end={value} />
                        </h4>

                        <p className="text-sm font-bold uppercase tracking-widest text-slate-500 group-hover:text-slate-700 transition-colors">
                            {label}
                        </p>
                    </div>

                    {/* Background Detail */}
                    <div className={`absolute -bottom-10 -right-10 w-40 h-40 ${glow} rounded-full blur-[60px] opacity-20 group-hover:opacity-40 transition-opacity duration-500`} />

                </motion.div>

                {/* Reflection Shadow below */}
                <div className="mx-auto w-[80%] h-4 bg-black/20 blur-xl rounded-[100%] mt-8 opacity-40 animate-pulse"></div>
            </motion.div>
        </motion.div>
    );
};

const Counter = ({ end }: { end: number }) => {
    const nodeRef = useRef<HTMLSpanElement>(null);
    const inView = useInView(nodeRef, { once: true });

    // Use a motion value for the number
    const count = useSpring(0, { stiffness: 50, damping: 20 });
    const rounded = useTransform(count, (latest) => Math.round(latest));

    useEffect(() => {
        if (inView) {
            count.set(end);
        }
    }, [inView, end, count]);

    return (
        <motion.span ref={nodeRef}>
            {rounded}
        </motion.span>
    );
};
