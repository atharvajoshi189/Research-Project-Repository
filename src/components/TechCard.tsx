"use client";

import React, { useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

const TechCard = () => {
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const mouseXSpring = useSpring(x);
    const mouseYSpring = useSpring(y);

    const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["12deg", "-12deg"]);
    const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-12deg", "12deg"]);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        const rect = e.currentTarget.getBoundingClientRect();

        const width = rect.width;
        const height = rect.height;

        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        const xPct = mouseX / width - 0.5;
        const yPct = mouseY / height - 0.5;

        x.set(xPct);
        y.set(yPct);
    };

    const handleMouseLeave = () => {
        x.set(0);
        y.set(0);
    };

    return (
        <motion.div
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{
                rotateY,
                rotateX,
                transformStyle: "preserve-3d",
            }}
            className="relative w-96 h-64 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 group overflow-hidden"
        >
            {/* Holographic Background Reveal */}
            <div
                className="absolute inset-0 opacity-0 group-hover:opacity-60 transition-opacity duration-500 pointer-events-none"
                style={{
                    backgroundImage: `url('/assets/neural-network.png')`,
                    backgroundSize: '120%',
                    backgroundPosition: 'center',
                    filter: 'contrast(1.2) brightness(1.2)'
                }}
            />

            {/* Gradient Overlay for Depth */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-black/40 pointer-events-none z-0" />

            {/* Glowing Edges */}
            <div className="absolute inset-0 rounded-2xl transition-all duration-500 group-hover:shadow-[0_0_40px_rgba(132,204,22,0.3)] z-[-1]" />

            {/* Content Content content */}
            <div className="relative z-10 flex flex-col justify-end h-full p-6" style={{ transform: "translateZ(50px)" }}>
                <div className="w-12 h-12 rounded-full bg-lime-400/20 flex items-center justify-center mb-auto border border-lime-400/30 shadow-[0_0_15px_rgba(163,230,53,0.3)]">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-lime-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><circle cx="19" cy="5" r="2"></circle><circle cx="5" cy="19" r="2"></circle><path d="M10.4 9.6l-1.8-1.8"></path><path d="M15.4 14.4l1.8 1.8"></path><path d="M13.6 8.4l1.8-1.8"></path><path d="M8.6 15.6l-1.8 1.8"></path></svg>
                </div>

                <h3 className="text-2xl font-bold text-white tracking-tight mb-1 drop-shadow-md">
                    Neural Architecture
                </h3>
                <p className="text-sm text-slate-300 font-medium leading-relaxed">
                    Explore glowing pathways of connected research nodes.
                </p>

                <div className="absolute top-6 right-6 px-2 py-1 rounded bg-lime-500/10 border border-lime-500/20 text-[10px] font-mono text-lime-400 font-bold tracking-widest uppercase">
                    v.2.4 Node
                </div>
            </div>
        </motion.div>
    );
};

export default TechCard;
