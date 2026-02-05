"use client";

import React, { useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

interface HeroParallaxProps {
    children: React.ReactNode;
    className?: string;
}

export const HeroParallax = ({ children, className = "" }: HeroParallaxProps) => {
    const ref = useRef<HTMLDivElement>(null);
    const [isHovering, setIsHovering] = useState(false);

    const x = useMotionValue(0);
    const y = useMotionValue(0);

    // Smooth springs for rotation
    const mouseX = useSpring(x, { stiffness: 400, damping: 30, mass: 0.5 });
    const mouseY = useSpring(y, { stiffness: 400, damping: 30, mass: 0.5 });

    // Mouse handle
    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!ref.current) return;
        const rect = ref.current.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;

        // Calculate normalized mouse position from center (-0.5 to 0.5)
        // We want relatively strong effect so we don't divide too much
        const mouseXPos = (e.clientX - rect.left) / width - 0.5;
        const mouseYPos = (e.clientY - rect.top) / height - 0.5;

        x.set(mouseXPos);
        y.set(mouseYPos);
    };

    const handleMouseLeave = () => {
        setIsHovering(false);
        x.set(0);
        y.set(0);
    };

    const handleMouseEnter = () => {
        setIsHovering(true);
    };

    return (
        <motion.div
            ref={ref}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onMouseEnter={handleMouseEnter}
            style={{
                perspective: 1200,
            }}
            className={`relative w-full h-full flex items-center justify-center ${className}`}
        >
            <ParallaxContext.Provider value={{ mouseX, mouseY, isHovering }}>
                {children}
            </ParallaxContext.Provider>
        </motion.div>
    );
};

// Context to share mouse motion values with children
interface ParallaxContextType {
    mouseX: any;
    mouseY: any;
    isHovering: boolean;
}

const ParallaxContext = React.createContext<ParallaxContextType>({
    mouseX: null,
    mouseY: null,
    isHovering: false,
});

export const useParallax = () => React.useContext(ParallaxContext);

interface ParallaxLayerProps {
    children: React.ReactNode;
    depth?: number; // Higher depth = closer to camera (moves more)
    className?: string;
    inverse?: boolean; // If true, moves in opposite direction (background elements)
}

export const ParallaxLayer = ({ children, depth = 20, className = "", inverse = false }: ParallaxLayerProps) => {
    const { mouseX, mouseY } = useParallax();

    // If depth is 50, we want max rotation of maybe 15 degrees
    // X movement causes Y rotation (looking side to side)
    // Y movement causes X rotation (looking up and down)
    const factor = inverse ? -1 : 1;
    const rotateY = useTransform(mouseX, [-0.5, 0.5], [-depth * factor, depth * factor]);
    const rotateX = useTransform(mouseY, [-0.5, 0.5], [depth * factor, -depth * factor]);

    // Parallax translation
    const translateX = useTransform(mouseX, [-0.5, 0.5], [-depth * 2 * factor, depth * 2 * factor]);
    const translateY = useTransform(mouseY, [-0.5, 0.5], [-depth * 2 * factor, depth * 2 * factor]);

    return (
        <motion.div
            style={{
                rotateX,
                rotateY,
                x: translateX,
                y: translateY,
                transformStyle: "preserve-3d",
            }}
            className={`${className}`}
        >
            {children}
        </motion.div>
    );
};
