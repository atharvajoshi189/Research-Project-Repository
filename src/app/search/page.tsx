"use client";

import { useState, Suspense, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { Filter, Search as SearchIcon, ArrowRight, Check, SlidersHorizontal, FolderX, Github } from 'lucide-react';
import NextLink from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import { motion, AnimatePresence, Variants } from 'framer-motion';

function SearchContent() {
    const searchParams = useSearchParams();
    const initialQuery = searchParams.get('q') || '';
    const initialCategory = searchParams.get('category') || '';

    const [allProjects, setAllProjects] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState(initialQuery);
    const [selectedYear, setSelectedYear] = useState<string[]>([]);
    const [selectedTech, setSelectedTech] = useState<string[]>([]); // Tech stack filter
    const [selectedCategory, setSelectedCategory] = useState<string[]>(initialCategory ? [initialCategory] : []);
    const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
    const [loading, setLoading] = useState(true);

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
                } else {
                    // Default fetch
                    const { data: allData, error } = await supabase.from('projects').select('*').eq('status', 'approved');
                    if (error) throw error;
                    data = allData || [];
                }

                setAllProjects(data);
            } catch (err) {
                console.error("Search error:", err);
            } finally {
                setLoading(false);
            }
        };

        // Debounce search to avoid too many RPC calls
        const debounce = setTimeout(() => {
            fetchProjects();
        }, 300);

        return () => clearTimeout(debounce);
    }, [searchTerm]);

    // Sync state with URL params on mount/update
    useEffect(() => {
        if (initialQuery) setSearchTerm(initialQuery);
        if (initialCategory && !selectedCategory.includes(initialCategory)) setSelectedCategory([initialCategory]);
    }, [initialQuery, initialCategory]);

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
            const matchesSearch = true;

            // Note: Use existing tech/year/category filters on the result set.

            // Year Logic (OR) - checking both year and academic_year
            const matchesYear = selectedYear.length === 0 || selectedYear.includes(project.year) || selectedYear.includes(project.academic_year);

            // Category Logic (OR)
            const matchesCategory = selectedCategory.length === 0 || selectedCategory.includes(project.category);

            // Tech Stack Logic (OR) - Checks if project has ANY of the selected techs
            const matchesTech = selectedTech.length === 0 || (project.techStack && project.techStack.some((tech: string) => selectedTech.includes(tech)));

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

    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.05
            }
        }
    };

    const itemVariants: Variants = {
        hidden: { opacity: 0, y: 30, scale: 0.95 },
        show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 350, damping: 25 } },
        exit: { opacity: 0, scale: 0.9, transition: { duration: 0.2 } }
    };

    return (
        <div className="relative min-h-screen w-full overflow-hidden pb-20">
            {/* Aura Mesh Background */}
            <div className="fixed inset-0 top-0 left-0 w-full h-full -z-50 overflow-hidden pointer-events-none bg-white">
                <div className="absolute -top-[10%] -left-[10%] w-[60vw] h-[60vh] bg-[#E0FBFC] rounded-full blur-[100px] opacity-60 animate-blob mix-blend-multiply"></div>
                <div className="absolute top-[20%] -right-[10%] w-[60vw] h-[60vh] bg-[#E0E7FF] rounded-full blur-[120px] opacity-60 animate-blob animation-delay-2000 mix-blend-multiply"></div>
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

                            <div className="bg-white/60 backdrop-blur-md p-6 rounded-3xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
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
                                    <SearchIcon className="ml-5 text-slate-400 group-focus-within:text-teal-500 transition-colors" size={22} />
                                    <input suppressHydrationWarning
                                        type="text"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        placeholder="Refine search by name or tech..."
                                        className="w-full py-4 px-4 bg-transparent text-slate-800 font-medium placeholder-slate-400 focus:outline-none"
                                    />
                                    {searchTerm && (
                                        <button onClick={() => setSearchTerm('')} className="mr-5 text-slate-400 hover:text-red-400 transition-colors text-sm font-bold px-3 py-1 bg-slate-50 rounded-full">
                                            Clear
                                        </button>
                                    )}
                                </div>
                            </div>
                            <div className="mt-4 flex items-center gap-2 text-sm text-slate-500">
                                <span className="font-bold text-slate-900">{filteredProjects.length}</span> Results Found
                            </div>
                        </div>

                        {/* Glass Project Cards Grid */}
                        <motion.div
                            variants={containerVariants}
                            initial="hidden"
                            animate="show"
                            className="grid grid-cols-1 xl:grid-cols-2 gap-6 pb-20"
                        >
                            <AnimatePresence mode="popLayout" initial={false}>
                                {loading ? (
                                    <div className="col-span-full flex justify-center py-20">
                                        <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
                                    </div>
                                ) : filteredProjects.length === 0 ? (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        className="col-span-full flex flex-col items-center justify-center py-24 bg-white/60 backdrop-blur-md rounded-[3rem] border border-white/60 text-center px-4"
                                    >
                                        <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-6">
                                            <FolderX size={48} className="text-slate-400" />
                                        </div>
                                        <h3 className="text-2xl font-bold text-slate-900 mb-2">No projects found</h3>
                                        <p className="text-slate-500 mb-8 max-w-md">We couldn't find any projects matching your current filters. Try adjusting your search criteria.</p>
                                        <button
                                            onClick={() => { setSearchTerm(''); setSelectedYear([]); setSelectedCategory([]); setSelectedTech([]) }}
                                            className="px-8 py-3 bg-teal-500 text-white font-bold rounded-full shadow-lg shadow-teal-200 hover:bg-teal-600 hover:shadow-xl transition-all"
                                        >
                                            Clear All Filters
                                        </button>
                                    </motion.div>
                                ) : (
                                    filteredProjects.map((project) => (
                                        <motion.div
                                            key={project.id}
                                            variants={itemVariants}
                                            layout
                                            initial="hidden"
                                            animate="show"
                                            exit="exit"
                                        >
                                            <NextLink href={`/project/${project.id}`} className="block h-full">
                                                <motion.div
                                                    className="group h-full bg-white/60 backdrop-blur-md rounded-[2.5rem] border border-white/50 p-8 hover:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] transition-all relative overflow-hidden flex flex-col"
                                                    whileHover={{ y: -6 }}
                                                >
                                                    {/* Subtle hover gradient overlay */}
                                                    <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-indigo-50/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                                                    <div className="relative z-10 flex flex-col h-full">
                                                        <div className="flex justify-between items-start mb-5">
                                                            <div className="flex flex-wrap gap-2">
                                                                <span className={`px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider backdrop-blur-sm shadow-sm
                                                                    ${project.status === 'IEEE Published' ? 'bg-indigo-100/80 text-indigo-700 border border-indigo-200' :
                                                                        project.status === 'Completed' ? 'bg-emerald-100/80 text-emerald-700 border border-emerald-200' : 'bg-blue-100/80 text-blue-700 border border-blue-200'}`}>
                                                                    {project.status}
                                                                </span>
                                                                <span className="px-4 py-1.5 rounded-full bg-white/80 text-slate-600 text-[11px] font-bold border border-slate-200 shadow-sm">
                                                                    {project.category}
                                                                </span>
                                                            </div>
                                                            <div className="flex gap-2">
                                                                {project.github_url && (
                                                                    <button
                                                                        onClick={(e) => {
                                                                            e.preventDefault();
                                                                            window.open(project.github_url, '_blank');
                                                                        }}
                                                                        className="p-3 bg-white rounded-full text-slate-300 hover:text-slate-900 transition-all duration-300 z-10 relative shadow-sm"
                                                                        title="View Source Code"
                                                                    >
                                                                        <Github size={20} />
                                                                    </button>
                                                                )}
                                                                <div className="p-3 bg-white rounded-full text-slate-300 group-hover:text-teal-500 group-hover:shadow-md transition-all duration-300">
                                                                    <ArrowRight size={20} className="-rotate-45 group-hover:rotate-0 transition-transform duration-300" />
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <h3 className="text-2xl font-bold text-slate-900 mb-3 group-hover:text-teal-700 transition-colors leading-tight">
                                                            {project.title}
                                                        </h3>

                                                        <p className="text-slate-500 mb-6 line-clamp-3 leading-relaxed text-sm font-medium">
                                                            {project.abstract}
                                                        </p>

                                                        <div className="mt-auto pt-6 border-t border-slate-100/50 flex flex-wrap items-center justify-between gap-4">
                                                            <div className="flex flex-wrap gap-2">
                                                                {project.techStack && project.techStack.slice(0, 4).map((tech: string) => (
                                                                    <span key={tech} className="px-3 py-1 rounded-lg text-xs font-semibold bg-white border border-teal-100 text-slate-600 group-hover:border-teal-200 group-hover:text-teal-600 transition-colors">
                                                                        #{tech}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                            <div className="text-xs font-bold text-slate-400 bg-slate-50 px-3 py-1 rounded-full">
                                                                {project.academic_year || project.year}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            </NextLink>
                                        </motion.div>
                                    ))
                                )}
                            </AnimatePresence>
                        </motion.div>
                    </div>
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