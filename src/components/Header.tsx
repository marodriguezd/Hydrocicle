import React, { useState } from 'react';
import { useSession } from '../contexts/SessionContext';
import { useSettings } from '../contexts/SettingsContext';
import { useTranslation } from '../hooks/useTranslation';

const LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'pt', name: 'Português', flag: '🇵🇹' },
  { code: 'zh', name: '简体中文', flag: '🇨🇳' }
];

export const Header = () => {
  const { config, updateConfig } = useSettings();
  const { phase, setPhase, currentRound, timeLeft, setIsPlaying } = useSession();
  const { t } = useTranslation();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const currentLangObj = LANGUAGES.find(l => l.code === config.language) || LANGUAGES[0];

  const toggleTheme = () => {
    const nextTheme = config.theme === 'dark' ? 'light' : 'dark';
    updateConfig({ theme: nextTheme });
  };

  let progressWidth = 0;
  if (phase === 'hot' || phase === 'cold') {
    const totalSessionTime = config.rounds * (config.hotDuration + config.coldDuration);
    if (totalSessionTime > 0) {
      let elapsed = (currentRound - 1) * (config.hotDuration + config.coldDuration);
      if (phase === 'hot') {
        elapsed += Math.max(0, config.hotDuration - timeLeft);
      } else {
        elapsed += config.hotDuration + Math.max(0, config.coldDuration - timeLeft);
      }
      progressWidth = Math.min(100, (elapsed / totalSessionTime) * 100);
    }
  } else if (phase === 'finished') {
    progressWidth = 100;
  }

  return (
    <div className="header">
      <div className="lang-container">
        {isDropdownOpen && (
          <div 
            className="lang-overlay" 
            style={{ display: 'block' }}
            onClick={() => setIsDropdownOpen(false)}
          ></div>
        )}
        <div className="lang-selector">
          <button 
            className="lang-toggle" 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <span className="lang-flag">{currentLangObj.flag}</span>
            <span>{currentLangObj.code.toUpperCase()}</span>
          </button>
          <div 
            className={`lang-dropdown ${isDropdownOpen ? 'open' : ''}`}
          >
            {LANGUAGES.map((lang) => (
              <button 
                key={lang.code}
                className={`lang-option ${config.language === lang.code ? 'active' : ''}`} 
                onClick={() => {
                  updateConfig({ language: lang.code });
                  setIsDropdownOpen(false);
                }}
              >
                <span className="lang-flag">{lang.flag}</span>
                <span>{lang.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
      <h1>{t('appTitle')}</h1>
      <div id="progressBar">
        <div id="progressFill" style={{ width: `${progressWidth}%` }}></div>
      </div>
      <button 
        className={`theme-toggle-btn ${(phase !== 'idle' && phase !== 'stats') ? 'hidden' : ''}`} 
        title="Change theme"
        onClick={toggleTheme}
      >
        {config.theme === 'dark' ? '☀️' : '🌙'}
      </button>
      <button 
        className={`finish-btn ${(phase !== 'hot' && phase !== 'cold') ? 'hidden' : ''}`} 
        onClick={() => {
          setIsPlaying(false);
          setPhase('finished');
        }}
      >
        {t('finishBtn')}
      </button>
    </div>
  );
};
