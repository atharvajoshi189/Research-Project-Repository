"use client";

import React, { useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

interface Project3DCardProps {
    project: any;
    spanClass?: string;
    index: number;
    noAnimation?: boolean;
    isPriority?: boolean;
}

const Project3DCard = ({ project, spanClass = "", index, noAnimation = false, isPriority = false }: Project3DCardProps) => {
    const ref = useRef<HTMLDivElement>(null);

    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const mouseX = useSpring(x, { stiffness: 500, damping: 100 });
    const mouseY = useSpring(y, { stiffness: 500, damping: 100 });

    const rotateX = useTransform(mouseY, [-0.5, 0.5], ["7deg", "-7deg"]);
    const rotateY = useTransform(mouseX, [-0.5, 0.5], ["-7deg", "7deg"]);

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

    const isLarge = spanClass.includes('col-span-2');

    const motionProps = noAnimation ? {} : {
        initial: { opacity: 0, scale: 0.8, rotateX: 20 },
        whileInView: { opacity: 1, scale: 1, rotateX: 0 },
        viewport: { once: true },
        transition: { delay: index * 0.1, stiffness: 50, damping: 20 }
    };

    return (
        <motion.div
            style={{
                perspective: 1000,
            }}
            {...motionProps}
            className={`relative ${spanClass}`}
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
                className={`relative w-full h-full rounded-3xl bg-white/40 dark:bg-slate-900/40 backdrop-blur-3xl border shadow-xl overflow-hidden group hover:z-20 transition-all duration-300 hover:shadow-2xl hover:shadow-teal-900/10 dark:hover:shadow-teal-900/20
                    ${isPriority
                        ? 'border-teal-400/80 shadow-[0_0_30px_-5px_rgba(45,212,191,0.6)] ring-2 ring-teal-400/20 z-10 scale-[1.02]'
                        : 'border-white/40 dark:border-slate-800/40'
                    }
                `}
            >
                {/* 1. Dynamic Glare Effect */}
                <motion.div
                    className="absolute inset-0 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                    style={{
                        background: useTransform(
                            [mouseX, mouseY],
                            ([x, y]) => `radial-gradient(circle at ${(x as number + 0.5) * 100}% ${(y as number + 0.5) * 100}%, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0) 60%)`
                        )
                    }}
                />

                {/* 2. Content */}
                <Link href={`/project/${project.id}`} className="absolute inset-0 flex flex-col p-8 z-20 h-full">

                    {/* Floating Header */}
                    <div
                        className="flex justify-between items-start mb-auto"
                        style={{ transform: "translateZ(30px)" }}
                    >
                        <span className="px-4 py-1.5 rounded-full bg-slate-900/90 dark:bg-white/10 text-white text-[10px] font-bold uppercase tracking-widest shadow-lg backdrop-blur-md">
                            {project.category}
                        </span>
                        <div className="w-10 h-10 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-sm border border-slate-100 dark:border-slate-700">
                            <ArrowRight size={18} className="text-slate-900 dark:text-white -rotate-45 group-hover:rotate-0 transition-transform duration-300" />
                        </div>
                    </div>

                    {/* Floating Body */}
                    <div className="mt-auto transform-gpu" style={{ transform: "translateZ(50px)" }}>
                        <h3 className={`font-bold text-slate-900 dark:text-slate-100 leading-[0.9] group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors mb-4 drop-shadow-sm ${isLarge ? 'text-4xl pr-10' : 'text-xl'}`}>
                            {project.title}
                        </h3>

                        {isLarge && (
                            <p className="text-slate-500 dark:text-slate-400 text-sm line-clamp-2 mb-6 font-medium leading-relaxed max-w-lg opacity-90">
                                {project.abstract}
                            </p>
                        )}

                        <div className="flex items-center gap-4 border-t border-slate-200/50 dark:border-slate-700/50 pt-5 mt-2">
                            <div className="flex -space-x-3">
                                {(Array.isArray(project.authors) ? project.authors : [project.authors || 'Unknown']).slice(0, 3).map((a: string, idx: number) => (
                                    <div key={idx} className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-400 to-blue-500 border-2 border-white dark:border-slate-800 shadow-sm flex items-center justify-center text-[9px] font-bold text-white uppercase transform group-hover:scale-110 transition-transform" style={{ transitionDelay: `${idx * 50}ms` }}>
                                        {a[0]}
                                    </div>
                                ))}
                            </div>
                            <span className="text-xs font-bold text-slate-400 dark:text-slate-500 bg-slate-100/80 dark:bg-slate-800/80 px-2.5 py-1 rounded-md">
                                {project.year || '2025'}
                            </span>
                        </div>
                    </div>

                    {/* Holographic Tech Reveal */}
                    <div className="absolute bottom-0 left-0 w-full p-6 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-md border-t border-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out z-30">
                        <div className="flex items-center gap-2 mb-3">
                            <span className="w-1.5 h-1.5 rounded-full bg-teal-400 shadow-[0_0_8px_rgba(45,212,191,0.8)] animate-pulse"></span>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-teal-200/80">System Architecture</span>
                        </div>
                        <div className="flex flex-wrap gap-x-4 gap-y-2">
                            {project.tech_stack ? (Array.isArray(project.tech_stack) ? project.tech_stack : project.tech_stack.split(',')).slice(0, 5).map((tech: string, i: number) => (
                                <span key={i} className="text-xs font-mono font-bold text-teal-300 drop-shadow-[0_0_5px_rgba(20,184,166,0.8)]">
                                    {tech.trim()}
                                </span>
                            )) : (
                                <span className="text-xs font-mono text-slate-300">View Project Analysis_</span>
                            )}
                        </div>
                    </div>
                </Link>

                {/* 3. Deep Background Elements */}
                <div className="absolute top-0 right-0 w-full h-full pointer-events-none overflow-hidden rounded-3xl z-0">
                    <div className="absolute -top-20 -right-20 w-80 h-80 bg-gradient-to-br from-teal-100/50 to-blue-100/50 rounded-full blur-[80px] opacity-0 group-hover:opacity-100 transition-opacity duration-700 mix-blend-multiply" />

                    {/* Grid Pattern Overlay */}
                    <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:16px_16px] group-hover:opacity-[0.07] transition-opacity" />
                </div>




            </motion.div>
        </motion.div>
    );
};

export default Project3DCard;



