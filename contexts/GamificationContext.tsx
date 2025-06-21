import { useNotification } from '@/components/NotificationManager';
import { Badge } from '@/constants/badges';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useEffect, useRef, useState } from 'react';

interface SessionEntry {
  timestamp: number;
  objective: string;
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
  currentObjective: string | null;
  currentSessionStartTime: number | null;
  currentSessionDuration: number | null;
  remainingTime: number | null;
  displayObjective: string | null;
}

interface GamificationContextType extends GamificationState {
  completeSession: (objective: string, duration: number) => void;
  resetProgress: () => void;
  clearLogs: () => void;
  startTimer: (objective: string, duration: number) => void;
  stopTimer: () => void;
  resumeTimer: () => void;
  getRemainingTime: () => number | null;
  setDisplayObjective: (objective: string | null) => void;
}

const defaultState: GamificationState = {
  coins: 0,
  level: 1,
  badges: [],
  completedPomodoros: 0,
  totalFocusTime: 0,
  sessions: [],
  isTimerRunning: false,
  currentObjective: null,
  currentSessionStartTime: null,
  currentSessionDuration: null,
  remainingTime: null,
  displayObjective: null,
};

export const GamificationContext = createContext<GamificationContextType>({
  ...defaultState,
  completeSession: () => {},
  resetProgress: () => {},
  clearLogs: () => {},
  startTimer: () => {},
  stopTimer: () => {},
  resumeTimer: () => {},
  getRemainingTime: () => null,
  setDisplayObjective: () => {},
});

const STORAGE_KEY = 'gamificationState';

// Tier definitions for badge restrictions
const TIER_1_BADGES: Badge[] = ['Productivity pioneer', 'Focus sprout', 'Focus seedling', 'Focus sapling', 'Focus hero', 'Dawn warrior'];
const TIER_2_BADGES: Badge[] = ['Hour hero', 'Early bird', 'Night owl', 'Marathon mind', 'Weekend warrior', 'AFK', 'Focus legend', 'Midday master', 'Twilight tactician'];
const TIER_3_BADGES: Badge[] = ['Badge hunter', 'Badge collector', 'Power hour', 'Badge connoisseur', 'Completionist'];

// Helper function to get the tier of a badge
const getBadgeTier = (badgeName: Badge): number => {
  if (TIER_1_BADGES.includes(badgeName)) return 1;
  if (TIER_2_BADGES.includes(badgeName)) return 2;
  if (TIER_3_BADGES.includes(badgeName)) return 3;
  return 1; // Default to tier 1
};

// Helper function to check if a tier is unlocked
const isTierUnlocked = (tier: number, earnedBadgeCount: number): boolean => {
  switch (tier) {
    case 1: return true; // Tier 1 always unlocked
    case 2: return earnedBadgeCount >= 4; // Need 4 badges for tier 2
    case 3: return earnedBadgeCount >= 10; // Need 10 badges for tier 3
    default: return false;
  }
};

