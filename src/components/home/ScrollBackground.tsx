"use client";

import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";

interface ScrollBackgroundProps {
    activeSection: string;
}

export default function ScrollBackground({ activeSection }: ScrollBackgroundProps) {

    // Smooth scroll parallax for the grid
    const { scrollY } = useScroll();
    const smoothScroll = useSpring(scrollY, { stiffness: 50, damping: 20 });
    const gridY = useTransform(smoothScroll, [0, 5000], [0, 500]); // Moves grid slowly

    const { theme } = useTheme();
    const isDark = theme === 'dark';

    // Define Deep, Premium Mesh Colors
    const getColors = () => {
        if (isDark) {
            switch (activeSection) {
                case "features": // Emerald Dark
                    return {
                        bg: "#020617", // Slate 950
                        blob1: "#064e3b", // Emerald-900
                        blob2: "#065f46", // Emerald-800
                        blob3: "#042f2e", // Emerald-950
                        blob4: "#10b981", // Emerald-500 (Highlights)
                        accent: "rgba(16, 185, 129, 0.1)"
                    };
                case "hall-of-fame": // Blue Dark
                    return {
                        bg: "#020617",
                        blob1: "#1e3a8a", // Blue-900
                        blob2: "#1e40af", // Blue-800
                        blob3: "#172554", // Blue-950
                        blob4: "#3b82f6", // Blue-500
                        accent: "rgba(37, 99, 235, 0.1)"
                    };
                case "repo-pulse": // Teal Dark
                    return {
                        bg: "#020617",
                        blob1: "#134e4a", // Teal-900
                        blob2: "#115e59", // Teal-800
                        blob3: "#042f2e", // Teal-950
                        blob4: "#14b8a6", // Teal-500
                        accent: "rgba(13, 148, 136, 0.1)"
                    };
                default: // Hero: Sky Dark
                    return {
                        bg: "#0f172a", // Slate 900
                        blob1: "#0c4a6e", // Sky-900
                        blob2: "#075985", // Sky-800
                        blob3: "#082f49", // Sky-950
                        blob4: "#0ea5e9", // Sky-500
                        accent: "rgba(14, 165, 233, 0.1)"
                    };
            }
        }

        switch (activeSection) {
            case "features": // Green Palette
                return {
                    bg: "#ffffff", // Pure White
                    blob1: "#10b981", // Emerald-500
                    blob2: "#34d399", // Emerald-400
                    blob3: "#059669", // Emerald-600
                    blob4: "#6ee7b7", // Emerald-300
                    accent: "rgba(16, 185, 129, 0.2)"
                };
            case "hall-of-fame": // Blue Palette
                return {
                    bg: "#ffffff", // Pure White
                    blob1: "#3b82f6", // Blue-500
                    blob2: "#60a5fa", // Blue-400
                    blob3: "#2563eb", // Blue-600
                    blob4: "#93c5fd", // Blue-300
                    accent: "rgba(37, 99, 235, 0.2)"
                };
            case "repo-pulse": // Green (Teal) Palette
                return {
                    bg: "#ffffff", // Pure White
                    blob1: "#14b8a6", // Teal-500
                    blob2: "#2dd4bf", // Teal-400
                    blob3: "#0d9488", // Teal-600
                    blob4: "#5eead4", // Teal-300
                    accent: "rgba(13, 148, 136, 0.2)"
                };
            default: // Hero: Blue Palette
                return {
                    bg: "#ffffff", // Pure White
                    blob1: "#0ea5e9", // Sky-500
                    blob2: "#38bdf8", // Sky-400
                    blob3: "#0284c7", // Sky-600
                    blob4: "#7dd3fc", // Sky-300
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
                className={`absolute -top-[10%] -left-[10%] w-[60vw] h-[60vw] rounded-full blur-[100px] opacity-60 ${isDark ? 'mix-blend-screen' : 'mix-blend-multiply'}`}
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
                className={`absolute top-[25%] -right-[10%] w-[60vw] h-[60vw] rounded-full blur-[100px] opacity-60 ${isDark ? 'mix-blend-screen' : 'mix-blend-multiply'}`}
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
                className={`absolute top-[55%] -left-[10%] w-[60vw] h-[60vw] rounded-full blur-[100px] opacity-50 ${isDark ? 'mix-blend-screen' : 'mix-blend-multiply'}`}
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
                className={`absolute -bottom-[5%] -right-[10%] w-[60vw] h-[60vw] rounded-full blur-[100px] opacity-60 ${isDark ? 'mix-blend-screen' : 'mix-blend-multiply'}`}
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
            <div className={`absolute inset-0 opacity-20 pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] ${isDark ? 'mix-blend-overlay' : 'mix-blend-soft-light'}`} />

        </motion.div>
    );
}
