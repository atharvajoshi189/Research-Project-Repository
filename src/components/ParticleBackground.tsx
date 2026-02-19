"use client";

import { useEffect, useRef } from 'react';

export default function ParticleBackground() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d', { alpha: true }); // Optimized context
        if (!ctx) return;

        let animationFrameId: number;
        let particles: Particle[] = [];
        let mouse = { x: -1000, y: -1000 };

        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            initParticles();
        };

        class Particle {
            x: number;
            y: number;
            vx: number;
            vy: number;
            size: number;

            constructor() {
                this.x = Math.random() * canvas!.width;
                this.y = Math.random() * canvas!.height;
                // Slower movement for "subtle" effect
                this.vx = (Math.random() - 0.5) * 0.3; // Slower
                this.vy = (Math.random() - 0.5) * 0.3; // Slower
                this.size = Math.random() * 2 + 1;
            }

            update() {
                this.x += this.vx;
                this.y += this.vy;

                // Bounce off edges
                if (this.x < 0 || this.x > canvas!.width) this.vx *= -1;
                if (this.y < 0 || this.y > canvas!.height) this.vy *= -1;
            }

            draw() {
                if (!ctx) return;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(148, 163, 184, 0.5)'; // Slate-400 equivalent
                ctx.fill();
            }
        }

        const initParticles = () => {
            particles = [];
            // Density based on screen size (Lower density: higher divisor)
            // Increased divisor from 15000 to 25000 for better performance on weak devices
            const numberOfParticles = Math.floor((canvas!.width * canvas!.height) / 25000);
            for (let i = 0; i < numberOfParticles; i++) {
                particles.push(new Particle());
            }
        };

        const drawLines = () => {
            if (!ctx) return;
            const maxDistance = 150;
            const maxDistanceSq = maxDistance * maxDistance; // Avoid usage of Math.sqrt

            for (let i = 0; i < particles.length; i++) {
                const p1 = particles[i];

                // Link to mouse
                const dxMouse = p1.x - mouse.x;
                const dyMouse = p1.y - mouse.y;
                // Quick check for mouse distance
                if (Math.abs(dxMouse) < 200 && Math.abs(dyMouse) < 200) {
                    const distMouseSq = dxMouse * dxMouse + dyMouse * dyMouse;
                    if (distMouseSq < 40000) { // 200 * 200
                        const distMouse = Math.sqrt(distMouseSq);
                        ctx.beginPath();
                        ctx.strokeStyle = `rgba(94, 234, 212, ${1 - distMouse / 200})`; // Teal-300
                        ctx.lineWidth = 1;
                        ctx.moveTo(p1.x, p1.y);
                        ctx.lineTo(mouse.x, mouse.y);
                        ctx.stroke();
                    }
                }

                // Link to other particles
                for (let j = i + 1; j < particles.length; j++) {
                    const p2 = particles[j];
                    const dx = p1.x - p2.x;
                    const dy = p1.y - p2.y;

                    // Quick bounding box check
                    if (Math.abs(dx) > maxDistance || Math.abs(dy) > maxDistance) continue;

                    const distSq = dx * dx + dy * dy;

                    if (distSq < maxDistanceSq) {
                        ctx.beginPath();
                        // Approximation for opacity to avoid sqrt if possible, 
                        // but linear fade needs distance. 
                        // We can use (1 - distSq / maxDistanceSq) for a quadratic fade which is faster,
                        // but for visual consistency with original, we'll keep sqrt or approximate.
                        // Let's use quadratic fade for performance: faster and smoother falloff.
                        const opacity = 0.15 * (1 - distSq / maxDistanceSq);

                        ctx.strokeStyle = `rgba(148, 163, 184, ${opacity})`;
                        ctx.lineWidth = 0.5;
                        ctx.moveTo(p1.x, p1.y);
                        ctx.lineTo(p2.x, p2.y);
                        ctx.stroke();
                    }
                }
            }
        };

        const animate = () => {
            if (!ctx) return;
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            particles.forEach(p => {
                p.update();
                p.draw();
            });

            drawLines();
            animationFrameId = requestAnimationFrame(animate);
        };

        const handleMouseMove = (e: MouseEvent) => {
            mouse.x = e.clientX;
            mouse.y = e.clientY;
        };

        const handleMouseLeave = () => {
            mouse.x = -1000;
            mouse.y = -1000;
        }

        window.addEventListener('resize', resizeCanvas);
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseleave', handleMouseLeave);

        resizeCanvas();
        animate();

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseleave', handleMouseLeave);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 pointer-events-none z-0 opacity-60"
        />
    );
}
