"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { Search, ArrowRight, FileText, Sparkles } from 'lucide-react';
import Link from 'next/link';
import StatsDashboard from '@/components/StatsDashboard';
import ResearchNetwork from '@/components/ResearchNetwork';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Project3DCard from '@/components/Project3DCard';
import { useAITheme } from '@/context/AIThemeContext';
import CategoryCloud from '@/components/home/CategoryCloud';

const TECH_ICON_MAP: Record<string, string> = {
  react: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg',
  'next.js': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nextjs/nextjs-original.svg',
  nextjs: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nextjs/nextjs-original.svg',
  typescript: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg',
  javascript: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg',
  python: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg',
  java: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/java/java-original.svg',
  'c++': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/cplusplus/cplusplus-original.svg',
  cpp: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/cplusplus/cplusplus-original.svg',
  c: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/c/c-original.svg',
  'c#': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/csharp/csharp-original.svg',
  csharp: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/csharp/csharp-original.svg',
  go: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/go/go-original-wordmark.svg',
  rust: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/rust/rust-plain.svg',
  flutter: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/flutter/flutter-original.svg',
  dart: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/dart/dart-original.svg',
  kotlin: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/kotlin/kotlin-original.svg',
  swift: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/swift/swift-original.svg',
  mysql: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mysql/mysql-original.svg',
  postgresql: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg',
  postgres: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg',
  mongodb: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mongodb/mongodb-original.svg',
  firebase: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/firebase/firebase-plain.svg',
  supabase: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/supabase/supabase-original.svg',
  docker: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg',
  kubernetes: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/kubernetes/kubernetes-plain.svg',
  git: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/git/git-original.svg',
  github: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/github/github-original.svg',
  html: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg',
  css: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/css3/css3-original.svg',
  tailwindcss: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/tailwindcss/tailwindcss-original.svg',
  tailwind: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/tailwindcss/tailwindcss-original.svg',
  nodejs: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg',
  'node.js': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg',
  express: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/express/express-original.svg',
  angular: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/angularjs/angularjs-original.svg',
  vue: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vuejs/vuejs-original.svg',
  svelte: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/svelte/svelte-original.svg',
  php: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/php/php-original.svg',
  laravel: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/laravel/laravel-original.svg',
  django: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/django/django-plain.svg',
  flask: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/flask/flask-original.svg',
  tensorflow: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/tensorflow/tensorflow-original.svg',
  pytorch: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/pytorch/pytorch-original.svg',
  opencv: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/opencv/opencv-original.svg',
  arduino: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/arduino/arduino-original.svg',
  solidity: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/solidity/solidity-original.svg',
  linux: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/linux/linux-original.svg',
  ubuntu: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/ubuntu/ubuntu-plain.svg',
  aws: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/amazonwebservices/amazonwebservices-original-wordmark.svg',
  azure: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/azure/azure-original.svg',
  gcp: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/googlecloud/googlecloud-original.svg',
  jenkins: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/jenkins/jenkins-original.svg',
  bash: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/bash/bash-original.svg',
  redux: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/redux/redux-original.svg',
  graphql: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/graphql/graphql-plain.svg',
  vercel: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vercel/vercel-original.svg',
  sqlite: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/sqlite/sqlite-original.svg',
  redis: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/redis/redis-original.svg',
  'in-memory (dev)': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/redis/redis-original.svg',
  'redis (prod)': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/redis/redis-original.svg',
  'postgresql (prod)': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg',
  'sqlite (dev)': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/sqlite/sqlite-original.svg',
  'docker with kubernetes': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/kubernetes/kubernetes-plain.svg',
  uvicorn: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg',
  sqlalchemy: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/sqlalchemy/sqlalchemy-original.svg',
  pypdf2: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg',
  'python-docx': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg',
  pandas: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/pandas/pandas-original.svg',
  aiohttp: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg',
  nginx: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nginx/nginx-original.svg',
  iot: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/raspberrypi/raspberrypi-original.svg',
};

const getTechIcon = (tech: string) => {
  const normalized = tech.toLowerCase().trim();
  if (TECH_ICON_MAP[normalized]) return TECH_ICON_MAP[normalized];
  return 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/devicon/devicon-original.svg';
};

