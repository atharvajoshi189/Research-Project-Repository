"use client";

import React, { useRef } from 'react';
import { motion, useMotionTemplate, useMotionValue, useSpring } from 'framer-motion';
import { Trophy, Star, Crown, Sparkles, Award } from 'lucide-react';

const HallOfFame = () => {
    return (
        <section className="relative w-full py-20 overflow-hidden bg-slate-50">
            {/* Ambient Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-amber-100/40 via-transparent to-transparent blur-3xl" />

            <div className="relative z-10 max-w-4xl mx-auto px-6">
                {/* Header */}
                <div className="text-center mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-600 text-xs font-bold tracking-widest uppercase mb-6"
                    >
                        <Crown size={14} className="fill-amber-600" />
                        Excellence Arcade
                    </motion.div>

                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 mb-6"
                    >
                        Hall of <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-500 to-amber-600">Fame</span>
                    </motion.h2>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="max-w-xl mx-auto text-base text-slate-600 font-medium"
                    >
                        Honoring the visionaries who pushed boundaries and redefined possibilities this academic year.
                    </motion.p>
                </div>

                {/* Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 items-start">
                    {/* Card 2: Top Innovation (Left) */}
                    <FameCard
                        rank={2}
                        title="Top Innovation"
                        name="Project Aether"
                        project="Sustainable IoT"
                        description="A self-sustaining IoT ecosystem powered by ambient kinetic energy."
                        icon={<Sparkles size={24} className="text-white" />}
                        gradient="from-blue-400 to-cyan-600"
                        accentColor="blue"
                        delay={0.2}
                        className="md:mt-12 z-20" // Mid height
                        floatDuration={4}
                    />

                    {/* Card 1: Researcher of the Year (Center - Highest) */}
                    <FameCard
                        rank={1}
                        title="Researcher of the Year"
                        name="Dr. Sarah Chen"
                        project="Neural Architectures"
                        description="Pioneering work in adaptive neural networks for real-time processing."
                        icon={<Trophy size={24} className="text-white" />}
                        gradient="from-amber-400 to-orange-600"
                        accentColor="amber"
                        delay={0}
                        className="z-30 order-first md:order-none scale-110" // Highest & slightly larger
                        floatDuration={5}
                    />

                    {/* Card 3: Best Thesis (Right) */}
                    <FameCard
                        rank={3}
                        title="Best Thesis"
                        name="James Wilson"
                        project="Quantum Cryptography"
                        description="Breaking new ground in post-quantum securities for distributed ledgers."
                        icon={<Award size={24} className="text-white" />}
                        gradient="from-purple-400 to-pink-600"
                        accentColor="purple"
                        delay={0.4}
                        className="md:mt-24 z-10" // Lowest height
                        floatDuration={4.5}
                    />
                </div>
            </div>
        </section>
    );
};

const FameCard = ({ rank, title, name, project, description, icon, gradient, accentColor, delay, floatDuration = 4, className = "" }: any) => {
    const ref = useRef<HTMLDivElement>(null);
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const mouseXSpring = useSpring(x);
    const mouseYSpring = useSpring(y);

    const rotateX = useMotionTemplate`calc(${mouseYSpring} * -0.5deg)`;
    const rotateY = useMotionTemplate`calc(${mouseXSpring} * 0.5deg)`;

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!ref.current) return;
        const rect = ref.current.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        const xPct = mouseX / width - 0.5;
        const yPct = mouseY / height - 0.5;
        x.set(xPct * 20); // Multiplier determines tilt intensity
        y.set(yPct * 20);
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
            className={`group relative w-full aspect-square ${className}`}
        >
            <motion.div
                animate={{ y: [0, -12, 0] }}
                transition={{
                    duration: floatDuration,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
                className="h-full w-full"
            >
                <motion.div
                    ref={ref}
                    onMouseMove={handleMouseMove}
                    onMouseLeave={handleMouseLeave}
                    style={{
                        rotateX,
                        rotateY,
                        transformStyle: "preserve-3d",
                        perspective: 1000,
                    }}
                    className="relative h-full w-full bg-white rounded-[2rem] border border-slate-100 shadow-xl overflow-hidden flex flex-col"
                >
                    {/* Gradient Header */}
                    <div className={`absolute top-0 inset-x-0 h-20 bg-gradient-to-br ${gradient} p-4 flex items-start justify-between z-0`}>
                        <div className="relative z-10 bg-white/20 backdrop-blur-md border border-white/30 p-2 rounded-xl shadow-lg">
                            {icon}
                        </div>
                        <div className="text-white font-black text-5xl opacity-20 -mt-2 -mr-1 select-none">
                            #{rank}
                        </div>
                    </div>

                    {/* Content */}
                    <div className="relative pt-20 px-4 pb-4 flex flex-col items-center justify-between text-center z-10 h-full">
                        {/* Floating Avatar Placeholder */}
                        <div className="absolute top-8 left-1/2 -translate-x-1/2 w-16 h-16 rounded-full border-4 border-white bg-slate-200 shadow-md overflow-hidden z-20">
                            {/* Placeholder Avatar */}
                            <div className={`w-full h-full bg-gradient-to-br ${gradient} opacity-50`} />
                        </div>

                        <div className="mt-6 mb-1">
                            <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">{title}</h4>
                            <h3 className="text-base font-bold text-slate-900 leading-tight">{name}</h3>
                        </div>

                        <div className="w-8 h-0.5 bg-slate-100 rounded-full my-2 group-hover:bg-slate-200 transition-colors" />

                        <div className="flex-1 flex flex-col justify-center">
                            <p className={`font-semibold text-xs text-${accentColor}-600 mb-1`}>{project}</p>
                            <p className="text-slate-500 text-[10px] leading-relaxed line-clamp-2">{description}</p>
                        </div>

                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className={`mt-2 px-4 py-1.5 rounded-lg bg-slate-50 text-slate-900 border border-slate-200 font-bold text-[10px] hover:bg-slate-100 transition-all flex items-center gap-1.5`}
                        >
                            View Profile <Star size={10} className="fill-slate-900" />
                        </motion.button>
                    </div>

                    {/* Shine Effect */}
                    <div className="absolute inset-0 z-50 pointer-events-none bg-gradient-to-tr from-transparent via-white/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 w-[200%] h-[200%] -translate-x-full -translate-y-full group-hover:translate-x-full group-hover:translate-y-full" />
                </motion.div>
            </motion.div>

            {/* Back Glow */}
            <div className={`absolute -inset-4 bg-gradient-to-br ${gradient} rounded-[2.5rem] -z-10 opacity-0 group-hover:opacity-30 blur-xl transition-opacity duration-500`} />
        </motion.div>
    );
};

export default HallOfFame;
