/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState, useRef } from "react";
import { usePomodoroStore } from "@/store/use-pomodoro";
import { usePathname, useRouter } from "next/navigation";
import { IoPlay, IoPause, IoFlame, IoCafeOutline } from "react-icons/io5";
import { cn } from "@/lib/utils";
import { usePomodoroSound } from "@/hooks/use-pomodoro-sound";
import { useGamificationStore } from "@/store/use-gamification";

export const GlobalPomodoroTimer = () => {
  // 1. Always Rehydrate
  useEffect(() => {
    usePomodoroStore.persist.rehydrate();
  }, []);

  const { isRunning, tick, status, timeLeft, currentSession, totalSessions, justCompleted, consumeCompletionFlag, pause, start } = usePomodoroStore();
  const pathname = usePathname();
  const router = useRouter();
  const { playSound } = usePomodoroSound();
  const { processGamification } = useGamificationStore();
  
  const [isClient, setIsClient] = useState(false);
  const isProcessingRef = useRef(false);

  useEffect(() => { setIsClient(true); }, []);

  // 2. Logic Interval (JALAN TERUS DIMANAPUN)
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning && status !== 'IDLE') {
      interval = setInterval(() => {
        tick();
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, status, tick]);

  // 3. Logic Sound (JALAN TERUS DIMANAPUN)
  useEffect(() => {
    if (status === 'IDLE') return;
    if (timeLeft === 0) playSound('finish');
  }, [timeLeft, status, playSound]);

  // 4. Logic Title (JALAN TERUS DIMANAPUN)
  useEffect(() => {
    if (status !== 'IDLE') {
        document.title = `${isRunning ? '▶' : '❚❚'} ${formatTime(timeLeft)} - ${status}`;
    } else {
        document.title = "MyNova";
    }
  }, [timeLeft, status, isRunning]);

  // 5. Logic Gamifikasi (JALAN TERUS DIMANAPUN)
  useEffect(() => {
      // Cek flag justCompleted
      if (justCompleted) {
          // Double protection: Cek ref agar tidak jalan 2x
          if (isProcessingRef.current) return;
          
          isProcessingRef.current = true; // Kunci
          consumeCompletionFlag(); // Matikan flag di store SEGERA

          const finishSession = async () => {
              try {
                  console.log("🎯 Triggering XP Reward..."); // Debugging
                  const res = await fetch("/api/pomodoro/finish", { method: "POST" });
                  const data = await res.json();
                  processGamification(data);
              } catch (error) {
                  console.error("XP Error", error);
              } finally {
                  setTimeout(() => {
                      isProcessingRef.current = false;
                  }, 2000);
              }
          };
          finishSession();
      }
  }, [justCompleted, consumeCompletionFlag, processGamification]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // --- RENDER VISUAL GUARD ---
  // Kita return null DISINI, di paling bawah.
  // Jadi useEffect di atas TETAP JALAN meskipun visualnya tidak muncul.
  
  if (!isClient) return null;
  
  // Sembunyikan Visual jika IDLE atau sedang di halaman Pomodoro (biar gak double UI)
  const shouldHideVisual = status === 'IDLE' || pathname === '/pomodoro';

  if (shouldHideVisual) return null;

  return (
    <div className="fixed bottom-6 left-6 z-[999] animate-in slide-in-from-bottom-10 fade-in duration-500">
        <div 
            onClick={() => router.push('/pomodoro')}
            className="group relative flex items-center gap-4 bg-background/80 backdrop-blur-md border border-border p-3 pr-5 rounded-2xl shadow-2xl hover:shadow-primary/20 transition-all hover:scale-105 cursor-pointer"
        >
            <div className={cn(
                "relative z-10 w-12 h-12 flex items-center justify-center rounded-xl text-xl shadow-inner border border-white/5",
                status === 'FOCUS' ? "bg-red-500/10 text-red-500" : "bg-emerald-500/10 text-emerald-500"
            )}>
                {status === 'FOCUS' ? <IoFlame className="animate-pulse" /> : <IoCafeOutline />}
            </div>

            <div className="relative z-10 flex flex-col pointer-events-none">
                <span className="text-xl font-mono font-bold tracking-tight leading-none text-foreground">
                    {formatTime(timeLeft)}
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground mt-1">
                    {status} • {currentSession}/{totalSessions}
                </span>
            </div>

            <div className="relative z-20 flex items-center gap-1 pl-2 border-l border-border/50 ml-1">
                <button 
                    onClick={(e) => { e.stopPropagation(); isRunning ? pause() : start(); }}
                    className="p-2 rounded-full hover:bg-muted text-foreground transition-colors"
                >
                    {isRunning ? <IoPause /> : <IoPlay />}
                </button>
            </div>
        </div>
    </div>
  );
};