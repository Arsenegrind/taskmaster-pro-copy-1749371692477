import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

export type TimerStatus = 'idle' | 'work' | 'shortBreak' | 'longBreak' | 'paused' | 'waiting';

export interface PomodoroSettings {
  workDuration: number; // in minutes
  shortBreakDuration: number; // in minutes
  longBreakDuration: number; // in minutes
  sessionsBeforeLongBreak: number;
  waitingTime: number; // in minutes for delay between sessions
}

interface PomodoroContextType {
  settings: PomodoroSettings;
  updateSettings: (newSettings: PomodoroSettings) => void;
  status: TimerStatus;
  currentSession: number;
  timeRemaining: number; // in seconds
  startTimer: () => void;
  pauseTimer: () => void;
  resetTimer: () => void;
  skipToNext: () => void;
}

const defaultSettings: PomodoroSettings = {
  workDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  sessionsBeforeLongBreak: 4,
  waitingTime: 0,
};

const PomodoroContext = createContext<PomodoroContextType | undefined>(undefined);

export const usePomodoroContext = () => {
  const context = useContext(PomodoroContext);
  if (!context) {
    throw new Error('usePomodoroContext must be used within a PomodoroProvider');
  }
  return context;
};

export const PomodoroProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<PomodoroSettings>(defaultSettings);
  const [status, setStatus] = useState<TimerStatus>('idle');
  const [currentSession, setCurrentSession] = useState(1);
  const [timeRemaining, setTimeRemaining] = useState(settings.workDuration * 60);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Effect to handle timer countdown
  useEffect(() => {
    if (status !== 'work' && status !== 'shortBreak' && status !== 'longBreak' && status !== 'waiting') {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }
    
    timerRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          handleTimerComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [status]);
  
  // Effect to set initial time when settings change
  useEffect(() => {
    if (status === 'idle') {
      setTimeRemaining(settings.workDuration * 60);
    }
  }, [settings, status]);
  
  const handleTimerComplete = () => {
    // Play notification sound
    // Vibrate device
    
    // If we just finished waiting, move to next actual session
    if (status === 'waiting') {
      // proceed to next phase
      return proceedPhase();
    }
    
    // If just finished a work session
    if (status === 'work') {
      const nextIsLong = currentSession % settings.sessionsBeforeLongBreak === 0;
      const nextStatus = nextIsLong ? 'longBreak' : 'shortBreak';
      const nextDuration = (nextIsLong ? settings.longBreakDuration : settings.shortBreakDuration) * 60;
      if (settings.waitingTime > 0) {
        setStatus('waiting');
        setTimeRemaining(settings.waitingTime * 60);
        return;
      }
      setStatus(nextStatus);
      setTimeRemaining(nextDuration);
      return;
    }
    
    // If finished a break session
    if (status === 'shortBreak' || status === 'longBreak') {
      if (settings.waitingTime > 0) {
        setStatus('waiting');
        setTimeRemaining(settings.waitingTime * 60);
        return;
      }
      return proceedPhase();
    }
  };
  
  const proceedPhase = () => {
    // Clear waiting or break, start work
    if (status === 'longBreak') {
      setCurrentSession(1);
    } else if (status === 'shortBreak') {
      setCurrentSession(prev => prev + 1);
    }
    setStatus('work');
    setTimeRemaining(settings.workDuration * 60);
  };
  
  const startTimer = () => {
    if (status === 'idle' || status === 'paused') {
      setStatus('work');
    }
  };
  
  const pauseTimer = () => {
    if (status === 'work' || status === 'shortBreak' || status === 'longBreak') {
      setStatus('paused');
    }
  };
  
  const resetTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setStatus('idle');
    setCurrentSession(1);
    setTimeRemaining(settings.workDuration * 60);
  };
  
  const skipToNext = () => {
    if (status === 'work') {
      if (currentSession % settings.sessionsBeforeLongBreak === 0) {
        setStatus('longBreak');
        setTimeRemaining(settings.longBreakDuration * 60);
      } else {
        setStatus('shortBreak');
        setTimeRemaining(settings.shortBreakDuration * 60);
      }
    } else if (status === 'shortBreak' || status === 'longBreak') {
      setStatus('work');
      setTimeRemaining(settings.workDuration * 60);
      if (status === 'longBreak') {
        setCurrentSession(1);
      } else {
        setCurrentSession(prev => prev + 1);
      }
    }
  };
  
  const updateSettings = (newSettings: PomodoroSettings) => {
    setSettings(newSettings);
    
    // If timer is idle, update the time remaining based on new settings
    if (status === 'idle') {
      setTimeRemaining(newSettings.workDuration * 60);
    }
  };
  
  return (
    <PomodoroContext.Provider 
      value={{ 
        settings, 
        updateSettings, 
        status, 
        currentSession, 
        timeRemaining, 
        startTimer, 
        pauseTimer, 
        resetTimer,
        skipToNext
      }}
    >
      {children}
    </PomodoroContext.Provider>
  );
};