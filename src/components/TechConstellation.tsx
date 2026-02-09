"use client";

import React, { useEffect, useRef } from 'react';

const TechConstellation = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let width = canvas.width = canvas.parentElement?.offsetWidth || 300;
        let height = canvas.height = 200;

        const techs = ["React", "AI", "IoT", "ML", "Next", "Node", "Cloud", "Data", "Cyber", "Web3"];

        const nodes: any[] = [];
        const numNodes = 15;

        // Initialize Nodes
        for (let i = 0; i < numNodes; i++) {
            nodes.push({
                x: Math.random() * width,
                y: Math.random() * height,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                radius: Math.random() * 2 + 1,
                label: techs[i % techs.length],
                alpha: Math.random() * 0.5 + 0.5
            });
        }

        const draw = () => {
            if (!ctx || !canvas) return;
            ctx.clearRect(0, 0, width, height);

            // Update and Draw Nodes
            nodes.forEach((node, i) => {
                node.x += node.vx;
                node.y += node.vy;

                // Bounce off walls
                if (node.x < 0 || node.x > width) node.vx *= -1;
                if (node.y < 0 || node.y > height) node.vy *= -1;

                // Draw Connections
                nodes.forEach((otherNode, j) => {
                    if (i === j) return;
                    const dx = node.x - otherNode.x;
                    const dy = node.y - otherNode.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < 80) {
                        ctx.beginPath();
                        ctx.moveTo(node.x, node.y);
                        ctx.lineTo(otherNode.x, otherNode.y);
                        ctx.strokeStyle = `rgba(20, 184, 166, ${1 - distance / 80})`; // Teal color
                        ctx.lineWidth = 0.5;
                        ctx.stroke();
                    }
                });

                // Draw Node
                ctx.beginPath();
                ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(99, 102, 241, ${node.alpha})`; // Indigo color
                ctx.fill();

                // Draw Label (occasionally)
                if (i % 3 === 0) {
                    ctx.fillStyle = `rgba(15, 23, 42, 0.5)`;
                    ctx.font = "10px monospace";
                    ctx.fillText(node.label, node.x + 5, node.y - 5);
                }
            });

            requestAnimationFrame(draw);
        };

        const animationId = requestAnimationFrame(draw);

        const handleResize = () => {
            width = canvas.width = canvas.parentElement?.offsetWidth || 300;
            height = canvas.height = 200;
        };

        window.addEventListener('resize', handleResize);

        return () => {
            cancelAnimationFrame(animationId);
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    return (
        <div className="w-full h-48 bg-white/40 backdrop-blur-xl rounded-3xl border border-white/40 shadow-lg shadow-teal-900/5 mb-6 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-b from-teal-50/30 to-transparent pointer-events-none"></div>
            <canvas ref={canvasRef} className="w-full h-full block" />
            <div className="absolute bottom-3 left-4 text-xs font-bold text-teal-600/80 uppercase tracking-widest pointer-events-none">
                Neural Network
            </div>
        </div>
    );
};

export default TechConstellation;
