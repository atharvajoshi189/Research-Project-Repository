"use client";

import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { useEffect, useState } from "react";

interface ScrollBackgroundProps {
    activeSection: string;
}

export default function ScrollBackground({ activeSection }: ScrollBackgroundProps) {

    // Smooth scroll parallax for the grid
    const { scrollY } = useScroll();
    const smoothScroll = useSpring(scrollY, { stiffness: 50, damping: 20 });
    const gridY = useTransform(smoothScroll, [0, 5000], [0, 500]); // Moves grid slowly

    // Define Deep, Premium Mesh Colors
    const getColors = () => {
        switch (activeSection) {
            case "features": // Deep Blue
                return {
                    bg: "#eff6ff", // Blue-50
                    blob1: "#3b82f6", // Blue-500
                    blob2: "#60a5fa", // Blue-400
                    blob3: "#2563eb", // Blue-600
                    blob4: "#93c5fd", // Blue-300
                    accent: "rgba(37, 99, 235, 0.2)"
                };
            case "hall-of-fame": // Cyan / Sky Green (Transition)
                return {
                    bg: "#ecfeff", // Cyan-50
                    blob1: "#06b6d4", // Cyan-500
                    blob2: "#22d3ee", // Cyan-400
                    blob3: "#0891b2", // Cyan-600
                    blob4: "#67e8f9", // Cyan-300
                    accent: "rgba(8, 145, 178, 0.2)"
                };
            case "repo-pulse": // Emerald / Green (End of Spectrum)
                return {
                    bg: "#f0fdf4", // Green-50
                    blob1: "#10b981", // Emerald-500
                    blob2: "#34d399", // Emerald-400
                    blob3: "#059669", // Emerald-600
                    blob4: "#6ee7b7", // Emerald-300
                    accent: "rgba(5, 150, 105, 0.2)"
                };
            default: // Hero: Light Sky Blue
                return {
                    bg: "#f0f9ff", // Sky-50
                    blob1: "#38bdf8", // Sky-400
                    blob2: "#7dd3fc", // Sky-300
                    blob3: "#0ea5e9", // Sky-500
                    blob4: "#bae6fd", // Sky-200
                    accent: "rgba(14, 165, 233, 0.15)"
                };
        }
    };

    const colors = getColors();

    return (
        <motion.div
            className="fixed inset-0 w-full h-full z-0 pointer-events-none overflow-hidden"
            initial={{ backgroundColor: "#ffffff" }}
            animate={{ backgroundColor: colors.bg }}
            transition={{ duration: 2, ease: "easeInOut" }} // Ultra-smooth base transition
        >
            {/* Background is now pure mesh gradient, grid removed as requested */}

            {/* --- MESH GRADIENT BLOBS --- */}
            {/* Blob 1: Top Left - Large Flowing */}
            <motion.div
                className="absolute -top-[10%] -left-[10%] w-[60vw] h-[60vw] rounded-full blur-[100px] mix-blend-multiply opacity-60"
                animate={{
                    backgroundColor: colors.blob1,
                    x: [0, 50, 0],
                    y: [0, 30, 0],
                    rotate: [0, 10, 0],
                    scale: [1, 1.05, 1],
                }}
                transition={{
                    duration: 10,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
            />

            {/* Blob 2: Middle-Top Right - Counter Flowing */}
            <motion.div
                className="absolute top-[25%] -right-[10%] w-[60vw] h-[60vw] rounded-full blur-[100px] mix-blend-multiply opacity-60"
                animate={{
                    backgroundColor: colors.blob2,
                    x: [0, -40, 0],
                    y: [0, -20, 0],
                    rotate: [0, -10, 0],
                    scale: [1, 1.1, 1],
                }}
                transition={{
                    duration: 12,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 2
                }}
            />

            {/* Blob 3: Middle-Bottom Left - Pulse */}
            <motion.div
                className="absolute top-[55%] -left-[10%] w-[60vw] h-[60vw] rounded-full blur-[100px] mix-blend-multiply opacity-50"
                animate={{
                    backgroundColor: colors.blob3,
                    scale: [1, 1.2, 1],
                    opacity: [0.4, 0.6, 0.4],
                    x: [0, 20, 0],
                    y: [0, -20, 0],
                }}
                transition={{
                    duration: 15, // Slower, more ambient
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 1
                }}
            />

            {/* Blob 4: Bottom Right - Counter Flowing Lower */}
            <motion.div
                className="absolute -bottom-[5%] -right-[10%] w-[60vw] h-[60vw] rounded-full blur-[100px] mix-blend-multiply opacity-60"
                animate={{
                    backgroundColor: colors.blob4,
                    x: [0, -30, 0],
                    y: [0, 25, 0],
                    rotate: [0, -5, 0],
                    scale: [1, 1.1, 1],
                }}
                transition={{
                    duration: 13,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 0.5
                }}
            />

            {/* Noise Texture for Texture/Realism */}
            <div className="absolute inset-0 opacity-20 mix-blend-soft-light pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

        </motion.div>
    );
}
