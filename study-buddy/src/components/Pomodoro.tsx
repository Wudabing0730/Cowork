'use client';

import { useState, useEffect, useRef, useCallback, type WheelEvent } from 'react';

const PRESETS = [
  { label: '25/5', work: 25, break: 5 },
  { label: '50/10', work: 50, break: 10 },
  { label: '15/3', work: 15, break: 3 },
];

const STORAGE_KEY = 'sb-pomodoro';
const CIRCLE_R = 84;
const CIRCLE_C = 2 * Math.PI * CIRCLE_R;

function DigitWheel({ value, max, onDelta }: { value: number; max: number; onDelta: (deltaY: number) => void }) {
  const prev = (value - 1 + max + 1) % (max + 1);
  const next = (value + 1) % (max + 1);
  const dragRef = useRef({ startY: 0, lastStep: 0 });
  const STEP = 20;

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    dragRef.current = { startY: e.clientY, lastStep: 0 };

    const onMouseMove = (ev: MouseEvent) => {
      const totalDelta = dragRef.current.startY - ev.clientY; // up=positive
      const currentStep = Math.round(totalDelta / STEP);
      const diff = currentStep - dragRef.current.lastStep;
      if (diff !== 0) {
        onDelta(diff > 0 ? -1 : 1); // drag up → negative deltaY → increase
      }
      dragRef.current.lastStep = currentStep;
    };

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }, [onDelta]);

  return (
    <div
      className="flex flex-col items-center cursor-ns-resize select-none"
      onMouseDown={onMouseDown}
    >
      <span className="text-[10px] leading-none" style={{ color: 'var(--text-tertiary)', opacity: 0.5, height: 16 }}>{next}</span>
      <span className="text-lg font-bold tabular-nums leading-none" style={{ color: 'var(--text-primary)', height: 24 }}>{value}</span>
      <span className="text-[10px] leading-none" style={{ color: 'var(--text-tertiary)', opacity: 0.5, height: 16 }}>{prev}</span>
    </div>
  );
}

interface PomodoroState {
  seconds: number;
  isRunning: boolean;
  isBreak: boolean;
  sessions: number;
  sessionsDate: string;
  lastTick: number;
  workMinutes: number;
  breakMinutes: number;
  collapsed: boolean;
}

function loadState(): PomodoroState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as PomodoroState;
  } catch {
    return null;
  }
}

function saveState(s: PomodoroState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  } catch { /* noop */ }
}

function computeInitial() {
  const saved = loadState();
  const today = new Date().toISOString().slice(0, 10);

  if (!saved) {
    return {
      seconds: PRESETS[0].work * 60,
      isBreak: false,
      sessions: 0,
      workMinutes: PRESETS[0].work,
      breakMinutes: PRESETS[0].break,
      collapsed: false,
    };
  }

  const wm = saved.workMinutes * 60;
  const bm = saved.breakMinutes * 60;

  // Daily session reset
  let sessions = saved.sessionsDate === today ? saved.sessions : 0;
  let seconds = saved.seconds;
  let isBreak = saved.isBreak;

  // Calculate offline elapsed time
  if (saved.isRunning) {
    const elapsed = Math.floor((Date.now() - saved.lastTick) / 1000);
    seconds -= elapsed;
    while (seconds < 0) {
      if (isBreak) {
        isBreak = false;
        seconds += wm;
      } else {
        sessions++;
        isBreak = true;
        seconds += bm;
      }
    }
  }

  return {
    seconds,
    isBreak,
    sessions,
    workMinutes: saved.workMinutes,
    breakMinutes: saved.breakMinutes,
    collapsed: saved.collapsed,
  };
}

