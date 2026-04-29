"use client";

import React from 'react';

const LightTechBackground = () => {
    return (
        <div className="fixed inset-0 -z-50 overflow-hidden bg-slate-50 dark:bg-slate-900">
            {/* Simple static grid overlay instead of animated particles */}
            <div
                className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.03] dark:opacity-[0.05]"
                style={{
                    backgroundImage: `linear-gradient(90deg, #94a3b8 1px, transparent 1px), linear-gradient(#94a3b8 1px, transparent 1px)`,
                    backgroundSize: '40px 40px'
                }}
            />
            {/* Static noise/vignette overlay */}
            <div className="absolute inset-0 opacity-20 pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay dark:mix-blend-soft-light" />
        </div>
    );
};

export default LightTechBackground;
