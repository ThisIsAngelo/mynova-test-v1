"use client";

import { useCallback } from "react";

export const usePomodoroSound = () => {
  const playSound = useCallback((type: 'start' | 'finish' | 'tick') => {
    
    if (typeof window !== 'undefined') {
        const audio = new Audio(`/assets/sounds/${type}.mp3`);
        audio.play().catch(e => console.log("Audio play error", e));
    }
  }, []);

  return { playSound };
};