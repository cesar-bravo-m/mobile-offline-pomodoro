import { useNotification } from '@/components/NotificationManager';
import { Badge } from '@/constants/badges';
import { Objective } from '@/constants/objectives';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useEffect, useRef, useState } from 'react';

interface SessionEntry {
  timestamp: number;
  objective: Objective;
  duration: number;
}

interface GamificationState {
  coins: number;
  level: number;
  badges: Badge[];
  completedPomodoros: number;
  totalFocusTime: number;
  sessions: SessionEntry[];
  isTimerRunning: boolean;
  currentSessionObjective: Objective | null;
  currentSessionStartTime: number | null;
  currentSessionDuration: number | null;
  remainingTime: number | null;
  displayObjective: Objective | null;
}

interface GamificationContextType extends GamificationState {
  completeSession: (objective: Objective, duration: number) => void;
  resetProgress: () => void;
  startTimer: (objective: Objective, duration: number) => void;
  stopTimer: () => void;
  resumeTimer: () => void;
  getRemainingTime: () => number | null;
  setDisplayObjective: (objective: Objective | null) => void;
}

const defaultState: GamificationState = {
  coins: 0,
  level: 1,
  badges: [],
  completedPomodoros: 0,
  totalFocusTime: 0,
  sessions: [],
  isTimerRunning: false,
  currentSessionObjective: null,
  currentSessionStartTime: null,
  currentSessionDuration: null,
  remainingTime: null,
  displayObjective: null,
};

export const GamificationContext = createContext<GamificationContextType>({
  ...defaultState,
  completeSession: () => {},
  resetProgress: () => {},
  startTimer: () => {},
  stopTimer: () => {},
  resumeTimer: () => {},
  getRemainingTime: () => null,
  setDisplayObjective: () => {},
});

const STORAGE_KEY = 'gamificationState';

const isRainy = async (): Promise<boolean> => {
  // Placeholder for weather check. Integrate with weather API here.
  return false;
};

