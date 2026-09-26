'use client';

import { createContext, useContext, useState, useEffect } from 'react';

const AtmosphereContext = createContext(null);

const atmosphereThemes = {
  default: {
    bg: '#FAFAFA',
    text: '#1A1A1A',
    accent: '#C41230',
    surface: '#FFFFFF',
    surfaceHover: '#F0F0F0',
  },
  clothing: {
    bg: '#FAFAFA',
    text: '#1A1A1A',
    accent: '#C41230',
    surface: '#FFFFFF',
    surfaceHover: '#F0F0F0',
  },
  fashion: {
    bg: '#FAFAFA',
    text: '#1A1A1A',
    accent: '#C41230',
    surface: '#FFFFFF',
    surfaceHover: '#F0F0F0',
  },
  footwear: {
    bg: '#FAFAFA',
    text: '#1A1A1A',
    accent: '#C41230',
    surface: '#FFFFFF',
    surfaceHover: '#F0F0F0',
  },
  accessories: {
    bg: '#FAFAFA',
    text: '#1A1A1A',
    accent: '#C41230',
    surface: '#FFFFFF',
    surfaceHover: '#F0F0F0',
  },
  gadgets: {
    bg: '#FAFAFA',
    text: '#1A1A1A',
    accent: '#0D9488',
    surface: '#FFFFFF',
    surfaceHover: '#F0F0F0',
  },
};

export function AtmosphereProvider({ children }) {
  const [currentAtmosphere, setCurrentAtmosphere] = useState('default');

  useEffect(() => {
    const theme = atmosphereThemes[currentAtmosphere] || atmosphereThemes.default;
    const root = document.documentElement;
    root.style.setProperty('--atmosphere-bg', theme.bg);
    root.style.setProperty('--atmosphere-text', theme.text);
    root.style.setProperty('--atmosphere-accent', theme.accent);
    root.style.setProperty('--atmosphere-surface', theme.surface);
    root.style.setProperty('--atmosphere-surface-hover', theme.surfaceHover);
  }, [currentAtmosphere]);

  return (
    <AtmosphereContext.Provider value={{ currentAtmosphere, setCurrentAtmosphere }}>
      {children}
    </AtmosphereContext.Provider>
  );
}

export function useAtmosphere() {
  const context = useContext(AtmosphereContext);
  if (!context) throw new Error('useAtmosphere must be used within AtmosphereProvider');
  return context;
}
