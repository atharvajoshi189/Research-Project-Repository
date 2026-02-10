"use client";

import { useState, Suspense, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { Filter, Search as SearchIcon, ArrowRight, Check, SlidersHorizontal, FolderX, Github, LayoutGrid, List, Share2 } from 'lucide-react';
import NextLink from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import Project3DCard from '@/components/Project3DCard';
import ProjectListView from '@/components/ProjectListView';
import ProjectGraphView from '@/components/ProjectGraphView';
import BackgroundBlobs from '@/components/BackgroundBlobs';
import GridPulse from '@/components/GridPulse';
import BentoGrid from '@/components/BentoGrid';
import TechConstellation from '@/components/TechConstellation';
import DistributionChart from '@/components/DistributionChart';

function SearchContent() {
    const searchParams = useSearchParams();
    const initialQuery = searchParams.get('q') || '';
    const initialCategory = searchParams.get('category') || '';
    const initialTech = searchParams.get('tech') || '';

    const [allProjects, setAllProjects] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState(initialQuery);
    const [selectedYear, setSelectedYear] = useState<string[]>([]);
    const [selectedTech, setSelectedTech] = useState<string[]>(initialTech ? [initialTech] : []); // Tech stack filter
    const [selectedCategory, setSelectedCategory] = useState<string[]>(initialCategory ? [initialCategory] : []);
    const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [isFocused, setIsFocused] = useState(false);
    const [viewMode, setViewMode] = useState<'grid' | 'list' | 'graph'>('grid');

    // Fetch logic that handles both initial load and search
    useEffect(() => {
        const fetchProjects = async () => {
            setLoading(true);
            try {
                let data = [];

                if (searchTerm) {
                    // Use RPC for smart search (Title, Tech, Leader, Collaborator)
                    const { data: searchData, error } = await supabase.rpc('search_projects', { keyword: searchTerm });
                    if (error) throw error;
                    data = searchData || [];
                } else if (initialTech) {
                    // Attempt Smart Fuzzy RPC first
                    const { data: techData, error: rpcError } = await supabase
                        .rpc('search_projects_by_tech', { tech_pattern: initialTech });

                    if (rpcError) {
                        console.warn("Fuzzy search RPC failed (function might be missing), falling back to strict match.", rpcError);
                        // Fallback to strict 'contains'
                        const { data: strictData, error: strictError } = await supabase
                            .from('projects')
                            .select('*')
                            .eq('status', 'approved')
                            .contains('tech_stack', [initialTech]);

                        if (strictError) throw strictError;
                        data = strictData || [];
                    } else {
                        data = techData || [];
                    }
                } else {
                    // Default fetch
                    const { data: allData, error } = await supabase.from('projects').select('*').eq('status', 'approved');
                    if (error) throw error;
                    data = allData || [];
                }

                setAllProjects(data);
            } catch (err) {
                console.error("Search error details:", JSON.stringify(err, Object.getOwnPropertyNames(err), 2));
                console.error("Search error raw:", err);
            } finally {
                setLoading(false);
            }
        };

        // Debounce search to avoid too many RPC calls
        const debounce = setTimeout(() => {
            fetchProjects();
        }, 300);

        return () => clearTimeout(debounce);
    }, [searchTerm, initialTech]); // Added initialTech dependency

    // Sync state with URL params on mount/update
    useEffect(() => {
        if (initialQuery) setSearchTerm(initialQuery);
        if (initialCategory && !selectedCategory.includes(initialCategory)) setSelectedCategory([initialCategory]);
        if (initialTech && !selectedTech.includes(initialTech)) setSelectedTech([initialTech]);
    }, [initialQuery, initialCategory, initialTech]);

    // SMART FILTERING LOGIC
    // Runs every time any filter state changes
    const filteredProjects = useMemo(() => {
        // 1. Reset check: If no filters are active, return everything (implicit in logic below)

        return allProjects.filter(project => {
            // Search Bar Logic - NOW HANDLED BY RPC, but we keep this as a secondary client-side filter 
            // incase user types faster than RPC or filters the RPC results further?
            // Actually, if we rely on RPC, `allProjects` IS the search result. 
            // So we just need to apply the OTHER filters (Year, Category, Tech - but Tech is also in RPC? RPC returns projects matching keyword anywhere)
            // If user searches "Python", RPC returns python projects.
            // If user THEN clicks "2025", we filter the RPC results. 
            // So matchesSearch is effectively true here if we assume allProjects contains relevant items.
            // BUT: if we want to support client-side filtering ON TOP of RPC results without refetching for every dropdown:

            // matchesSearch is redundant if searchTerm was sent to RPC. 
            // However, to keep it robust (e.g. if we want to filter within the returned set for refined matches or if RPC returns broadly):
            // Let's just return true for search match portion since `allProjects` is ALREADY filtered by search term via RPC.
            // Strict Filtering: Only show projects that match the search term
            const matchesSearch = !searchTerm || (
                (project.title?.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (Array.isArray(project.tech_stack) && project.tech_stack.some((t: string) => t.toLowerCase().includes(searchTerm.toLowerCase()))) ||
                (typeof project.tech_stack === 'string' && project.tech_stack.toLowerCase().includes(searchTerm.toLowerCase()))
            );

            // Note: Use existing tech/year/category filters on the result set.

            // Year Logic (OR) - checking both year and academic_year
            const matchesYear = selectedYear.length === 0 || selectedYear.includes(project.year) || selectedYear.includes(project.academic_year);

            // Category Logic (OR)
            const matchesCategory = selectedCategory.length === 0 || selectedCategory.includes(project.category);

            // Tech Stack Logic (OR) - Fuzzy Match (Targeting tech_stack column)
            const matchesTech = selectedTech.length === 0 || (() => {
                // Support both snake_case (DB default) and camelCase (potential RPC/transform)
                const stack = project.tech_stack || project.techStack;
                return stack && Array.isArray(stack) && stack.some((tech: string) =>
                    selectedTech.some(filter => tech.toLowerCase().includes(filter.toLowerCase()))
                );
            })();

            // Combine with AND
            return matchesSearch && matchesYear && matchesCategory && matchesTech;
        });
    }, [searchTerm, selectedYear, selectedCategory, selectedTech, allProjects]);

    const toggleFilter = (list: string[], setList: any, item: string) => {
        if (list.includes(item)) {
            setList(list.filter((i: string) => i !== item));
        } else {
            setList([...list, item]);
        }
    };

    // Calculate all unique tech stacks from loaded projects
    const allUniqueTechs = useMemo(() => {
        const techs = new Set<string>();
        allProjects.forEach(p => {
            const stack = p.tech_stack || p.techStack;
            if (stack) {
                if (Array.isArray(stack)) {
                    stack.forEach((t: string) => techs.add(t));
                } else if (typeof stack === 'string') {
                    stack.split(',').forEach((t: string) => techs.add(t.trim()));
                }
            }
        });
        return Array.from(techs);
    }, [allProjects]);

    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.15 // Increased stagger for better flow
            }
        }
    };

    const itemVariants: Variants = {
        hidden: { opacity: 0, y: 30, scale: 0.95 },
        show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 350, damping: 25 } },
        exit: { opacity: 0, scale: 0.9, transition: { duration: 0.2 } }
    };

    return (
        <div className="relative min-h-screen w-full overflow-hidden pb-20 bg-[#F8FAFC]">
            {/* Background Animations */}
            <BackgroundBlobs />
            <div className="fixed inset-0 z-0 pointer-events-none">
                <GridPulse />
                <BentoGrid />
            </div>

            <div className="max-w-[95rem] mx-auto px-4 md:px-8 pt-6">

                {/* Mobile Filter Header */}
                <div className="md:hidden mb-6 flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-slate-900">Browse Projects</h1>
                    <button
                        onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
                        className="p-2 bg-white border border-slate-200 rounded-lg text-slate-600 shadow-sm"
                    >
                        <SlidersHorizontal size={20} />
                    </button>
                </div>

                <div className="flex flex-col md:flex-row gap-8 lg:gap-12">
                    {/* Modern Sidebar */}
                    <aside className={`
                        fixed inset-0 z-40 bg-white/95 backdrop-blur-xl p-6 md:p-0 md:bg-transparent md:backdrop-filter-none md:relative md:w-72 lg:w-80 flex-shrink-0 transition-transform duration-300 md:translate-x-0
                        ${isMobileFilterOpen ? 'translate-x-0' : '-translate-x-full'}
                    `}>
                        <div className="md:sticky md:top-32 space-y-8 h-full md:h-auto overflow-y-auto md:overflow-visible pb-20 md:pb-0">
                            <div className="flex justify-between items-center md:hidden mb-6">
                                <h2 className="text-lg font-bold">Filters</h2>
                                <button onClick={() => setIsMobileFilterOpen(false)} className="text-slate-500">Close</button>
                            </div>

                            {/* Tech Constellation Visualization */}
                            <TechConstellation allTechs={allUniqueTechs} />

                            {/* Distribution Chart */}
                            {allProjects.length > 0 && (
                                <DistributionChart
                                    selected={selectedCategory}
                                    onSelect={(cat) => toggleFilter(selectedCategory, setSelectedCategory, cat)}
                                    data={Object.entries(allProjects.reduce((acc: any, proj: any) => {
                                        const cat = proj.category || 'Uncategorized';
                                        acc[cat] = (acc[cat] || 0) + 1;
                                        return acc;
                                    }, {})).map(([label, count]: any, i: number) => ({
                                        label,
                                        count,
                                        color: i === 0 ? "bg-indigo-500" : i === 1 ? "bg-teal-500" : i === 2 ? "bg-rose-500" : "bg-amber-500"
                                    })).sort((a: any, b: any) => b.count - a.count).slice(0, 5)}
                                />
                            )}

                            <div className="bg-white/30 backdrop-blur-[15px] p-6 rounded-3xl border border-teal-400/30 shadow-xl shadow-teal-900/5 transition-all hover:shadow-teal-900/10">
                                {/* Live Stats Counter */}
                                <div className="mb-6 bg-white/50 rounded-2xl p-4 text-center border border-white/50 shadow-inner">
                                    <span className="block text-3xl font-black text-slate-900 leading-none mb-1">
                                        {filteredProjects.length}
                                    </span>
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-teal-600">
                                        {selectedTech.length > 0 ? `${selectedTech[0]} Projects` :
                                            selectedCategory.length > 0 ? `${selectedCategory[0]}` :
                                                searchTerm ? 'Matching Results' : 'Total Projects'}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
                                    <h3 className="flex items-center gap-2 text-sm font-extrabold text-slate-900 uppercase tracking-wider">
                                        <Filter size={16} className="text-teal-500" /> Smart Filters
                                    </h3>
                                    {(selectedYear.length > 0 || selectedCategory.length > 0 || selectedTech.length > 0) && (
                                        <button
                                            onClick={() => { setSelectedYear([]); setSelectedCategory([]); setSelectedTech([]) }}
                                            className="text-[10px] font-bold text-red-400 hover:text-red-500 uppercase tracking-wider"
                                        >
                                            Reset
                                        </button>
                                    )}
                                </div>

                                <div className="space-y-8">
                                    <FilterGroup label="Academic Year">
                                        {['2025-2026', '2024-2025', '2023-2024'].map(year => (
                                            <Checkbox
                                                key={year}
                                                label={year}
                                                checked={selectedYear.includes(year)}
                                                onChange={() => toggleFilter(selectedYear, setSelectedYear, year)}
                                            />
                                        ))}
                                    </FilterGroup>

                                    <FilterGroup label="Category">
                                        {['Final Year Project', 'Research Paper', 'Micro-Project'].map(cat => (
                                            <Checkbox
                                                key={cat}
                                                label={cat}
                                                checked={selectedCategory.includes(cat)}
                                                onChange={() => toggleFilter(selectedCategory, setSelectedCategory, cat)}
                                            />
                                        ))}
                                    </FilterGroup>

                                    <FilterGroup label="Tech Stack">
                                        {['Python', 'React', 'Blockchain', 'IoT', 'Machine Learning'].map(tech => (
                                            <Checkbox
                                                key={tech}
                                                label={tech}
                                                checked={selectedTech.includes(tech)}
                                                onChange={() => toggleFilter(selectedTech, setSelectedTech, tech)}
                                            />
                                        ))}
                                    </FilterGroup>
                                </div>
                            </div>
                        </div>
                    </aside>

                    {/* Results Area */}
                    <div className="flex-1 flex flex-col min-h-[60vh]">
                        {/* Search Input */}
                        <div className="mb-10 relative z-10">
                            <div className="relative group max-w-2xl">
                                <div className="absolute -inset-1 rounded-full bg-teal-400/20 opacity-0 group-focus-within:opacity-100 blur-xl transition-opacity duration-500"></div>
                                <div className="relative bg-white rounded-full shadow-[0_0_20px_-5px_rgba(0,0,0,0.05)] border border-slate-100 flex items-center overflow-hidden transition-shadow group-focus-within:shadow-[0_0_20px_-5px_rgba(45,212,191,0.2)]">
                                    <SearchIcon className={`ml-5 transition-colors duration-300 ${searchTerm ? 'text-teal-500' : 'text-slate-400'}`} size={22} />
                                    <input suppressHydrationWarning
                                        type="text"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        onFocus={() => setIsFocused(true)}
                                        onBlur={() => setIsFocused(false)}
                                        placeholder="Type to activate Neural Search..."
                                        className="w-full py-4 px-4 bg-transparent text-slate-800 font-medium placeholder-slate-400 focus:outline-none"
                                    />
                                    {/* Circuit Beam Emitter */}
                                    {searchTerm && (
                                        <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-teal-400 to-transparent animate-pulse shadow-[0_0_10px_rgba(45,212,191,0.8)]"></div>
                                    )}

                                    {/* Search Circuit Traces (Left & Right) */}
                                    <div className={`absolute top-1/2 right-full h-[2px] bg-gradient-to-l from-teal-500/50 to-transparent transition-all duration-700 ease-out ${isFocused ? 'w-[100vw] opacity-100' : 'w-0 opacity-0'}`} style={{ transform: 'translateY(-50%)' }}>
                                        {/* Traveling Data Packet (Left) */}
                                        {(loading || searchTerm) && <div className="absolute top-0 right-0 h-full w-20 bg-gradient-to-l from-teal-200 to-transparent animate-[shimmer_2s_infinite] shadow-[0_0_15px_rgba(45,212,191,0.8)]"></div>}
                                    </div>
                                    <div className={`absolute top-1/2 left-full h-[2px] bg-gradient-to-r from-teal-500/50 to-transparent transition-all duration-700 ease-out ${isFocused ? 'w-[100vw] opacity-100' : 'w-0 opacity-0'}`} style={{ transform: 'translateY(-50%)' }}>
                                        {/* Traveling Data Packet (Right) */}
                                        {(loading || searchTerm) && <div className="absolute top-0 left-0 h-full w-20 bg-gradient-to-r from-teal-200 to-transparent animate-[shimmer_2s_infinite] shadow-[0_0_15px_rgba(45,212,191,0.8)]"></div>}
                                    </div>
                                    {searchTerm && (
                                        <button onClick={() => setSearchTerm('')} className="mr-5 text-slate-400 hover:text-red-400 transition-colors text-sm font-bold px-3 py-1 bg-slate-50 rounded-full">
                                            Clear
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Visual Controls Header (View Toggle) */}
                        <div className="flex items-center justify-between mt-4">
                            <div className="flex items-center gap-2 text-sm text-slate-500">
                                <span className="font-bold text-slate-900">{filteredProjects.length}</span> Results Found
                                {initialTech && (
                                    <span className="ml-4 px-3 py-1 bg-teal-100 text-teal-700 text-xs font-bold rounded-full uppercase tracking-wider flex items-center gap-1">
                                        Filtering by: {initialTech}
                                    </span>
                                )}
                            </div>

                            <div className="flex items-center bg-white/50 backdrop-blur rounded-xl p-1 shadow-sm border border-slate-200">
                                <button
                                    onClick={() => setViewMode('grid')}
                                    className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white shadow text-teal-600' : 'text-slate-400 hover:text-slate-600'}`}
                                    title="Grid View"
                                >
                                    <LayoutGrid size={18} />
                                </button>
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white shadow text-teal-600' : 'text-slate-400 hover:text-slate-600'}`}
                                    title="List View"
                                >
                                    <List size={18} />
                                </button>
                                <button
                                    onClick={() => setViewMode('graph')}
                                    className={`p-2 rounded-lg transition-all ${viewMode === 'graph' ? 'bg-white shadow text-teal-600' : 'text-slate-400 hover:text-slate-600'}`}
                                    title="Graph View"
                                >
                                    <Share2 size={18} />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Content Area based on View Mode */}
                    {viewMode === 'list' ? (
                        <ProjectListView projects={filteredProjects} />
                    ) : viewMode === 'graph' ? (
                        <ProjectGraphView projects={filteredProjects} />
                    ) : (
                        /* Bento Grid with Project3DCard */
                        <motion.div
                            variants={containerVariants}
                            initial="hidden"
                            animate="show"
                            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 auto-rows-[350px] pb-20"
                        >
                            <AnimatePresence mode="popLayout" initial={false}>
                                {loading ? (
                                    <div className="col-span-full flex justify-center py-20">
                                        <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
                                    </div>
                                ) : filteredProjects.length === 0 && !loading ? (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        className="col-span-full flex flex-col items-center justify-center py-24 bg-white/40 backdrop-blur-xl rounded-[3rem] border border-white/40 text-center px-4"
                                    >
                                        <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-6">
                                            <FolderX size={48} className="text-slate-400" />
                                        </div>
                                        <h3 className="text-2xl font-bold text-slate-900 mb-2">No projects found</h3>
                                        <p className="text-slate-500 mb-8 max-w-md">We couldn't find any projects matching your current filters. Try adjusting your search criteria.</p>
                                        <button
                                            onClick={() => { setSearchTerm(''); setSelectedYear([]); setSelectedCategory([]); setSelectedTech([]) }}
                                            className="mt-6 px-8 py-3 bg-teal-500 text-white font-bold rounded-full shadow-lg shadow-teal-200 hover:bg-teal-600 hover:shadow-xl transition-all"
                                        >
                                            Clear All Filters
                                        </button>
                                    </motion.div>
                                ) : (
                                    filteredProjects.map((project, i) => (
                                        <motion.div
                                            key={project.id}
                                            className="col-span-1 h-full"
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.3, delay: i * 0.05 }}
                                            layout
                                        >
                                            <Project3DCard
                                                project={project}
                                                spanClass="h-full"
                                                index={i}
                                                noAnimation={true}
                                                isPriority={searchTerm.length > 2 && (
                                                    (project.title?.toLowerCase().includes(searchTerm.toLowerCase())) ||
                                                    (Array.isArray(project.tech_stack) && project.tech_stack.some((t: string) => t.toLowerCase().includes(searchTerm.toLowerCase()))) ||
                                                    (typeof project.tech_stack === 'string' && project.tech_stack.toLowerCase().includes(searchTerm.toLowerCase()))
                                                )}
                                            />
                                        </motion.div>
                                    ))
                                )}
                            </AnimatePresence>
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function SearchPage() {
    return (
        <Suspense fallback={<div className="min-h-screen grid place-items-center"><div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div></div>}>
            <SearchContent />
        </Suspense>
    );
}

const FilterGroup = ({ label, children }: { label: string, children: React.ReactNode }) => (
    <div className="mb-6 last:mb-0">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 pl-1">{label}</h4>
        <div className="space-y-3">
            {children}
        </div>
    </div>
);

const Checkbox = ({ label, checked, onChange }: { label: string, checked: boolean, onChange: () => void }) => (
    <label className="flex items-center gap-3 cursor-pointer group select-none">
        <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-200 ${checked ? 'bg-teal-500 border-teal-500 shadow-sm shadow-teal-200' : 'bg-white border-slate-200 group-hover:border-teal-300'}`}>
            {checked && <Check size={12} className="text-white stroke-[4]" />}
        </div>
        <span className={`text-sm transition-colors ${checked ? 'text-slate-900 font-bold' : 'text-slate-600 font-medium group-hover:text-teal-600'}`}>
            {label}
        </span>
        <input type="checkbox" className="hidden" checked={checked} onChange={onChange} />
    </label>
);
