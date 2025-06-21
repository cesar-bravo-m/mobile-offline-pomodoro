import { useNotification } from '@/components/NotificationManager';
import { Badge } from '@/constants/badges';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useEffect, useState } from 'react';

interface SessionEntry {
  timestamp: number;
  mode: 'focus' | 'break';
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
  currentSessionMode: 'focus' | 'break' | null;
  currentSessionStartTime: number | null;
  currentSessionDuration: number | null;
}

interface GamificationContextType extends GamificationState {
  completeSession: (mode: 'focus' | 'break', duration: number) => void;
  resetProgress: () => void;
  startTimer: (mode: 'focus' | 'break', duration: number) => void;
  stopTimer: () => void;
}

const defaultState: GamificationState = {
  coins: 0,
  level: 1,
  badges: [],
  completedPomodoros: 0,
  totalFocusTime: 0,
  sessions: [],
  isTimerRunning: false,
  currentSessionMode: null,
  currentSessionStartTime: null,
  currentSessionDuration: null,
};

export const GamificationContext = createContext<GamificationContextType>({
  ...defaultState,
  completeSession: () => {},
  resetProgress: () => {},
  startTimer: () => {},
  stopTimer: () => {},
});

const STORAGE_KEY = 'gamificationState';

const isRainy = async (): Promise<boolean> => {
  // Placeholder for weather check. Integrate with weather API here.
  return false;
};

export const GamificationProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, setState] = useState<GamificationState>(defaultState);
  const { showNotification } = useNotification();

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
            currentSessionMode: null,
            currentSessionStartTime: null,
            currentSessionDuration: null,
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

  const startTimer = (mode: 'focus' | 'break', duration: number) => {
    setState(prev => ({
      ...prev,
      isTimerRunning: true,
      currentSessionMode: mode,
      currentSessionStartTime: Date.now(),
      currentSessionDuration: duration,
    }));
  };

  const stopTimer = () => {
    setState(prev => ({
      ...prev,
      isTimerRunning: false,
      currentSessionMode: null,
      currentSessionStartTime: null,
      currentSessionDuration: null,
    }));
  };

  const completeSession = async (mode: 'focus' | 'break', duration: number) => {
    const now = new Date();
    const sessions = [...state.sessions, { timestamp: now.getTime(), mode, duration }];

    let { coins, completedPomodoros, totalFocusTime, badges } = state;

    if (mode === 'focus') {
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
    if (mode === 'focus' && hour < 10 && !badges.includes('Early bird')) {
      badges = [...badges, 'Early bird'];
      newBadges.push('Early bird');
    }

    if (mode === 'focus' && hour >= 22 && !badges.includes('Night owl')) {
      badges = [...badges, 'Night owl'];
      newBadges.push('Night owl');
    }

    if (mode === 'break' && duration >= 900 && !badges.includes('AFK')) {
      badges = [...badges, 'AFK'];
      newBadges.push('AFK');
    }

    if (!badges.includes('Power hour')) {
      const todayHours = sessions
        .filter(
          (s) =>
            s.mode === 'focus' && new Date(s.timestamp).toDateString() === now.toDateString()
        )
        .map((s) => new Date(s.timestamp).getHours());
      const required = [9, 10, 11, 12, 13, 14, 15, 16];
      if (required.every((h) => todayHours.includes(h))) {
        badges = [...badges, 'Power hour'];
        newBadges.push('Power hour');
      }
    }

    if (mode === 'focus' && !badges.includes('Rainy day focuser')) {
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
      currentSessionMode: null,
      currentSessionStartTime: null,
      currentSessionDuration: null,
    };

    setState(newState);

    // Show notifications
    const sessionType = mode === 'focus' ? 'Focus' : 'Break';
    const durationMinutes = Math.floor(duration / 60);
    showNotification(
      `${sessionType} Great job!`,
      `You completed a ${durationMinutes}-minute ${sessionType.toLowerCase()} session.`
    );

    // Show badge notifications
    newBadges.forEach(badge => {
      showNotification(
        'You\'ve earned a badge!',
        badge
      );
    });
  };

  const resetProgress = () => {
    setState(defaultState);
    AsyncStorage.removeItem(STORAGE_KEY).catch((e) =>
      console.log('Failed to clear gamification state', e)
    );
  };

  return (
    <GamificationContext.Provider value={{ 
      ...state, 
      completeSession, 
      resetProgress, 
      startTimer, 
      stopTimer
    }}>
      {children}
    </GamificationContext.Provider>
  );
};
