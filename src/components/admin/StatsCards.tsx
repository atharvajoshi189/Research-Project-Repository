import { FileText, Clock, Users, HardDrive } from 'lucide-react';

interface StatsProps {
    totalProjects: number;
    pendingProjects: number;
    totalUsers: number;
    storageUsed: string;
}

export default function StatsCards({ totalProjects, pendingProjects, totalUsers, storageUsed }: StatsProps) {
    const cards = [
        {
            label: 'Total Projects',
            value: totalProjects,
            icon: FileText,
            bg: 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100',
            iconColor: 'text-blue-600',
            trend: '+12% this week'
        },
        {
            label: 'Pending Approvals',
            value: pendingProjects,
            icon: Clock,
            bg: 'bg-gradient-to-br from-amber-50 to-orange-50 border-amber-100',
            iconColor: 'text-amber-600',
            trend: 'Requires attention'
        },
        {
            label: 'Total Users',
            value: totalUsers,
            icon: Users,
            bg: 'bg-gradient-to-br from-purple-50 to-fuchsia-50 border-purple-100',
            iconColor: 'text-purple-600',
            trend: '+5 new today'
        },
        {
            label: 'Storage Used',
            value: storageUsed,
            icon: HardDrive,
            bg: 'bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-100',
            iconColor: 'text-emerald-600',
            trend: 'of 1GB Limit'
        },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            {cards.map((card, idx) => (
                <div key={idx} className={`relative overflow-hidden p-8 rounded-3xl border shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1 ${card.bg}`}>
                    {/* Background decoration */}
                    <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white opacity-40 rounded-full blur-2xl"></div>

                    <div className="relative z-10">
                        <div className="flex justify-between items-start mb-6">
                            <div className={`p-3.5 bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm ${card.iconColor}`}>
                                <card.icon size={24} strokeWidth={2.5} />
                            </div>
                            {/* Optional Badge */}
                            {idx === 1 && typeof card.value === 'number' && card.value > 0 && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-700 animate-pulse">
                                    Action
                                </span>
                            )}
                        </div>

                        <div>
                            <h3 className="text-slate-500 text-sm font-bold uppercase tracking-wider mb-2">{card.label}</h3>
                            <div className="flex items-baseline gap-2">
                                <span className="text-4xl font-extrabold text-slate-900 tracking-tight">{card.value}</span>
                            </div>
                            <p className="text-xs font-medium text-slate-400 mt-2">{card.trend}</p>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
