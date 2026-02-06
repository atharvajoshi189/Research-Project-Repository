import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

const CATEGORIES = [
    { name: "Artificial Intelligence", color: "bg-blue-100 text-blue-700 hover:bg-blue-200" },
    { name: "IoT", color: "bg-emerald-100 text-emerald-700 hover:bg-emerald-200" },
    { name: "Cyber Security", color: "bg-red-100 text-red-700 hover:bg-red-200" },
    { name: "Blockchain", color: "bg-purple-100 text-purple-700 hover:bg-purple-200" },
    { name: "Cloud Computing", color: "bg-cyan-100 text-cyan-700 hover:bg-cyan-200" },
    { name: "Data Science", color: "bg-orange-100 text-orange-700 hover:bg-orange-200" }
];

export default function CategoryCloud() {
    const router = useRouter();
    const [counts, setCounts] = useState<Record<string, number>>({});

    useEffect(() => {
        const fetchCategoryCounts = async () => {
            const { data } = await supabase
                .from('projects')
                .select('category')
                .eq('status', 'approved');

            const newCounts: Record<string, number> = {};

            if (data) {
                data.forEach((p: any) => {
                    const cat = p.category?.trim();
                    if (cat) {
                        // Normalize slightly strictly matching the predefined list or vague match
                        // For now, doing exact match via name or partial
                        CATEGORIES.forEach(c => {
                            if (cat.toLowerCase().includes(c.name.toLowerCase()) || c.name.toLowerCase().includes(cat.toLowerCase())) {
                                newCounts[c.name] = (newCounts[c.name] || 0) + 1;
                            }
                        });
                    }
                });
            }
            setCounts(newCounts);
        };

        fetchCategoryCounts();
    }, []);

    const handleCategoryClick = (category: string) => {
        router.push(`/search?q=${encodeURIComponent(category)}`);
    };

    return (
        <div className="flex flex-wrap justify-center gap-4 mt-8 max-w-4xl mx-auto px-4">
            {CATEGORIES.map((cat, index) => (
                <motion.button
                    key={cat.name}
                    onClick={() => handleCategoryClick(cat.name)}
                    className={`px-5 py-2.5 rounded-full text-sm font-bold shadow-sm transition-colors flex items-center gap-2 ${cat.color}`}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{
                        opacity: 1,
                        scale: 1,
                        y: 0
                    }}
                    transition={{
                        // Entrance animation
                        opacity: { delay: 0.5 + index * 0.1 },
                        scale: { delay: 0.5 + index * 0.1 }
                    }}
                    whileHover={{ scale: 1.1, rotate: ((index % 2 === 0 ? 1 : -1) * (2 + (index % 3))) }}
                    whileTap={{ scale: 0.95 }}
                >
                    {cat.name}
                    {counts[cat.name] ? (
                        <span className="bg-white/40 px-1.5 py-0.5 rounded-full text-[10px] min-w-[20px] text-center backdrop-blur-sm">
                            {counts[cat.name]}
                        </span>
                    ) : null}
                </motion.button>
            ))}
        </div>
    );
}
