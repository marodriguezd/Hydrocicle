import React, { createContext, useState, useContext } from 'react';

export type SessionPhase = 'idle' | 'hot' | 'cold' | 'finished' | 'stats';

export interface RoundResult {
  round: number;
  hotDuration: number;
  coldDuration: number;
}

interface SessionState {
  phase: SessionPhase;
  currentRound: number;
  timeLeft: number;
  isPlaying: boolean;
  roundResults: RoundResult[];
  setPhase: (phase: SessionPhase) => void;
  setCurrentRound: (round: number | ((prev: number) => number)) => void;
  setTimeLeft: (timeLeft: number | ((prev: number) => number)) => void;
  setIsPlaying: (isPlaying: boolean) => void;
  setRoundResults: React.Dispatch<React.SetStateAction<RoundResult[]>>;
  resetSession: () => void;
}

export const SessionContext = createContext<SessionState | null>(null);

export const SessionProvider = ({ children }: { children: React.ReactNode }) => {
  const [phase, setPhase] = useState<SessionPhase>('idle');
  const [currentRound, setCurrentRound] = useState(1);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [roundResults, setRoundResults] = useState<RoundResult[]>([]);

  const resetSession = () => {
    setPhase('idle');
    setCurrentRound(1);
    setTimeLeft(0);
    setIsPlaying(false);
    setRoundResults([]);
  };

  const phaseRef = React.useRef<SessionPhase>(phase);
  React.useEffect(() => {
    phaseRef.current = phase;
    const isActive = phase === 'hot' || phase === 'cold';
    window.dispatchEvent(new CustomEvent('omega-session-state', {
      detail: { active: isActive, isPlaying, app: 'hydro' }
    }));
  }, [phase, isPlaying]);

  React.useEffect(() => {
    const handlePauseSession = (e: any) => {
      if (e.detail?.exit) {
        resetSession();
      } else if (typeof e.detail?.pause === 'boolean') {
        if (e.detail.pause) {
          setIsPlaying(false);
        } else if (phaseRef.current === 'hot' || phaseRef.current === 'cold') {
          setIsPlaying(true);
        }
      }
    };
    window.addEventListener('omega-pause-session', handlePauseSession);
    return () => window.removeEventListener('omega-pause-session', handlePauseSession);
  }, []);

  return (
    <SessionContext.Provider value={{
      phase, setPhase,
      currentRound, setCurrentRound,
      timeLeft, setTimeLeft,
      isPlaying, setIsPlaying,
      roundResults, setRoundResults,
      resetSession
    }}>
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = () => {
  const context = useContext(SessionContext);
  if (!context) throw new Error('useSession must be used within SessionProvider');
  return context;
};
