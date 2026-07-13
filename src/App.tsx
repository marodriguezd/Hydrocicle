import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Pause, RotateCcw, Flame, Snowflake, Settings2, Bell, Volume2 } from 'lucide-react';

// --- Audio Utility ---
const playBeep = (frequency: number, duration: number, volume: number = 0.1, multiplier: number = 1, type: OscillatorType = 'square') => {
  try {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, audioCtx.currentTime);
    
    const finalVolume = volume * multiplier; 
    gainNode.gain.setValueAtTime(finalVolume, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);

    oscillator.start();
    oscillator.stop(audioCtx.currentTime + duration);
  } catch (e) {
    console.error("Audio context error:", e);
  }
};

const playTransitionSound = (multiplier: number) => {
  // Ultra-aggressive siren for transition
  const baseFreq = 987.77; // B5
  playBeep(baseFreq, 0.4, 0.3, multiplier, 'square');
  setTimeout(() => playBeep(baseFreq * 0.5, 0.4, 0.3, multiplier, 'square'), 100);
  setTimeout(() => playBeep(baseFreq, 0.4, 0.3, multiplier, 'square'), 200);
  setTimeout(() => playBeep(baseFreq * 0.5, 0.6, 0.3, multiplier, 'square'), 300);
};

const playCompletionSound = (multiplier: number) => {
  // Arpeggio fanfare
  const freqs = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
  freqs.forEach((freq, i) => {
    setTimeout(() => playBeep(freq, i === 3 ? 0.8 : 0.2, 0.3, multiplier, 'square'), i * 150);
  });
};

const playAlertBeep = (multiplier: number) => {
  playBeep(660, 0.2, 0.15, multiplier, 'square');
};

// --- Components ---

type Phase = 'idle' | 'hot' | 'cold' | 'finished';

