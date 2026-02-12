"use client";

import { useState, useEffect } from 'react';
import { Book, ExternalLink, Loader2, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SuggestedReadingsProps {
    projectTitle: string;
    projectAbstract: string;
}

export default function SuggestedReadings({ projectTitle, projectAbstract }: SuggestedReadingsProps) {
    const [readings, setReadings] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [generated, setGenerated] = useState(false);

    const generateReadings = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/grok', {
                method: 'POST',
                body: JSON.stringify({
                    action: 'suggested_readings',
                    context: { title: projectTitle, abstract: projectAbstract }
                })
            });
            const { data } = await res.json();
            if (data?.readings) {
                setReadings(data.readings);
                setGenerated(true);
            }
        } catch (e) {
            console.error("Failed to fetch readings", e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white/70 backdrop-blur-md rounded-3xl p-6 shadow-xl shadow-slate-200/50 border border-white">
            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Book size={20} className="text-teal-600" /> Suggested Readings
            </h3>

            {!generated && !loading && (
                <div className="text-center py-6">
                    <p className="text-sm text-slate-500 mb-4">Get AI-curated academic references for your research.</p>
                    <button
                        onClick={generateReadings}
                        className="px-4 py-2 bg-gradient-to-r from-teal-500 to-emerald-500 text-white text-sm font-bold rounded-xl shadow-lg shadow-teal-200 hover:scale-105 transition-transform flex items-center gap-2 mx-auto"
                    >
                        <Sparkles size={16} /> Generate References
                    </button>
                </div>
            )}

            {loading && (
                <div className="flex flex-col items-center justify-center py-8 space-y-3">
                    <Loader2 size={24} className="animate-spin text-teal-500" />
                    <p className="text-xs text-slate-400 font-medium animate-pulse">Scanning academic indexes...</p>
                </div>
            )}

            <AnimatePresence>
                {generated && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="space-y-4"
                    >
                        {readings.map((item, i) => (
                            <div key={i} className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start gap-2">
                                    <h4 className="text-sm font-bold text-slate-800 leading-tight">{item.title}</h4>
                                    <span className="shrink-0 text-[10px] font-bold px-2 py-0.5 bg-slate-100 text-slate-500 rounded uppercase tracking-wide">{item.type}</span>
                                </div>
                                <p className="text-xs text-indigo-600 font-medium mt-1">{item.author}</p>
                                <p className="text-xs text-slate-500 mt-2 italic border-l-2 border-teal-200 pl-2">{item.relevance}</p>
                                <a
                                    href={`https://scholar.google.com/scholar?q=${encodeURIComponent(item.title)}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="mt-3 inline-flex items-center gap-1 text-[10px] font-bold text-slate-400 hover:text-teal-600 transition-colors"
                                >
                                    Find on Scholar <ExternalLink size={10} />
                                </a>
                            </div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
