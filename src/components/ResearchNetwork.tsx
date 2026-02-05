"use client";

import { motion } from 'framer-motion';
import TechCard from './TechCard';

const ResearchNetwork = () => {
    return (
        <section className="relative w-full py-32 overflow-hidden bg-slate-900 perspective-1000">
            {/* 3D Grid Horizon Background */}
            <div className="absolute inset-0 transform-gpu overflow-hidden">
                <div className="absolute inset-0 bg-slate-900 z-0" />

                {/* Moving Grid Floor */}
                <div
                    className="absolute -inset-[100%] w-[300%] h-[300%] origin-bottom animate-grid-flow"
                    style={{
                        backgroundSize: '60px 60px',
                        backgroundImage: `
                            linear-gradient(to right, rgba(20, 184, 166, 0.1) 1px, transparent 1px),
                            linear-gradient(to bottom, rgba(20, 184, 166, 0.1) 1px, transparent 1px)
                        `,
                        transform: 'rotateX(60deg) translateZ(-200px)',
                    }}
                />

                {/* Horizon Glow */}
                <div className="absolute inset-0 bg-gradient-to-t from-teal-500/10 via-slate-900/50 to-slate-900 z-10 pointer-events-none" />
                <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-slate-900 to-transparent z-10" />
            </div>

            <div className="max-w-7xl mx-auto px-6 relative z-20">
                <div className="flex flex-col md:flex-row items-center justify-between gap-12">

                    {/* Left Side: Text Content */}
                    <div className="md:w-1/2 space-y-6">
                        <motion.span
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            className="inline-block px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs font-bold uppercase tracking-wider backdrop-blur-md"
                        >
                            Global Collaboration
                        </motion.span>
                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-4xl md:text-5xl font-extrabold text-white leading-tight"
                        >
                            Connect with <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-400">Research Nodes</span> Worldwide.
                        </motion.h2>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-lg text-slate-400 leading-relaxed"
                        >
                            Our platform visualizes the complex web of academic contributions. Discover how your work links with others in a 3D interactive space.
                        </motion.p>
                    </div>

                    {/* Right Side: 3D Tech Card Demo */}
                    <div className="md:w-1/2 flex justify-center perspective-1000">
                        <TechCard />
                    </div>
                </div>
            </div>

            {/* CSS Animation for Grid Flow */}
            <style jsx>{`
                @keyframes grid-flow {
                    0% { transform: rotateX(60deg) translateY(0); }
                    100% { transform: rotateX(60deg) translateY(60px); }
                }
                .animate-grid-flow {
                    animation: grid-flow 2s linear infinite;
                }
            `}</style>
        </section>
    );
};

export default ResearchNetwork;
