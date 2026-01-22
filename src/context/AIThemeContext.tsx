"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';

type AIThemeContextType = {
    isAIActive: boolean;
    toggleAIMode: () => void;
    setAIActive: (active: boolean) => void;
};

const AIThemeContext = createContext<AIThemeContextType | undefined>(undefined);

export function AIThemeProvider({ children }: { children: ReactNode }) {
    const [isAIActive, setIsAIActive] = useState(false);

    const toggleAIMode = () => {
        setIsAIActive(prev => !prev);
    };

    const setAIActive = (active: boolean) => {
        setIsAIActive(active);
    };

    return (
        <AIThemeContext.Provider value={{ isAIActive, toggleAIMode, setAIActive }}>
            {children}
        </AIThemeContext.Provider>
    );
}

export function useAITheme() {
    const context = useContext(AIThemeContext);
    if (context === undefined) {
        throw new Error('useAITheme must be used within an AIThemeProvider');
    }
    return context;
}
