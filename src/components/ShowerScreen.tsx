import React, { useState } from 'react';
import { useSession } from '../contexts/SessionContext';
import { useSettings } from '../contexts/SettingsContext';
import { useTranslation } from '../hooks/useTranslation';
import { useTimer } from '../contexts/TimerContext';
import { formatTimeDigital } from '../utils/timeFormat';
import { BreathingSphere } from './BreathingSphere';
import { Flame, Snowflake, RotateCcw, Play, Pause, SkipForward, Wind } from 'lucide-react';

export const ShowerScreen = () => {
  const { config } = useSettings();
  const { phase, currentRound, timeLeft, isPlaying, setIsPlaying } = useSession();
  const { skipPhase, stopSession } = useTimer();
  const { t } = useTranslation();

  const [isPacingActive, setIsPacingActive] = useState<boolean>(() => {
    return localStorage.getItem('omega_cold_pacing') === 'true';
  });

  if (phase !== 'hot' && phase !== 'cold') return null;

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const togglePacing = () => {
    setIsPacingActive(prev => {
      const next = !prev;
      localStorage.setItem('omega_cold_pacing', String(next));
      return next;
    });
  };

  const isHot = phase === 'hot';
  const targetDuration = isHot ? config.hotDuration : config.coldDuration;
  // Progress counting up from 0 to 100% as time elapses
  const elapsedSec = Math.max(0, targetDuration - timeLeft);
  const progressPercent = targetDuration > 0 ? (elapsedSec / targetDuration) * 100 : 0;

  // 4s inhale / 6s exhale cold shock pacing
  const cycleSec = elapsedSec % 10;
  const isPacingInhale = cycleSec < 4;

  let sphereScale = isPlaying ? 1.05 : 1.0;
  let durationMs = 300;
  let easing = 'cubic-bezier(0.4, 0, 0.2, 1)';

  if (!isHot && isPacingActive && isPlaying) {
    if (isPacingInhale) {
      sphereScale = 1.25;
      durationMs = 4000;
      easing = 'ease-out';
    } else {
      sphereScale = 0.95;
      durationMs = 6000;
      easing = 'ease-in-out';
    }
  }

  const instructionText = isHot
    ? t('hotPhase', { defaultValue: 'Agua Caliente' })
    : isPacingActive && isPlaying
      ? (isPacingInhale ? t('pacingInhale', { defaultValue: 'Inhala suavemente (4s)' }) : t('pacingExhale', { defaultValue: 'Exhala despacio (6s)' }))
      : t('coldPhase', { defaultValue: 'Agua Fría' });

  return (
    <div id="exerciseScreen" className="screen active shower-screen" style={{ justifyContent: 'space-evenly' }}>
      <div className="round-info">
        {t('roundInfo', { current: currentRound, total: config.rounds })}
      </div>

      <div 
        className="instruction" 
        style={{ 
          color: isHot ? 'var(--omega-warm-amber, #ff7a00)' : 'var(--omega-cold-blue, #00d2ff)', 
          fontSize: '1.3rem', 
          fontWeight: 700,
          minHeight: '2rem'
        }}
      >
        {instructionText}
      </div>

      {/* 4s/6s Breath Pacing Toggle Pill (Cold Phase only) */}
      {!isHot && (
        <button
          type="button"
          onClick={togglePacing}
          className={`pacing-toggle-btn ${isPacingActive ? 'active' : ''}`}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            backgroundColor: isPacingActive ? 'rgba(0, 210, 255, 0.2)' : 'rgba(255, 255, 255, 0.05)',
            border: `1px solid ${isPacingActive ? 'var(--omega-cold-blue, #00d2ff)' : 'rgba(255, 255, 255, 0.15)'}`,
            color: isPacingActive ? '#00d2ff' : 'var(--color-muted)',
            padding: '0.25rem 0.75rem',
            borderRadius: '9999px',
            fontSize: '0.75rem',
            fontWeight: 600,
            cursor: 'pointer',
            margin: '0 auto',
            transition: 'all 0.2s ease'
          }}
          title={t('pacingActiveDesc', { defaultValue: 'Ritmo 4s/6s activo para calmar el reflejo de jadeo' })}
        >
          <Wind size={13} />
          <span>{t('pacingToggleLabel', { defaultValue: 'Ritmo 4s/6s' })}: {isPacingActive ? 'ON' : 'OFF'}</span>
        </button>
      )}

      {/* Wim Hof Sacred Geometry Rounded Hexagon with Perimeter Progress */}
      <BreathingSphere
        phase={phase}
        scale={sphereScale}
        durationMs={durationMs}
        easing={easing}
        isPulsing={isPlaying && !isPacingActive}
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
