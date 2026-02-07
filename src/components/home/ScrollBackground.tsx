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
            case "features": // Strong Blue
                return {
                    bg: "#eff6ff", // Blue-50 base
                    blob1: "#3b82f6", // Blue-500 (Strong)
                    blob2: "#60a5fa", // Blue-400
                    blob3: "#2563eb", // Blue-600
                    accent: "rgba(37, 99, 235, 0.2)"
                };
            case "hall-of-fame": // Strong Amber/Gold
                return {
                    bg: "#fffbeb", // Amber-50 base
                    blob1: "#f59e0b", // Amber-500 (Strong)
                    blob2: "#fbbf24", // Amber-400
                    blob3: "#d97706", // Amber-600
                    accent: "rgba(217, 119, 6, 0.2)"
                };
            case "repo-pulse": // Strong Green
                return {
                    bg: "#f0fdf4", // Green-50 base
                    blob1: "#10b981", // Emerald-500 (Strong)
                    blob2: "#34d399", // Emerald-400
                    blob3: "#059669", // Emerald-600
                    accent: "rgba(5, 150, 105, 0.2)"
                };
            default: // Hero: White/Teal
                return {
                    bg: "#ffffff",
                    blob1: "#2dd4bf", // Teal-400
                    blob2: "#99f6e4", // Teal-200
                    blob3: "#5eead4", // Teal-300
                    accent: "rgba(45, 212, 191, 0.15)"
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
                className="absolute -top-[10%] -left-[10%] w-[70vw] h-[70vw] rounded-full blur-[100px] mix-blend-multiply opacity-60"
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

            {/* Blob 2: Bottom Right - Counter Flowing */}
            <motion.div
                className="absolute top-[20%] -right-[10%] w-[60vw] h-[60vw] rounded-full blur-[80px] mix-blend-multiply opacity-60"
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

            {/* Blob 3: Center Accent - Pulse */}
            <motion.div
                className="absolute top-[40%] left-[30%] w-[40vw] h-[40vw] rounded-full blur-[60px] mix-blend-multiply opacity-50"
                animate={{
                    backgroundColor: colors.blob3,
                    scale: [1, 1.2, 1],
                    opacity: [0.4, 0.6, 0.4]
                }}
                transition={{
                    duration: 8,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 1
                }}
            />

            {/* Noise Texture for Texture/Realism */}
            <div className="absolute inset-0 opacity-20 mix-blend-soft-light pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

        </motion.div>
    );
}
