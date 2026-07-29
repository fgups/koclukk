"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Pause, Play, RotateCcw, SkipForward } from "lucide-react";
import { Button } from "@/components/ui/button";

const FOCUS_SECONDS = 25 * 60;
const BREAK_SECONDS = 5 * 60;

type Mode = "focus" | "break";

function todayKey(): string {
  return `pomodoro_sessions_${new Date().toISOString().slice(0, 10)}`;
}

// Minimal external store so completing a session doesn't require setState-in-effect.
let sessionsCache: number | null = null;
const listeners = new Set<() => void>();

function readSessions(): number {
  if (sessionsCache === null) {
    sessionsCache = Number(localStorage.getItem(todayKey()) ?? "0");
  }
  return sessionsCache;
}

function incrementSessions(): void {
  sessionsCache = readSessions() + 1;
  localStorage.setItem(todayKey(), String(sessionsCache));
  listeners.forEach((l) => l());
}

function subscribeSessions(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSessionsServerSnapshot(): number {
  return 0;
}

function formatTime(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, "0");
  const s = (totalSeconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

export function PomodoroTimer() {
  const [mode, setMode] = useState<Mode>("focus");
  const [secondsLeft, setSecondsLeft] = useState(FOCUS_SECONDS);
  const [isRunning, setIsRunning] = useState(false);
  const sessionsToday = useSyncExternalStore(subscribeSessions, readSessions, getSessionsServerSnapshot);
  const modeRef = useRef(mode);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  useEffect(() => {
    if (!isRunning) return;
    intervalRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev > 1) return prev - 1;

        const finishedMode = modeRef.current;
        const nextMode: Mode = finishedMode === "focus" ? "break" : "focus";
        if (finishedMode === "focus") incrementSessions();
        setIsRunning(false);
        setMode(nextMode);
        return nextMode === "focus" ? FOCUS_SECONDS : BREAK_SECONDS;
      });
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning]);

  function reset() {
    setIsRunning(false);
    setSecondsLeft(mode === "focus" ? FOCUS_SECONDS : BREAK_SECONDS);
  }

  function skip() {
    setIsRunning(false);
    const nextMode: Mode = mode === "focus" ? "break" : "focus";
    setMode(nextMode);
    setSecondsLeft(nextMode === "focus" ? FOCUS_SECONDS : BREAK_SECONDS);
  }

  const total = mode === "focus" ? FOCUS_SECONDS : BREAK_SECONDS;
  const pct = Math.round(((total - secondsLeft) / total) * 100);

  return (
    <div className="flex flex-col items-center gap-6 py-4">
      <span
        className={`rounded-full px-3 py-1 text-xs font-semibold ${
          mode === "focus"
            ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300"
            : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
        }`}
      >
        {mode === "focus" ? "Odaklanma" : "Mola"}
      </span>

      <div className="relative flex h-52 w-52 items-center justify-center">
        <svg className="absolute h-full w-full -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="46" fill="none" strokeWidth="6" className="stroke-slate-100 dark:stroke-slate-800" />
          <circle
            cx="50"
            cy="50"
            r="46"
            fill="none"
            strokeWidth="6"
            strokeLinecap="round"
            className={mode === "focus" ? "stroke-indigo-500" : "stroke-emerald-500"}
            strokeDasharray={2 * Math.PI * 46}
            strokeDashoffset={2 * Math.PI * 46 * (1 - pct / 100)}
            style={{ transition: "stroke-dashoffset 1s linear" }}
          />
        </svg>
        <span className="text-4xl font-bold tabular-nums text-slate-900 dark:text-slate-100">
          {formatTime(secondsLeft)}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={reset} aria-label="Sıfırla">
          <RotateCcw className="h-4 w-4" />
        </Button>
        <Button onClick={() => setIsRunning((v) => !v)} className="w-32">
          {isRunning ? (
            <>
              <Pause className="h-4 w-4" /> Duraklat
            </>
          ) : (
            <>
              <Play className="h-4 w-4" /> Başlat
            </>
          )}
        </Button>
        <Button variant="outline" size="sm" onClick={skip} aria-label="Atla">
          <SkipForward className="h-4 w-4" />
        </Button>
      </div>

      <p className="text-sm text-slate-500 dark:text-slate-400">
        Bugün tamamlanan: <span className="font-semibold text-slate-900 dark:text-slate-100">{sessionsToday}</span> pomodoro
      </p>
    </div>
  );
}
