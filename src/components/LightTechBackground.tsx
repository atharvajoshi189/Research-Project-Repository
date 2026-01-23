"use client";

import React, { useEffect, useState } from 'react';
import { motion, useScroll, useTransform, useMotionValue, useSpring } from 'framer-motion';

const LightTechBackground = () => {
    const { scrollY } = useScroll();
    const y1 = useTransform(scrollY, [0, 1000], [0, 200]);

    // Mouse interactive effect
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    // Smooth spring for mouse movement
    const springConfig = { damping: 25, stiffness: 120 };
    const springX = useSpring(mouseX, springConfig);
    const springY = useSpring(mouseY, springConfig);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            const { clientX, clientY } = e;
            const centerX = window.innerWidth / 2;
            const centerY = window.innerHeight / 2;

            // Calculate distance from center to normalize values
            mouseX.set((clientX - centerX) * 0.05); // Reduced sensitivity
            mouseY.set((clientY - centerY) * 0.05);
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, [mouseX, mouseY]);

    // Random particles data
    // Random particles data - client side only to prevent hydration errors
    const [particles, setParticles] = useState<any[]>([]);

    useEffect(() => {
        const newParticles = Array.from({ length: 15 }).map((_, i) => ({
            id: i,
            x: Math.random() * 100,
            y: Math.random() * 100,
            size: Math.random() * 8 + 2, // 2px to 10px
            type: Math.random() > 0.5 ? 'circle' : 'square',
            delay: Math.random() * 5,
            duration: Math.random() * 10 + 10,
        }));
        setParticles(newParticles);
    }, []);

    return (
        <div className="fixed inset-0 -z-50 overflow-hidden">
            {/* 
                1. "Living Gradient" Background 
                - Colors: #E0F2FE (Soft Sky Blue), #CCFBF1 (Pale Teal), #F3E8FF (Light Lavender)
                - Animation: diagonal flow 
             */}
            <style jsx>{`
                @keyframes gradient-flow {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }
                .living-gradient {
                    background: linear-gradient(-45deg, #E0F2FE, #CCFBF1, #F3E8FF, #E0F2FE);
                    background-size: 400% 400%;
                    animation: gradient-flow 15s ease infinite;
                }
            `}</style>

            <div className="absolute inset-0 w-full h-full living-gradient" />

            {/* 2. Enhanced Grid Overlay - More visible (opacity 0.1, darker gray) */}
            <motion.div
                style={{ y: y1 }}
                className="absolute inset-0 w-full h-[150%] pointer-events-none opacity-10"
            >
                <div
                    className="w-full h-full"
                    style={{
                        backgroundImage: `linear-gradient(90deg, #94a3b8 1px, transparent 1px), linear-gradient(#94a3b8 1px, transparent 1px)`,
                        backgroundSize: '40px 40px'
                    }}
                />
            </motion.div>

            {/* 3. Floating Geometric Particles */}
            {particles.map((p) => (
                <motion.div
                    key={p.id}
                    className={`absolute ${p.type === 'circle' ? 'rounded-full' : 'rounded-sm'} pointer-events-none bg-slate-500`}
                    style={{
                        left: `${p.x}%`,
                        top: `${p.y}%`,
                        width: p.size,
                        height: p.size,
                        opacity: 0.4, // Slightly increased opacity for visibility against new bg
                        x: springX, // Attracted to mouse
                        y: springY,
                    }}
                    animate={{
                        y: [0, -100, 0],
                        opacity: [0.3, 0.6, 0.3],
                        rotate: p.type === 'square' ? [0, 90, 180] : 0,
                    }}
                    transition={{
                        duration: p.duration,
                        repeat: Infinity,
                        ease: "linear",
                        delay: p.delay,
                    }}
                />
            ))}

            {/* Subtle Vignette for focus */}
            <div className="absolute inset-0 bg-radial-gradient(circle at center, transparent 0%, rgba(255,255,255,0) 60%, rgba(255,255,255,0.4) 100%) pointer-events-none" />
        </div>
    );
};

export default LightTechBackground;
