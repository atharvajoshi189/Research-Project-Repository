"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function GridPulse() {
    const [pulses, setPulses] = useState<{ id: number; orientation: 'h' | 'v'; pos: number }[]>([]);

    useEffect(() => {
        let timeoutId: NodeJS.Timeout;

        const triggerPulse = () => {
            const orientation: 'h' | 'v' = Math.random() > 0.5 ? 'h' : 'v';
            const pos = Math.floor(Math.random() * 30) * 24;
            const newPulse = { id: Math.random(), orientation, pos };

            setPulses(prev => [...prev, newPulse]);

            timeoutId = setTimeout(triggerPulse, 500 + Math.random() * 2000);
        };

        timeoutId = setTimeout(triggerPulse, 1000);
        return () => clearTimeout(timeoutId);
    }, []);

    const removePulse = (id: number) => {
        setPulses(prev => prev.filter(p => p.id !== id));
    };

    return (
        <AnimatePresence>
            {pulses.map(pulse => (
                <motion.div
                    key={pulse.id}
                    initial={pulse.orientation === 'h' ? { left: '-10%', top: pulse.pos, opacity: 0 } : { top: '-10%', left: pulse.pos, opacity: 0 }}
                    animate={pulse.orientation === 'h' ? { left: '110%', opacity: [0, 1, 0] } : { top: '110%', opacity: [0, 1, 0] }}
                    transition={{ duration: 3, ease: "linear" }}
                    onAnimationComplete={() => removePulse(pulse.id)}
                    className="absolute pointer-events-none z-0"
                    style={{
                        position: 'absolute',
                        ...(pulse.orientation === 'h'
                            ? { height: '1px', width: '300px', background: 'linear-gradient(90deg, transparent, #14b8a6, transparent)' }
                            : { width: '1px', height: '300px', background: 'linear-gradient(180deg, transparent, #14b8a6, transparent)' }
                        )
                    }}
                />
            ))}
        </AnimatePresence>
    );
}
