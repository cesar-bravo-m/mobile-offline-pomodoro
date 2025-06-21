import AsyncStorage from '@react-native-async-storage/async-storage';
import { ALL_BADGES, Badge } from '@/constants/badges';
import React, { createContext, useEffect, useState } from 'react';

interface SessionEntry {
  timestamp: number;
  mode: 'focus' | 'break';
  duration: number;
  completed: boolean;
}

interface GamificationState {
  coins: number;
  level: number;
  badges: Badge[];
  badgeDates: Record<Badge, number | null>;
  completedPomodoros: number;
  totalFocusTime: number;
  sessions: SessionEntry[];
  recentBadge: Badge | null;
}

interface GamificationContextType extends GamificationState {
  completeSession: (
    mode: 'focus' | 'break',
    duration: number,
    completed: boolean
  ) => void;
  clearRecentBadge: () => void;
}

const defaultState: GamificationState = {
  coins: 0,
  level: 1,
  badges: [],
  badgeDates: ALL_BADGES.reduce<Record<Badge, number | null>>(
    (acc, b) => ({ ...acc, [b]: null }),
    {}
  ),
  completedPomodoros: 0,
  totalFocusTime: 0,
  sessions: [],
  recentBadge: null,
};

export const GamificationContext = createContext<GamificationContextType>({
  ...defaultState,
  completeSession: () => {},
  clearRecentBadge: () => {},
});

const STORAGE_KEY = 'gamificationState';

const isRainy = async (): Promise<boolean> => {
  // Placeholder for weather check. Integrate with weather API here.
  return false;
};

export const GamificationProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, setState] = useState<GamificationState>(defaultState);

  useEffect(() => {
    (async () => {
      try {
        const data = await AsyncStorage.getItem(STORAGE_KEY);
        if (data) {
          setState(JSON.parse(data));
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

  const completeSession = async (
    mode: 'focus' | 'break',
    duration: number,
    completed: boolean
  ) => {
    const now = new Date();
    const sessions = [
      ...state.sessions,
      { timestamp: now.getTime(), mode, duration, completed },
    ];

    let { coins, completedPomodoros, totalFocusTime, badges, badgeDates } = state;

    let recentBadge: Badge | null = null;

    if (completed && mode === 'focus') {
      completedPomodoros += 1;
      totalFocusTime += duration;
      coins += 10; // 10 coins per focus session
    }

    // Badge conditions
    if (completedPomodoros >= 1 && !badges.includes('First pomodoro')) {
      badges = [...badges, 'First pomodoro'];
      badgeDates['First pomodoro'] = now.getTime();
      recentBadge = 'First pomodoro';
    }

    if (totalFocusTime >= 3600 && !badges.includes('Hour hero')) {
      badges = [...badges, 'Hour hero'];
      badgeDates['Hour hero'] = now.getTime();
      recentBadge = 'Hour hero';
    }

    const hour = now.getHours();
    if (completed && mode === 'focus' && hour < 10 && !badges.includes('Early bird')) {
      badges = [...badges, 'Early bird'];
      badgeDates['Early bird'] = now.getTime();
      recentBadge = 'Early bird';
    }

    if (completed && mode === 'focus' && hour >= 22 && !badges.includes('Night owl')) {
      badges = [...badges, 'Night owl'];
      badgeDates['Night owl'] = now.getTime();
      recentBadge = 'Night owl';
    }

    if (completed && mode === 'break' && duration >= 900 && !badges.includes('AFK')) {
      badges = [...badges, 'AFK'];
      badgeDates['AFK'] = now.getTime();
      recentBadge = 'AFK';
    }

    if (completed && !badges.includes('Power hour')) {
      const todayHours = sessions
        .filter(
          (s) =>
            s.mode === 'focus' && new Date(s.timestamp).toDateString() === now.toDateString()
        )
        .map((s) => new Date(s.timestamp).getHours());
      const required = [9, 10, 11, 12, 13, 14, 15, 16];
      if (required.every((h) => todayHours.includes(h))) {
        badges = [...badges, 'Power hour'];
        badgeDates['Power hour'] = now.getTime();
        recentBadge = 'Power hour';
      }
    }

    if (completed && mode === 'focus' && !badges.includes('Rainy day focuser')) {
      try {
        if (await isRainy()) {
          badges = [...badges, 'Rainy day focuser'];
          badgeDates['Rainy day focuser'] = now.getTime();
          recentBadge = 'Rainy day focuser';
        }
      } catch (e) {
        console.log('Weather check failed', e);
      }
    }

    const level = Math.floor(completedPomodoros / 10) + 1;

    setState({
      coins,
      level,
      badges,
      badgeDates,
      completedPomodoros,
      totalFocusTime,
      sessions,
      recentBadge,
    });
  };

  const clearRecentBadge = () => {
    setState((prev) => ({ ...prev, recentBadge: null }));
  };

  return (
    <GamificationContext.Provider value={{ ...state, completeSession, clearRecentBadge }}>
      {children}
    </GamificationContext.Provider>
  );
};
