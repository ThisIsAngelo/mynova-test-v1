/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import Container from "@/components/container";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { usePomodoroSound } from "@/hooks/use-pomodoro-sound";
import { cn } from "@/lib/utils";
import { usePomodoroStore } from "@/store/use-pomodoro";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
    IoArrowBack,
    IoCafe,
    IoFlame,
    IoPause,
    IoPlay,
    IoScanOutline,
    IoStop
} from "react-icons/io5";


const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

const RADIUS = 120;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

// Interface untuk Theme Style
interface ThemeStyle {
    text: string;
    stroke: string;
    bg: string;
    shadow: string;
}

const SessionInfo = ({ current, total }: { current: number, total: number }) => (
    <div className="px-4 py-1.5 rounded-full bg-background/20 backdrop-blur-md border border-white/5 text-xs font-mono font-bold tracking-widest text-muted-foreground uppercase shadow-sm">
        Session {current} <span className="opacity-50 mx-1">/</span> {total}
    </div>
);

const StatusBadge = ({ status, isFocus, theme }: { status: string, isFocus: boolean, theme: ThemeStyle }) => (
    <div className={cn(
        "flex items-center gap-3 px-6 py-2 rounded-full border backdrop-blur-md shadow-sm transition-all duration-500 animate-in fade-in slide-in-from-top-4 shrink-0",
        `${theme.text} border-current/20 bg-background/30`
    )}>
        {isFocus ? <IoFlame className="animate-pulse" /> : <IoCafe className="animate-bounce" />}
        <span className="font-bold tracking-[0.3em] text-sm uppercase">{status} PROTOCOL</span>
    </div>
);

const Controls = ({
    isRunning,
    onToggle,
    onStop,
    theme
}: {
    isRunning: boolean,
    onToggle: () => void,
    onStop: () => void,
    theme: ThemeStyle
}) => (
    <div className="flex items-center gap-6 sm:gap-8 shrink-0 pb-6 sm:pb-0">
        <button
            onClick={onToggle}
            className={cn(
                "w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center rounded-[2rem] text-background shadow-2xl transition-all hover:scale-105 active:scale-95 text-3xl sm:text-4xl pl-1 border-4 border-background/10",
                theme.bg, theme.shadow
            )}
        >
            {isRunning ? <IoPause /> : <IoPlay />}
        </button>

        <AlertDialog>
            <AlertDialogTrigger asChild>
                <button
                    className="w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center rounded-[1.5rem] bg-card/50 backdrop-blur-md border border-border text-muted-foreground hover:text-destructive hover:border-destructive/50 transition-all hover:scale-105 active:scale-95 shadow-lg group"
                    title="Stop Session"
                >
                    <IoStop size={22} className="group-hover:rotate-90 transition-transform duration-300" />
                </button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Abort Mission?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This will reset your progress for this session. Are you sure you want to stop?
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel className="cursor-pointer">Keep Focusing</AlertDialogCancel>
                    <AlertDialogAction onClick={onStop} className="bg-destructive text-destructive-foreground hover:bg-destructive/90 cursor-pointer">
                        Yes, Stop
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    </div>
);

