import React, { useEffect, useRef } from 'react';
import { useSession } from '../contexts/SessionContext';
import { useHistory } from '../contexts/HistoryContext';
import { useSettings } from '../contexts/SettingsContext';
import { useTranslation } from '../hooks/useTranslation';
import { formatTime, formatTimeDigital } from '../utils/timeFormat';
import { Flame, Snowflake, Trophy } from 'lucide-react';

export const ResultsScreen = () => {
  const { phase, resetSession, roundResults } = useSession();
  const { config } = useSettings();
  const { addSession, currentStreak, longestStreak } = useHistory();
  const { t } = useTranslation();
  const savedRef = useRef(false);

  const totalTime = roundResults.reduce((acc, r) => acc + r.hotDuration + r.coldDuration, 0);
  const totalColdTime = roundResults.reduce((acc, r) => acc + r.coldDuration, 0);
  const averageColdTime = roundResults.length > 0 
    ? Math.round(totalColdTime / roundResults.length) 
    : 0;

  useEffect(() => {
    if (phase === 'finished' && !savedRef.current) {
      addSession({
        rounds: roundResults.length || config.rounds,
        hotDuration: config.hotDuration,
        coldDuration: config.coldDuration,
        totalColdTime,
        totalTime
      });
      savedRef.current = true;
    }
  }, [phase, addSession, totalTime, totalColdTime, roundResults.length, config.hotDuration, config.coldDuration, config.rounds]);

  // Reset saved flag when session resets
  useEffect(() => {
    if (phase === 'idle') {
      savedRef.current = false;
    }
  }, [phase]);

  if (phase !== 'finished') return null;

  return (
    <div id="resultsScreen" className="screen active">
      <div className="results-title">{t('resultsTitle')}</div>
      
      <div id="resultsContent" style={{ marginBottom: '2rem', textAlign: 'center' }}>
        <p style={{ fontSize: '1.25rem', marginBottom: '0.6rem', color: '#fff' }}>
          {t('totalTimeLabel')}: <strong>{formatTime(totalTime)}</strong>
        </p>
        <p style={{ fontSize: '1.15rem', marginBottom: '1rem', color: '#3498db' }}>
          {t('totalColdTimeLabel')}: <strong>{formatTime(totalColdTime)}</strong>
        </p>
        <p style={{ fontSize: '1rem', marginBottom: '1rem', color: '#fff', opacity: 0.8 }}>
          {t('averageLabel')}: <strong>{formatTime(averageColdTime)}</strong>
        </p>
        
        {roundResults.length > 0 && (
          <div style={{ margin: '1.5rem auto', maxWidth: '320px', textAlign: 'left', background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '16px', border: '1px solid var(--color-glass-border)' }}>
            {roundResults.map((r) => (
              <div key={r.round} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                <span style={{ fontSize: '0.9rem', opacity: 0.8 }}>{t('roundLabel', { round: r.round })}:</span>
                <span style={{ fontSize: '0.9rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                  {config.hotDuration > 0 && <><Flame size={14} color="var(--color-accent)" /> {formatTimeDigital(r.hotDuration)} | </>}<Snowflake size={14} color="#3498db" /> {formatTimeDigital(r.coldDuration)}
                </span>
              </div>
            ))}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', margin: '1rem 0' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ fontSize: '1.5rem', display: 'flex' }}><Flame size={32} color="var(--color-accent)" /></div>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-accent)' }}>{currentStreak}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--color-muted)' }}>{t('currentStreak')}</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ fontSize: '1.5rem', display: 'flex' }}><Trophy size={32} color="#f1c40f" /></div>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff' }}>{longestStreak}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--color-muted)' }}>{t('bestStreak')}</div>
          </div>
        </div>
      </div>

      <button className="start-button" onClick={resetSession}>{t('newSessionBtn')}</button>
    </div>
  );
};
