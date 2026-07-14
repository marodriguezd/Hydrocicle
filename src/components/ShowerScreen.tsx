import React from 'react';
import { useSession } from '../contexts/SessionContext';
import { useSettings } from '../contexts/SettingsContext';
import { useTranslation } from '../hooks/useTranslation';
import { useTimer } from '../contexts/TimerContext';
import { formatTimeDigital } from '../utils/timeFormat';
import { Flame, Snowflake, RotateCcw, Play, Pause, SkipForward } from 'lucide-react';

export const ShowerScreen = () => {
  const { config } = useSettings();
  const { phase, currentRound, timeLeft, isPlaying, setIsPlaying } = useSession();
  const { skipPhase, stopSession } = useTimer();
  const { t } = useTranslation();

  if (phase !== 'hot' && phase !== 'cold') return null;

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  // Determine styles for the pulsing hexagon based on the phase
  const isHot = phase === 'hot';
  const progressPercent = isHot
    ? (timeLeft / config.hotDuration) * 100
    : (timeLeft / config.coldDuration) * 100;

  // Render a visual SVG border indicator that rotates/pulses around the hexagon
  return (
    <div id="exerciseScreen" className="screen active" style={{ justifyContent: 'space-evenly' }}>
      <div className="round-info">
        {t('roundInfo', { current: currentRound, total: config.rounds })}
      </div>

      <div className="instruction" style={{ color: isHot ? '#e67e22' : '#3498db', fontSize: '1.5rem', fontWeight: 700 }}>
        {isHot ? t('hotPhase') : t('coldPhase')}
      </div>

      <div className="hexagon-container" style={{ margin: '1.5rem auto' }}>
        <div 
          className={`hexagon phase-${phase} ${isPlaying ? 'pulsing' : ''}`}
          style={{
            transform: isPlaying ? 'scale(1.05)' : 'scale(1.0)',
            transition: 'transform 1s ease-in-out infinite alternate',
            width: '10rem',
            height: '8.6rem'
          }}
        >
          <div className="breath-counter" style={{ fontSize: '3.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {isHot ? <Flame size={56} color="white" /> : <Snowflake size={56} color="white" />}
          </div>
        </div>
      </div>

      <div className="timer-display">
        {formatTimeDigital(timeLeft)}
      </div>

      {/* Up Next Preview */}
      {isHot && (
        <div style={{ fontSize: '0.85rem', color: 'var(--color-muted)', display: 'flex', gap: '0.4rem', justifyContent: 'center', alignItems: 'center' }}>
          <span>{t('nextPhaseLabel')}</span>
          <span style={{ color: '#3498db', fontWeight: 600 }}>
            {t('coldPhase')} ({formatTimeDigital(config.coldDuration)})
          </span>
        </div>
      )}

      {/* Controls Panel */}
      <div className="controls-panel" style={{ marginTop: '1rem' }}>
        <button 
          className="control-btn" 
          title="Reset"
          onClick={stopSession}
        >
          <span style={{ fontSize: '1.2rem', display: 'flex' }}><RotateCcw size={24} /></span>
        </button>
        <button 
          className="control-btn primary-btn" 
          onClick={handlePlayPause}
          title={isPlaying ? 'Pause' : 'Play'}
        >
          <span style={{ fontSize: '1.5rem', display: 'flex' }}>{isPlaying ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" />}</span>
        </button>
        <button 
          className="control-btn" 
          title="Skip"
          onClick={skipPhase}
        >
          <span style={{ fontSize: '1.2rem', display: 'flex' }}><SkipForward size={24} /></span>
        </button>
      </div>

      <div className="timer-footer">
        <button className="skip-button" onClick={skipPhase}>
          {isHot ? t('skipToColdBtn') : (currentRound === config.rounds ? t('finishBtn') : t('skipToHotBtn'))}
        </button>
      </div>
    </div>
  );
};