// Helper function to check if a badge can be earned
const canEarnBadge = (badgeName: Badge, earnedBadgeCount: number): boolean => {
  const tier = getBadgeTier(badgeName);
  return isTierUnlocked(tier, earnedBadgeCount);
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
        const remaining = Math.max(0, state.currentSessionDuration! - elapsed);
        
        // Update remaining time first
        setState(prev => ({
          ...prev,
          remainingTime: remaining,
        }));
        
        if (remaining <= 0) {
          // Timer completed - delay completion slightly to ensure UI shows 00:00
          setTimeout(() => {
            completeSession(state.currentObjective!, state.currentSessionDuration!);
          }, 100);
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
  }, [state.isTimerRunning, state.currentSessionStartTime, state.currentSessionDuration, state.currentObjective]);

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
            currentObjective: null,
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

  const startTimer = useCallback((objective: string, duration: number) => {
    setState(prev => ({
      ...prev,
      isTimerRunning: true,
      currentObjective: objective,
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
      // Don't clear currentObjective, currentSessionDuration, or remainingTime
      // so the timer can be resumed
    }));
  }, []);

  const getRemainingTime = useCallback(() => {
    return state.remainingTime;
  }, [state.remainingTime]);

  const completeSession = useCallback(async (objective: string, duration: number) => {
    // Stop timer first
    if (timerInterval.current) {
      clearInterval(timerInterval.current);
      timerInterval.current = null;
    }

    const now = new Date();
    const sessions = [...state.sessions, { timestamp: now.getTime(), objective, duration }];

    let { coins, completedPomodoros, totalFocusTime, badges } = state;

    completedPomodoros += 1;
    totalFocusTime += duration;
    coins += 10; // 10 coins per session

    // Track new badges earned
    const newBadges: Badge[] = [];

    // Badge conditions
    if (completedPomodoros >= 1 && !badges.includes('Productivity pioneer') && canEarnBadge('Productivity pioneer', badges.length)) {
      badges = [...badges, 'Productivity pioneer'];
      newBadges.push('Productivity pioneer');
    }

    if (totalFocusTime >= 3600 && !badges.includes('Hour hero') && canEarnBadge('Hour hero', badges.length)) {
      badges = [...badges, 'Hour hero'];
      newBadges.push('Hour hero');
    }

    const hour = now.getHours();
    if (hour < 10 && !badges.includes('Early bird') && canEarnBadge('Early bird', badges.length)) {
      badges = [...badges, 'Early bird'];
      newBadges.push('Early bird');
    }

    if (hour >= 22 && !badges.includes('Night owl') && canEarnBadge('Night owl', badges.length)) {
      badges = [...badges, 'Night owl'];
      newBadges.push('Night owl');
    }

    if (!badges.includes('Power hour') && canEarnBadge('Power hour', badges.length)) {
      const todayHours = sessions
        .filter((s) => new Date(s.timestamp).toDateString() === now.toDateString())
        .map((s) => new Date(s.timestamp).getHours());
      const required = [9, 10, 11, 12, 13, 14, 15, 16];
      if (required.every((h) => todayHours.includes(h))) {
        badges = [...badges, 'Power hour'];
        newBadges.push('Power hour');
      }
    }

    // New badges logic
    if (completedPomodoros >= 2 && !badges.includes('Focus sprout') && canEarnBadge('Focus sprout', badges.length)) {
      badges = [...badges, 'Focus sprout'];
      newBadges.push('Focus sprout');
    }

    if (completedPomodoros >= 5 && !badges.includes('Focus seedling') && canEarnBadge('Focus seedling', badges.length)) {
      badges = [...badges, 'Focus seedling'];
      newBadges.push('Focus seedling');
    }

    if (completedPomodoros >= 10 && !badges.includes('Focus sapling') && canEarnBadge('Focus sapling', badges.length)) {
      badges = [...badges, 'Focus sapling'];
      newBadges.push('Focus sapling');
    }

    if (completedPomodoros >= 15 && !badges.includes('Focus hero') && canEarnBadge('Focus hero', badges.length)) {
      badges = [...badges, 'Focus hero'];
      newBadges.push('Focus hero');
    }

    if (completedPomodoros >= 20 && !badges.includes('Focus legend') && canEarnBadge('Focus legend', badges.length)) {
      badges = [...badges, 'Focus legend'];
      newBadges.push('Focus legend');
    }

    // Marathon mind - 4 pomodoros in a day
    if (!badges.includes('Marathon mind') && canEarnBadge('Marathon mind', badges.length)) {
      const todaySessions = sessions.filter((s) => 
        new Date(s.timestamp).toDateString() === now.toDateString()
      );
      if (todaySessions.length >= 4) {
        badges = [...badges, 'Marathon mind'];
        newBadges.push('Marathon mind');
      }
    }

    // Weekend warrior - pomodoro during weekend
    const dayOfWeek = now.getDay();
    if ((dayOfWeek === 0 || dayOfWeek === 6) && !badges.includes('Weekend warrior') && canEarnBadge('Weekend warrior', badges.length)) {
      badges = [...badges, 'Weekend warrior'];
      newBadges.push('Weekend warrior');
    }

    // Meal time badges
    // Dawn warrior - pomodoro during 6AM-10AM
    if (hour >= 6 && hour < 10 && !badges.includes('Dawn warrior') && canEarnBadge('Dawn warrior', badges.length)) {
      badges = [...badges, 'Dawn warrior'];
      newBadges.push('Dawn warrior');
    }

    // Midday master - pomodoro during 11AM-2PM
    if (hour >= 11 && hour < 14 && !badges.includes('Midday master') && canEarnBadge('Midday master', badges.length)) {
      badges = [...badges, 'Midday master'];
      newBadges.push('Midday master');
    }

    // Twilight tactician - pomodoro during 5PM-9PM
    if (hour >= 17 && hour < 21 && !badges.includes('Twilight tactician') && canEarnBadge('Twilight tactician', badges.length)) {
      badges = [...badges, 'Twilight tactician'];
      newBadges.push('Twilight tactician');
    }

    // AFK badge - This would be triggered elsewhere when user takes a break > 15 minutes
    // For now, we'll leave this as a placeholder since break tracking isn't implemented yet
    // if (breakDuration > 900 && !badges.includes('AFK') && canEarnBadge('AFK', badges.length)) {
    //   badges = [...badges, 'AFK'];
    //   newBadges.push('AFK');
    // }

    // Badge collection badges - check these after all other badges have been potentially added
    let currentBadgeCount = badges.length;
    
    if (currentBadgeCount >= 3 && !badges.includes('Badge hunter') && canEarnBadge('Badge hunter', currentBadgeCount)) {
      badges = [...badges, 'Badge hunter'];
      newBadges.push('Badge hunter');
      currentBadgeCount++;
    }

    if (currentBadgeCount >= 5 && !badges.includes('Badge collector') && canEarnBadge('Badge collector', currentBadgeCount)) {
      badges = [...badges, 'Badge collector'];
      newBadges.push('Badge collector');
      currentBadgeCount++;
    }

    if (currentBadgeCount >= 10 && !badges.includes('Badge connoisseur') && canEarnBadge('Badge connoisseur', currentBadgeCount)) {
      badges = [...badges, 'Badge connoisseur'];
      newBadges.push('Badge connoisseur');
      currentBadgeCount++;
    }

    // Completionist - all badges earned (check this at the very end)
    const ALL_BADGES_COUNT = 20; // Total badge count including Completionist itself
    if (currentBadgeCount >= (ALL_BADGES_COUNT - 1) && !badges.includes('Completionist') && canEarnBadge('Completionist', currentBadgeCount)) {
      badges = [...badges, 'Completionist'];
      newBadges.push('Completionist');
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
      currentObjective: null,
      currentSessionStartTime: null,
      currentSessionDuration: null,
      remainingTime: null,
      displayObjective: state.displayObjective, // Preserve display objective
    };

    setState(newState);

    // Show notifications
    const durationMinutes = Math.floor(duration / 60);
    showNotification(
      `${objective} - Great job!`,
      `You completed a ${durationMinutes}-minute ${objective.toLowerCase()} session.`
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

  const setDisplayObjective = useCallback((objective: string | null) => {
    setState(prev => ({
      ...prev,
      displayObjective: objective,
    }));
  }, []);

  const clearLogs = useCallback(() => {
    setState(prev => ({
      ...prev,
      sessions: [],
    }));
  }, []);

  return (
    <GamificationContext.Provider value={{
      ...state,
      completeSession, 
      resetProgress, 
      clearLogs,
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
