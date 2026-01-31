import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type PomodoroStatus = 'IDLE' | 'FOCUS' | 'BREAK';

interface PomodoroState {
  // Config
  focusDuration: number;
  breakDuration: number;
  totalSessions: number;

  // Real-time State
  timeLeft: number;
  status: PomodoroStatus;
  currentSession: number;
  isRunning: boolean;

  justCompleted: boolean;

  // Actions
  setup: (focus: number, breakTime: number, sessions: number) => void;
  start: () => void;
  pause: () => void;
  stop: () => void;
  tick: () => void;
  skip: () => void;
  consumeCompletionFlag: () => void;
}

export const usePomodoroStore = create<PomodoroState>()(
  persist(
    (set, get) => ({
      focusDuration: 25,
      breakDuration: 5,
      totalSessions: 4,

      timeLeft: 25 * 60,
      status: 'IDLE',
      currentSession: 1,
      isRunning: false,
      justCompleted: false,

      setup: (focus, breakTime, sessions) => set({
        focusDuration: focus,
        breakDuration: breakTime,
        totalSessions: sessions,
        timeLeft: focus * 60,
        status: 'IDLE',
        currentSession: 1,
        isRunning: false,
        justCompleted: false
      }),

      start: () => {
        const { status } = get();
        if (status === 'IDLE') {
          set({ status: 'FOCUS', isRunning: true, justCompleted: false });
        } else {
          set({ isRunning: true });
        }
      },

      pause: () => set({ isRunning: false }),

      stop: () => {
        const { focusDuration } = get();
        set({
          status: 'IDLE',
          isRunning: false,
          timeLeft: focusDuration * 60,
          currentSession: 1,
          justCompleted: false
        });
      },

      consumeCompletionFlag: () => set({ justCompleted: false }),

      tick: () => {
        const { timeLeft, status, currentSession, focusDuration, breakDuration, totalSessions } = get();

        if (timeLeft > 0) {
          set({ timeLeft: timeLeft - 1 });
          return;
        }

        // --- LOGIC GANTI FASE (TIMER HABIS) ---
        if (status === 'FOCUS') {
          // Selesai Fokus
          set({ justCompleted: true });

          if (currentSession >= totalSessions) {
            // Selesai Semua Sesi -> Stop & Reset
            set({ status: 'IDLE', isRunning: false, currentSession: 1, timeLeft: focusDuration * 60 });
          } else {
            // Lanjut ke Break -> AUTO PLAY (isRunning: true)
            set({
              status: 'BREAK',
              timeLeft: breakDuration * 60,
              isRunning: true // <--- AUTO START BREAK
            });
          }
        } else if (status === 'BREAK') {
          // Selesai Break -> Lanjut Fokus -> BIASANYA MANUAL START (Supaya user siap dulu)
          set({
            status: 'FOCUS',
            currentSession: currentSession + 1,
            timeLeft: focusDuration * 60,
            isRunning: false // Tetap false agar user tarik napas dulu sebelum deep work lagi
          });
        }
      },

      skip: () => {
        // Fitur skip (opsional/dev purpose), disesuaikan logicnya
        const { status, currentSession, focusDuration, breakDuration } = get();
        if (status === 'FOCUS') {
          // Skip Focus -> Auto Start Break
          set({ status: 'BREAK', timeLeft: breakDuration * 60, isRunning: true });
        } else if (status === 'BREAK') {
          // Skip Break -> Manual Start Focus
          set({ status: 'FOCUS', currentSession: currentSession + 1, timeLeft: focusDuration * 60, isRunning: false });
        }
      }
    }),
    {
      name: 'pomodoro-storage',
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,

      partialize: (state) => ({
        // Kita whitelist apa saja yang mau disimpan
        focusDuration: state.focusDuration,
        breakDuration: state.breakDuration,
        totalSessions: state.totalSessions,
        timeLeft: state.timeLeft,
        status: state.status,
        currentSession: state.currentSession,
        isRunning: state.isRunning,
      })
    }
  )
);