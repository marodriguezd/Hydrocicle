import React, { useEffect, useRef } from 'react';
import { useSettings } from '../contexts/SettingsContext';
import { useSession } from '../contexts/SessionContext';

export const SoundscapeManager = () => {
  const { config } = useSettings();
  const { isPlaying } = useSession();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.loop = true;
    }

    const audio = audioRef.current;
    
    // Set volume
    audio.volume = config.volume;

    // Set track based on selection
    let src = '';
    if (config.soundscape && config.soundscape !== 'none') {
      // Resolve path base-relative to avoid breakage on GitHub Pages subfolder paths
      const baseUrl = import.meta.env.BASE_URL || '/';
      src = `${baseUrl}assets/${config.soundscape}.mp3`;
    }

    if (src && audio.src !== src) {
      audio.src = src;
    }

    if (isPlaying && src) {
      audio.play().catch(e => console.warn("Autoplay blocked or audio missing:", e));
    } else {
      audio.pause();
    }
  }, [config.soundscape, config.volume, isPlaying]);

  return null; // Silent ambient controller
};
