import { FileText, Clock, Users, HardDrive } from 'lucide-react';

interface StatsProps {
    totalProjects: number;
    pendingProjects: number;
    totalUsers: number;
}

export default function StatsCards({ totalProjects, pendingProjects, totalUsers }: StatsProps) {
    const cards = [
        {
            label: 'Total Projects',
            value: totalProjects,
            icon: FileText,
            iconBg: 'bg-blue-50 text-blue-600',
            trend: '+12% this week'
        },
        {
            label: 'Pending Approvals',
            value: pendingProjects,
            icon: Clock,
            iconBg: 'bg-amber-50 text-amber-600',
            trend: 'Requires attention'
        },
        {
            label: 'Total Users',
            value: totalUsers,
            icon: Users,
            iconBg: 'bg-purple-50 text-purple-600',
            trend: '+5 new today'
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            {cards.map((card, idx) => (
                <div key={idx} className="group relative overflow-hidden p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 shadow-sm hover:shadow-md transition-all duration-300">
                    <div className="flex items-center justify-between mb-4">
                        <div className={`p-3 rounded-xl ${card.iconBg}`}>
                            <card.icon size={22} strokeWidth={2} />
                        </div>
                        {idx === 1 && typeof card.value === 'number' && card.value > 0 && (
                            <span className="flex h-2 w-2 rounded-full bg-amber-500">
                                <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-amber-400 opacity-75"></span>
                            </span>
                        )}
                    </div>

                    <div>
                        <h3 className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">{card.label}</h3>
                        <div className="flex items-end gap-2">
                            <span className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">{card.value}</span>
                            <span className="text-xs text-slate-400 font-medium mb-1.5">{card.trend}</span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}