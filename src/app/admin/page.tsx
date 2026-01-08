"use client";

import { Check, X, FileText, AlertCircle } from 'lucide-react';

export default function AdminDashboard() {
    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-slate-900">Admin Dashboard</h1>

            {/* Analytics Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <h3 className="font-bold text-slate-800 mb-6">Project Domains Distribution</h3>
                    <div className="space-y-4">
                        <Bar label="Artificial Intelligence" percent={45} color="bg-indigo-500" />
                        <Bar label="Web Development" percent={30} color="bg-blue-500" />
                        <Bar label="Blockchain" percent={15} color="bg-purple-500" />
                        <Bar label="IoT" percent={10} color="bg-emerald-500" />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
                        <AlertCircle size={20} className="text-amber-500" /> Actions Required
                    </h3>
                    <div className="space-y-4">
                        <div className="p-4 bg-amber-50 rounded-xl flex items-center justify-between">
                            <span className="text-amber-800 font-medium">Pending Approvals</span>
                            <span className="text-2xl font-bold text-amber-900">12</span>
                        </div>
                        <div className="p-4 bg-slate-50 rounded-xl flex items-center justify-between">
                            <span className="text-slate-700 font-medium">Flagged Projects</span>
                            <span className="text-2xl font-bold text-slate-900">2</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Approval Queue */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-6 border-b border-slate-100">
                    <h3 className="font-bold text-slate-900">Approval Queue</h3>
                </div>
                <div>
                    {[1, 2, 3].map(i => (
                        <div key={i} className="flex items-center justify-between p-6 border-b border-slate-50 hover:bg-slate-50 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-indigo-50 rounded-full text-indigo-600">
                                    <FileText size={20} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-900">Smart Traffic Light System</h4>
                                    <p className="text-sm text-slate-500">Submitted by: John Doe • 2 hours ago</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-50 text-green-700 font-semibold hover:bg-green-100 transition-colors">
                                    <Check size={18} /> Approve
                                </button>
                                <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-50 text-red-700 font-semibold hover:bg-red-100 transition-colors">
                                    <X size={18} /> Reject
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

const Bar = ({ label, percent, color }: { label: string, percent: number, color: string }) => (
    <div>
        <div className="flex justify-between mb-1">
            <span className="text-sm font-medium text-slate-700">{label}</span>
            <span className="text-sm font-medium text-slate-500">{percent}%</span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-2.5">
            <div className={`${color} h-2.5 rounded-full`} style={{ width: `${percent}%` }}></div>
        </div>
    </div>
);
