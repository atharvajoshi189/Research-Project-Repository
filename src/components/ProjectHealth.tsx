"use client";

import { useState, useEffect } from 'react';
import { Activity, Info } from 'lucide-react';
import { motion } from 'framer-motion';

interface ProjectHealthProps {
    projectTitle: string;
    projectAbstract: string;
    techStack: string;
}

export default function ProjectHealth({ projectTitle, projectAbstract, techStack }: ProjectHealthProps) {
    const [score, setScore] = useState(0);
    const [feedback, setFeedback] = useState("Analyzing...");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHealth = async () => {
            try {
                const res = await fetch('/api/grok', {
                    method: 'POST',
                    body: JSON.stringify({
                        action: 'project_health',
                        context: {
                            title: projectTitle,
                            abstract: projectAbstract,
                            tech_stack: techStack
                        }
                    })
                });
                const { data } = await res.json();
                if (data?.score) {
                    setScore(data.score);
                    setFeedback(data.feedback);
                }
            } catch (e) {
                console.error("Health check failed", e);
                setScore(50); // Fallback
                setFeedback("Could not analyze at this time.");
            } finally {
                setLoading(false);
            }
        };

        fetchHealth();
    }, [projectTitle, projectAbstract, techStack]);

    // Circular Progress Params
    const radius = 30;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (score / 100) * circumference;

    const getColor = (s: number) => {
        if (s >= 80) return 'text-emerald-500';
        if (s >= 60) return 'text-amber-500';
        return 'text-red-500';
    };

    return (
        <div className="bg-white/70 backdrop-blur-md rounded-3xl p-6 shadow-xl shadow-slate-200/50 border border-white flex items-center justify-between gap-4">
            <div>
                <h3 className="font-bold text-slate-900 mb-1 flex items-center gap-2">
                    <Activity size={20} className="text-rose-500" /> Project Health
                </h3>
                <p className="text-xs text-slate-500 font-medium max-w-[150px] leading-relaxed">
                    Documentation Quality
                </p>
                {!loading && (
                    <p className="text-[10px] text-slate-400 mt-2 font-medium italic border-l-2 border-rose-200 pl-2 max-w-[180px]">
                        "{feedback}"
                    </p>
                )}
            </div>

            <div className="relative w-20 h-20 flex items-center justify-center">
                {/* Background Circle */}
                <svg className="transform -rotate-90 w-20 h-20">
                    <circle
                        cx="40"
                        cy="40"
                        r={radius}
                        stroke="currentColor"
                        strokeWidth="6"
                        fill="transparent"
                        className="text-slate-100"
                    />
                    <motion.circle
                        initial={{ strokeDashoffset: circumference }}
                        animate={{ strokeDashoffset: loading ? circumference : strokeDashoffset }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        cx="40"
                        cy="40"
                        r={radius}
                        stroke="currentColor"
                        strokeWidth="6"
                        fill="transparent"
                        strokeDasharray={circumference}
                        strokeLinecap="round"
                        className={getColor(score)}
                    />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center flex-col">
                    <span className={`text-xl font-black ${getColor(score)}`}>{loading ? '--' : score}</span>
                </div>
            </div>
        </div>
    );
}
