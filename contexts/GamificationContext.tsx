import React, { createContext, useState } from 'react';

interface GamificationState {
  coins: number;
  level: number;
  badges: string[];
  completedPomodoros: number;
}

interface GamificationContextType extends GamificationState {
  completePomodoro: () => void;
}

const defaultState: GamificationState = {
  coins: 0,
  level: 1,
  badges: [],
  completedPomodoros: 0,
};

export const GamificationContext = createContext<GamificationContextType>({
  ...defaultState,
  completePomodoro: () => {},
});

export const GamificationProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, setState] = useState<GamificationState>(defaultState);

  const completePomodoro = () => {
    const completed = state.completedPomodoros + 1;
    const coins = state.coins + 10; // 10 coins per pomodoro
    const level = Math.floor(completed / 10) + 1;
    const badges = [...state.badges];

    if (completed === 1 && !badges.includes('First Pomodoro')) {
      badges.push('First Pomodoro');
    }
    if (completed === 5 && !badges.includes('Pomodoro Novice')) {
      badges.push('Pomodoro Novice');
    }
    if (completed === 25 && !badges.includes('Pomodoro Pro')) {
      badges.push('Pomodoro Pro');
    }

    setState({ coins, level, badges, completedPomodoros: completed });
  };

  return (
    <GamificationContext.Provider value={{ ...state, completePomodoro }}>
      {children}
    </GamificationContext.Provider>
  );
};
