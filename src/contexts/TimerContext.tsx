import React, { createContext, useContext, useEffect, useRef, useCallback } from 'react';
import { useSession, RoundResult } from './SessionContext';
import { useSettings } from './SettingsContext';
import {
  playTransitionCue,
  playCompletionFanfare,
  playCountdownBeep,
  playWaterMilestoneCue,
  triggerHaptic
} from '../services/zenAudioService';

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
    
    // Double the gain (2x boost) so synthesized audio cues cut through background music
    const effectiveVolume = volume * 2;
    gainNode.gain.setValueAtTime(effectiveVolume, audioCtx.currentTime);
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
  triggerHaptic('medium', pattern).catch(() => {});
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
  const phaseStartTimeRef = useRef<number | null>(null);
  const accumulatedPhaseMsRef = useRef<number>(0);
  const phaseTargetSecRef = useRef<number>(0);
  const lastWarningSecRef = useRef<number | null>(null);
  const lastMilestoneSecRef = useRef<number | null>(null);
  
  // Track actual seconds spent in current phase for logging
  const secondsInPhaseRef = useRef(0);
  const currentRoundResultsRef = useRef<RoundResult[]>([]);

  // Update ref to avoid dependency cycle in callback
  useEffect(() => {
    currentRoundResultsRef.current = roundResults;
  }, [roundResults]);

  const playTransitionSound = useCallback((targetPhase: 'hot' | 'cold') => {
    playTransitionCue(targetPhase, config.volume);
  }, [config.volume]);

  const playCompletionSound = useCallback(() => {
    playCompletionFanfare(config.volume);
  }, [config.volume]);

  const playWarningBeep = useCallback((secRemaining: number) => {
    playCountdownBeep(config.volume, secRemaining);
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
    phaseStartTimeRef.current = null;
    accumulatedPhaseMsRef.current = 0;
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

    accumulatedPhaseMsRef.current = 0;
    lastWarningSecRef.current = null;
    lastMilestoneSecRef.current = null;
    phaseStartTimeRef.current = Date.now();

    // Determine what phase is next
    if (isHot) {
      // Hot -> Cold
      playTransitionSound('cold');
      vibrate([300, 100, 300]);
      setPhase('cold');
      setTimeLeft(config.coldDuration);
      phaseTargetSecRef.current = config.coldDuration;
      secondsInPhaseRef.current = 0;
    } else {
      // Cold -> Hot (Next Round) or Finish
      if (currentRound < config.rounds) {
        playTransitionSound('hot');
        vibrate([300, 100, 300]);
        setCurrentRound(r => r + 1);
        
        if (config.hotDuration > 0) {
          setPhase('hot');
          setTimeLeft(config.hotDuration);
          phaseTargetSecRef.current = config.hotDuration;
        } else {
          setPhase('cold');
          setTimeLeft(config.coldDuration);
          phaseTargetSecRef.current = config.coldDuration;
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
    accumulatedPhaseMsRef.current = 0;
    lastWarningSecRef.current = null;
    lastMilestoneSecRef.current = null;

    const initialPhase = config.hotDuration > 0 ? 'hot' : 'cold';
    const initialDuration = initialPhase === 'hot' ? config.hotDuration : config.coldDuration;
    phaseTargetSecRef.current = initialDuration;
    setPhase(initialPhase);
    setTimeLeft(initialDuration);
    phaseStartTimeRef.current = Date.now();
  };

  const stopSession = () => {
    stopTimer();
    setIsPlaying(false);
    phaseStartTimeRef.current = null;
    accumulatedPhaseMsRef.current = 0;
    lastMilestoneSecRef.current = null;
    resetSession();
  };

  const skipPhase = () => {
    transitionToNext();
  };

  // High-precision timer tick
  useEffect(() => {
    if (isPlaying && (phase === 'hot' || phase === 'cold')) {
      phaseStartTimeRef.current = Date.now();

      intervalRef.current = window.setInterval(() => {
        if (!phaseStartTimeRef.current) return;
        const now = Date.now();
        const currentPhaseMs = accumulatedPhaseMsRef.current + (now - phaseStartTimeRef.current);
        const elapsedSec = Math.floor(currentPhaseMs / 1000);
        const remaining = Math.max(0, phaseTargetSecRef.current - elapsedSec);

        secondsInPhaseRef.current = elapsedSec;
        setTimeLeft(remaining);

        // Acoustic water milestone chimes at 15s, 30s, 45s, 60s, and every 30s beyond during cold phase
        if (
          phase === 'cold' &&
          (elapsedSec === 15 || elapsedSec === 30 || elapsedSec === 45 || elapsedSec === 60 || (elapsedSec > 60 && elapsedSec % 30 === 0)) &&
          elapsedSec !== lastMilestoneSecRef.current &&
          remaining > 5
        ) {
          lastMilestoneSecRef.current = elapsedSec;
          playWaterMilestoneCue(config.volume, elapsedSec);
          vibrate([150, 100, 250]);
        }

        // Sound warnings during last 5 seconds (5, 4, 3, 2, 1)
        if (remaining <= 5 && remaining > 0 && remaining !== lastWarningSecRef.current) {
          lastWarningSecRef.current = remaining;
          playWarningBeep(remaining);
          vibrate(100);
        }
      }, 200);
    } else {
      // When paused: accumulate elapsed time and clear active interval
      if (phaseStartTimeRef.current) {
        accumulatedPhaseMsRef.current += Date.now() - phaseStartTimeRef.current;
        phaseStartTimeRef.current = null;
      }
      stopTimer();
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
