import React, { createContext, useContext, useEffect, useRef, useCallback } from 'react';
import { useSession, RoundResult } from './SessionContext';
import { useSettings } from './SettingsContext';

let audioCtx: AudioContext | null = null;

export const playTone = (frequency: number, durationMs: number, volume: number, type: OscillatorType = 'sine') => {
  if (volume === 0) return;
  try {
    if (!audioCtx) {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      audioCtx = new AudioCtxClass();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.type = type;
    oscillator.frequency.value = frequency;
    
    // Smooth volume ramp to avoid clicking sounds
    gainNode.gain.setValueAtTime(volume, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + durationMs / 1000);

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    oscillator.start();
    oscillator.stop(audioCtx.currentTime + durationMs / 1000);
  } catch (e) {
    console.warn('Audio not available:', e);
  }
};

export const vibrate = (pattern: number | number[]) => {
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    try {
      navigator.vibrate(pattern);
    } catch (e) {
      console.warn('Vibration not supported or blocked:', e);
    }
  }
};

interface TimerState {
  startSession: () => void;
  stopSession: () => void;
  skipPhase: () => void;
  playTone: (frequency: number, durationMs: number, volume: number, type?: OscillatorType) => void;
}

const TimerContext = createContext<TimerState | null>(null);

export const TimerProvider = ({ children }: { children: React.ReactNode }) => {
  const { config } = useSettings();
  const {
    phase, setPhase,
    currentRound, setCurrentRound,
    timeLeft, setTimeLeft,
    isPlaying, setIsPlaying,
    roundResults, setRoundResults,
    resetSession
  } = useSession();

  const intervalRef = useRef<number | null>(null);
  
  // Track actual seconds spent in current phase for logging
  const secondsInPhaseRef = useRef(0);
  const currentRoundResultsRef = useRef<RoundResult[]>([]);

  // Update ref to avoid dependency cycle in callback
  useEffect(() => {
    currentRoundResultsRef.current = roundResults;
  }, [roundResults]);

  const playTransitionSound = useCallback(() => {
    // Siren-like transition tone using square wave
    const baseFreq = 880; // A5
    playTone(baseFreq, 300, config.volume, 'square');
    setTimeout(() => playTone(baseFreq * 0.8, 300, config.volume, 'square'), 120);
  }, [config.volume]);

  const playCompletionSound = useCallback(() => {
    // Fanfare arpeggio
    const freqs = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    freqs.forEach((freq, i) => {
      setTimeout(() => playTone(freq, i === 3 ? 800 : 200, config.volume, 'sine'), i * 150);
    });
  }, [config.volume]);

  const playWarningBeep = useCallback(() => {
    playTone(587.33, 150, config.volume, 'sine'); // D5 warning beep
  }, [config.volume]);

  const stopTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const finishSession = useCallback(() => {
    stopTimer();
    setIsPlaying(false);
    playCompletionSound();
    vibrate([500, 200, 500, 200, 1000]);
    setPhase('finished');
  }, [setPhase, setIsPlaying, playCompletionSound, stopTimer]);

  const transitionToNext = useCallback(() => {
    stopTimer();
    
    // Save duration of the completed phase into roundResults
    const isHot = phase === 'hot';
    const durationLogged = secondsInPhaseRef.current;
    
    setRoundResults(prev => {
      const existIdx = prev.findIndex(r => r.round === currentRound);
      if (existIdx >= 0) {
        const updated = [...prev];
        updated[existIdx] = {
          ...updated[existIdx],
          hotDuration: isHot ? durationLogged : updated[existIdx].hotDuration,
          coldDuration: !isHot ? durationLogged : updated[existIdx].coldDuration,
        };
        return updated;
      } else {
        return [...prev, {
          round: currentRound,
          hotDuration: isHot ? durationLogged : 0,
          coldDuration: !isHot ? durationLogged : 0,
        }];
      }
    });

    // Determine what phase is next
    if (isHot) {
      // Hot -> Cold
      playTransitionSound();
      vibrate([300, 100, 300]);
      setPhase('cold');
      setTimeLeft(config.coldDuration);
      secondsInPhaseRef.current = 0;
    } else {
      // Cold -> Hot (Next Round) or Finish
      if (currentRound < config.rounds) {
        playTransitionSound();
        vibrate([300, 100, 300]);
        setCurrentRound(r => r + 1);
        
        if (config.hotDuration > 0) {
          setPhase('hot');
          setTimeLeft(config.hotDuration);
        } else {
          setPhase('cold');
          setTimeLeft(config.coldDuration);
        }
        secondsInPhaseRef.current = 0;
      } else {
        // Last round cold finished -> Session finished
        finishSession();
      }
    }
  }, [phase, currentRound, config.rounds, config.hotDuration, config.coldDuration, setPhase, setTimeLeft, setCurrentRound, setRoundResults, playTransitionSound, finishSession, stopTimer]);

  const startSession = () => {
    resetSession();
    setIsPlaying(true);
    setCurrentRound(1);
    secondsInPhaseRef.current = 0;

    if (config.hotDuration > 0) {
      setPhase('hot');
      setTimeLeft(config.hotDuration);
    } else {
      setPhase('cold');
      setTimeLeft(config.coldDuration);
    }
  };

  const stopSession = () => {
    stopTimer();
    setIsPlaying(false);
    resetSession();
  };

  const skipPhase = () => {
    transitionToNext();
  };

  // Timer tick
  useEffect(() => {
    if (isPlaying && (phase === 'hot' || phase === 'cold')) {
      secondsInPhaseRef.current = 0;
      
      intervalRef.current = window.setInterval(() => {
        setTimeLeft(prev => {
          if (prev > 0) {
            const nextVal = prev - 1;
            secondsInPhaseRef.current += 1;
            
            // Sound warnings during last 5 seconds
            if (nextVal <= 5 && nextVal > 0) {
              playWarningBeep();
              vibrate(100);
            }
            return nextVal;
          }
          return 0;
        });
      }, 1000);
    }

    return () => stopTimer();
  }, [isPlaying, phase, playWarningBeep, stopTimer, setTimeLeft]);

  // Phase transition check
  useEffect(() => {
    if (isPlaying && (phase === 'hot' || phase === 'cold') && timeLeft === 0) {
      transitionToNext();
    }
  }, [isPlaying, phase, timeLeft, transitionToNext]);

  return (
    <TimerContext.Provider value={{ startSession, stopSession, skipPhase, playTone }}>
      {children}
    </TimerContext.Provider>
  );
};

export const useTimer = () => {
  const context = useContext(TimerContext);
  if (!context) throw new Error('useTimer must be used within TimerProvider');
  return context;
};
