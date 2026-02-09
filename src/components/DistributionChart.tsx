"use client";

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

interface DistributionChartProps {
    data: { label: string; count: number; color: string }[];
    selected: string[];
    onSelect: (label: string) => void;
}

const DistributionChart = ({ data, selected, onSelect }: DistributionChartProps) => {
    const total = useMemo(() => data.reduce((acc, curr) => acc + curr.count, 0), [data]);

    if (total === 0) return null;

    return (
        <div className="w-full bg-white/40 backdrop-blur-xl rounded-3xl border border-white/40 shadow-lg shadow-teal-900/5 mb-6 p-6 relative overflow-hidden">
            <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse"></span>
                Result Distribution
            </h3>

            <div className="space-y-3">
                {data.map((item) => {
                    const percent = (item.count / total) * 100;
                    const isSelected = selected.includes(item.label);
                    const isDimmed = selected.length > 0 && !isSelected;

                    return (
                        <div key={item.label} className="group cursor-pointer" onClick={() => onSelect(item.label)}>
                            <div className="flex justify-between items-center text-xs font-bold mb-1">
                                <span className={`transition-colors ${isSelected ? 'text-teal-700' : isDimmed ? 'text-slate-400' : 'text-slate-600'}`}>
                                    {item.label}
                                </span>
                                <span className="text-slate-400">{Math.round(percent)}%</span>
                            </div>

                            <div className="h-2 w-full bg-slate-100/50 rounded-full overflow-hidden relative">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${percent}%` }}
                                    transition={{ duration: 1, ease: "easeOut" }}
                                    className={`absolute top-0 left-0 h-full rounded-full ${item.color} ${isDimmed ? 'opacity-30' : 'opacity-100'}`}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default DistributionChart;
