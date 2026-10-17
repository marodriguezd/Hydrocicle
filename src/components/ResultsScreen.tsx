import React, { useState, useEffect, useRef } from 'react';
import { useSession } from '../contexts/SessionContext';
import { useHistory } from '../contexts/HistoryContext';
import { useSettings } from '../contexts/SettingsContext';
import { useTranslation } from '../hooks/useTranslation';
import { formatTime, formatTimeDigital } from '../utils/timeFormat';
import { Flame, Snowflake, Trophy, Thermometer, Sparkles } from 'lucide-react';

const COLD_SENSATION_OPTIONS = [
  { id: 'no_shivering', labelKey: 'sensation_no_shivering', defaultLabel: 'Sin temblores', icon: '🛡️' },
  { id: 'core_control', labelKey: 'sensation_core_control', defaultLabel: 'Control del core', icon: '🔥' },
  { id: 'energized', labelKey: 'sensation_energized', defaultLabel: 'Vigor total', icon: '⚡' },
  { id: 'quiet_mind', labelKey: 'sensation_quiet_mind', defaultLabel: 'Mente en silencio', icon: '🧠' }
];

export const ResultsScreen = () => {
  const { phase, resetSession, roundResults } = useSession();
  const { config } = useSettings();
  const { addSession, updateSession, currentStreak, longestStreak } = useHistory();
  const { t } = useTranslation();
  const savedRef = useRef(false);
  const savedIdRef = useRef<string | null>(null);
  const [tempValue, setTempValue] = useState<number | null>(null);
  const [tempUnit, setTempUnit] = useState<'C' | 'F'>('C');
  const [selectedSensations, setSelectedSensations] = useState<string[]>([]);

  const totalTime = roundResults.reduce((acc, r) => acc + r.hotDuration + r.coldDuration, 0);
  const totalColdTime = roundResults.reduce((acc, r) => acc + r.coldDuration, 0);
  const averageColdTime = roundResults.length > 0 
    ? Math.round(totalColdTime / roundResults.length) 
    : 0;

  useEffect(() => {
    if (phase === 'finished' && !savedRef.current) {
      const id = addSession({
        rounds: roundResults.length || config.rounds,
        hotDuration: config.hotDuration,
        coldDuration: config.coldDuration,
        totalColdTime,
        totalTime,
        waterTemp: tempValue ?? undefined,
        tempUnit: tempUnit,
        sensations: selectedSensations
      });
      savedIdRef.current = id;
      savedRef.current = true;
    }
  }, [phase, addSession, totalTime, totalColdTime, roundResults.length, config.hotDuration, config.coldDuration, config.rounds]);

  const handleIncreaseTemp = () => {
    const next = tempValue === null ? (tempUnit === 'C' ? 12 : 54) : tempValue + 1;
    setTempValue(next);
    if (savedIdRef.current) {
      updateSession(savedIdRef.current, { waterTemp: next, tempUnit });
    }
  };

  const handleDecreaseTemp = () => {
    const next = tempValue === null ? (tempUnit === 'C' ? 12 : 54) : Math.max(0, tempValue - 1);
    setTempValue(next);
    if (savedIdRef.current) {
      updateSession(savedIdRef.current, { waterTemp: next, tempUnit });
    }
  };

  const handleToggleUnit = () => {
    const nextUnit = tempUnit === 'C' ? 'F' : 'C';
    let nextVal = tempValue;
    if (tempValue !== null) {
      nextVal = nextUnit === 'F' ? Math.round(tempValue * 1.8 + 32) : Math.round((tempValue - 32) / 1.8);
      setTempValue(nextVal);
    }
    setTempUnit(nextUnit);
    if (savedIdRef.current) {
      updateSession(savedIdRef.current, { waterTemp: nextVal ?? undefined, tempUnit: nextUnit });
    }
  };

  const handleClearTemp = () => {
    setTempValue(null);
    if (savedIdRef.current) {
      updateSession(savedIdRef.current, { waterTemp: undefined, tempUnit });
    }
  };

  const toggleSensation = (id: string) => {
    const next = selectedSensations.includes(id)
      ? selectedSensations.filter(s => s !== id)
      : [...selectedSensations, id];
    setSelectedSensations(next);

    if (savedIdRef.current) {
      updateSession(savedIdRef.current, { sensations: next });
      try {
        const storeStr = localStorage.getItem('omega_wimhof_store');
        if (storeStr) {
          const store = JSON.parse(storeStr);
          if (store.coldHistory && store.coldHistory[0]) {
            store.coldHistory[0].sensations = next;
            localStorage.setItem('omega_wimhof_store', JSON.stringify(store));
            window.dispatchEvent(new CustomEvent('omega-store-update'));
          }
        }
      } catch (e) {}
    }
  };

  // Reset saved flag when session resets
  useEffect(() => {
    if (phase === 'idle') {
      savedRef.current = false;
      savedIdRef.current = null;
      setTempValue(null);
      setSelectedSensations([]);
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

        {/* Cold Exposure Bodily Response Check-in Chips */}
        <div style={{
          margin: '1.2rem auto',
          maxWidth: '340px',
          background: 'rgba(255, 255, 255, 0.04)',
          borderRadius: '16px',
          border: '1px solid var(--color-glass-border)',
          padding: '0.8rem 0.9rem',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--omega-cold-blue, #00d2ff)', marginBottom: '0.6rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}>
            <Sparkles size={16} />
            <span>{t('coldSensationTitle', { defaultValue: 'Respuesta al frío (opcional)' })}</span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem', justifyContent: 'center' }}>
            {COLD_SENSATION_OPTIONS.map((opt) => {
              const active = selectedSensations.includes(opt.id);
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => toggleSensation(opt.id)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    background: active ? 'rgba(0, 210, 255, 0.22)' : 'rgba(255, 255, 255, 0.06)',
                    border: active ? '1px solid var(--omega-cold-blue, #00d2ff)' : '1px solid rgba(255, 255, 255, 0.12)',
                    color: active ? '#00d2ff' : 'var(--color-muted)',
                    borderRadius: '9999px',
                    padding: '0.3rem 0.65rem',
                    fontSize: '0.78rem',
                    fontWeight: active ? 700 : 500,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <span>{opt.icon}</span>
                  <span>{t(opt.labelKey, { defaultValue: opt.defaultLabel })}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Optional Water Temperature Stepper */}
        <div style={{
          margin: '1.2rem auto',
          maxWidth: '320px',
          background: 'rgba(255, 255, 255, 0.04)',
          borderRadius: '16px',
          border: '1px solid var(--color-glass-border)',
          padding: '0.85rem 1rem',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--omega-cold-blue, #00d2ff)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}>
            <Thermometer size={16} />
            <span>{t('waterTempOptional', { defaultValue: 'Temperatura del agua (opcional)' })}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.8rem', marginTop: '0.4rem' }}>
            <button
              type="button"
              className="control-btn"
              style={{ width: '36px', height: '36px', minWidth: '36px', padding: 0, fontSize: '1.1rem' }}
              onClick={handleDecreaseTemp}
            >
              -
            </button>

            <div style={{ minWidth: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem' }}>
              <span style={{ fontSize: '1.3rem', fontWeight: 800, color: '#fff' }}>
                {tempValue !== null ? tempValue : '--'}
              </span>
              <button
                type="button"
                onClick={handleToggleUnit}
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  color: '#00d2ff',
                  borderRadius: '6px',
                  padding: '2px 6px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                °{tempUnit}
              </button>
            </div>

            <button
              type="button"
              className="control-btn"
              style={{ width: '36px', height: '36px', minWidth: '36px', padding: 0, fontSize: '1.1rem' }}
              onClick={handleIncreaseTemp}
            >
              +
            </button>
          </div>

          {tempValue !== null && (
            <button
              type="button"
              onClick={handleClearTemp}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--color-muted)',
                fontSize: '0.72rem',
                marginTop: '0.4rem',
                textDecoration: 'underline',
                cursor: 'pointer'
              }}
            >
              {t('clearTemp', { defaultValue: 'Borrar temperatura' })}
            </button>
          )}
        </div>

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
