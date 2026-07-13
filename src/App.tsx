import React from 'react';
import './index.css';
import './translations.js';

import { SettingsProvider } from './contexts/SettingsContext';
import { SessionProvider, useSession } from './contexts/SessionContext';
import { HistoryProvider } from './contexts/HistoryContext';
import { useShowerTimer } from './hooks/useShowerTimer';

import { Header } from './components/Header';
import { ConfigScreen } from './components/ConfigScreen';
import { ShowerScreen } from './components/ShowerScreen';
import { ResultsScreen } from './components/ResultsScreen';
import { StatsScreen } from './components/StatsScreen';
import { SoundscapeManager } from './components/SoundscapeManager';

const MainApp = () => {
  const { phase } = useSession();
  
  // Mounted inside the providers to run the timer logic
  useShowerTimer();

  return (
    <div className="container">
      <SoundscapeManager />
      <Header />
      {phase === 'idle' && <ConfigScreen />}
      {(phase === 'hot' || phase === 'cold') && <ShowerScreen />}
      {phase === 'finished' && <ResultsScreen />}
      {phase === 'stats' && <StatsScreen />}
    </div>
  );
};

function App() {
  return (
    <SettingsProvider>
      <SessionProvider>
        <HistoryProvider>
          <MainApp />
        </HistoryProvider>
      </SessionProvider>
    </SettingsProvider>
  );
}

export default App;
