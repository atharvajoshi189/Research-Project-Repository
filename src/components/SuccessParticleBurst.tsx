"use client";

import React, { useEffect, useRef } from "react";

interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    color: string;
    shape: 'circle' | 'square' | 'triangle' | 'plus';
    size: number;
    rotation: number;
    rotationSpeed: number;
    life: number;
    maxLife: number;
}

const SuccessParticleBurst: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // Resize Canvas
        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        resize();
        window.addEventListener("resize", resize);

        // Particle System
        let particles: Particle[] = [];
        const colors = ["#84cc16", "#ffffff", "#14b8a6", "#a3e635"]; // Lime, White, Teal, Light Lime
        const shapes: ('circle' | 'square' | 'triangle' | 'plus')[] = ['square', 'triangle', 'plus'];

        const createParticle = (x: number, y: number) => {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 8 + 4; // Initial explosion speed
            return {
                x,
                y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                color: colors[Math.floor(Math.random() * colors.length)],
                shape: shapes[Math.floor(Math.random() * shapes.length)],
                size: Math.random() * 8 + 4,
                rotation: Math.random() * Math.PI * 2,
                rotationSpeed: (Math.random() - 0.5) * 0.2,
                life: 0,
                maxLife: 200, // Frames
            };
        };

        // Spawn Burst
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        for (let i = 0; i < 150; i++) {
            particles.push(createParticle(centerX, centerY));
        }

        let animationFrameId: number;

        const drawShape = (ctx: CanvasRenderingContext2D, p: Particle) => {
            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate(p.rotation);
            ctx.fillStyle = p.color;

            if (p.shape === 'square') {
                ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
            } else if (p.shape === 'triangle') {
                ctx.beginPath();
                ctx.moveTo(0, -p.size / 2);
                ctx.lineTo(p.size / 2, p.size / 2);
                ctx.lineTo(-p.size / 2, p.size / 2);
                ctx.closePath();
                ctx.fill();
            } else if (p.shape === 'plus') {
                const thickness = p.size / 3;
                ctx.fillRect(-p.size / 2, -thickness / 2, p.size, thickness);
                ctx.fillRect(-thickness / 2, -p.size / 2, thickness, p.size);
            }

            ctx.restore();
        };

        // Animation Loop
        const animate = () => {
            if (!ctx || !canvas) return;

            // Clear with slight trail effect (optional, here just clear)
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;

            particles.forEach((p, index) => {
                p.life++;
                p.x += p.vx;
                p.y += p.vy;
                p.rotation += p.rotationSpeed;

                // Friction
                p.vx *= 0.95;
                p.vy *= 0.95;

                // Gravitate to Center (Implosion effect after initial burst)
                if (p.life > 40) {
                    const dx = centerX - p.x;
                    const dy = centerY - p.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    const force = 0.05 * (p.life / p.maxLife); // Stronger pull over time

                    p.vx += (dx / dist) * force * 2;
                    p.vy += (dy / dist) * force * 2;
                }

                // Opacity Fade
                const opacity = Math.max(0, 1 - p.life / p.maxLife);
                ctx.globalAlpha = opacity;

                drawShape(ctx, p);

                // Remove dead particles
                if (p.life >= p.maxLife || opacity <= 0.01) {
                    particles.splice(index, 1);
                }
            });

            if (particles.length > 0) {
                animationFrameId = requestAnimationFrame(animate);
            }
        };

        animate();

        return () => {
            window.removeEventListener("resize", resize);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 pointer-events-none z-50"
            style={{ width: "100%", height: "100%" }}
        />
    );
};

export default SuccessParticleBurst;