export default function Pomodoro() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // ── Prevent initial ring animation jump ──
  const [animReady, setAnimReady] = useState(false);

  // ── Single source of initial values ──
  const initial = useRef(computeInitial());

  const [seconds, setSeconds] = useState(initial.current.seconds);
  const [isRunning, setIsRunning] = useState(false); // Always start paused after page load
  const [isBreak, setIsBreak] = useState(initial.current.isBreak);
  const [sessions, setSessions] = useState(initial.current.sessions);
  const [workMinutes, setWorkMinutes] = useState(initial.current.workMinutes);
  const [breakMinutes, setBreakMinutes] = useState(initial.current.breakMinutes);
  const [collapsed, setCollapsed] = useState(initial.current.collapsed);
  const [pickerOpen, setPickerOpen] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  const workDuration = workMinutes * 60;
  const breakDuration = breakMinutes * 60;
  const total = isBreak ? breakDuration : workDuration;

  // ── Enable ring transition after mount ──
  useEffect(() => {
    const frame = requestAnimationFrame(() => setAnimReady(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  // ── Create audio once ──
  useEffect(() => {
    audioRef.current = new Audio('/notification.mp3');
  }, []);

  // ── Close picker on click outside ──
  useEffect(() => {
    if (!pickerOpen) return;
    const handler = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setPickerOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [pickerOpen]);

  // ── Persist state ──
  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    saveState({
      seconds,
      isRunning,
      isBreak,
      sessions,
      sessionsDate: today,
      lastTick: Date.now(),
      workMinutes,
      breakMinutes,
      collapsed,
    });
  }, [seconds, isRunning, isBreak, sessions, workMinutes, breakMinutes, collapsed]);

  // ── Timer interval (decrement only) ──
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setSeconds(prev => prev - 1);
      }, 1000);
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isRunning]);

  // ── Handle zero crossing — auto-advance phase ──
  useEffect(() => {
    if (!isRunning || seconds > 0) return;

    audioRef.current?.play().catch(() => {});

    if (isBreak) {
      setIsBreak(false);
      setSeconds(workDuration);
    } else {
      setSessions(s => s + 1);
      setIsBreak(true);
      setSeconds(breakDuration);
    }
  }, [seconds, isRunning, isBreak, workDuration, breakDuration]);

  // ── Document title ──
  useEffect(() => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    const t = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    document.title = isRunning ? `${isBreak ? '☕' : '🍅'} ${t}` : '学习搭子';
    return () => { document.title = '学习搭子'; };
  }, [seconds, isRunning, isBreak]);

  // ── Actions ──

  const toggle = useCallback(() => setIsRunning(r => !r), []);

  const reset = useCallback(() => {
    setIsRunning(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setSeconds(isBreak ? breakDuration : workDuration);
  }, [isBreak, workDuration, breakDuration]);

  const skipPhase = useCallback(() => {
    if (isBreak) {
      setIsBreak(false);
      setSeconds(workDuration);
    } else {
      setSessions(s => s + 1);
      setIsBreak(true);
      setSeconds(breakDuration);
    }
  }, [isBreak, workDuration, breakDuration]);

  const selectPreset = useCallback((w: number, b: number) => {
    setWorkMinutes(w);
    setBreakMinutes(b);
    if (!isRunning) {
      setIsBreak(false);
      setSeconds(w * 60);
    }
  }, [isRunning]);

  const adjustDisplayedTime = useCallback((unit: 'minutes' | 'seconds', delta: number) => {
    if (isRunning) return;

    const step = delta > 0 ? -1 : 1;
    const currentMinutes = Math.floor(seconds / 60);
    const currentSeconds = seconds % 60;
    const nextMinutes = unit === 'minutes' ? currentMinutes + step : currentMinutes;
    const nextSeconds = unit === 'seconds' ? currentSeconds + step : currentSeconds;

    if (nextMinutes < 0 || nextSeconds < 0 || nextSeconds > 59) return;

    const durationLimit = (isBreak ? 60 : 120) * 60;
    const nextTotalSeconds = nextMinutes * 60 + nextSeconds;

    if (nextTotalSeconds < 1 || nextTotalSeconds > durationLimit) return;

    setSeconds(nextTotalSeconds);

    if (isBreak) {
      setBreakMinutes(Math.max(1, Math.ceil(nextTotalSeconds / 60)));
    } else {
      setWorkMinutes(Math.max(1, Math.ceil(nextTotalSeconds / 60)));
    }
  }, [isRunning, seconds, isBreak]);

  const handleTimeWheel = useCallback((unit: 'minutes' | 'seconds') => (event: WheelEvent<HTMLSpanElement>) => {
    event.preventDefault();
    adjustDisplayedTime(unit, event.deltaY);
  }, [adjustDisplayedTime]);

  const handleDigitDelta = useCallback((position: 'minTens' | 'minOnes' | 'secTens' | 'secOnes', deltaY: number) => {
    if (isRunning) return;

    const step = deltaY > 0 ? -1 : 1;
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;

    const mt = Math.floor(min / 10);
    const mo = min % 10;
    const st = Math.floor(sec / 10);
    const so = sec % 10;

    let nextMins = min;
    let nextSecs = sec;

    switch (position) {
      case 'minTens': nextMins = ((mt + step + 10) % 10) * 10 + mo; break;
      case 'minOnes': nextMins = mt * 10 + ((mo + step + 10) % 10); break;
      case 'secTens': nextSecs = ((st + step + 6) % 6) * 10 + so; break;
      case 'secOnes': nextSecs = st * 10 + ((so + step + 10) % 10); break;
    }

    if (nextMins < 0 || nextSecs < 0 || nextSecs > 59) return;

    const durationLimit = (isBreak ? 60 : 120) * 60;
    const total = nextMins * 60 + nextSecs;
    if (total < 1 || total > durationLimit) return;

    setSeconds(total);
    if (isBreak) {
      setBreakMinutes(Math.max(1, Math.ceil(total / 60)));
    } else {
      setWorkMinutes(Math.max(1, Math.ceil(total / 60)));
    }
  }, [isRunning, seconds, isBreak]);

  const toggleCollapsed = useCallback(() => setCollapsed(c => !c), []);

  // ── Display helpers ──
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const remaining = Math.max((seconds / total) * 100, 0);
  const dashOffset = CIRCLE_C - (remaining / 100) * CIRCLE_C;

  const phaseIcon = isBreak ? '☕' : '🍅';
  const phaseLabel = isBreak ? '休息' : '专注';

  return (
    <div style={{ border: '1px solid var(--grid-line)' }}>
      {/* Header — always visible */}
      <button
        onClick={toggleCollapsed}
        className="w-full flex items-center justify-between px-5 py-3 ink-hover"
        style={{ borderBottom: collapsed ? 'none' : '1px solid var(--grid-line)' }}
      >
        <div className="flex items-center gap-2">
          <span
            className="transition-transform duration-300"
            style={{ transform: collapsed ? 'rotate(-90deg)' : 'rotate(0deg)', color: 'var(--text-tertiary)' }}
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
              <path d="M5 1L1 5l4 4 4-4-4-4z" />
            </svg>
          </span>
          <span className="text-xs font-semibold label-spaced" style={{ color: 'var(--text-secondary)' }}>
            {isBreak ? '休息' : '番茄钟'}
          </span>
          {isRunning && (
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: isBreak ? 'var(--success)' : 'var(--accent)' }} />
          )}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold tabular-nums serif-display" style={{ color: isBreak ? 'var(--success)' : 'var(--text-primary)' }}>
            {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
          </span>
          <span className="text-[10px] font-semibold" style={{ color: 'var(--text-tertiary)' }}>
            {sessions} 番茄
          </span>
        </div>
      </button>

      {/* Collapsible body */}
      <div
        className="overflow-hidden transition-all duration-300 ease-in-out"
        style={{
          maxHeight: collapsed ? '0px' : '600px',
          opacity: collapsed ? 0 : 1,
        }}
      >
        <div className="flex flex-col items-center gap-4 py-4 px-5">
          {/* Preset + custom time */}
          <div className="flex items-center gap-2 flex-wrap justify-center">
            <div className="flex gap-0" style={{ border: '1px solid var(--grid-line)', borderRadius: 'var(--radius-sm)' }}>
              {PRESETS.map(p => {
                const active = p.work === workMinutes && p.break === breakMinutes;
                return (
                  <button
                    key={p.label}
                    onClick={() => selectPreset(p.work, p.break)}
                    className="px-3 py-1 text-[10px] font-semibold tracking-wide transition-colors"
                    style={{
                      background: active ? 'var(--accent)' : 'transparent',
                      color: active ? 'var(--accent-text)' : 'var(--text-tertiary)',
                    }}
                  >
                    {p.label}
                  </button>
                );
              })}
            </div>

          </div>

          {/* Circular timer */}
          <div className="relative" style={{ width: 190, height: 190 }}>
            <svg width="190" height="190" viewBox="0 0 190 190" style={{ transform: 'rotate(-90deg)' }}>
              {/* Background track */}
              <circle
                cx="95" cy="95" r={CIRCLE_R}
                fill="none"
                stroke="var(--bg-hover)"
                strokeWidth="5"
                strokeLinecap="round"
              />
              {/* Progress ring */}
              <circle
                cx="95" cy="95" r={CIRCLE_R}
                fill="none"
                stroke={isBreak ? 'var(--success)' : 'var(--accent)'}
                strokeWidth="5"
                strokeLinecap="round"
                strokeDasharray={CIRCLE_C}
                strokeDashoffset={dashOffset}
                style={{
                  transition: animReady ? 'stroke-dashoffset 1s linear, stroke 0.3s ease' : 'none',
                  filter: isRunning ? `drop-shadow(0 0 4px ${isBreak ? 'var(--success)' : 'var(--accent)'}33)` : 'none',
                }}
              />
            </svg>
            {/* Center content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <div className="flex items-center gap-1 mb-0.5">
                <span className="text-xl">{phaseIcon}</span>
              </div>
              <div className="relative pointer-events-auto">
                <div
                  onClick={() => { if (!isRunning) setPickerOpen(o => !o); }}
                  className="text-4xl font-black tracking-tight tabular-nums serif-display flex items-center cursor-pointer"
                  style={{ color: isBreak ? 'var(--success)' : 'var(--text-primary)' }}
                >
                  <span onWheel={handleTimeWheel('minutes')} className="cursor-ns-resize select-none">{String(mins).padStart(2, '0')}</span>
                  <span>:</span>
                  <span onWheel={handleTimeWheel('seconds')} className="cursor-ns-resize select-none">{String(secs).padStart(2, '0')}</span>
                </div>
                {pickerOpen && (
                  <div
                    ref={pickerRef}
                    className="absolute left-1/2 top-full mt-2 z-50 -translate-x-1/2"
                    style={{
                      background: 'var(--bg-surface)',
                      border: '1px solid var(--grid-line)',
                      borderRadius: 'var(--radius-md)',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                    }}
                  >
                    <div className="px-4 py-3">
                      <div className="text-[10px] font-semibold label-spaced mb-3 text-center" style={{ color: 'var(--text-secondary)' }}>
                        {phaseIcon} {phaseLabel} · 调节时间
                      </div>
                      <div className="flex items-center gap-4">
                        {/* Minutes */}
                        <div className="flex flex-col items-center gap-1">
                          <span className="text-[9px] font-semibold" style={{ color: 'var(--text-tertiary)' }}>分</span>
                          <div className="flex gap-1 items-center" style={{
                            background: 'var(--bg-muted)',
                            borderRadius: 'var(--radius-sm)',
                            padding: '4px 6px',
                          }}>
                            <DigitWheel value={Math.floor(mins / 10)} max={9} onDelta={d => handleDigitDelta('minTens', d)} />
                            <DigitWheel value={mins % 10} max={9} onDelta={d => handleDigitDelta('minOnes', d)} />
                          </div>
                        </div>
                        <span className="text-xl font-bold mt-3" style={{ color: 'var(--text-tertiary)' }}>:</span>
                        {/* Seconds */}
                        <div className="flex flex-col items-center gap-1">
                          <span className="text-[9px] font-semibold" style={{ color: 'var(--text-tertiary)' }}>秒</span>
                          <div className="flex gap-1 items-center" style={{
                            background: 'var(--bg-muted)',
                            borderRadius: 'var(--radius-sm)',
                            padding: '4px 6px',
                          }}>
                            <DigitWheel value={Math.floor(secs / 10)} max={5} onDelta={d => handleDigitDelta('secTens', d)} />
                            <DigitWheel value={secs % 10} max={9} onDelta={d => handleDigitDelta('secOnes', d)} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="text-[10px] font-semibold label-spaced mt-1" style={{ color: 'var(--text-tertiary)' }}>
                {phaseLabel}
              </div>
              {isRunning && (
                <div className="text-[9px] mt-0.5" style={{ color: 'var(--text-tertiary)' }}>
                  预计 {mins} 分钟后
                </div>
              )}
            </div>
          </div>

          {/* Session dots */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-semibold" style={{ color: 'var(--text-tertiary)' }}>今日</span>
            <span className="text-lg font-bold serif-display" style={{ color: 'var(--accent-strong)' }}>{sessions}</span>
            <span className="text-[10px] font-semibold" style={{ color: 'var(--text-tertiary)' }}>个番茄</span>
            {[...Array(Math.min(sessions, 8))].map((_, i) => (
              <span key={i} className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: 'var(--accent)', opacity: 0.6 }} />
            ))}
          </div>

          {/* Controls */}
          <div className="flex items-center gap-3">
            <button
              onClick={reset}
              className="ink-hover w-9 h-9 rounded-full flex items-center justify-center"
              style={{ border: '1px solid var(--grid-line)', color: 'var(--text-secondary)' }}
              title="重置"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M1 4v6h6" />
                <path d="M3.5 15.5a9 9 0 102.1-10.3L1 10" />
              </svg>
            </button>
            <button
              onClick={toggle}
              className="ink-hover w-14 h-14 rounded-full flex items-center justify-center transition-all duration-200"
              style={{
                background: isRunning ? 'var(--warn-bg)' : 'var(--accent)',
                color: isRunning ? 'var(--warn)' : 'var(--accent-text)',
                border: isRunning ? '1px solid var(--warn)' : '1px solid var(--accent)',
                boxShadow: isRunning ? '0 0 20px rgba(196, 148, 62, 0.2)' : '0 0 20px rgba(196, 30, 58, 0.2)',
              }}
            >
              {isRunning ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="6" y="4" width="4" height="16" rx="1" />
                  <rect x="14" y="4" width="4" height="16" rx="1" />
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </button>
            {/* Skip — only when paused */}
            {!isRunning && (
              <button
                onClick={skipPhase}
                className="ink-hover w-9 h-9 rounded-full flex items-center justify-center"
                style={{ border: '1px solid var(--grid-line)', color: 'var(--text-secondary)' }}
                title="跳过"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 4l10 8-10 8V4z" />
                  <path d="M19 5v14" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
