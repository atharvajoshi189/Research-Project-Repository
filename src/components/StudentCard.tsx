"use client";

import { motion } from 'framer-motion';
import { User, Briefcase, Hash, GraduationCap } from 'lucide-react';

interface StudentCardProps {
    name: string;
    role: string;
    number: string;
    branch: string;
}

export default function StudentCard({ name, role, number, branch }: StudentCardProps) {
    return (
        <motion.div
            whileHover={{ y: -5, boxShadow: "0 20px 40px -10px rgba(0,0,0,0.1)" }}
            className="w-full max-w-sm bg-white border border-slate-100 rounded-3xl p-6 shadow-sm overflow-hidden relative group transition-all"
        >
            {/* Background Accent */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-teal-50 rounded-full -mr-16 -mt-16 group-hover:bg-teal-100 transition-colors" />

            <div className="relative z-10">
                {/* Header: Icon & Name */}
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 rounded-2xl bg-slate-900 flex items-center justify-center text-white shadow-lg">
                        <User size={32} />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-slate-900">{name}</h3>
                        <div className="flex items-center gap-1.5 text-teal-600 font-semibold text-sm">
                            <Briefcase size={14} />
                            {role}
                        </div>
                    </div>
                </div>

                {/* Details Grid */}
                <div className="space-y-4">
                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                        <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-slate-400 shadow-sm">
                            <Hash size={18} />
                        </div>
                        <div>
                            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Student ID/Number</p>
                            <p className="text-sm font-bold text-slate-700">{number}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                        <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-slate-400 shadow-sm">
                            <GraduationCap size={18} />
                        </div>
                        <div>
                            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Department / Branch</p>
                            <p className="text-sm font-bold text-slate-700">{branch}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Status bar */}
            <div className="mt-6 pt-4 border-t border-slate-100 flex justify-between items-center">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Active Member</span>
                <div className="flex gap-1">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="w-1.5 h-1.5 rounded-full bg-teal-500" />
                    ))}
                </div>
            </div>
        </motion.div>
    );
}