export default function App() {
  const [hotDuration, setHotDuration] = useState(120); // 2 minutes
  const [coldDuration, setColdDuration] = useState(60); // 1 minute
  const [loudness, setLoudness] = useState(100); // 100% to 1000%
  const [timeLeft, setTimeLeft] = useState(120);
  const [phase, setPhase] = useState<Phase>('idle');
  const [isActive, setIsActive] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const presets = [
    { name: 'Standard', hot: 120, cold: 60, label: '2m / 1m' },
    { name: 'Extended', hot: 300, cold: 120, label: '5m / 2m' },
  ];

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // New multiplier logic: 100% = 20x original, 1000% = 200x original
  const loudnessMultiplier = loudness / 5;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const vibrate = (pattern: number | number[]) => {
    if ('vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
  };

  const handleStart = () => {
    if (phase === 'idle' || phase === 'finished') {
      setPhase('hot');
      setTimeLeft(hotDuration);
    }
    setIsActive(true);
  };

  const handlePause = () => {
    setIsActive(false);
  };

  const handleReset = () => {
    setIsActive(false);
    setPhase('idle');
    setTimeLeft(hotDuration);
  };

  const applyPreset = (hot: number, cold: number) => {
    setHotDuration(hot);
    setColdDuration(cold);
    if (!isActive) {
      setTimeLeft(hot);
      setPhase('idle');
    }
  };

  const nextPhase = useCallback(() => {
    if (phase === 'hot') {
      playTransitionSound(loudnessMultiplier);
      vibrate([300, 100, 300, 100, 300]);
      setPhase('cold');
      setTimeLeft(coldDuration);
    } else if (phase === 'cold') {
      playCompletionSound(loudnessMultiplier);
      vibrate([500, 200, 500, 200, 1000]);
      setPhase('finished');
      setIsActive(false);
    }
  }, [phase, coldDuration, loudnessMultiplier]);

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          const next = prev - 1;
          
          // Alert in last 5 seconds - make them shorter and more intense as it nears 0
          if (next <= 5 && next > 0) {
            playAlertBeep(loudnessMultiplier);
            vibrate(150);
          }
          
          return next;
        });
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      nextPhase();
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, timeLeft, nextPhase, loudnessMultiplier]);

  // Update timeLeft when durations change if idle
  useEffect(() => {
    if (phase === 'idle') {
      setTimeLeft(hotDuration);
    }
  }, [hotDuration, phase]);

  const progress = phase === 'hot' 
    ? (timeLeft / hotDuration) * 100 
    : phase === 'cold' 
      ? (timeLeft / coldDuration) * 100 
      : 100;

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-6 transition-colors duration-1000 ${
      phase === 'hot' ? 'bg-red-950/20' : phase === 'cold' ? 'bg-blue-950/20' : 'bg-slate-950'
    }`}>
      {/* Background Ambience Bloom */}
      <div className={`fixed inset-0 pointer-events-none transition-opacity duration-1000 ${phase === 'hot' ? 'opacity-100' : 'opacity-0'}`}>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] rounded-full bg-red-600/10 blur-[120px]" />
      </div>
      <div className={`fixed inset-0 pointer-events-none transition-opacity duration-1000 ${phase === 'cold' ? 'opacity-100' : 'opacity-0'}`}>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] rounded-full bg-blue-600/10 blur-[120px]" />
      </div>

      <div className="w-full max-w-md space-y-8 relative z-10">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-block px-4 py-1.5 rounded-full bg-white/5 border border-white/10 mb-2"
          >
            <span className="text-[10px] font-extrabold uppercase tracking-[0.4em] text-slate-400">
              {phase === 'finished' ? 'Session Complete' : isActive ? 'Active Session' : 'Ready to start'}
            </span>
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-6xl font-display font-bold tracking-tighter text-white"
          >
            HydroCycle
          </motion.h1>
        </div>

        {/* Timer Display */}
        <motion.div 
          layout
          className="glass rounded-[40px] p-12 flex flex-col items-center justify-center relative overflow-hidden transition-all duration-500 border-white/20"
        >
          {/* Pulse Effect when Active */}
          <AnimatePresence>
            {isActive && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1.2, opacity: 0.1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
                className={`absolute inset-0 rounded-full ${phase === 'hot' ? 'bg-red-500' : 'bg-blue-500'}`}
              />
            )}
          </AnimatePresence>

          {/* Progress Ring Background */}
          <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none p-4" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              pathLength="100"
              className="text-white/5"
            />
            <motion.circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              pathLength="100"
              strokeDasharray="100 100"
              animate={{ strokeDashoffset: 100 - progress }}
              transition={{ duration: 1, ease: "linear" }}
              className={phase === 'hot' ? 'text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]' : phase === 'cold' ? 'text-blue-500 drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]' : 'text-slate-800'}
            />
          </svg>

          <div className="z-10 flex flex-col items-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={phase}
                initial={{ opacity: 0, scale: 0.7, rotate: -15 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                exit={{ opacity: 0, scale: 1.3, rotate: 15 }}
                className="mb-6"
              >
                {phase === 'hot' && <Flame className="w-16 h-16 text-orange-500" />}
                {phase === 'cold' && <Snowflake className="w-16 h-16 text-cyan-400" />}
                {(phase === 'idle' || phase === 'finished') && <RotateCcw className="w-16 h-16 text-slate-400/50" />}
              </motion.div>
            </AnimatePresence>

            <div className="relative">
              <motion.span 
                key={timeLeft}
                initial={{ opacity: 0.5, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-8xl font-display font-bold tabular-nums tracking-tighter text-white"
              >
                {formatTime(timeLeft)}
              </motion.span>
              
              {/* Subtle separator */}
              <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent w-full my-4" />
            </div>

            <div className="flex flex-col items-center">
              <span className={`font-bold uppercase tracking-[0.4em] text-[10px] pb-1 ${
                phase === 'hot' ? 'text-red-400' : phase === 'cold' ? 'text-blue-400' : 'text-slate-500'
              }`}>
                {phase === 'idle' ? 'Ready' : phase === 'hot' ? 'Hot Interval' : phase === 'cold' ? 'Cold Exposure' : 'Finished'}
              </span>
              <span className="text-slate-500 text-[10px] font-medium tracking-widest uppercase">
                {phase === 'hot' ? 'Step 1 of 2' : phase === 'cold' ? 'Step 2 of 2' : ''}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Up Next Preview */}
        <AnimatePresence>
          {isActive && phase === 'hot' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center justify-center gap-2 text-slate-500 text-xs font-semibold"
            >
              <span className="uppercase tracking-widest text-[9px]">Up Next:</span>
              <div className="flex items-center gap-1 bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded-full border border-blue-500/20">
                <Snowflake className="w-3 h-3" />
                <span>Cold Shower ({formatTime(coldDuration)})</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Controls */}
        <div className="flex items-center justify-center gap-8 pt-4">
          <motion.button 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleReset}
            className="p-5 rounded-full glass hover:bg-white/10 transition-colors text-slate-400"
            title="Reset"
          >
            <RotateCcw className="w-7 h-7" />
          </motion.button>

          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={isActive ? handlePause : handleStart}
            className={`w-24 h-24 rounded-full flex items-center justify-center transition-all shadow-[0_0_30px_rgba(0,0,0,0.5)] border-t border-white/20 ${
              isActive 
                ? 'bg-white text-slate-900' 
                : 'bg-indigo-500 text-white shadow-indigo-500/20'
            }`}
          >
            {isActive ? <Pause className="w-10 h-10 fill-current" /> : <Play className="w-10 h-10 fill-current ml-1" />}
          </motion.button>

          <motion.button 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowSettings(!showSettings)}
            className={`p-5 rounded-full glass transition-colors ${showSettings ? 'bg-white/10 text-white border-white/40' : 'text-slate-400 hover:bg-white/10'}`}
            title="Settings"
          >
            <Settings2 className="w-7 h-7" />
          </motion.button>
        </div>

        {/* Settings Panel */}
        <AnimatePresence>
          {showSettings && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="glass rounded-[32px] p-8 space-y-8 overflow-hidden backdrop-blur-2xl border-white/20"
            >
              {/* Presets Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-slate-400 mb-1">
                  <Settings2 className="w-4 h-4" />
                  <label className="text-[10px] font-bold uppercase tracking-[0.2em]">Quick Presets</label>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {presets.map((preset) => (
                    <button
                      key={preset.name}
                      onClick={() => applyPreset(preset.hot, preset.cold)}
                      className={`py-3 px-4 rounded-xl border transition-all text-left ${
                        hotDuration === preset.hot && coldDuration === preset.cold
                          ? 'bg-indigo-500 text-white border-indigo-400 shadow-lg shadow-indigo-500/20'
                          : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                      }`}
                    >
                      <div className="text-[9px] font-bold uppercase tracking-tight opacity-70">{preset.name}</div>
                      <div className="text-sm font-bold">{preset.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-5">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-red-500/10 text-red-500">
                      <Flame className="w-5 h-5" />
                    </div>
                    <label className="text-sm font-semibold text-slate-200">Hot Duration</label>
                  </div>
                  <span className="text-sm font-bold text-white tabular-nums bg-white/5 px-2 py-1 rounded-md">{formatTime(hotDuration)}</span>
                </div>
                <input 
                  type="range" 
                  min="30" 
                  max="600" 
                  step="30"
                  value={hotDuration}
                  onChange={(e) => setHotDuration(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-red-500"
                />
              </div>

              <div className="space-y-5">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                      <Snowflake className="w-5 h-5" />
                    </div>
                    <label className="text-sm font-semibold text-slate-200">Cold Duration</label>
                  </div>
                  <span className="text-sm font-bold text-white tabular-nums bg-white/5 px-2 py-1 rounded-md">{formatTime(coldDuration)}</span>
                </div>
                <input 
                  type="range" 
                  min="15" 
                  max="300" 
                  step="15"
                  value={coldDuration}
                  onChange={(e) => setColdDuration(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>

              <div className="space-y-5">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
                      <Volume2 className="w-5 h-5" />
                    </div>
                    <label className="text-sm font-semibold text-slate-200">Loudness Multiplier</label>
                  </div>
                  <span className="text-sm font-bold text-white tabular-nums bg-white/5 px-2 py-1 rounded-md">{loudness}%</span>
                </div>
                <input 
                  type="range" 
                  min="100" 
                  max="1000" 
                  step="10"
                  value={loudness}
                  onChange={(e) => setLoudness(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
                <button
                  onClick={() => playBeep(440, 0.4, 0.1, loudnessMultiplier, 'square')}
                  className="w-full py-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-slate-300 transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
                >
                  <Volume2 className="w-4 h-4" /> TEST AUDIO SIGNAL
                </button>
              </div>

              <div className="pt-4 border-t border-white/10 flex items-center justify-around text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                <div className="flex items-center gap-1.5 grayscale opacity-50">
                  <Bell className="w-3 h-3" /> 5s Warning
                </div>
                <div className="flex items-center gap-1.5 grayscale opacity-50">
                  <Volume2 className="w-3 h-3" /> Extreme Multiplier
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer Info */}
        <div className="text-center pt-4">
          <p className="text-slate-600 text-[9px] font-bold uppercase tracking-[0.3em]">
            HydroCycle System • v2.0
          </p>
        </div>

      </div>
    </div>
  );
}
