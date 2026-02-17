"use client";

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export default function BentoGrid({ className }: { className?: string }) {
    return (
        <motion.div
            initial={{
                opacity: 0.04,
                maskImage: 'radial-gradient(circle at center, black 0%, transparent 0%)',
                WebkitMaskImage: 'radial-gradient(circle at center, black 0%, transparent 0%)'
            } as any}
            animate={{
                opacity: [0.05, 0.15, 0.05],
                maskImage: 'radial-gradient(circle at center, black 100%, transparent 100%)',
                WebkitMaskImage: 'radial-gradient(circle at center, black 100%, transparent 100%)'
            } as any}
            transition={{
                duration: 2,
                ease: "easeOut",
                delay: 0.2,
                opacity: {
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut"
                }
            }}
            className={cn(
                "absolute inset-0 pointer-events-none",
                "bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)]",
                "bg-[size:24px_24px]",
                className
            )}
        />
    );
}
