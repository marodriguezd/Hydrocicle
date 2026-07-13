import React, { useState, useEffect } from 'react';
import { useSettings } from '../contexts/SettingsContext';
import { useSession } from '../contexts/SessionContext';
import { useTranslation } from '../hooks/useTranslation';
import { playTone } from '../hooks/useShowerTimer';
import { formatTimeDigital } from '../utils/timeFormat';

export const ConfigScreen = () => {
  const { config, updateConfig } = useSettings();
  const { setPhase, setCurrentRound, setTimeLeft, setIsPlaying } = useSession();
  const { t } = useTranslation();

  const [previewPhase, setPreviewPhase] = useState<'hot' | 'cold'>('hot');

  // Preview phase switching animation
  useEffect(() => {
    const interval = setInterval(() => {
      setPreviewPhase(prev => (prev === 'hot' ? 'cold' : 'hot'));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleStart = () => {
    setIsPlaying(true);
    setCurrentRound(1);
    
    if (config.hotDuration > 0) {
      setPhase('hot');
      setTimeLeft(config.hotDuration);
    } else {
      setPhase('cold');
      setTimeLeft(config.coldDuration);
    }
  };

  const handleResetConfig = () => {
    updateConfig({
      hotDuration: 120,
      coldDuration: 60,
      rounds: 3,
      volume: 0.5,
      soundscape: 'none',
      preset: 'standard'
    });
  };

  const applyPreset = (presetName: string) => {
    if (presetName === 'standard') {
      updateConfig({ preset: 'standard', hotDuration: 120, coldDuration: 60, rounds: 3 });
    } else if (presetName === 'extended') {
      updateConfig({ preset: 'extended', hotDuration: 300, coldDuration: 120, rounds: 3 });
    } else if (presetName === 'coldshock') {
      updateConfig({ preset: 'coldshock', hotDuration: 0, coldDuration: 180, rounds: 1 });
    } else {
      updateConfig({ preset: 'custom' });
    }
  };

  const getEstimatedTime = () => {
    const totalSeconds = config.rounds * (config.hotDuration + config.coldDuration);
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return s > 0 ? `~${m}m ${s}s` : `~${m}m`;
  };

  const testAudioSignal = () => {
    playTone(440, 400, config.volume, 'sine');
  };

  return (
    <div id="configScreen" className="screen active">
      {/* Dynamic Visual Preview Hexagon */}
      <div className="hexagon-container">
        <div 
          className={`hexagon phase-${config.hotDuration === 0 ? 'cold' : previewPhase}`}
          style={{ transform: 'scale(1.1)', transition: 'all 1s ease' }}
        >
          <div className="breath-counter">
            {config.hotDuration === 0 ? '❄️' : previewPhase === 'hot' ? '🔥' : '❄️'}
          </div>
        </div>
      </div>
      <div className="preview-label">{t('previewLabel')}</div>

      {/* Preset Selector */}
      <div className="preset-selector" style={{ marginTop: '1rem' }}>
        <button 
          className={`preset-btn ${config.preset === 'standard' ? 'active' : ''}`}
          onClick={() => applyPreset('standard')}
        >
          <span className="preset-btn-name">{t('presetStandard')}</span>
          <span className="preset-btn-desc">2m / 1m</span>
        </button>
        <button 
          className={`preset-btn ${config.preset === 'extended' ? 'active' : ''}`}
          onClick={() => applyPreset('extended')}
        >
          <span className="preset-btn-name">{t('presetExtended')}</span>
          <span className="preset-btn-desc">5m / 2m</span>
        </button>
        <button 
          className={`preset-btn ${config.preset === 'coldshock' ? 'active' : ''}`}
          onClick={() => applyPreset('coldshock')}
        >
          <span className="preset-btn-name">{t('presetColdShock')}</span>
          <span className="preset-btn-desc">3m Cold</span>
        </button>
        <button 
          className={`preset-btn ${config.preset === 'custom' ? 'active' : ''}`}
          onClick={() => applyPreset('custom')}
        >
          <span className="preset-btn-name">{t('presetCustom')}</span>
          <span className="preset-btn-desc">Custom</span>
        </button>
      </div>

      {/* Sliders */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', width: '100%', margin: '1rem 0' }}>
        
        {config.preset === 'custom' && (
          <>
            <div className="slider-group">
              <label>
                <span>{t('hotDurationLabel')}</span>
                <span>{formatTimeDigital(config.hotDuration)}</span>
              </label>
              <input 
                type="range" 
                min="0" 
                max="600" 
                step="30"
                value={config.hotDuration}
                onChange={(e) => updateConfig({ hotDuration: parseInt(e.target.value), preset: 'custom' })}
                className="slider"
              />
            </div>

            <div className="slider-group">
              <label>
                <span>{t('coldDurationLabel')}</span>
                <span>{formatTimeDigital(config.coldDuration)}</span>
              </label>
              <input 
                type="range" 
                min="15" 
                max="600" 
                step="15"
                value={config.coldDuration}
                onChange={(e) => updateConfig({ coldDuration: parseInt(e.target.value), preset: 'custom' })}
                className="slider"
              />
            </div>

            <div className="slider-group">
              <label>
                <span>{t('roundsLabel')}</span>
                <span>{config.rounds}</span>
              </label>
              <input 
                type="range" 
                min="1" 
                max="10" 
                step="1"
                value={config.rounds}
                onChange={(e) => updateConfig({ rounds: parseInt(e.target.value), preset: 'custom' })}
                className="slider"
              />
            </div>
          </>
        )}

        {/* Ambient audio selection */}
        <div className="slider-group">
          <label>
            <span>{t('soundscapeLabel')}</span>
          </label>
          <select 
            className="select-input" 
            value={config.soundscape}
            onChange={(e) => updateConfig({ soundscape: e.target.value })}
          >
            <option value="none">{t('soundscape_none')}</option>
            <option value="rain">{t('soundscape_rain')}</option>
            <option value="ocean">{t('soundscape_ocean')}</option>
            <option value="wind">{t('soundscape_wind')}</option>
          </select>
        </div>

        {/* Volume & test audio signal */}
        <div className="slider-group">
          <label>
            <span>{t('volumeLabel')}</span>
            <span>{Math.round(config.volume * 100)}%</span>
          </label>
          <input 
            type="range" 
            min="0" 
            max="1" 
            step="0.05"
            value={config.volume}
            onChange={(e) => updateConfig({ volume: parseFloat(e.target.value) })}
            className="slider"
          />
          <button 
            type="button" 
            className="speed-btn" 
            onClick={testAudioSignal}
            style={{ padding: '0.4rem', fontSize: '0.8rem', marginTop: '0.2rem' }}
          >
            Test Tone
          </button>
        </div>
      </div>

      <div className="estimated-time">
        {t('estimated_time')}: {getEstimatedTime()}
      </div>

      {/* Buttons */}
      <div className="config-buttons">
        <button className="reset-config-btn" onClick={handleResetConfig}>
          {t('resetConfigBtn')}
        </button>
        <button className="start-button" onClick={handleStart}>
          {t('startBtn')}
        </button>
      </div>
      <button 
        className="speed-btn" 
        onClick={() => setPhase('stats')}
        style={{ marginTop: '0.8rem', width: '100%', borderRadius: '1.5rem', padding: '0.9rem' }}
      >
        {t('statsBtn')}
      </button>
    </div>
  );
};
