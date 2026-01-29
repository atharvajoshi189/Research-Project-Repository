"use client";

import { motion } from "framer-motion";

export default function Template({ children }: { children: React.ReactNode }) {
    return (
        <div style={{ perspective: "2000px" }}>
            <motion.div
                initial={{ rotateY: -90, opacity: 0, scale: 0.9 }}
                animate={{ rotateY: 0, opacity: 1, scale: 1 }}
                exit={{ rotateY: 90, opacity: 0, scale: 0.9 }}
                transition={{
                    duration: 0.6,
                    ease: [0.22, 1, 0.36, 1], // easeOutQuint
                    type: "spring",
                    stiffness: 100,
                    damping: 20
                }}
                style={{ transformOrigin: "center center" }}
                className="transform-style-3d bg-white origin-center min-h-screen shadow-2xl"
            >
                {children}
            </motion.div>
        </div>
    );
}
