import React, { useState, useEffect, useRef } from 'react';
import { useSettings } from '../contexts/SettingsContext';
import { useSession } from '../contexts/SessionContext';
import { useTranslation } from '../hooks/useTranslation';
import { playTone } from '../contexts/TimerContext';
import { formatTimeDigital } from '../utils/timeFormat';

export const ConfigScreen = () => {
  const { config, updateConfig } = useSettings();
  const { setPhase, setCurrentRound, setTimeLeft, setIsPlaying } = useSession();
  const { t } = useTranslation();

  const [previewPhase, setPreviewPhase] = useState<'hot' | 'cold'>('hot');
  const [testingSoundscape, setTestingSoundscape] = useState<boolean>(false);
  const testSoundscapeRef = useRef<HTMLAudioElement | null>(null);

  // Preview phase switching animation
  useEffect(() => {
    const interval = setInterval(() => {
      setPreviewPhase(prev => (prev === 'hot' ? 'cold' : 'hot'));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Clean up soundscape test audio on unmount
  useEffect(() => {
    return () => {
      if (testSoundscapeRef.current) {
        testSoundscapeRef.current.pause();
        testSoundscapeRef.current = null;
      }
    };
  }, []);

  // Control playback of the soundscape preview
  useEffect(() => {
    if (testingSoundscape && config.soundscape && config.soundscape !== 'none') {
      if (!testSoundscapeRef.current) {
        testSoundscapeRef.current = new Audio();
        testSoundscapeRef.current.loop = true;
      }
      const baseUrl = import.meta.env.BASE_URL || '/';
      const src = `${baseUrl}assets/${config.soundscape}.mp3`;
      if (testSoundscapeRef.current.src !== src) {
        testSoundscapeRef.current.src = src;
      }
      testSoundscapeRef.current.volume = config.volume;
      testSoundscapeRef.current.play().catch(e => console.warn("Preview playback failed:", e));
    } else {
      if (testSoundscapeRef.current) {
        testSoundscapeRef.current.pause();
      }
    }
  }, [testingSoundscape, config.soundscape, config.volume]);

  const handleStart = () => {
    setTestingSoundscape(false);
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
    setTestingSoundscape(false);
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

            <div className="estimated-time-custom">
              <span className="estimated-time-label">{t('estimated_time')}</span>
              <span className="estimated-time-value">{getEstimatedTime()}</span>
            </div>
          </>
        )}

        {/* Ambient audio selection */}
        <div className="soundscape-selector-group">
          <label className="soundscape-label">{t('soundscapeLabel')}</label>
          <div className="soundscape-grid">
            <button 
              type="button"
              className={`soundscape-btn ${config.soundscape === 'none' ? 'active' : ''}`}
              onClick={() => {
                updateConfig({ soundscape: 'none' });
                setTestingSoundscape(false);
              }}
            >
              <span className="soundscape-icon">🔇</span>
              <span className="soundscape-name">{t('soundscape_none')}</span>
            </button>
            <button 
              type="button"
              className={`soundscape-btn ${config.soundscape === 'rain' ? 'active' : ''}`}
              onClick={() => updateConfig({ soundscape: 'rain' })}
            >
              <span className="soundscape-icon">🌧️</span>
              <span className="soundscape-name">{t('soundscape_rain')}</span>
            </button>
            <button 
              type="button"
              className={`soundscape-btn ${config.soundscape === 'ocean' ? 'active' : ''}`}
              onClick={() => updateConfig({ soundscape: 'ocean' })}
            >
              <span className="soundscape-icon">🌊</span>
              <span className="soundscape-name">{t('soundscape_ocean')}</span>
            </button>
            <button 
              type="button"
              className={`soundscape-btn ${config.soundscape === 'wind' ? 'active' : ''}`}
              onClick={() => updateConfig({ soundscape: 'wind' })}
            >
              <span className="soundscape-icon">💨</span>
              <span className="soundscape-name">{t('soundscape_wind')}</span>
            </button>
          </div>
          
          {config.soundscape !== 'none' && (
            <button
              type="button"
              className={`soundscape-test-btn ${testingSoundscape ? 'testing' : ''}`}
              onClick={() => setTestingSoundscape(!testingSoundscape)}
            >
              {testingSoundscape ? `⏹️ ${t('stop_preview')}` : `▶️ ${t('test_soundscape')}`}
            </button>
          )}
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
            className="speed-btn tone-test-btn" 
            onClick={testAudioSignal}
            style={{ padding: '0.45rem 1.2rem', fontSize: '0.85rem', marginTop: '0.4rem', alignSelf: 'center' }}
          >
            {t('test_tone')}
          </button>
        </div>
      </div>

      {/* Buttons */}
      <div className="config-buttons">
        <button className="reset-config-btn" onClick={handleResetConfig}>
          {t('resetConfigBtn')}
        </button>
        <button className="reset-config-btn" onClick={() => { setTestingSoundscape(false); setPhase('stats'); }}>
          {t('statsBtn')}
        </button>
        <button className="start-button" onClick={handleStart}>
          {t('startBtn')}
        </button>
      </div>
    </div>
  );
};
