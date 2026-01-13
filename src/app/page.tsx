"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { Search, BookOpen, Clock, Tag, FileText, ArrowRight, Mic, LayoutGrid, Users, Trophy, Activity, Zap, Shield, Database, Globe } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { projects, Project } from '@/lib/mockData';

export default function Home() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Project[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
                                           
  // Filter projects as user types
  useEffect(() => {
    if (query.trim()) {
      const matches = projects.filter(p =>
        p.title.toLowerCase().includes(query.toLowerCase()) ||
        p.techStack.some(t => t.toLowerCase().includes(query.toLowerCase()))
      ).slice(0, 5);
      setSuggestions(matches);
      setShowDropdown(true);
    } else {
      setSuggestions([]);
      setShowDropdown(false);
    }
    setSelectedIndex(-1);
  }, [query]);

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
    if (selectedIndex >= 0 && suggestions[selectedIndex]) {
      router.push(`/project/${suggestions[selectedIndex].id}`);
    } else if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query)}`);
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

  return (
    <div className="relative w-full">
      {/* 1. Full-Page Mesh Gradient Background */}
      <div className="fixed inset-0 top-0 left-0 w-full h-full -z-50 overflow-hidden pointer-events-none bg-white">
        {/* Top Left: Faint Teal #E0FBFC */}
        <div className="absolute -top-[10%] -left-[10%] w-[70vw] h-[70vh] bg-[#E0FBFC] rounded-full blur-[120px] opacity-80 animate-blob mix-blend-multiply"></div>
        {/* Top Right: Powder Blue #E0E7FF */}
        <div className="absolute top-[5%] -right-[10%] w-[70vw] h-[70vh] bg-[#E0E7FF] rounded-full blur-[140px] opacity-80 animate-blob animation-delay-2000 mix-blend-multiply"></div>
        {/* Bottom Accent */}
        <div className="absolute -bottom-[20%] left-[20%] w-[50vw] h-[50vh] bg-indigo-50/50 rounded-full blur-[100px] opacity-60"></div>
      </div>

      {/* Immersive Hero & Search */}
      <section className="flex flex-col items-center justify-center text-center space-y-16 pt-32 pb-20 px-4 w-full max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="space-y-8"
        >
          <span className="inline-block px-5 py-2 rounded-full bg-white/80 border border-indigo-100 text-indigo-600 font-semibold text-xs tracking-widest uppercase shadow-sm backdrop-blur-md">
            Computer Science & Engineering
          </span>
          <h1 className="text-7xl md:text-8xl font-black text-slate-900 tracking-tight leading-[1.1]">
            Design Your
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-teal-400 pb-2">
              Intellectual Legacy
            </span>
          </h1>
          <p className="text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed font-medium">
            Search across thousands of research papers and innovative projects in seconds.
          </p>
        </motion.div>

        {/* 3. The "Aura" Search Bar */}
        <motion.div
          ref={containerRef}
          className="w-full max-w-3xl relative z-20"
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <form onSubmit={handleSearch} className="relative group">

            {/* Soft Teal Aura Glow */}
            <div className="absolute -inset-4 rounded-full bg-teal-400/20 opacity-0 group-focus-within:opacity-100 blur-2xl transition-opacity duration-500"></div>

            <motion.div
              className="relative rounded-full bg-white shadow-[0_10px_40px_-10px_rgba(0,0,0,0.08)] border border-slate-100/50"
              whileHover={{ y: -2, boxShadow: "0 20px 40px -10px rgba(0,0,0,0.12)" }}
              whileTap={{ scale: 0.99 }}
              animate={showDropdown ? { borderBottomLeftRadius: '2rem', borderBottomRightRadius: '2rem' } : {}}
            >
              <div className="w-full h-full bg-white/80 backdrop-blur-sm rounded-full flex items-center pr-3 pl-8 overflow-hidden py-2">
                <div className="pr-5 pointer-events-none text-slate-400">
                  <Search className="w-6 h-6" />
                </div>
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onFocus={() => { if (query) setShowDropdown(true) }}
                  autoComplete="off"
                  className="w-full bg-transparent text-slate-800 text-xl font-medium placeholder-slate-400 focus:outline-none py-4"
                  placeholder="Search projects, authors, or technologies..."
                />
                <div className="flex items-center gap-3">
                  <button type="button" className="p-3 text-slate-400 hover:text-indigo-600 transition-colors bg-slate-50 rounded-full hover:bg-slate-100">
                    <Mic size={20} />
                  </button>
                  <button type="submit" className="bg-slate-900 text-white font-bold px-8 py-4 rounded-full hover:bg-indigo-600 hover:shadow-lg hover:shadow-indigo-200 transition-all transform active:scale-95 text-base">
                    Search
                  </button>
                </div>
              </div>
            </motion.div>
          </form>

          {/* Suggestions */}
          <AnimatePresence>
            {showDropdown && query.trim() && (
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
                                                        ${index === selectedIndex ? 'bg-indigo-50 border-l-4 border-indigo-500' : 'hover:bg-indigo-50 hover:border-l-4 hover:border-indigo-500 border-l-4 border-transparent'}
                                                    `}
                        >
                          <div className="p-2 bg-indigo-100/50 rounded-lg text-indigo-500 group-hover:text-indigo-600 transition-colors">
                            <FileText size={20} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className={`text-base font-bold truncate group-hover:text-indigo-700 transition-colors ${index === selectedIndex ? 'text-indigo-700' : 'text-slate-800'}`}>
                              {project.title}
                            </h4>
                            <div className="flex items-center gap-2 text-xs text-slate-500 mt-1 font-medium">
                              <span className="px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-600">
                                {project.techStack[0]}
                              </span>
                              <span>• {project.category}</span>
                            </div>
                          </div>
                          <ArrowRight size={16} className="opacity-0 group-hover:opacity-100 text-indigo-500 -translate-x-2 group-hover:translate-x-0 transition-all" />
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
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex flex-wrap justify-center gap-3 pt-8 max-w-2xl mx-auto"
        >
          <span className="text-sm font-semibold text-slate-400 mr-2 py-1.5">Trending: </span>
          {['#TensorFlow', '#NextJS', '#IoT', '#CyberSecurity', '#Blockchain'].map((tag, i) => (
            <Link key={i} href={`/search?q=${encodeURIComponent(tag.replace('#', ''))}`}>
              <span className="px-4 py-1.5 rounded-full bg-white/50 border border-slate-200 text-slate-600 text-sm hover:bg-white hover:border-indigo-400 hover:text-indigo-600 transition-all cursor-pointer shadow-sm">
                {tag}
              </span>
            </Link>
          ))}
        </motion.div>
      </section>

      {/* Featured Projects Grid */}
      <section className="px-4 pb-20 w-full max-w-[90rem] mx-auto">
        <div className="flex items-center justify-between mb-8 px-4">
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <LayoutGrid className="text-indigo-500" /> Featured Projects
          </h2>
          <Link href="/search" className="text-indigo-600 font-semibold hover:underline flex items-center gap-1">
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
                <div className="group h-full bg-white/60 backdrop-blur-md border border-white/50 rounded-3xl p-6 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] transition-all hover:-translate-y-2 cursor-pointer flex flex-col">
                  <div className="flex justify-between items-start mb-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider
                                            ${project.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>
                      {project.status}
                    </span>
                    <div className="p-2 bg-white rounded-full text-slate-400 group-hover:text-indigo-500 transition-colors shadow-sm">
                      <ArrowRight size={16} className="-rotate-45 group-hover:rotate-0 transition-transform" />
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-slate-900 mb-3 leading-snug group-hover:text-indigo-600 transition-colors">
                    {project.title}
                  </h3>

                  <p className="text-slate-500 text-sm line-clamp-3 mb-6 flex-1 leading-relaxed">
                    {project.abstract}
                  </p>

                  <div className="flex items-center justify-between mt-auto border-t border-slate-100 pt-4">
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                      <Users size={14} className="text-slate-400" />
                      {project.authors.length} Authors
                    </div>
                    <span className="text-xs font-bold text-indigo-500 bg-indigo-50 px-2 py-1 rounded-md">
                      {project.year}
                    </span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 1. Impact Stats Bar */}
      <section className="w-full bg-white/40 border-y border-white/50 backdrop-blur-md py-16 mb-24">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <StatCounter count="250+" label="Total Projects" icon={Database} color="text-teal-500" />
          <StatCounter count="85+" label="Research Papers" icon={BookOpen} color="text-blue-500" />
          <StatCounter count="15+" label="Active Domains" icon={Globe} color="text-indigo-500" />
          <StatCounter count="500+" label="Student Contributors" icon={Users} color="text-purple-500" />
        </div>
      </section>

      {/* 2. & 5. Discovery & Pulse Section (Side by Side) */}
      <section className="max-w-7xl mx-auto px-6 mb-32 grid grid-cols-1 lg:grid-cols-3 gap-12">

        {/* Left: Domain Discovery */}
        <div className="lg:col-span-2">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-slate-900 mb-2">Explore Domains</h2>
            <p className="text-slate-500">Curated collections of student excellence.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <DomainCard title="AI & Machine Learning" count="120 Projects" icon={Zap} color="bg-purple-50 text-purple-600" />
            <DomainCard title="Blockchain Technology" count="45 Projects" icon={Database} color="bg-blue-50 text-blue-600" />
            <DomainCard title="Cyber Security" count="32 Projects" icon={Shield} color="bg-teal-50 text-teal-600" />
            <DomainCard title="Web & App Dev" count="88 Projects" icon={LayoutGrid} color="bg-indigo-50 text-indigo-600" />
          </div>
        </div>

        {/* Right: Recent Activity Pulse */}
        <div className="bg-white/60 backdrop-blur-md border border-slate-100 rounded-3xl p-8">
          <h3 className="flex items-center gap-2 font-bold text-slate-900 mb-6">
            <Activity className="text-emerald-500" /> Live Activity Pulse
          </h3>
          <div className="space-y-6 relative">
            {/* Timeline Line */}
            <div className="absolute left-3 top-2 bottom-2 w-0.5 bg-slate-200"></div>

            {[
              { title: "Quantum Cryptography", type: "Research Paper", team: "Team Alpha", time: "2h ago" },
              { title: "Smart Agri-Tech", type: "Project", team: "Green Soul", time: "5h ago" },
              { title: "DeFi Exchange", type: "Micro-Project", team: "BitBuilders", time: "1d ago" },
              { title: "AI Traffic Control", type: "Thesis", team: "UrbanFlow", time: "1d ago" },
            ].map((item, i) => (
              <div key={i} className="flex gap-4 relative">
                <div className="w-6 h-6 rounded-full bg-white border-2 border-emerald-400 z-10 flex-shrink-0 mt-1"></div>
                <div>
                  <p className="text-sm font-medium text-slate-900 leading-snug">
                    New <b>{item.type}</b> uploaded on <span className="text-indigo-600">'{item.title}'</span>
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    by {item.team} • {item.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Hall of Fame (Gamified) */}
      <section className="w-full bg-gradient-to-b from-transparent to-indigo-50/50 py-24">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-yellow-100 border border-yellow-200 text-yellow-700 text-xs font-bold uppercase tracking-widest mb-4">
              <Trophy size={14} /> Top Contributors
            </div>
            <h2 className="text-4xl font-extrabold text-slate-900 mb-4">Repository Hall of Fame</h2>
            <p className="text-slate-500">Recognizing the most active researchers and guides.</p>
          </div>

          <div className="flex flex-wrap justify-center gap-8 md:gap-16 items-end">
            {/* Rank 2 */}
            <ContributorCard
              rank={2}
              name="Priya Sharma"
              count={12}
              role="Student"
              color="border-slate-300"
              bg="bg-slate-100"
            />
            {/* Rank 1 */}
            <ContributorCard
              rank={1}
              name="Dr. R. K. Patil"
              count={28}
              role="Faculty Guide"
              color="border-yellow-400"
              bg="bg-yellow-50"
              isWinner
            />
            {/* Rank 3 */}
            <ContributorCard
              rank={3}
              name="Amit Verma"
              count={9}
              role="Student"
              color="border-orange-300"
              bg="bg-orange-50"
            />
          </div>
        </div>
      </section>
    </div>
  );
}

const StatCounter = ({ count, label, icon: Icon, color }: any) => (
  <div className="flex flex-col items-center group">
    <div className={`mb-3 p-3 rounded-2xl bg-white shadow-sm border border-slate-100 group-hover:scale-110 transition-transform ${color}`}>
      <Icon size={32} />
    </div>
    <span className="text-4xl md:text-5xl font-black text-slate-900 mb-2">{count}</span>
    <span className="text-slate-500 font-medium text-sm uppercase tracking-wider">{label}</span>
  </div>
);

const DomainCard = ({ title, count, icon: Icon, color }: { title: string, count: string, icon: any, color: string }) => (
  <div className="bg-white border border-slate-100 p-6 rounded-2xl hover:shadow-[0_10px_30px_-10px_rgba(0,0,0,0.08)] transition-all cursor-pointer group hover:-translate-y-1 flex items-center gap-4">
    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 ${color}`}>
      <Icon size={32} />
    </div>
    <div>
      <h3 className="text-lg font-bold text-slate-900 mb-1 group-hover:text-indigo-600 transition-colors">{title}</h3>
      <p className="text-sm text-slate-500 font-medium">{count}</p>
    </div>
  </div>
);

const ContributorCard = ({ rank, name, count, role, color, bg, isWinner }: any) => (
  <div className={`flex flex-col items-center ${isWinner ? '-mt-12 scale-110' : ''}`}>
    <div className={`w-24 h-24 rounded-full border-4 ${color} ${bg} flex items-center justify-center mb-4 shadow-xl relative`}>
      <span className="text-2xl font-bold text-slate-700">{name[0]}</span>
      <div className="absolute -bottom-3 px-3 py-1 bg-slate-900 text-white text-xs font-bold rounded-full border-2 border-white">
        #{rank}
      </div>
    </div>
    <h4 className="text-lg font-bold text-slate-900">{name}</h4>
    <p className="text-xs text-slate-500 mb-2">{role}</p>
    <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold">
      {count} Uploads
    </span>
  </div>
);
