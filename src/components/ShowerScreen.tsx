import React from 'react';
import { useSession } from '../contexts/SessionContext';
import { useSettings } from '../contexts/SettingsContext';
import { useTranslation } from '../hooks/useTranslation';
import { useTimer } from '../contexts/TimerContext';
import { formatTimeDigital } from '../utils/timeFormat';
import { BreathingSphere } from './BreathingSphere';
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

  const isHot = phase === 'hot';
  const targetDuration = isHot ? config.hotDuration : config.coldDuration;
  // Progress counting up from 0 to 100% as time elapses
  const elapsedSec = Math.max(0, targetDuration - timeLeft);
  const progressPercent = targetDuration > 0 ? (elapsedSec / targetDuration) * 100 : 0;

  return (
    <div id="exerciseScreen" className="screen active shower-screen" style={{ justifyContent: 'space-evenly' }}>
      <div className="round-info">
        {t('roundInfo', { current: currentRound, total: config.rounds })}
      </div>

      <div 
        className="instruction" 
        style={{ 
          color: isHot ? 'var(--omega-warm-amber, #ff7a00)' : 'var(--omega-cold-blue, #00d2ff)', 
          fontSize: '1.4rem', 
          fontWeight: 700 
        }}
      >
        {isHot ? t('hotPhase', { defaultValue: 'Agua Caliente' }) : t('coldPhase', { defaultValue: 'Agua Fría' })}
      </div>

      {/* Wim Hof Sacred Geometry Rounded Hexagon with Perimeter Progress */}
      <BreathingSphere
        phase={phase}
        scale={isPlaying ? 1.05 : 1.0}
        isPulsing={isPlaying}
        progress={progressPercent}
        icon={isHot ? <Flame size={54} color="white" /> : <Snowflake size={54} color="white" />}
        onClick={handlePlayPause}
      />

      <div className="timer-display" style={{ margin: '0.4rem 0' }}>
        {formatTimeDigital(timeLeft)}
      </div>

      {/* Up Next Preview */}
      {isHot && (
        <div style={{ fontSize: '0.85rem', color: 'var(--color-muted)', display: 'flex', gap: '0.4rem', justifyContent: 'center', alignItems: 'center' }}>
          <span>{t('nextPhaseLabel', { defaultValue: 'Siguiente:' })}</span>
          <span style={{ color: 'var(--omega-cold-blue, #00d2ff)', fontWeight: 600 }}>
            {t('coldPhase', { defaultValue: 'Frío' })} ({formatTimeDigital(config.coldDuration)})
          </span>
        </div>
      )}

      {/* Controls Panel */}
      <div className="controls-panel" style={{ marginTop: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
        <button 
          className="control-btn" 
          title="Reiniciar"
          onClick={stopSession}
          aria-label="Reiniciar sesión"
        >
          <RotateCcw size={22} />
        </button>
        <button 
          className="control-btn primary-btn" 
          onClick={handlePlayPause}
          title={isPlaying ? 'Pausa' : 'Reanudar'}
          aria-label={isPlaying ? 'Pausa' : 'Reanudar'}
        >
          {isPlaying ? <Pause size={28} fill="currentColor" /> : <Play size={28} fill="currentColor" />}
        </button>
        <button 
          className="control-btn" 
          title="Saltar fase"
          onClick={skipPhase}
          aria-label="Saltar fase"
        >
          <SkipForward size={22} />
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
