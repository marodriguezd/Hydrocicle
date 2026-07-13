import React, { createContext, useState, useEffect, useContext } from 'react';

export interface AppConfig {
  hotDuration: number;
  coldDuration: number;
  rounds: number;
  volume: number;
  soundscape: string;
  language: string;
  theme: string;
  preset: string;
}

interface SettingsState {
  config: AppConfig;
  updateConfig: (updates: Partial<AppConfig>) => void;
}

export const SettingsContext = createContext<SettingsState | null>(null);

export const SettingsProvider = ({ children }: { children: React.ReactNode }) => {
  const [config, setConfig] = useState<AppConfig>(() => {
    const saved = localStorage.getItem('hydrocicleConfig');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          hotDuration: parsed.hotDuration !== undefined ? parsed.hotDuration : 120,
          coldDuration: parsed.coldDuration !== undefined ? parsed.coldDuration : 60,
          rounds: parsed.rounds || 3,
          volume: parsed.volume !== undefined ? parsed.volume : 0.5,
          soundscape: parsed.soundscape || 'none',
          language: parsed.language || 'en',
          theme: parsed.theme || 'dark',
          preset: parsed.preset || 'standard'
        };
      } catch (e) {
        console.error(e);
      }
    }
    return {
      hotDuration: 120,
      coldDuration: 60,
      rounds: 3,
      volume: 0.5,
      soundscape: 'none',
      language: 'en',
      theme: 'dark',
      preset: 'standard'
    };
  });

  const updateConfig = (updates: Partial<AppConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }));
  };

  useEffect(() => {
    localStorage.setItem('hydrocicleConfig', JSON.stringify(config));
    document.documentElement.setAttribute('data-theme', config.theme);
  }, [config]);

  return (
    <SettingsContext.Provider value={{ config, updateConfig }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) throw new Error('useSettings must be used within SettingsProvider');
  return context;
};
