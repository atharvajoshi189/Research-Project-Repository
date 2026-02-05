"use client";

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

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

    const handleCategoryClick = (category: string) => {
        router.push(`/search?q=${encodeURIComponent(category)}`);
    };

    return (
        <div className="flex flex-wrap justify-center gap-4 mt-8 max-w-4xl mx-auto px-4">
            {CATEGORIES.map((cat, index) => (
                <motion.button
                    key={cat.name}
                    onClick={() => handleCategoryClick(cat.name)}
                    className={`px-5 py-2.5 rounded-full text-sm font-bold shadow-sm transition-colors ${cat.color}`}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{
                        opacity: 1,
                        scale: 1,
                        y: [0, -8, 0]
                    }}
                    transition={{
                        // Float/Bob animation
                        y: {
                            duration: 3 + ((index * 3) % 4) * 0.5, // Deterministic duration 3-5s
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: index * 0.2
                        },
                        // Entrance animation
                        opacity: { delay: 0.5 + index * 0.1 },
                        scale: { delay: 0.5 + index * 0.1 }
                    }}
                    whileHover={{ scale: 1.1, rotate: ((index % 2 === 0 ? 1 : -1) * (2 + (index % 3))) }}
                    whileTap={{ scale: 0.95 }}
                >
                    {cat.name}
                </motion.button>
            ))}
        </div>
    );
}
