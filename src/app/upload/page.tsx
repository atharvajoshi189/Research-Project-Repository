"use client";

import { useState } from 'react';
import { UploadCloud, CheckCircle, FileText, Layers } from 'lucide-react';

export default function UploadPage() {
    const [step, setStep] = useState(1);

    return (
        <div className="max-w-3xl mx-auto py-10">
            {/* Progress Bar */}
            <div className="mb-12 relative">
                <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-200 -z-10 rounded-full"></div>
                <div className="flex justify-between">
                    <StepIndicator num={1} label="Category" current={step} />
                    <StepIndicator num={2} label="Details" current={step} />
                    <StepIndicator num={3} label="Upload" current={step} />
                </div>
            </div>

            {/* Step Content */}
            <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-100">
                {step === 1 && (
                    <div className="space-y-6 animate-in slide-in-from-right fade-in duration-300">
                        <h2 className="text-2xl font-bold text-slate-900 text-center">Select Project Category</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {['Research Paper', 'Micro-Project', 'Final Year Project', 'Hackathon Submission'].map(cat => (
                                <button key={cat} onClick={() => setStep(2)} className="p-6 border-2 border-slate-100 rounded-xl hover:border-indigo-500 hover:bg-indigo-50 transition-all text-left group">
                                    <span className="font-bold text-slate-700 group-hover:text-indigo-700 block mb-1">{cat}</span>
                                    <span className="text-xs text-slate-400">Select this category</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="space-y-6 animate-in slide-in-from-right fade-in duration-300">
                        <h2 className="text-2xl font-bold text-slate-900 mb-6">Project Metadata</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Project Title</label>
                                <input type="text" className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="e.g. AI Powered Chatbot" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Academic Year</label>
                                    <select className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                                        <option>2025-2026</option>
                                        <option>2024-2025</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Tech Stack (comma separated)</label>
                                    <input type="text" className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="React, Node, etc." />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Abstract</label>
                                <textarea className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 h-32" placeholder="Brief description..."></textarea>
                            </div>
                            <div className="flex justify-end gap-3 pt-4">
                                <button onClick={() => setStep(1)} className="px-6 py-2 text-slate-500 font-medium">Back</button>
                                <button onClick={() => setStep(3)} className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-indigo-700 transition">Next Step</button>
                            </div>
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="space-y-6 text-center animate-in slide-in-from-right fade-in duration-300">
                        <h2 className="text-2xl font-bold text-slate-900">Upload Project Files</h2>
                        <div className="border-3 border-dashed border-indigo-200 bg-indigo-50/50 rounded-2xl p-10 flex flex-col items-center justify-center cursor-pointer hover:bg-indigo-50 transition-colors">
                            <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center mb-4 text-indigo-500">
                                <UploadCloud size={32} />
                            </div>
                            <p className="text-indigo-900 font-medium mb-1">Click to upload PDF or Drag & Drop</p>
                            <p className="text-sm text-indigo-400">Max file size 10MB</p>
                        </div>
                        <div className="flex justify-end gap-3 pt-4">
                            <button onClick={() => setStep(2)} className="px-6 py-2 text-slate-500 font-medium">Back</button>
                            <button className="bg-emerald-500 text-white px-8 py-2 rounded-lg font-bold hover:bg-emerald-600 transition shadow-lg shadow-emerald-200">Submit Project</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

const StepIndicator = ({ num, label, current }: { num: number, label: string, current: number }) => {
    const isCompleted = current > num;
    const isActive = current === num;

    return (
        <div className="flex flex-col items-center relative z-10">
            <div className={`
                w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300
                ${isActive ? 'bg-indigo-600 text-white shadow-lg ring-4 ring-indigo-100' :
                    isCompleted ? 'bg-emerald-500 text-white' : 'bg-white text-slate-400 border border-slate-200'}
            `}>
                {isCompleted ? <CheckCircle size={18} /> : num}
            </div>
            <span className={`mt-2 text-xs font-semibold uppercase tracking-wider ${isActive ? 'text-indigo-600' : 'text-slate-400'}`}>{label}</span>
        </div>
    );
}
