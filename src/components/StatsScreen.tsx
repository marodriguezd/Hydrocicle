import React from 'react';
import { useSession } from '../contexts/SessionContext';
import { useHistory } from '../contexts/HistoryContext';
import { useTranslation } from '../hooks/useTranslation';
import { formatTime } from '../utils/timeFormat';
import { Snowflake, Droplet, Timer, X } from 'lucide-react';

export const StatsScreen = () => {
  const { phase, setPhase } = useSession();
  const { history, currentStreak, longestStreak, removeSession, clearHistory } = useHistory();
  const { t } = useTranslation();

  const handleDelete = (id: string) => {
    if (window.confirm(t('confirmDelete'))) {
      removeSession(id);
    }
  };

  const handleClearHistory = () => {
    if (window.confirm(t('clear_history_confirm'))) {
      clearHistory();
    }
  };

  if (phase !== 'stats') return null;

  const totalSessions = history.length;
  const totalColdTime = history.reduce((acc, curr) => acc + curr.totalColdTime, 0);
  const averageCold = totalSessions > 0 ? Math.round(totalColdTime / totalSessions) : 0;

  return (
    <div id="statsScreen" className="screen active stats-screen">
      <h2 className="stats-title">{t('statsTitle')}</h2>
      
      <div className="stats-grid">
        <div className="stats-card">
          <div className="stats-value primary">{currentStreak}</div>
          <div className="stats-label">{t('currentStreak')}</div>
        </div>
        <div className="stats-card">
          <div className="stats-value primary">{longestStreak}</div>
          <div className="stats-label">{t('bestStreak')}</div>
        </div>
        <div className="stats-card">
          <div className="stats-value small">{totalSessions}</div>
          <div className="stats-label">{t('totalSessions')}</div>
        </div>
        <div className="stats-card">
          <div className="stats-value small">{formatTime(averageCold)}</div>
          <div className="stats-label">{t('averageCold')}</div>
        </div>
      </div>

      <div className="history-section">
        <h3 className="history-title">{t('recentSessions')}</h3>
        {history.length === 0 ? (
          <p style={{ color: 'var(--color-text)', textAlign: 'center', opacity: 0.7 }}>
            {t('noSessionsYet')}
          </p>
        ) : (
          <div className="history-list">
            {history.slice(0, 10).map((session, idx) => {
              let StatusIconComponent = Snowflake;
              let statusDotColor = '#3498db';
              
              if (session.totalColdTime >= 180) {
                StatusIconComponent = Snowflake; // Ice cream or something else? Just snowflake is fine
                statusDotColor = '#1abc9c';
              } else if (session.totalColdTime >= 60) {
                StatusIconComponent = Droplet;
                statusDotColor = '#3498db';
              } else {
                StatusIconComponent = Timer;
                statusDotColor = 'var(--color-accent)';
              }

              return (
                <div key={session.id || idx} className="history-item">
                  <div className="history-item-left">
                    <span className="history-status-dot" style={{ backgroundColor: statusDotColor, color: statusDotColor }}></span>
                    <span className="history-icon" style={{ display: 'flex' }}><StatusIconComponent size={20} color={statusDotColor} /></span>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span className="history-date">{new Date(session.date).toLocaleDateString()}</span>
                      <span className="history-date" style={{ fontSize: '0.85em', opacity: 0.8, marginTop: '2px' }}>
                        {new Date(session.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                  <strong className="history-detail" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span>
                      {formatTime(session.totalColdTime)} ({session.rounds} {session.rounds === 1 ? t('roundSingular') : t('roundsPlural')})
                    </span>
                    <button 
                      onClick={() => handleDelete(session.id)}
                      title={t('delete')}
                      style={{ background: 'none', border: 'none', color: '#ff4444', cursor: 'pointer', display: 'flex', padding: '0 4px' }}
                    >
                      <X size={18} />
                    </button>
                  </strong>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="config-buttons" style={{ marginTop: 'auto', gap: '10px', justifyContent: 'center' }}>
        <button 
          className="reset-config-btn back-btn" 
          onClick={handleClearHistory} 
          style={{ margin: 0, backgroundColor: 'rgba(255, 68, 68, 0.1)', color: '#ff4444', borderColor: 'rgba(255, 68, 68, 0.3)' }}
          disabled={history.length === 0}
        >
          {t('clear_history_button')}
        </button>
        <button className="reset-config-btn back-btn" onClick={() => setPhase('idle')} style={{ margin: 0 }}>
          {t('backBtn')}
        </button>
      </div>
    </div>
  );
};
