"use client";

import { useState } from 'react';
import { Mic, X, Copy, Check, Loader2, Sparkles, PlayCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

interface PresentationPitchProps {
    projectTitle: string;
    projectAbstract: string;
}

export default function PresentationPitch({ projectTitle, projectAbstract }: PresentationPitchProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [script, setScript] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [copied, setCopied] = useState(false);

    const generatePitch = async () => {
        setIsOpen(true);
        if (script) return; // Don't regenerate if already exists

        setLoading(true);
        try {
            const res = await fetch('/api/grok', {
                method: 'POST',
                body: JSON.stringify({
                    action: 'presentation_pitch',
                    context: { title: projectTitle, abstract: projectAbstract }
                })
            });
            const { data } = await res.json();
            if (data?.script) {
                setScript(data.script);
                confetti({
                    particleCount: 100,
                    spread: 70,
                    origin: { y: 0.6 }
                });
            }
        } catch (e) {
            console.error("Failed to generate pitch", e);
        } finally {
            setLoading(false);
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(script);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <>
            <button
                onClick={generatePitch}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold shadow-lg shadow-amber-200 hover:shadow-xl hover:scale-[1.02] transition-all flex items-center justify-center gap-3"
            >
                <Mic size={20} /> Generate 2-Min Pitch
            </button>

            <AnimatePresence>
                {isOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                        />

                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative bg-white rounded-3xl w-full max-w-2xl max-h-[80vh] overflow-hidden shadow-2xl flex flex-col"
                        >
                            {/* Header */}
                            <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-6 border-b border-amber-100 flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-amber-100 rounded-lg text-amber-600">
                                        <Mic size={24} />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-slate-800">Viva Pitch Script</h2>
                                        <p className="text-xs text-amber-600 font-bold uppercase tracking-wider">AI-POWERED • 2 MINUTES</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-2 hover:bg-white rounded-full transition-colors text-slate-400 hover:text-slate-600"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Content */}
                            <div className="p-8 overflow-y-auto flex-1 custom-scrollbar">
                                {loading ? (
                                    <div className="flex flex-col items-center justify-center h-48 space-y-4">
                                        <div className="relative">
                                            <div className="w-16 h-16 border-4 border-amber-100 border-t-amber-500 rounded-full animate-spin"></div>
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <Sparkles size={20} className="text-amber-500 animate-pulse" />
                                            </div>
                                        </div>
                                        <p className="text-sm font-bold text-slate-500 animate-pulse">Drafting the perfect hook...</p>
                                    </div>
                                ) : (
                                    <div className="prose prose-slate max-w-none">
                                        <div className="whitespace-pre-line text-slate-600 text-lg leading-relaxed font-medium">
                                            {script}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Footer */}
                            {!loading && (
                                <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-between items-center">
                                    <div className="flex items-center gap-2 text-sm text-slate-500">
                                        <PlayCircle size={16} className="text-amber-500" />
                                        <span>Read at a steady pace.</span>
                                    </div>
                                    <button
                                        onClick={handleCopy}
                                        className={`px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2
                                            ${copied
                                                ? 'bg-emerald-100 text-emerald-700'
                                                : 'bg-slate-900 text-white hover:bg-slate-800 shadow-lg'
                                            }`}
                                    >
                                        {copied ? <><Check size={18} /> Copied</> : <><Copy size={18} /> Copy Script</>}
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
}