export default function Home() {
  const router = useRouter();
  const { isAIActive, toggleAIMode } = useAITheme();
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [techIcons, setTechIcons] = useState<{ name: string, url: string }[]>([]);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    const { data } = await supabase
      .from('projects')
      .select('*')
      .eq('status', 'approved')
      .order('created_at', { ascending: false });

    const defaultIcons = [
      { name: 'React', url: getTechIcon('React') },
      { name: 'Node.js', url: getTechIcon('Node.js') },
      { name: 'Python', url: getTechIcon('Python') },
      { name: 'TensorFlow', url: getTechIcon('TensorFlow') },
      { name: 'Docker', url: getTechIcon('Docker') },
      { name: 'PostgreSQL', url: getTechIcon('PostgreSQL') },
    ];

    if (data && data.length > 0) {
      setProjects(data);

      const uniqueTech = new Set<string>();
      data.forEach((p: any) => {
        if (p.techStack && Array.isArray(p.techStack)) {
          p.techStack.forEach((t: string) => uniqueTech.add(t));
        }
      });

      const icons = Array.from(uniqueTech).map(tech => ({
        name: tech,
        url: getTechIcon(tech)
      }));

      // If we have icons from DB, use them. 
      // Merging with defaults ONLY if we have very few to ensure the marquee looks full?
      // User asked: "Render the ticker using only the technologies that actually exist in the database."
      if (icons.length > 0) {
        // If less than 6, maybe duplicate them for smooth marquee?
        // But for "Dynamic" Strictness, let's just use what we have.
        setTechIcons(icons);
      } else {
        setTechIcons(defaultIcons);
      }
    } else {
      // Fallback if no projects found or RLS blocks them
      setTechIcons(defaultIcons);
    }
  };

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

  const handleAIToggle = () => {
    toggleAIMode();
    if (!isAIActive) {
      router.push('/ai-mode');
    }
  };

  return (
    <div className="relative w-full min-h-screen bg-[#FAFAFA] text-slate-900 overflow-x-hidden selection:bg-teal-100 selection:text-teal-900">

      {/* 1. Aurora Background */}
      <div className="fixed inset-0 w-full h-full -z-50 pointer-events-none">
        <div className="fixed inset-0 w-full h-full -z-50 pointer-events-none opacity-40">
          <ResearchNetwork />
        </div>
        {/* Noise Texture Overaly */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-soft-light"></div>
      </div>

      {/* Hero Section */}
      <section className="relative px-6 pt-32 pb-20 w-full max-w-7xl mx-auto flex flex-col items-center text-center">

        {/* Animated Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-slate-200 shadow-sm text-xs font-bold tracking-widest uppercase text-slate-500 hover:border-teal-300 transition-colors cursor-default">
            <Sparkles size={12} className="text-teal-400" /> Department of Computer Science
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-6xl md:text-8xl lg:text-9xl font-bold tracking-tighter leading-[0.9] text-slate-900 mb-10"
        >
          Research <br />
          <span className="font-[family-name:var(--font-playfair)] italic font-medium text-transparent bg-clip-text bg-gradient-to-r from-teal-500 via-blue-500 to-purple-500 animate-gradient-wipe">Reimagined.</span>
        </motion.h1>

        {/* Subtext */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="max-w-2xl mx-auto text-xl text-slate-500 font-medium leading-relaxed mb-12"
        >
          Explore a curated archive of groundbreaking student projects, research papers, and technological innovations.
        </motion.p>

        {/* Search Bar */}
        <motion.div
          ref={containerRef}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="w-full max-w-2xl relative z-50"
        >
          <form onSubmit={handleSearch} className="relative group">
            {/* Glow Effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-teal-400 to-blue-500 rounded-full opacity-20 group-focus-within:opacity-50 blur-xl transition-opacity duration-500" />

            <div className={`relative bg-white/80 backdrop-blur-xl border border-white/40 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300 ${showDropdown ? 'rounded-3xl' : 'rounded-full'}`}>
              <div className="flex items-center pl-6 pr-2 py-2">
                <Search className="text-slate-400 w-5 h-5 flex-shrink-0 mr-4" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onFocus={() => { if (query) setShowDropdown(true) }}
                  placeholder="Find projects, topics, or authors..."
                  className="bg-transparent w-full text-lg font-medium text-slate-800 placeholder-slate-400 focus:outline-none py-3"
                />
                <button type="submit" className="p-3 bg-slate-900 text-white rounded-full hover:bg-slate-800 transition-transform active:scale-95">
                  <ArrowRight size={20} />
                </button>

                {/* AI Toggle Switch */}
                <div className="pl-3 border-l border-slate-200 ml-3">
                  <button
                    type="button"
                    onClick={handleAIToggle}
                    className={`relative flex items-center gap-2 px-4 py-2 rounded-full font-bold text-xs uppercase tracking-wider transition-all duration-500 overflow-hidden group/ai
                      ${isAIActive
                        ? 'bg-slate-900 text-white shadow-[0_0_20px_rgba(168,85,247,0.5)] border border-purple-500/50'
                        : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                      }
                    `}
                  >
                    {/* Animated Gradient Background for AI Mode */}
                    {isAIActive && (
                      <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-20 animate-pulse-slow"></div>
                    )}

                    <div className={`relative z-10 p-1 rounded-full transition-transform duration-500 ${isAIActive ? 'rotate-[360deg] scale-110' : ''}`}>
                      <Sparkles size={16} className={isAIActive ? "text-purple-300 fill-purple-300" : "text-slate-400"} />
                    </div>
                    <span className="relative z-10 transition-colors duration-300">
                      {isAIActive ? 'AI Mode ON' : 'AI Mode'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Dropdown */}
              <AnimatePresence>
                {showDropdown && query.trim() && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="border-t border-slate-100 px-2 pb-2"
                  >
                    <ul className="py-2">
                      {suggestions.length > 0 ? (
                        suggestions.map((project, index) => (
                          <li key={project.id}>
                            <button
                              onClick={() => router.push(`/project/${project.id}`)}
                              className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 transition-colors ${index === selectedIndex ? 'bg-slate-50' : 'hover:bg-slate-50'}`}
                            >
                              <div className="w-8 h-8 rounded-full bg-teal-50 flex items-center justify-center text-teal-600 flex-shrink-0">
                                <FileText size={14} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-bold text-slate-700 truncate text-sm">{project.title}</p>
                                <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                                  <span className="capitalize">{project.category}</span>
                                  <span className="w-1 h-1 rounded-full bg-slate-300" />
                                  <span>{project.academic_year}</span>
                                </p>
                              </div>
                            </button>
                          </li>
                        ))
                      ) : (
                        <li className="px-4 py-8 text-center text-slate-400 text-sm">
                          No matches found for "{query}"
                        </li>
                      )}
                    </ul>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </form>
        </motion.div>

        {/* Floating Category Cloud */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="w-full relative z-40"
        >
          <CategoryCloud />
        </motion.div>

        {/* Tech Stack Icons (Wavy Row) */}
        {/* Tech Stack Infinite Marquee */}
        <div className="mt-20 w-full overflow-hidden relative">
          <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-[#FAFAFA] to-transparent z-10" />
          <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-[#FAFAFA] to-transparent z-10" />

          <motion.div
            className="flex w-max"
            animate={{ x: "-50%" }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear",
              repeatType: "loop"
            }}
          >
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex gap-16 items-center pr-16">
                {techIcons.length > 0 ? techIcons.map((tech, index) => (
                  <motion.div
                    key={`${i}-${index}`}
                    onClick={() => router.push(`/search?tech=${encodeURIComponent(tech.name)}`)}
                    className="group relative flex flex-col items-center justify-center gap-4 cursor-pointer"
                    animate={{ y: [-8, 8, -8] }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: index * 0.2
                    }}
                  >
                    <div className="w-12 h-12 rounded-full bg-white border border-slate-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)] flex items-center justify-center p-3 transition-all duration-300 group-hover:scale-110 group-hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)]">
                      <img
                        src={tech.url}
                        alt={tech.name}
                        className="w-full h-full object-contain filter grayscale brightness-0 opacity-80 group-hover:grayscale-0 group-hover:brightness-100 group-hover:opacity-100 transition-all duration-300"
                      />
                    </div>
                  </motion.div>
                )) : null}
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Bento Grid Featured */}
      <section className="px-4 pb-32 max-w-[90rem] mx-auto">
        <div className="flex items-end justify-between mb-12 px-2">
          <div>
            <h2 className="text-4xl font-bold text-slate-900 mb-2 tracking-tight">Featured Work</h2>
            <p className="text-slate-500">Hand-picked excellence from this semester.</p>
          </div>
          <Link href="/search" className="hidden md:flex items-center gap-2 text-slate-900 font-bold border-b-2 border-slate-900 pb-0.5 hover:text-teal-600 hover:border-teal-600 transition-colors">
            View All Archives <ArrowRight size={18} />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 auto-rows-[300px]">
          {projects.slice(0, 7).map((project, i) => {
            // Determine Bento Span
            const isLarge = i === 0 || i === 4;
            const spanClass = isLarge ? "md:col-span-2 md:row-span-2" : "md:col-span-1 md:row-span-1";

            return (
              <Project3DCard
                key={project.id}
                project={project}
                spanClass={spanClass}
                index={i}
              />
            );
          })}

          {/* View More Card */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="md:col-span-1 md:row-span-1 rounded-3xl border border-dashed border-slate-300 bg-slate-50/50 backdrop-blur-sm flex flex-col items-center justify-center text-center p-6 hover:bg-slate-100/50 transition-colors cursor-pointer group"
            onClick={() => router.push('/search')}
          >
            <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center text-slate-400 group-hover:text-slate-900 group-hover:scale-110 transition-all mb-3">
              <ArrowRight size={24} />
            </div>
            <span className="font-bold text-slate-600">View All Projects</span>
          </motion.div>
        </div>
      </section>

      {/* Floating Glass Stats */}
      <section className="py-20 bg-[#F1F5F9] relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#000_1px,transparent_1px),linear-gradient(to_bottom,#000_1px,transparent_1px)] bg-[size:2rem_2rem]" />

        <div className="max-w-7xl mx-auto px-6 relative z-10 flex flex-col items-center">
          <StatsDashboard />
        </div>
      </section>

    </div>
  );
}

// Removed GlassStat since we are using StatsDashboard now
// const GlassStat = ...
