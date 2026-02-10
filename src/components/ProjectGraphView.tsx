
import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

interface ProjectGraphViewProps {
    projects: any[];
}

const ProjectGraphView = ({ projects }: ProjectGraphViewProps) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const router = useRouter();
    const [hoveredNode, setHoveredNode] = useState<any>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const container = containerRef.current;
        if (!canvas || !container || projects.length === 0) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Resize handler
        const resize = () => {
            canvas.width = container.offsetWidth;
            canvas.height = 600; // Fixed height for graph view
        };
        resize();
        window.addEventListener('resize', resize);

        // NODE GENERATION
        // Simple force layout or randomized placement with clustering?
        // Let's do randomized but keep them somewhat central
        const nodes = projects.map(p => ({
            id: p.id,
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            vx: (Math.random() - 0.5) * 0.5,
            vy: (Math.random() - 0.5) * 0.5,
            radius: p.isPriority ? 8 : 5, // Larger if priority
            color: p.category === 'Research Paper' ? '#f43f5e' : p.category === 'Final Year Project' ? '#6366f1' : '#f59e0b',
            title: p.title,
            techs: Array.isArray(p.tech_stack) ? p.tech_stack : (p.tech_stack || '').split(','),
            data: p
        }));

        // CONNECTIONS
        // Connect nodes that share at least one tech
        const links: any[] = [];
        for (let i = 0; i < nodes.length; i++) {
            for (let j = i + 1; j < nodes.length; j++) {
                const nodeA = nodes[i];
                const nodeB = nodes[j];
                // Check intersection of techs
                const commonTech = nodeA.techs.some((t: string) => nodeB.techs.includes(t));
                if (commonTech) {
                    links.push({ source: nodeA, target: nodeB });
                }
            }
        }

        // ANIMATION LOOP
        let animationFrameId: number;

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Update positions (simple physics)
            nodes.forEach(node => {
                node.x += node.vx;
                node.y += node.vy;

                // Bounce off walls
                if (node.x < 0 || node.x > canvas.width) node.vx *= -1;
                if (node.y < 0 || node.y > canvas.height) node.vy *= -1;
            });

            // Draw Links
            ctx.lineWidth = 0.5;
            links.forEach(link => {
                const dx = link.source.x - link.target.x;
                const dy = link.source.y - link.target.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                // Only draw if close enough to avoid clutter
                if (dist < 200) {
                    ctx.strokeStyle = `rgba(203, 213, 225, ${1 - dist / 200})`; // Slate-300 fading
                    ctx.beginPath();
                    ctx.moveTo(link.source.x, link.source.y);
                    ctx.lineTo(link.target.x, link.target.y);
                    ctx.stroke();
                }
            });

            // Draw Nodes
            nodes.forEach(node => {
                ctx.beginPath();
                ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
                ctx.fillStyle = node.color;
                ctx.fill();

                // Glow for priority or hovered
                if (node.radius > 5) {
                    ctx.shadowBlur = 10;
                    ctx.shadowColor = node.color;
                } else {
                    ctx.shadowBlur = 0;
                }
                ctx.shadowBlur = 0; // Reset
            });

            animationFrameId = requestAnimationFrame(animate);
        };

        animate();

        // INTERACTION HANDLERS
        const handleMouseMove = (e: MouseEvent) => {
            const rect = canvas.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;

            let found = null;
            nodes.forEach(node => {
                const dist = Math.hypot(node.x - mouseX, node.y - mouseY);
                if (dist < node.radius + 5) { // Hit test
                    found = node;
                }
            });
            setHoveredNode(found);
            canvas.style.cursor = found ? 'pointer' : 'default';
        };

        const handleClick = (e: MouseEvent) => {
            const rect = canvas.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;

            nodes.forEach(node => {
                const dist = Math.hypot(node.x - mouseX, node.y - mouseY);
                if (dist < node.radius + 5) {
                    router.push(`/project/${node.data.id}`);
                }
            });
        };

        canvas.addEventListener('mousemove', handleMouseMove);
        canvas.addEventListener('click', handleClick);

        return () => {
            window.removeEventListener('resize', resize);
            cancelAnimationFrame(animationFrameId);
            canvas.removeEventListener('mousemove', handleMouseMove);
            canvas.removeEventListener('click', handleClick);
        };
    }, [projects, router]);

    return (
        <div ref={containerRef} className="relative w-full h-[600px] bg-slate-50/50 rounded-3xl border border-slate-200 overflow-hidden shadow-inner">
            {/* Tooltip Overlay */}
            {hoveredNode && (
                <div
                    className="absolute z-10 p-3 bg-white/90 backdrop-blur rounded-xl shadow-xl border border-slate-100 pointer-events-none transition-all duration-200"
                    style={{ left: hoveredNode.x + 15, top: hoveredNode.y - 15 }}
                >
                    <h4 className="font-bold text-slate-800 text-sm">{hoveredNode.title}</h4>
                    <div className="flex gap-1 mt-1">
                        {hoveredNode.techs.slice(0, 3).map((t: string, i: number) => (
                            <span key={i} className="text-[10px] px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded">{t}</span>
                        ))}
                    </div>
                </div>
            )}
            <canvas ref={canvasRef} className="w-full h-full block" />
            <div className="absolute bottom-4 right-4 text-xs text-slate-400 font-mono bg-white/50 px-2 py-1 rounded-lg backdrop-blur">
                Graph interactions: Hover to preview, Click to view
            </div>
        </div>
    );
};

export default ProjectGraphView;
