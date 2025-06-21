import AsyncStorage from '@react-native-async-storage/async-storage';
import { ALL_BADGES, Badge } from '@/constants/badges';

export interface EarnedBadge {
  name: Badge;
  earnedAt: number;
}
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
  badges: EarnedBadge[];
  completedPomodoros: number;
  totalFocusTime: number;
  sessions: SessionEntry[];
}

interface GamificationContextType extends GamificationState {
  completeSession: (mode: 'focus' | 'break', duration: number) => void;
  logSession: (mode: 'focus' | 'break', duration: number, completed: boolean) => void;
  badgeJustEarned: EarnedBadge | null;
  acknowledgeBadge: () => void;
}

const defaultState: GamificationState = {
  coins: 0,
  level: 1,
  badges: [],
  completedPomodoros: 0,
  totalFocusTime: 0,
  sessions: [],
};

export const GamificationContext = createContext<GamificationContextType>({
  ...defaultState,
  completeSession: () => {},
  logSession: () => {},
  badgeJustEarned: null,
  acknowledgeBadge: () => {},
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

  const logSession = (mode: 'focus' | 'break', duration: number, completed: boolean) => {
    const timestamp = Date.now();
    setState((prev) => ({
      ...prev,
      sessions: [...prev.sessions, { timestamp, mode, duration, completed }],
    }));
  };

  const [badgeJustEarned, setBadgeJustEarned] = useState<EarnedBadge | null>(null);

  const acknowledgeBadge = () => setBadgeJustEarned(null);

  const completeSession = async (mode: 'focus' | 'break', duration: number) => {
    const now = new Date();
    const sessions = [...state.sessions, { timestamp: now.getTime(), mode, duration, completed: true }];

    let { coins, completedPomodoros, totalFocusTime, badges } = state;

    if (mode === 'focus') {
      completedPomodoros += 1;
      totalFocusTime += duration;
      coins += 10; // 10 coins per focus session
    }

    // Badge conditions
    const addBadge = (name: Badge) => {
      if (!badges.find((b) => b.name === name)) {
        const earned = { name, earnedAt: now.getTime() };
        badges = [...badges, earned];
        setBadgeJustEarned(earned);
      }
    };

    if (completedPomodoros >= 1) {
      addBadge('First pomodoro');
    }

    if (totalFocusTime >= 3600) {
      addBadge('Hour hero');
    }

    const hour = now.getHours();
    if (mode === 'focus' && hour < 10) {
      addBadge('Early bird');
    }

    if (mode === 'focus' && hour >= 22) {
      addBadge('Night owl');
    }

    if (mode === 'break' && duration >= 900) {
      addBadge('AFK');
    }

    if (!badges.find((b) => b.name === 'Power hour')) {
      const todayHours = sessions
        .filter(
          (s) =>
            s.mode === 'focus' && new Date(s.timestamp).toDateString() === now.toDateString()
        )
        .map((s) => new Date(s.timestamp).getHours());
      const required = [9, 10, 11, 12, 13, 14, 15, 16];
      if (required.every((h) => todayHours.includes(h))) {
        addBadge('Power hour');
      }
    }

    if (mode === 'focus' && !badges.find((b) => b.name === 'Rainy day focuser')) {
      try {
        if (await isRainy()) {
          addBadge('Rainy day focuser');
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
      completedPomodoros,
      totalFocusTime,
      sessions,
    });
  };

  return (
    <GamificationContext.Provider value={{ ...state, completeSession, logSession, badgeJustEarned, acknowledgeBadge }}>
      {children}
    </GamificationContext.Provider>
  );
};
