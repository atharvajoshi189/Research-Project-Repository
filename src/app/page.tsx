"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { Search, BookOpen, Clock, Tag, FileText, ArrowRight, Mic, LayoutGrid, Users, Trophy, Activity, Zap, Shield, Database, Globe, Github, Sparkles, BrainCircuit, Cpu } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAITheme } from '@/context/AIThemeContext';
import LightTechBackground from '@/components/LightTechBackground';

export default function Home() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const [projects, setProjects] = useState<any[]>([]);

  // Use Global AI Context
  const { isAIActive, toggleAIMode } = useAITheme();
  const [isThinking, setIsThinking] = useState(false); // New state for "Thinking" animation

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    const { data } = await supabase
      .from('projects')
      .select('*')
      .eq('status', 'approved')
      .order('created_at', { ascending: false });

    if (data) setProjects(data);
  };

  // Filter projects as user types
  useEffect(() => {
    if (query.trim()) {
      const matches = projects.filter(p =>
        p.title.toLowerCase().includes(query.toLowerCase()) ||
        p.techStack?.some((t: string) => t.toLowerCase().includes(query.toLowerCase()))
      ).slice(0, 5);
      setSuggestions(matches);
      setShowDropdown(true);
    } else {
      setSuggestions([]);
      setShowDropdown(false);
    }
    setSelectedIndex(-1);
  }, [query, projects]);

  // Handle outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    if (isAIActive) {
      // AI Mode "Thinking" Effect
      if (!query.trim()) return;

      setIsThinking(true);

      // Simulate processing delay for effect (optional, or just go directly)
      setTimeout(() => {
        router.push(`/ai-mode?query=${encodeURIComponent(query)}`);
      }, 1500);

    } else {
      // Standard Search Logic
      if (selectedIndex >= 0 && suggestions[selectedIndex]) {
        router.push(`/project/${suggestions[selectedIndex].id}`);
      } else if (query.trim()) {
        router.push(`/search?q=${encodeURIComponent(query)}`);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > -1 ? prev - 1 : prev));
    }
  };

  // State for Real-Time Stats
  const [stats, setStats] = useState({ projects: 0, papers: 0, users: 0, domains: 12 });
  const [pulseActivity, setPulseActivity] = useState<any[]>([]);

  useEffect(() => {
    const fetchRealTimeData = async () => {
      // 1. Fetch Counts
      const { count: projectCount } = await supabase.from('projects').select('*', { count: 'exact', head: true }).eq('status', 'approved');
      const { count: userCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });

      // For "Papers", we'll just assume a ratio or specific category if exists, else just use a subset logic or placeholder + live count
      // Let's use 'Research Paper' category count if possible, otherwise 30% of projects
      // For now, let's keep it simple: Real Projects Count. Papers can be a specific category count.
      const { count: paperCount } = await supabase.from('projects').select('*', { count: 'exact', head: true }).eq('category', 'Research Paper').eq('status', 'approved');

      setStats({
        projects: projectCount || 0,
        papers: paperCount || Math.floor((projectCount || 0) * 0.4), // Fallback logic
        users: userCount || 0,
        domains: 15 // Static for now or fetch categories
      });

      // 2. Fetch Live Activity Pulse (Latest 5 Approved)
      const { data: recent } = await supabase
        .from('projects')
        .select('id, title, category, created_at, authors')
        .eq('status', 'approved')
        .order('created_at', { ascending: false })
        .limit(5);

      if (recent) setPulseActivity(recent);
    };

    fetchRealTimeData();

    // Optional: Real-time subscription for Pulse
    const channel = supabase
      .channel('public:projects')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'projects' }, (payload) => {
        // New project added, refetch or prepend
        fetchRealTimeData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className={`relative w-full transition-colors duration-1000 ${isThinking ? 'overflow-hidden h-screen' : ''}`}>

      {/* 1. Standard Background Blob (Only visible in normal mode, handled by Layout for AI mode) */}
      {!isAIActive && <LightTechBackground />}

      {/* Dim Overlay when Thinking */}
      <AnimatePresence>
        {isThinking && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-[60] bg-[#05010d]/80 backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      {/* Immersive Hero & Search */}
      <section className={`flex flex-col items-center justify-center text-center space-y-16 pt-32 pb-20 px-4 w-full max-w-7xl mx-auto transition-all duration-800 ${isThinking ? 'z-[70] relative scale-105' : ''}`}>
        {!isAIActive && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className={`space-y-8 ${isThinking ? 'opacity-20 blur-sm' : ''}`}
          >
            <span className={`inline-block px-5 py-2 rounded-full border text-xs tracking-widest uppercase shadow-sm backdrop-blur-md transition-colors duration-800 ${isAIActive ? 'bg-white/10 border-white/20 text-cyan-300' : 'bg-white/80 border-teal-100 text-teal-600'}`}>
              Computer Science & Engineering
            </span>
            <h1 className={`text-7xl md:text-8xl font-black tracking-tight leading-[1.1] transition-colors duration-800 ${isAIActive ? 'text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]' : 'text-slate-900'}`}>
              Design Your
              <span className={`block pb-2 ${isAIActive ? 'text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-fuchsia-400 animate-pulse' : 'text-transparent bg-clip-text bg-gradient-to-r from-teal-500 via-emerald-500 to-teal-400'}`}>
                Intellectual Legacy
              </span>
            </h1>
            <p className={`text-xl max-w-2xl mx-auto leading-relaxed font-medium transition-colors duration-800 ${isAIActive ? 'text-slate-300' : 'text-slate-500'}`}>
              Search across thousands of research papers and innovative projects in seconds.
            </p>
          </motion.div>
        )}

        {/* 3. The "Aura" Search Bar */}
        <motion.div
          ref={containerRef}
          className="w-full max-w-3xl relative z-20"
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <form onSubmit={handleSearch} className="relative group">

            {/* Dynamic Glow Effect for AI Mode */}
            <div className={`absolute -inset-1 rounded-full opacity-0 blur-xl transition-all duration-1000 ${isAIActive ? 'bg-gradient-to-r from-cyan-500 via-purple-600 to-pink-500 opacity-60 group-hover:opacity-80 group-focus-within:opacity-100 animate-pulse' : 'bg-teal-400/20 group-focus-within:opacity-100'}`}></div>

            <motion.div
              className={`relative rounded-full shadow-[0_10px_40px_-10px_rgba(0,0,0,0.08)] transition-all duration-300
                  ${isAIActive
                  ? `bg-[rgba(30,30,30,0.6)] backdrop-blur-xl border-[1.5px] border-white/10 ${isThinking ? 'scale-110 border-cyan-400/50' : ''}`
                  : 'bg-white/60 backdrop-blur-[12px] border-[1px] border-transparent hover:border-slate-300'}
              `}
              style={!isAIActive ? {
                background: 'linear-gradient(rgba(255, 255, 255, 0.6), rgba(255, 255, 255, 0.6)) padding-box, linear-gradient(to right, #3b82f6, #a855f7) border-box',
                border: '1px solid transparent',
              } : {}}
              whileHover={{ y: isThinking ? 0 : -1, borderColor: isAIActive ? "rgba(255,255,255,0.2)" : "transparent" }}
              whileTap={{ scale: 0.99 }}
              animate={showDropdown && !isAIActive ? { borderBottomLeftRadius: '2rem', borderBottomRightRadius: '2rem' } : {}}
            >
              <div className={`w-full h-full backdrop-blur-sm rounded-full flex items-center pr-3 pl-8 overflow-hidden py-2 ${isAIActive ? 'bg-transparent' : 'bg-white/80'}`}>
                <div className={`pr-5 pointer-events-none transition-colors duration-500 ${isAIActive ? 'text-slate-400' : 'text-slate-400'}`}>
                  {isAIActive ? <Sparkles className="w-5 h-5 text-fuchsia-400" /> : <Search className="w-6 h-6" />}
                </div>
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onFocus={() => { if (query && !isAIActive) setShowDropdown(true) }}
                  autoComplete="off"
                  readOnly={isThinking}
                  className={`w-full bg-transparent text-xl font-medium focus:outline-none py-4 transition-colors duration-500 
                      ${isAIActive
                      ? 'text-slate-200 placeholder-slate-500 selection:bg-cyan-500/30'
                      : 'text-slate-800 placeholder-slate-400'
                    }`}
                  placeholder={isAIActive ? "Ask Grok anything..." : "Search projects, authors, or technologies..."}
                />

                {/* Thinking Animation Overlay inside Input */}
                {isThinking && (
                  <div className="absolute inset-0 left-16 right-16 flex items-center bg-[#1e1e1e]">
                    <span className="text-cyan-300 text-lg font-mono animate-pulse flex items-center gap-2">
                      Processing...
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-3">

                  {/* AI Toggle Button (Always Visible or Integrated) */}
                  {!isThinking && (
                    <div className="flex items-center gap-2 mr-2">
                      <button
                        type="button"
                        onClick={toggleAIMode}
                        className={`w-8 h-8 rounded-full transition-all duration-300 flex items-center justify-center
                            ${isAIActive ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}
                        `}
                        title={isAIActive ? "Exit AI Mode" : "Enter AI Mode"}
                      >
                        <Sparkles size={14} />
                      </button>
                    </div>
                  )}

                  <button type="submit" disabled={isThinking} className={`
                    rounded-full transition-all transform active:scale-95 flex items-center justify-center
                    ${isAIActive
                      ? 'w-10 h-10 bg-white/10 hover:bg-white/20 text-white'
                      : 'px-8 py-4 font-bold bg-slate-900 text-white hover:bg-teal-600 hover:shadow-lg hover:shadow-teal-200'}
                    ${isThinking ? 'opacity-0 scale-0 w-0 px-0 overflow-hidden' : 'opacity-100 scale-100'}
                  `}>
                    {isAIActive ? (
                      <ArrowRight size={18} />
                    ) : (
                      "Search"
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </form>

          {/* Suggestions (Standard Mode Only) */}
          <AnimatePresence>
            {showDropdown && query.trim() && !isAIActive && (
              <motion.div
                initial={{ opacity: 0, y: -20, scale: 0.98 }}
                animate={{ opacity: 1, y: 12, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.98 }}
                transition={{ duration: 0.2 }}
                className="absolute top-full left-0 right-0 bg-white border border-slate-100 rounded-3xl shadow-2xl overflow-hidden py-3"
              >
                <ul>
                  {suggestions.length > 0 ? (
                    suggestions.map((project, index) => (
                      <li key={project.id}>
                        <button
                          onClick={() => router.push(`/project/${project.id}`)}
                          className={`w-full text-left px-6 py-4 flex items-center gap-4 transition-all group
                                                        ${index === selectedIndex ? 'bg-teal-50 border-l-4 border-teal-500' : 'hover:bg-teal-50 hover:border-l-4 hover:border-teal-500 border-l-4 border-transparent'}
                                                    `}
                        >
                          <div className="p-2 bg-teal-100/50 rounded-lg text-teal-500 group-hover:text-teal-600 transition-colors">
                            <FileText size={20} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className={`text-base font-bold truncate group-hover:text-teal-700 transition-colors ${index === selectedIndex ? 'text-teal-700' : 'text-slate-800'}`}>
                              {project.title}
                            </h4>
                            <div className="flex items-center gap-2 text-xs text-slate-500 mt-1 font-medium">
                              {project.techStack && project.techStack[0] && (
                                <span className="px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-600">
                                  {project.techStack[0]}
                                </span>
                              )}
                              <span>• {project.category}</span>
                            </div>
                          </div>
                          <ArrowRight size={16} className="opacity-0 group-hover:opacity-100 text-teal-500 -translate-x-2 group-hover:translate-x-0 transition-all" />
                        </button>
                      </li>
                    ))
                  ) : (
                    <li className="px-8 py-8 text-center text-slate-500 text-base">
                      No projects found for "{query}"
                    </li>
                  )}
                </ul>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* 4. "Aura" Trending Technology Cloud */}
        {!isAIActive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className={`flex flex-wrap justify-center gap-3 pt-8 max-w-2xl mx-auto transition-opacity duration-500 ${isThinking ? 'opacity-0' : 'opacity-100'}`}
          >
            <span className={`text-sm font-semibold mr-2 py-1.5 ${isAIActive ? 'text-slate-400' : 'text-slate-400'}`}>Trending: </span>
            {['#TensorFlow', '#NextJS', '#IoT', '#CyberSecurity', '#Blockchain'].map((tag, i) => (
              <Link key={i} href={`/search?q=${encodeURIComponent(tag.replace('#', ''))}`}>
                <span className={`px-4 py-1.5 rounded-full border text-sm transition-all cursor-pointer shadow-sm
                    ${isAIActive
                    ? 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:border-cyan-400 hover:text-cyan-400'
                    : 'bg-white/50 border-slate-200 text-slate-600 hover:bg-white hover:border-teal-400 hover:text-teal-600'}
                `}>
                  {tag}
                </span>
              </Link>
            ))}
          </motion.div>
        )}
      </section>

      {/* Featured Projects Grid */}
      {!isAIActive && (
        <section className={`px-4 pb-20 w-full max-w-[90rem] mx-auto transition-opacity duration-500 ${isThinking ? 'opacity-20 blur-sm' : ''}`}>
          <div className="flex items-center justify-between mb-8 px-4">
            <h2 className={`text-2xl font-bold flex items-center gap-2 ${isAIActive ? 'text-white' : 'text-slate-900'}`}>
              <LayoutGrid className={isAIActive ? 'text-cyan-400' : 'text-teal-500'} /> Featured Projects
            </h2>
            <Link href="/search" className={`font-semibold hover:underline flex items-center gap-1 ${isAIActive ? 'text-cyan-400' : 'text-teal-600'}`}>
              View All <ArrowRight size={16} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {projects.slice(0, 8).map((project, i) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Link href={`/project/${project.id}`}>
                  <div className={`group h-full backdrop-blur-md border rounded-3xl p-6 transition-all hover:-translate-y-2 cursor-pointer flex flex-col
                      ${isAIActive
                      ? 'ai-card'
                      : 'bg-white/60 border-white/50 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)]'}
                  `}>
                    <div className="flex justify-between items-start mb-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider
                           ${project.status === 'Completed'
                          ? (isAIActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-700')
                          : (isAIActive ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-700')}
                      `}>
                        {project.status}
                      </span>
                      <div className="flex gap-2">
                        {/* Github Icon Logic */}
                        <div className={`p-2 rounded-full transition-colors shadow-sm ${isAIActive ? 'bg-white/10 text-slate-400 group-hover:text-cyan-400' : 'bg-white text-slate-400 group-hover:text-teal-500'}`}>
                          <ArrowRight size={16} className="-rotate-45 group-hover:rotate-0 transition-transform" />
                        </div>
                      </div>
                    </div>

                    <h3 className={`text-xl font-bold mb-3 leading-snug transition-colors ${isAIActive ? 'text-sharp-white group-hover:text-cyan-400' : 'text-slate-900 group-hover:text-teal-600'}`}>
                      {project.title}
                    </h3>

                    <p className={`text-sm line-clamp-3 mb-6 flex-1 leading-relaxed ${isAIActive ? 'text-slate-400' : 'text-slate-500'}`}>
                      {project.abstract}
                    </p>

                    <div className={`flex items-center justify-between mt-auto border-t pt-4 ${isAIActive ? 'border-white/10' : 'border-slate-100'}`}>
                      <div className={`flex items-center gap-2 text-xs font-semibold ${isAIActive ? 'text-slate-400' : 'text-slate-600'}`}>
                        <Users size={14} className={isAIActive ? 'text-slate-500' : 'text-slate-400'} />
                        {Array.isArray(project.authors) ? project.authors.length : 1} Authors
                      </div>
                      <span className={`text-xs font-bold px-2 py-1 rounded-md ${isAIActive ? 'text-cyan-400 bg-cyan-950/30' : 'text-teal-500 bg-teal-50'}`}>
                        {project.academic_year || project.year}
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* 1. Impact Stats Bar (Connected to Real-Time Stats) */}
      {!isAIActive && (
        <section className={`w-full border-y backdrop-blur-md py-16 mb-24 transition-colors duration-800 ${isAIActive ? 'bg-[#0f0c29]/50 border-white/10' : 'bg-white/40 border-white/50'}`}>
          <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <StatCounter count={stats.projects} label="Total Projects" icon={Database} color={isAIActive ? "text-cyan-500" : "text-teal-500"} isAI={isAIActive} />
            <StatCounter count={stats.papers} label="Research Papers" icon={BookOpen} color="text-blue-500" isAI={isAIActive} />
            <StatCounter count={stats.domains} label="Active Domains" icon={Globe} color="text-indigo-500" isAI={isAIActive} />
            <StatCounter count={stats.users} label="Student Contributors" icon={Users} color="text-purple-500" isAI={isAIActive} />
          </div>
        </section>
      )}

      {/* 2. & 5. Discovery & Pulse Section */}
      {!isAIActive && (
        <section className="max-w-7xl mx-auto px-6 mb-32 grid grid-cols-1 lg:grid-cols-3 gap-12">

          {/* Left: Domain Discovery */}
          <div className="lg:col-span-2">
            <div className="mb-8">
              <h2 className={`text-3xl font-bold mb-2 ${isAIActive ? 'text-sharp-white' : 'text-slate-900'}`}>Explore Domains</h2>
              <p className={isAIActive ? 'text-sharp-gray' : 'text-slate-500'}>Curated collections of student excellence.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <DomainCard title="AI & Machine Learning" count="120 Projects" icon={Zap} color="bg-purple-50 text-purple-600" isAI={isAIActive} />
              <DomainCard title="Blockchain Technology" count="45 Projects" icon={Database} color="bg-blue-50 text-blue-600" isAI={isAIActive} />
              <DomainCard title="Cyber Security" count="32 Projects" icon={Shield} color="bg-teal-50 text-teal-600" isAI={isAIActive} />
              <DomainCard title="Web & App Dev" count="88 Projects" icon={LayoutGrid} color="bg-indigo-50 text-indigo-600" isAI={isAIActive} />
            </div>
          </div>

          {/* Right: Recent Activity Pulse (Connected to Supabase) */}
          <div className={`backdrop-blur-md border rounded-3xl p-8 ${isAIActive ? 'ai-card' : 'bg-white/60 border-slate-100'}`}>
            <h3 className={`flex items-center gap-2 font-bold mb-6 ${isAIActive ? 'text-sharp-white' : 'text-slate-900'}`}>
              <Activity className={isAIActive ? "text-cyan-400" : "text-emerald-500"} /> Live Activity Pulse
            </h3>
            <div className="space-y-6 relative">
              {/* Timeline Line */}
              <div className={`absolute left-3 top-2 bottom-2 w-0.5 ${isAIActive ? 'bg-white/10' : 'bg-slate-200'}`}></div>

              {pulseActivity.length > 0 ? pulseActivity.map((item, i) => (
                <div key={i} className="flex gap-4 relative animate-in slide-in-from-right duration-500" style={{ animationDelay: `${i * 100}ms` }}>
                  <div className={`w-6 h-6 rounded-full border-2 z-10 flex-shrink-0 mt-1 ${isAIActive ? 'bg-slate-900 border-cyan-500' : 'bg-white border-emerald-400'}`}></div>
                  <div>
                    <p className={`text-sm font-medium leading-snug ${isAIActive ? 'text-sharp-white' : 'text-slate-900'}`}>
                      New <b>{item.category || 'Project'}</b> uploaded: <span className={isAIActive ? "text-cyan-400" : "text-teal-600"}>'{item.title}'</span>
                    </p>
                    <p className={`text-xs mt-1 ${isAIActive ? 'text-sharp-gray' : 'text-slate-500'}`}>
                      by {Array.isArray(item.authors) ? item.authors[0] : (item.authors?.split(',')[0] || 'Unknown')} • {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              )) : (
                <div className="text-sm text-slate-500 py-4 pl-4">Loading real-time updates...</div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* 3. Hall of Fame (Gamified) */}
      {!isAIActive && (
        <section className="w-full bg-gradient-to-b from-transparent to-teal-50/50 py-24">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <div className="mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-yellow-100 border border-yellow-200 text-yellow-700 text-xs font-bold uppercase tracking-widest mb-4">
                <Trophy size={14} /> Top Contributors
              </div>
              <h2 className={`text-4xl font-extrabold mb-4 ${isAIActive ? 'text-sharp-white' : 'text-slate-900'}`}>Repository Hall of Fame</h2>
              <p className={isAIActive ? 'text-sharp-gray' : 'text-slate-500'}>Recognizing the most active researchers and guides.</p>
            </div>

            <div className="flex flex-wrap justify-center gap-8 md:gap-16 items-end">
              <ContributorCard rank={2} name="Priya Sharma" count={12} role="Student" color="border-slate-300" bg="bg-slate-100" isAI={isAIActive} />
              <ContributorCard rank={1} name="Dr. R. K. Patil" count={28} role="Faculty Guide" color="border-yellow-400" bg="bg-yellow-50" isWinner isAI={isAIActive} />
              <ContributorCard rank={3} name="Amit Verma" count={9} role="Student" color="border-orange-300" bg="bg-orange-50" isAI={isAIActive} />
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

function StatCounter({ count, label, icon: Icon, color, isAI }: any) {
  return (
    <div className="flex flex-col items-center group">
      <div className={`mb-3 p-3 rounded-2xl border transition-transform group-hover:scale-110 
        ${isAI
          ? 'bg-transparent border-white/20 text-cyan-400'
          : `bg-white border-slate-100 shadow-sm ${color}`
        }`}>
        <Icon size={32} />
      </div>
      <span className={`text-4xl md:text-5xl font-black mb-2 ${isAI ? 'text-sharp-white' : 'text-slate-900'}`}>{count}</span>
      <span className={`font-medium text-sm uppercase tracking-wider ${isAI ? 'text-sharp-gray' : 'text-slate-500'}`}>{label}</span>
    </div>
  );
}

function DomainCard({ title, count, icon: Icon, color, isAI }: any) {
  return (
    <div className={`border p-6 rounded-2xl transition-all cursor-pointer group hover:-translate-y-1 flex items-center gap-4
        ${isAI ? 'ai-card' : 'bg-white border-slate-100 hover:shadow-[0_10px_30px_-10px_rgba(0,0,0,0.08)]'}
    `}>
      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 ${isAI ? 'bg-white/5 text-cyan-400' : color}`}>
        <Icon size={32} />
      </div>
      <div>
        <h3 className={`text-lg font-bold mb-1 transition-colors ${isAI ? 'text-sharp-white group-hover:text-cyan-400' : 'text-slate-900 group-hover:text-teal-600'}`}>{title}</h3>
        <p className={`text-sm font-medium ${isAI ? 'text-sharp-gray' : 'text-slate-500'}`}>{count}</p>
      </div>
    </div>
  );
}

function ContributorCard({ rank, name, count, role, color, bg, isWinner, isAI }: any) {
  return (
    <div className={`flex flex-col items-center ${isWinner ? '-mt-12 scale-110' : ''}`}>
      <div className={`w-24 h-24 rounded-full border-4 ${color} ${bg} flex items-center justify-center mb-4 shadow-xl relative`}>
        <span className="text-2xl font-bold text-slate-700">{name[0]}</span>
        <div className="absolute -bottom-3 px-3 py-1 bg-slate-900 text-white text-xs font-bold rounded-full border-2 border-white">
          #{rank}
        </div>
      </div>
      <h4 className={`text-lg font-bold ${isAI ? 'text-sharp-white' : 'text-slate-900'}`}>{name}</h4>
      <p className={`text-xs ${isAI ? 'text-sharp-gray' : 'text-slate-500'} mb-2`}>{role}</p>
      <span className="px-3 py-1 rounded-full bg-teal-50 text-teal-700 text-xs font-bold">
        {count} Uploads
      </span>
    </div>
  );
}