const TimerCircle = ({
    timeLeft,
    totalTime,
    theme,
    isRunning,
    sizeClass
}: {
    timeLeft: number,
    totalTime: number,
    theme: ThemeStyle,
    isRunning: boolean,
    sizeClass: string
}) => {
    const progressOffset = ((totalTime - timeLeft) / totalTime) * CIRCUMFERENCE;

    return (
        <div className={cn("relative flex items-center justify-center group cursor-default select-none shrink-0 transition-all duration-700", sizeClass)}>
            <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 260 260">
                {/* Background Ring */}
                <circle
                    cx="130" cy="130" r={RADIUS}
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="transparent"
                    className="text-foreground/5"
                />
                {/* Progress Ring */}
                <circle
                    cx="130" cy="130" r={RADIUS}
                    stroke="currentColor"
                    strokeWidth="6"
                    fill="transparent"
                    strokeDasharray={CIRCUMFERENCE}
                    strokeDashoffset={progressOffset}
                    strokeLinecap="round"
                    className={cn(
                        "transition-all duration-1000 ease-linear",
                        theme.stroke
                    )}
                />
            </svg>

            {/* Timer Text (Centered) */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pt-2">
                <h1 className={cn(
                    "font-mono font-black tracking-tighter leading-none transition-colors duration-500 tabular-nums drop-shadow-2xl",
                    theme.text,
                    "text-6xl sm:text-7xl lg:text-8xl xl:text-[9rem]"
                )}>
                    {formatTime(timeLeft)}
                </h1>

                <p className={cn(
                    "font-medium tracking-[0.2em] text-muted-foreground uppercase mt-2 sm:mt-4 opacity-60",
                    "text-[10px] sm:text-xs xl:text-sm"
                )}>
                    {isRunning ? "Sequence Running" : "Sequence Paused"}
                </p>
            </div>
        </div>
    );
};


export default function PomodoroPage() {
    const {
        status, timeLeft, currentSession, totalSessions, isRunning,
        focusDuration, breakDuration,
        setup, start, pause, stop
    } = usePomodoroStore();

    const { playSound } = usePomodoroSound();

    // Hydration Fix
    useEffect(() => {
        usePomodoroStore.persist.rehydrate();
    }, []);

    // Local State
    const [inputFocus, setInputFocus] = useState(focusDuration < 15 ? 25 : focusDuration);
    const [inputBreak, setInputBreak] = useState(breakDuration);
    const [inputSessions, setInputSessions] = useState(totalSessions);

    // Sync state when IDLE
    useEffect(() => {
        if (status === 'IDLE') {
            setInputFocus(focusDuration);
            setInputBreak(breakDuration);
            setInputSessions(totalSessions);
        }
    }, [status, focusDuration, breakDuration, totalSessions]);

    // Derived State
    const isFocus = status === 'FOCUS';
    const totalTimeCurrent = isFocus ? focusDuration * 60 : breakDuration * 60;

    const theme: ThemeStyle = isFocus
        ? { text: "text-amber-500", stroke: "stroke-amber-500", bg: "bg-amber-500", shadow: "shadow-amber-500/20" }
        : { text: "text-emerald-500", stroke: "stroke-emerald-500", bg: "bg-emerald-500", shadow: "shadow-emerald-500/20" };

    // --- VIEW 1: SETUP FORM (IDLE) ---
    if (status === 'IDLE') {
        return (
            <main className="min-h-screen bg-background text-foreground pt-28 pb-10 overflow-hidden selection:bg-primary/20">
                {/* Background Accent */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />

                <Container className="flex flex-col items-center justify-center relative">
                    {/* HEADER NAV */}
                    <div className="w-full pb-8 flex justify-between items-center z-20">
                        <Link href="/" className="inline-flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors group cursor-pointer px-4 py-2 rounded-full border border-border/50 hover:bg-muted/50 backdrop-blur-sm">
                            <IoArrowBack className="group-hover:-translate-x-1 transition-transform" /> DASHBOARD
                        </Link>
                    </div>

                    {/* CONFIG CARD */}
                    <div className="w-full max-w-[450px] relative z-10 animate-in fade-in zoom-in-95 duration-500">
                        <div className="bg-card/80 backdrop-blur-2xl border border-white/10 dark:border-white/5 rounded-[2.5rem] p-8 shadow-2xl shadow-black/10 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-50 pointer-events-none rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

                            <div className="text-center mb-10 relative">
                                <div className="inline-flex p-3 rounded-2xl bg-primary/10 text-primary mb-4 border border-primary/10 shadow-inner">
                                    <IoScanOutline size={24} />
                                </div>
                                <h1 className="text-3xl font-heading font-black tracking-tighter mb-1">Sync Mode</h1>
                                <p className="text-muted-foreground text-xs font-bold tracking-widest uppercase opacity-60">Calibrate your flow</p>
                            </div>

                            <div className="space-y-8 relative">
                                <div className="space-y-6">
                                    {/* Focus Slider */}
                                    <div className="space-y-3 group/slider">
                                        <div className="flex justify-between items-end">
                                            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground group-hover/slider:text-primary transition-colors">Focus</label>
                                            <span className="font-mono font-bold text-xl text-foreground">{inputFocus}<span className="text-xs text-muted-foreground ml-1">min</span></span>
                                        </div>
                                        <input
                                            type="range" min="15" max="60" step="5"
                                            value={inputFocus} onChange={(e) => setInputFocus(Number(e.target.value))}
                                            className="w-full h-2 bg-muted rounded-full appearance-none cursor-pointer accent-primary hover:accent-primary/80 transition-all"
                                        />
                                    </div>

                                    {/* Break Slider */}
                                    <div className="space-y-3 group/slider">
                                        <div className="flex justify-between items-end">
                                            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground group-hover/slider:text-emerald-500 transition-colors">Break</label>
                                            <span className="font-mono font-bold text-xl text-emerald-500">{inputBreak}<span className="text-xs text-muted-foreground ml-1">min</span></span>
                                        </div>
                                        <input
                                            type="range" min="5" max="30" step="5"
                                            value={inputBreak} onChange={(e) => setInputBreak(Number(e.target.value))}
                                            className="w-full h-2 bg-muted rounded-full appearance-none cursor-pointer accent-emerald-500 hover:accent-emerald-400 transition-all"
                                        />
                                    </div>
                                </div>

                                {/* Cycles */}
                                <div className="space-y-3">
                                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground block text-center">Cycles</label>
                                    <div className="flex justify-center gap-2">
                                        {[2, 3, 4, 5, 6].map((num) => (
                                            <button
                                                key={num}
                                                onClick={() => setInputSessions(num)}
                                                className={cn(
                                                    "w-10 h-10 rounded-xl font-bold text-sm transition-all flex items-center justify-center border",
                                                    inputSessions === num
                                                        ? "bg-foreground text-background border-foreground shadow-lg scale-110"
                                                        : "bg-transparent text-muted-foreground border-border hover:border-foreground/50 hover:text-foreground"
                                                )}
                                            >
                                                {num}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <button
                                    onClick={() => {
                                        setup(inputFocus, inputBreak, inputSessions);
                                        start();
                                        playSound('start');
                                    }}
                                    className="group/btn relative w-full bg-primary text-primary-foreground hover:bg-primary/90 py-4 rounded-xl text-lg font-bold mt-2 transition-all active:scale-[0.98] shadow-xl overflow-hidden"
                                >
                                    <span className="relative z-10 flex items-center justify-center gap-2 text-sm uppercase tracking-widest">
                                        Initiate Sequence <IoArrowBack className="rotate-180 group-hover/btn:translate-x-1 transition-transform" />
                                    </span>
                                    <div className="absolute inset-0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12" />
                                </button>
                            </div>
                        </div>
                    </div>
                </Container>
            </main>
        );
    }

    // --- VIEW 2: ACTIVE TIMER ---

    return (
        <main className="h-screen bg-background relative overflow-hidden transition-colors duration-700 flex flex-col lg:flex-row">

            {/* Dynamic Background */}
            <div className={cn(
                "absolute top-1/2 -translate-y-1/2 rounded-full blur-[150px] opacity-15 transition-all duration-1000 pointer-events-none animate-pulse-slow",
                "left-1/2 -translate-x-1/2 w-[80vh] h-[80vh] lg:left-[75%] lg:w-[60vw] lg:h-[60vw]",
                theme.bg
            )} />

            {/* --- MOBILE/TABLET LAYOUT (< lg) --- */}
            <div className="lg:hidden h-full flex flex-col relative z-10">
                <div className="w-full pt-24 px-6 md:px-12 flex justify-between items-center z-30 shrink-0">
                    <Link href="/" className="p-3 rounded-full bg-background/20 backdrop-blur-md border border-white/5 text-muted-foreground hover:text-foreground transition-all hover:scale-105"><IoArrowBack size={22} /></Link>
                    <SessionInfo current={currentSession} total={totalSessions} />
                </div>

                <div className="flex-1 flex flex-col items-center justify-center w-full px-6 gap-8 sm:gap-12 min-h-0">
                    <StatusBadge status={status} isFocus={isFocus} theme={theme} />
                    <TimerCircle
                        timeLeft={timeLeft}
                        totalTime={totalTimeCurrent}
                        theme={theme}
                        isRunning={isRunning}
                        sizeClass="w-[280px] h-[280px] sm:w-[360px] sm:h-[360px]"
                    />
                    <Controls
                        isRunning={isRunning}
                        onToggle={isRunning ? pause : start}
                        onStop={stop}
                        theme={theme}
                    />
                </div>
            </div>

            {/* --- DESKTOP LAYOUT (>= lg) --- */}
            <div className="hidden lg:flex h-full w-full relative z-10 flex-row">
                <div className="flex-1 flex flex-col items-start justify-center pl-24 gap-16">
                    <div className="flex flex-col items-start gap-6">
                        <Link href="/" className="p-3 rounded-full bg-background/20 backdrop-blur-md border border-white/5 text-muted-foreground hover:text-foreground transition-all hover:scale-105 inline-flex"><IoArrowBack size={22} /></Link>
                        <SessionInfo current={currentSession} total={totalSessions} />
                    </div>

                    <div className="flex flex-col items-start gap-12">
                        <StatusBadge status={status} isFocus={isFocus} theme={theme} />
                        <Controls
                            isRunning={isRunning}
                            onToggle={isRunning ? pause : start}
                            onStop={stop}
                            theme={theme}
                        />
                    </div>
                </div>

                <div className="flex-1 flex items-center justify-center pr-12">
                    <TimerCircle
                        timeLeft={timeLeft}
                        totalTime={totalTimeCurrent}
                        theme={theme}
                        isRunning={isRunning}
                        sizeClass="w-[500px] h-[500px] xl:w-[650px] xl:h-[650px]"
                    />
                </div>
            </div>

        </main>
    );
}