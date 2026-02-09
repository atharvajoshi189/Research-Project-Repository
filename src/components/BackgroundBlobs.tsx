"use client";

import { motion } from 'framer-motion';

export default function BackgroundBlobs() {
    return (
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
            <motion.div
                animate={{
                    x: [0, 50, 0],
                    y: [0, 30, 0],
                    scale: [1, 1.1, 1],
                }}
                transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-[10%] -right-[5%] w-[70vw] h-[70vw] bg-teal-400/30 rounded-full blur-[100px] opacity-70"
            />
            <motion.div
                animate={{
                    x: [0, -50, 0],
                    y: [0, -30, 0],
                    scale: [1, 1.2, 1],
                }}
                transition={{ duration: 25, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                className="absolute -bottom-[10%] -left-[10%] w-[70vw] h-[70vw] bg-blue-400/30 rounded-full blur-[100px] opacity-70"
            />
        </div>
    );
}
