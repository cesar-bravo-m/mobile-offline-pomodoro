export type Objective =
  | 'Focus'
  | 'Deep work'
  | 'Read'
  | 'Do homework'
  | 'Test prep'
  | 'Workout'
  | 'Meditation';

export const OBJECTIVES: { name: Objective; emoji: string }[] = [
  { name: 'Focus', emoji: '🎯' },
  { name: 'Deep work', emoji: '🧠' },
  { name: 'Read', emoji: '📖' },
  { name: 'Do homework', emoji: '📚' },
  { name: 'Test prep', emoji: '📝' },
  { name: 'Workout', emoji: '🏋️' },
  { name: 'Meditation', emoji: '🧘' },
];

export const DEFAULT_OBJECTIVE: Objective = 'Focus';
