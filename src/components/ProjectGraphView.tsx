"use client";

import { useEffect, useState, useMemo, useRef } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { CircleDot, Maximize, Info, Share2 } from 'lucide-react';

// Dynamically import ForceGraph2D to avoid SSR issues
const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), {
    ssr: false,
    loading: () => (
        <div className="flex items-center justify-center h-full w-full bg-slate-50 text-slate-400">
            <div className="flex flex-col items-center gap-2">
                <div className="w-8 h-8 border-4 border-slate-300 border-t-indigo-600 rounded-full animate-spin"></div>
                <span className="text-sm font-medium text-slate-500">Loading Network...</span>
            </div>
        </div>
    )
});

interface ProjectGraphViewProps {
    projects: any[];
}

const ProjectGraphView = ({ projects }: ProjectGraphViewProps) => {
    const router = useRouter();
    const containerRef = useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = useState({ width: 600, height: 600 });
    const graphRef = useRef<any>(null);

    useEffect(() => {
        if (containerRef.current) {
            setDimensions({
                width: containerRef.current.clientWidth,
                height: containerRef.current.clientHeight || 600
            });
        }
    }, [containerRef.current]);

    // Construct graph data
    const graphData = useMemo(() => {
        const nodes: any[] = [];
        const links: any[] = [];

        // 1. Create Nodes (Projects)
        projects.forEach(p => {
            nodes.push({
                id: p.id,
                name: p.title,
                val: 1,
                group: p.category,
                tech: Array.isArray(p.tech_stack) ? p.tech_stack : (typeof p.tech_stack === 'string' ? p.tech_stack.split(',') : []),
                img: p.image_url
            });
        });

        // 2. Create Links (Shared Tech Stack)
        for (let i = 0; i < nodes.length; i++) {
            for (let j = i + 1; j < nodes.length; j++) {
                const nodeA = nodes[i];
                const nodeB = nodes[j];

                const commonTech = nodeA.tech.filter((t: string) =>
                    nodeB.tech.some((bt: string) => bt.trim().toLowerCase() === t.trim().toLowerCase())
                );

                if (commonTech.length > 0) {
                    links.push({
                        source: nodeA.id,
                        target: nodeB.id,
                        value: commonTech.length,
                        common: commonTech
                    });
                }
            }
        }

        return { nodes, links };
    }, [projects]);


    return (
        <div className="w-full h-[650px] bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-200 flex flex-col md:flex-row">

            {/* Graph Area (Left/Top) */}
            <div ref={containerRef} className="relative flex-1 h-[400px] md:h-full bg-slate-50/50 cursor-move">
                <ForceGraph2D
                    ref={graphRef}
                    width={dimensions.width}
                    height={dimensions.height}
                    graphData={graphData}
                    backgroundColor="transparent" // Clean background

                    // Node Styling - "Floating Dots"
                    nodeLabel="name"
                    nodeColor={(node: any) => {
                        if (node.group === 'Final Year Project') return '#0d9488'; // Teal-600
                        if (node.group === 'Research Paper') return '#4f46e5'; // Indigo-600
                        if (node.group === 'Micro-Project') return '#e11d48'; // Rose-600
                        return '#64748b'; // Slate-500
                    }}
                    nodeRelSize={6}


                    // Link Styling - Subtle connections
                    linkColor={() => '#cbd5e1'} // Slate-300
                    linkWidth={(link: any) => 0.5} // Thin lines
                    linkDirectionalParticles={0}

                    nodeCanvasObject={(node: any, ctx, globalScale) => {
                        const label = node.name;
                        const fontSize = 12 / globalScale;

                        // Soft Glow for "Floating" effect
                        ctx.shadowColor = node.color || '#64748b';
                        ctx.shadowBlur = 10;
                        ctx.shadowOffsetX = 0;
                        ctx.shadowOffsetY = 0;

                        // Node Dot
                        ctx.beginPath();
                        ctx.arc(node.x, node.y, 5, 0, 2 * Math.PI, false);
                        ctx.fillStyle = node.color || '#64748b';
                        ctx.fill();

                        // Reset shadow
                        ctx.shadowColor = 'transparent';
                        ctx.shadowBlur = 0;

                        // Clean White Border
                        ctx.strokeStyle = '#ffffff';
                        ctx.lineWidth = 1.5;
                        ctx.stroke();

                        // Label (Only when zoomed in close)
                        if (globalScale > 2) {
                            ctx.font = `600 ${fontSize}px Inter, sans-serif`;
                            const textWidth = ctx.measureText(label).width;
                            const bckgDimensions = [textWidth, fontSize].map(n => n + fontSize * 0.4);

                            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
                            ctx.roundRect(
                                node.x - bckgDimensions[0] / 2,
                                node.y + 8,
                                bckgDimensions[0],
                                bckgDimensions[1],
                                4
                            );
                            ctx.fill();

                            ctx.textAlign = 'center';
                            ctx.textBaseline = 'middle';
                            ctx.fillStyle = '#0f172a'; // Slate-900
                            ctx.fillText(label, node.x, node.y + 8 + bckgDimensions[1] / 2);
                        }
                    }}
                    onNodeClick={(node: any) => {
                        router.push(`/project/${node.id}`);
                    }}
                    cooldownTicks={100}
                />

                {/* Floating Control Button */}
                <div className="absolute bottom-4 left-4">
                    <button
                        onClick={() => graphRef.current?.zoomToFit(400)}
                        className="p-2 bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 rounded-lg shadow-sm transition-colors"
                        title="Reset View"
                    >
                        <Maximize size={18} />
                    </button>
                </div>
            </div>

            {/* Sidebar (Right/Bottom) */}
            <div className="w-full md:w-80 bg-white border-l border-slate-200 p-6 flex flex-col h-auto md:h-full overflow-y-auto z-10 shadow-[-5px_0_15px_-5px_rgba(0,0,0,0.05)]">
                <div className="mb-6">
                    <div className="flex items-center gap-2 mb-1">
                        <div className="p-1.5 bg-teal-50 rounded-md text-teal-600">
                            <CircleDot size={18} />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900">Project Map</h3>
                    </div>
                    <p className="text-sm text-slate-500 leading-relaxed">
                        Explore the research ecosystem. Dots represent projects, connected by shared technologies.
                    </p>
                </div>

                <div className="space-y-6">
                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-center">
                            <span className="block text-2xl font-bold text-slate-800">{graphData.nodes.length}</span>
                            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Nodes</span>
                        </div>
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-center">
                            <span className="block text-2xl font-bold text-slate-800">{graphData.links.length}</span>
                            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Links</span>
                        </div>
                    </div>

                    {/* Legend */}
                    <div>
                        <h4 className="text-xs font-bold text-slate-900 uppercase tracking-widest mb-3 flex items-center gap-2">
                            <Info size={12} className="text-slate-400" /> Legend
                        </h4>
                        <div className="space-y-2 bg-slate-50/50 p-3 rounded-xl border border-slate-100">
                            <div className="flex items-center gap-3 p-2 bg-white rounded-lg border border-slate-100 shadow-sm">
                                <span className="w-3 h-3 rounded-full bg-teal-600 shadow-[0_0_8px_rgba(13,148,136,0.4)]" />
                                <span className="text-xs font-medium text-slate-700">Final Year Project</span>
                            </div>
                            <div className="flex items-center gap-3 p-2 bg-white rounded-lg border border-slate-100 shadow-sm">
                                <span className="w-3 h-3 rounded-full bg-indigo-600 shadow-[0_0_8px_rgba(79,70,229,0.4)]" />
                                <span className="text-xs font-medium text-slate-700">Research Paper</span>
                            </div>
                            <div className="flex items-center gap-3 p-2 bg-white rounded-lg border border-slate-100 shadow-sm">
                                <span className="w-3 h-3 rounded-full bg-rose-600 shadow-[0_0_8px_rgba(225,29,72,0.4)]" />
                                <span className="text-xs font-medium text-slate-700">Micro-Project</span>
                            </div>
                        </div>
                    </div>

                    <div className="mt-auto pt-6 border-t border-slate-100">
                        <h4 className="text-xs font-bold text-slate-900 uppercase tracking-widest mb-3 flex items-center gap-2">
                            <Share2 size={12} className="text-slate-400" /> Interaction
                        </h4>
                        <ul className="text-xs text-slate-500 space-y-2">
                            <li className="flex items-start gap-2">
                                <span className="font-bold text-slate-700">• Drag</span> nodes to rearrange.
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="font-bold text-slate-700">• Scroll</span> to zoom in/out.
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="font-bold text-slate-700">• Click</span> a dot to open details.
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProjectGraphView;
