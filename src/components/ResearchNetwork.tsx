"use client";

import { motion } from 'framer-motion';
import TechCard from './TechCard';

const ResearchNetwork = () => {
    return (
        <section className="relative w-full py-20 overflow-hidden bg-slate-50">
            {/* Background Decorations */}
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-teal-50 via-slate-50 to-slate-50 opacity-60"></div>

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="flex flex-col md:flex-row items-center justify-between gap-12">

                    {/* Left Side: Text Content */}
                    <div className="md:w-1/2 space-y-6">
                        <motion.span
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            className="inline-block px-3 py-1 rounded-full bg-teal-100 text-teal-800 text-xs font-bold uppercase tracking-wider"
                        >
                            Global Collaboration
                        </motion.span>
                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-4xl md:text-5xl font-extrabold text-slate-900 leading-tight"
                        >
                            Connect with <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-blue-600">Research Nodes</span> Worldwide.
                        </motion.h2>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-lg text-slate-600 leading-relaxed"
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
        </section>
    );
};

export default ResearchNetwork;
