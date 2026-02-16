import { motion } from 'framer-motion';
import { FileText, Clock, Users, GraduationCap, User } from 'lucide-react';

interface StatsProps {
    totalProjects: number;
    pendingProjects: number;
    totalStudents: number;
    totalTeachers: number;
}

export default function StatsCards({ totalProjects, pendingProjects, totalStudents, totalTeachers }: StatsProps) {
    const cards = [
        {
            label: 'Total Projects',
            value: totalProjects,
            icon: FileText,
            iconBg: 'bg-blue-50 text-blue-600',
            trend: 'Global Count'
        },
        {
            label: 'Pending Approvals',
            value: pendingProjects,
            icon: Clock,
            iconBg: 'bg-amber-50 text-amber-600',
            trend: 'Requires Action'
        },
        {
            label: 'Total Students',
            value: totalStudents,
            icon: GraduationCap,
            iconBg: 'bg-teal-50 text-teal-600',
            trend: 'Registered'
        },
        {
            label: 'Total Teachers',
            value: totalTeachers,
            icon: User,
            iconBg: 'bg-purple-50 text-purple-600',
            trend: 'Faculty'
        }
    ];

    return (
        <motion.div
            variants={{
                show: {
                    transition: {
                        staggerChildren: 0.1
                    }
                }
            }}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10"
        >
            {cards.map((card, idx) => (
                <motion.div
                    key={idx}
                    variants={{
                        hidden: { opacity: 0, y: 20 },
                        show: { opacity: 1, y: 0 }
                    }}
                    className="group relative overflow-hidden p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 shadow-sm hover:shadow-md transition-all duration-300"
                >
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
                </motion.div>
            ))}
        </motion.div>
    );
}
