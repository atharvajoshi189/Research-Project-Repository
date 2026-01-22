"use client";

import { useEffect, useState } from 'react';

export default function ParticleBackground() {
    const [particles, setParticles] = useState<any[]>([]);

    useEffect(() => {
        // Create 20 random particles
        const newParticles = Array.from({ length: 20 }).map((_, i) => ({
            id: i,
            left: Math.random() * 100, // 0-100%
            delay: Math.random() * 10, // 0-10s delay
            duration: 10 + Math.random() * 20, // 10-30s duration
            size: 1 + Math.random() * 3, // 1-4px size
        }));
        setParticles(newParticles);
    }, []);

    return (
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
            {particles.map((p) => (
                <div
                    key={p.id}
                    className="particle"
                    style={{
                        left: `${p.left}%`,
                        width: `${p.size}px`,
                        height: `${p.size}px`,
                        animationDelay: `${p.delay}s`,
                        animationDuration: `${p.duration}s`,
                        boxShadow: `0 0 ${p.size * 2}px rgba(255, 255, 255, 0.8)`
                    }}
                />
            ))}
        </div>
    );
}