export const GamificationProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, setState] = useState<GamificationState>(defaultState);
  const { showNotification } = useNotification();
  const timerInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  // Timer management
  useEffect(() => {
    if (state.isTimerRunning && state.currentSessionStartTime && state.currentSessionDuration) {
      // Start timer interval
      timerInterval.current = setInterval(() => {
        const now = Date.now();
        const elapsed = Math.floor((now - state.currentSessionStartTime!) / 1000);
        const remaining = state.currentSessionDuration! - elapsed;
        
        if (remaining <= 0) {
          // Timer completed
          completeSession(state.currentSessionObjective!, state.currentSessionDuration!);
        } else {
          // Update remaining time
          setState(prev => ({
            ...prev,
            remainingTime: remaining,
          }));
        }
      }, 1000);

      return () => {
        if (timerInterval.current) {
          clearInterval(timerInterval.current);
          timerInterval.current = null;
        }
      };
    } else {
      // Clear timer interval when not running
      if (timerInterval.current) {
        clearInterval(timerInterval.current);
        timerInterval.current = null;
      }
      // Do NOT clear remainingTime here so the timer can be resumed
    }
  }, [state.isTimerRunning, state.currentSessionStartTime, state.currentSessionDuration, state.currentSessionObjective]);

  useEffect(() => {
    (async () => {
      try {
        const data = await AsyncStorage.getItem(STORAGE_KEY);
        if (data) {
          const parsedData = JSON.parse(data);
          // Ensure timer state is reset on app restart
          setState({
            ...parsedData,
            isTimerRunning: false,
            currentSessionObjective: null,
            currentSessionStartTime: null,
            currentSessionDuration: null,
            remainingTime: null,
          });
        }
      } catch (e) {
        console.log('Failed to load gamification state', e);
      }
    })();
  }, []);

  useEffect(() => {
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state)).catch((e) =>
      console.log('Failed to save gamification state', e)
    );
  }, [state]);

  const startTimer = useCallback((objective: Objective, duration: number) => {
    setState(prev => ({
      ...prev,
      isTimerRunning: true,
      currentSessionObjective: objective,
      currentSessionStartTime: Date.now(),
      currentSessionDuration: duration,
      remainingTime: duration,
    }));
  }, []);

  const resumeTimer = useCallback(() => {
    if (state.remainingTime !== null) {
      setState(prev => ({
        ...prev,
        isTimerRunning: true,
        currentSessionStartTime: Date.now() - ((prev.currentSessionDuration! - prev.remainingTime!) * 1000),
      }));
    }
  }, [state.remainingTime, state.currentSessionDuration]);

  const stopTimer = useCallback(() => {
    if (timerInterval.current) {
      clearInterval(timerInterval.current);
      timerInterval.current = null;
    }
    setState(prev => ({
      ...prev,
      isTimerRunning: false,
      currentSessionStartTime: null,
      // Don't clear currentSessionObjective, currentSessionDuration, or remainingTime
      // so the timer can be resumed
    }));
  }, []);

  const getRemainingTime = useCallback(() => {
    return state.remainingTime;
  }, [state.remainingTime]);

  const completeSession = useCallback(async (objective: Objective, duration: number) => {
    // Stop timer first
    if (timerInterval.current) {
      clearInterval(timerInterval.current);
      timerInterval.current = null;
    }

    const now = new Date();
    const sessions = [...state.sessions, { timestamp: now.getTime(), objective, duration }];

    let { coins, completedPomodoros, totalFocusTime, badges } = state;

    if (objective === 'Focus') {
      completedPomodoros += 1;
      totalFocusTime += duration;
      coins += 10; // 10 coins per focus session
    }

    // Track new badges earned
    const newBadges: Badge[] = [];

    // Badge conditions
    if (completedPomodoros >= 1 && !badges.includes('First pomodoro')) {
      badges = [...badges, 'First pomodoro'];
      newBadges.push('First pomodoro');
    }

    if (totalFocusTime >= 3600 && !badges.includes('Hour hero')) {
      badges = [...badges, 'Hour hero'];
      newBadges.push('Hour hero');
    }

    const hour = now.getHours();
    if (objective === 'Focus' && hour < 10 && !badges.includes('Early bird')) {
      badges = [...badges, 'Early bird'];
      newBadges.push('Early bird');
    }

    if (objective === 'Focus' && hour >= 22 && !badges.includes('Night owl')) {
      badges = [...badges, 'Night owl'];
      newBadges.push('Night owl');
    }

    if (!badges.includes('Power hour')) {
      const todayHours = sessions
        .filter(
          (s) =>
            s.objective === 'Focus' && new Date(s.timestamp).toDateString() === now.toDateString()
        )
        .map((s) => new Date(s.timestamp).getHours());
      const required = [9, 10, 11, 12, 13, 14, 15, 16];
      if (required.every((h) => todayHours.includes(h))) {
        badges = [...badges, 'Power hour'];
        newBadges.push('Power hour');
      }
    }

    if (objective === 'Focus' && !badges.includes('Rainy day focuser')) {
      try {
        if (await isRainy()) {
          badges = [...badges, 'Rainy day focuser'];
          newBadges.push('Rainy day focuser');
        }
      } catch (e) {
        console.log('Weather check failed', e);
      }
    }

    const level = Math.floor(completedPomodoros / 10) + 1;

    const newState = {
      coins,
      level,
      badges,
      completedPomodoros,
      totalFocusTime,
      sessions,
      isTimerRunning: false,
      currentSessionObjective: null,
      currentSessionStartTime: null,
      currentSessionDuration: null,
      remainingTime: null,
      displayObjective: state.displayObjective, // Preserve display objective
    };

    setState(newState);

    // Show notifications
    const sessionType = objective;
    const durationMinutes = Math.floor(duration / 60);
    showNotification(
      `${sessionType} Great job!`,
      `You completed a ${durationMinutes}-minute ${sessionType.toLowerCase()} session.`
    );

    // Show badge notifications
    newBadges.forEach((badge) => {
      showNotification(
        'New Badge Earned!',
        `Congratulations! You earned the "${badge}" badge.`,
        'success'
      );
    });
  }, [state.sessions, state.coins, state.completedPomodoros, state.totalFocusTime, state.badges, state.displayObjective, showNotification]);

  const resetProgress = useCallback(() => {
    setState({
      ...defaultState,
      displayObjective: state.displayObjective, // Preserve display objective
    });
  }, [state.displayObjective]);

  const setDisplayObjective = useCallback((objective: Objective | null) => {
    setState(prev => ({
      ...prev,
      displayObjective: objective,
    }));
  }, []);

  return (
    <GamificationContext.Provider value={{
      ...state,
      completeSession, 
      resetProgress, 
      startTimer, 
      stopTimer,
      resumeTimer,
      getRemainingTime,
      setDisplayObjective
    }}>
      {children}
    </GamificationContext.Provider>
  );
};
