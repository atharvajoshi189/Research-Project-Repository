"use client";

import React, { useRef } from 'react';
import { motion, useMotionTemplate, useMotionValue, useSpring } from 'framer-motion';
import { Trophy, Star, Crown, Sparkles, Award } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';

const HallOfFame = () => {
    const [projects, setProjects] = React.useState<any[]>([]);

    React.useEffect(() => {
        const fetchDeepTech = async () => {
            // Fetch 3 random or latest approved projects. 
            // For "Hall of Fame", maybe we want the *first* 3 created? Or random?
            // Let's go with "Latest" for now as it makes sense for "Real Time".
            const { data } = await supabase
                .from('projects')
                .select('*')
                .eq('status', 'approved')
                .order('created_at', { ascending: false })
                .limit(3);

            if (data) {
                setProjects(data);
            }
        };
        fetchDeepTech();
    }, []);

    // if (projects.length === 0) return null; // Or return skeleton

    // Map ranks to specific array indices for the podium layout
    // Layout expects: 
    // Card 2 (Left) -> index 1
    // Card 1 (Center) -> index 0
    // Card 3 (Right) -> index 2

    // We need at least 1 project.
    const topProject = projects[0];
    const secondProject = projects[1];
    const thirdProject = projects[2];

    return (
        <section className="relative w-full py-24 overflow-hidden">

            <div className="relative z-10 max-w-4xl mx-auto px-6">
                {/* Header */}
                <div className="text-center mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-600 text-xs font-bold tracking-widest uppercase mb-6"
                    >
                        <Crown size={14} className="fill-amber-600" />
                        Excellence Arcade
                    </motion.div>

                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 mb-6 relative z-20"
                    >
                        Hall of <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700">Fame</span>
                    </motion.h2>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="max-w-xl mx-auto text-base text-slate-600 font-medium"
                    >
                        Honoring the visionaries who pushed boundaries and redefined possibilities this academic year.
                    </motion.p>
                </div>

                {/* Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 items-start">
                    {/* Card 2: Top Innovation (Left) */}
                    {secondProject && (
                        <FameCard
                            rank={2}
                            title="Recent Innovation"
                            name={Array.isArray(secondProject.authors) ? secondProject.authors[0] : (secondProject.authors || 'Unknown')}
                            project={secondProject.title}
                            description={secondProject.abstract}
                            icon={<Sparkles size={24} className="text-white" />}
                            gradient="from-blue-400 to-cyan-600"
                            accentColor="blue"
                            delay={0.2}
                            className="md:mt-12 z-20" // Mid height
                            floatDuration={4}
                            id={secondProject.id}
                        />
                    )}

                    {/* Card 1: Researcher of the Year (Center - Highest) */}
                    {topProject && (
                        <FameCard
                            rank={1}
                            title="Featured Project"
                            name={Array.isArray(topProject.authors) ? topProject.authors[0] : (topProject.authors || 'Unknown')}
                            project={topProject.title}
                            description={topProject.abstract}
                            icon={<Trophy size={24} className="text-white" />}
                            gradient="from-amber-400 to-orange-600"
                            accentColor="amber"
                            delay={0}
                            className="z-30 order-first md:order-none scale-110" // Highest & slightly larger
                            floatDuration={5}
                            id={topProject.id}
                        />
                    )}

                    {/* Card 3: Best Thesis (Right) */}
                    {thirdProject && (
                        <FameCard
                            rank={3}
                            title="Honorable Mention"
                            name={Array.isArray(thirdProject.authors) ? thirdProject.authors[0] : (thirdProject.authors || 'Unknown')}
                            project={thirdProject.title}
                            description={thirdProject.abstract}
                            icon={<Award size={24} className="text-white" />}
                            gradient="from-purple-400 to-pink-600"
                            accentColor="purple"
                            delay={0.4}
                            className="md:mt-24 z-10" // Lowest height
                            floatDuration={4.5}
                            id={thirdProject.id}
                        />
                    )}
                </div>
            </div>
        </section>
    );
};

const getAvatarUrl = (name: string) => {
    const n = name.trim();
    const lower = n.toLowerCase();

    // Heuristic for Indian context
    let isFemale = lower.endsWith('a') || lower.endsWith('i') || lower.endsWith('e') || lower.includes('shr') || lower.includes('war');

    if (lower.includes('parth') || lower.includes('aditya') || lower.includes('krishna') || lower.includes('pranav') || lower.includes('rohit')) {
        isFemale = false;
    }
    if (lower.includes('sharwari') || lower.includes('uttara') || lower.includes('divya') || lower.includes('drishti')) {
        isFemale = true;
    }

    // Deterministic selection helper
    const pick = (arr: string[]) => {
        let hash = 0;
        for (let i = 0; i < n.length; i++) {
            hash = n.charCodeAt(i) + ((hash << 5) - hash);
        }
        return arr[Math.abs(hash) % arr.length];
    };

    // Safe V7 Options
    const femaleTops = ['longHair', 'longHairBob', 'longHairCurly', 'longHairStraight', 'longHairBun'];
    const maleTops = ['shortHair', 'shortHairDreads', 'shortHairFrizzle', 'shortHairShaggy'];

    const femaleClothes = ['blazer', 'hoodie', 'overall'];
    const maleClothes = ['blazerAndShirt', 'hoodie', 'shirtCrewNeck'];

    const params = new URLSearchParams();
    params.set('seed', n);
    // Explicitly using 7.x which is very widely cached and stable
    const baseUrl = 'https://api.dicebear.com/7.x/avataaars/svg';

    if (isFemale) {
        params.set('top', pick(femaleTops));
        params.set('clothing', pick(femaleClothes));
        params.set('accessories', pick(['prescription02', 'round', 'none', 'none']));
        params.set('facialHair', 'none');
        params.set('backgroundColor', 'ffdfbf');
    } else {
        params.set('top', pick(maleTops));
        params.set('facialHair', pick(['beardLight', 'beardMedium', 'moustacheFancy', 'none']));
        params.set('clothing', pick(maleClothes));
        params.set('accessories', pick(['prescription02', 'round', 'none', 'none', 'sunglasses']));
        params.set('backgroundColor', 'b6e3f4');
    }

    return `${baseUrl}?${params.toString()}`;
};





