"use client";

import { useEffect, useState } from 'react';
import { Lightbulb, ArrowRight, Zap } from 'lucide-react';
import Link from 'next/link';

interface RelatedProject {
    id: string;
    title: string;
    tech_stack: string | string[];
    aiReason?: string;
}

interface RelatedInnovationsProps {
    projectTitle: string;
    projectAbstract: string;
}

export default function RelatedInnovations({ projectTitle, projectAbstract }: RelatedInnovationsProps) {
    const [projects, setProjects] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRelated = async () => {
            try {
                // Determine tech string
                // Note: The parent component should ideally pass tech_stack too, but abstract often contains it.
                // We'll trust the route to handle context.

                const res = await fetch('/api/grok', {
                    method: 'POST',
                    body: JSON.stringify({
                        action: 'related_innovations',
                        context: { title: projectTitle, abstract: projectAbstract }
                    })
                });
                const { data } = await res.json();

                if (data?.related) {
                    // Start fetching details for these IDs
                    // Optimization: We can just use the IDs and basic info if the API returned it.
                    // But usually we want more info.
                    // For now, let's assume the API returns enough info OR we fetch it.
                    // The API route I wrote returns { related: [{ id, reason }] }
                    // I need to fetch the actual project details for these IDs.

                    const ids = data.related.map((r: any) => r.id);
                    if (ids.length > 0) {
                        const projectsRes = await fetch(`/api/projects/batch?ids=${ids.join(',')}`);
                        // Wait, I don't have a batch API.
                        // I should probably implement one or just use Supabase client here if I could.
                        // OR, I can accept that I need to fetch them one by one or create a new internal helper.
                        // Actually, 'actions/aiAction.ts' does this on server.

                        // Workaround: I will use the 'similarProjects' state logic from the parent if I could, 
                        // but here I am isolated.

                        // Let's just fetch them using supabase client if available, OR
                        // since this is a client component, I can use the supabase client directly!
                        fetchProjectsFromSupabase(data.related);
                    } else {
                        setLoading(false);
                    }
                } else {
                    setLoading(false);
                }
            } catch (e) {
                console.error("Related innovations fetch failed", e);
                setLoading(false);
            }
        };

        fetchRelated();
    }, [projectTitle, projectAbstract]);

    const fetchProjectsFromSupabase = async (relatedMatches: any[]) => {
        // Dynamic import to avoid SSR issues if any, though standard usage is fine
        const { supabase } = await import('@/lib/supabaseClient');
        const ids = relatedMatches.map(m => m.id);

        const { data } = await supabase
            .from('projects')
            .select('id, title, tech_stack, category')
            .in('id', ids);

        if (data) {
            const merged = data.map(p => ({
                ...p,
                aiReason: relatedMatches.find(m => m.id === p.id)?.reason
            }));
            setProjects(merged);
        }
        setLoading(false);
    };

    if (loading) {
        return (
            <div className="mt-12 opacity-50">
                <div className="h-6 w-48 bg-slate-200 rounded animate-pulse mb-6"></div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-40 bg-slate-100 rounded-3xl animate-pulse"></div>
                    ))}
                </div>
            </div>
        );
    }

    if (projects.length === 0) return null;

    return (
        <section className="mt-20">
            <div className="flex items-center gap-3 mb-8">
                <div className="p-2 bg-indigo-100 rounded-xl text-indigo-600">
                    <Lightbulb size={24} />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">Related Innovations</h2>
                    <p className="text-sm text-slate-500">Conceptual matches found by Grok AI</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {projects.map((p) => (
                    <Link key={p.id} href={`/project/${p.id}`}>
                        <div className="group relative bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all h-full flex flex-col">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-100 transition-opacity">
                                <ArrowRight size={24} className="text-indigo-500 -rotate-45 group-hover:rotate-0 transition-transform duration-300" />
                            </div>

                            <div className="mb-4">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-500 bg-indigo-50 px-2 py-1 rounded-md">
                                    {p.category}
                                </span>
                            </div>

                            <h3 className="font-bold text-slate-800 text-lg mb-2 leading-tight group-hover:text-indigo-600 transition-colors">
                                {p.title}
                            </h3>

                            <p className="text-xs text-slate-500 italic mb-4 border-l-2 border-indigo-100 pl-3 line-clamp-2">
                                "{p.aiReason}"
                            </p>

                            <div className="mt-auto pt-4 border-t border-slate-50 flex flex-wrap gap-2">
                                {(Array.isArray(p.tech_stack) ? p.tech_stack : (p.tech_stack?.split(',') || [])).slice(0, 3).map((t: string, i: number) => (
                                    <span key={i} className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-full">
                                        {t.trim()}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </section>
    );
}