const FameCard = ({ rank, title, name, project, description, icon, gradient, accentColor, delay, floatDuration = 4, className = "", id }: any) => {
    const ref = useRef<HTMLDivElement>(null);
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const mouseXSpring = useSpring(x);
    const mouseYSpring = useSpring(y);

    const rotateX = useMotionTemplate`calc(${mouseYSpring} * -0.5deg)`;
    const rotateY = useMotionTemplate`calc(${mouseXSpring} * 0.5deg)`;

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!ref.current) return;
        const rect = ref.current.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        const xPct = mouseX / width - 0.5;
        const yPct = mouseY / height - 0.5;
        x.set(xPct * 20); // Multiplier determines tilt intensity
        y.set(yPct * 20);
    };

    const handleMouseLeave = () => {
        x.set(0);
        y.set(0);
    };

    const avatarUrl = getAvatarUrl(name || 'User');

    const CardContent = (
        <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay, duration: 0.8, type: "spring" }}
            className={`group relative w-full h-[450px] ${className}`}
        >
            <motion.div
                animate={{ y: [0, -12, 0] }}
                transition={{
                    duration: floatDuration,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
                className="h-full w-full"
            >
                <motion.div
                    ref={ref}
                    onMouseMove={handleMouseMove}
                    onMouseLeave={handleMouseLeave}
                    style={{
                        rotateX,
                        rotateY,
                        transformStyle: "preserve-3d",
                        perspective: 1000,
                    }}
                    className="relative h-full w-full bg-white rounded-[2rem] border border-slate-100 shadow-xl overflow-hidden flex flex-col"
                >
                    {/* Gradient Header */}
                    <div className={`absolute top-0 inset-x-0 h-24 bg-gradient-to-br ${gradient} p-5 flex items-start justify-between z-0`}>
                        <div className="relative z-10 bg-white/20 backdrop-blur-md border border-white/30 p-2.5 rounded-xl shadow-lg">
                            {icon}
                        </div>
                        <div className="text-white font-black text-6xl opacity-20 -mt-3 -mr-2 select-none">
                            #{rank}
                        </div>
                    </div>

                    {/* Content */}
                    <div className="relative pt-24 px-6 pb-6 flex flex-col items-center justify-between text-center z-10 h-full">
                        {/* Floating Avatar - Animated Look */}
                        <div className="absolute top-12 left-1/2 -translate-x-1/2 w-24 h-24 rounded-full border-[3px] border-white bg-white shadow-lg overflow-hidden z-20 group-hover:scale-110 transition-transform duration-300">
                            <img
                                src={avatarUrl}
                                alt={name}
                                className="w-full h-full object-cover bg-slate-50"
                                loading="lazy"
                            />
                        </div>

                        <div className="mt-12 mb-2">
                            <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">{title}</h4>
                            <h3 className="text-lg font-bold text-slate-900 leading-tight px-2">{name}</h3>
                        </div>

                        <div className="w-10 h-1 bg-slate-100 rounded-full my-3 group-hover:bg-slate-200 transition-colors" />

                        <div className="flex-1 flex flex-col justify-center w-full">
                            <p className={`font-bold text-sm text-${accentColor}-600 mb-2`}>{project}</p>
                            <p className="text-slate-500 text-xs leading-relaxed line-clamp-4 px-2">{description}</p>
                        </div>

                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className={`mt-4 px-6 py-2 rounded-xl bg-slate-50 text-slate-900 border border-slate-200 font-bold text-xs hover:bg-slate-100 transition-all flex items-center gap-2 shadow-sm`}
                        >
                            View Profile <Star size={12} className="fill-slate-900" />
                        </motion.button>
                    </div>

                    {/* Shine Effect */}
                    <div className="absolute inset-0 z-50 pointer-events-none bg-gradient-to-tr from-transparent via-white/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 w-[200%] h-[200%] -translate-x-full -translate-y-full group-hover:translate-x-full group-hover:translate-y-full" />
                </motion.div>
            </motion.div>



            {/* Back Glow for individual cards handled in FameCard */}
            <div className={`absolute -inset-4 bg-gradient-to-br ${gradient} rounded-[2.5rem] -z-10 opacity-0 group-hover:opacity-30 blur-xl transition-opacity duration-500`} />
        </motion.div>
    );

    if (id) {
        return <Link href={`/project/${id}`}>{CardContent}</Link>;
    }
    return CardContent;
};

export default HallOfFame;
