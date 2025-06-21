export type Badge =
  | 'First pomodoro'
  | 'Hour hero'
  | 'Early bird'
  | 'Night owl'
  | 'Power hour'
  | 'Rainy day focuser'
  | 'AFK';

export const ALL_BADGES: Badge[] = [
  'First pomodoro',
  'Hour hero',
  'Early bird',
  'Night owl',
  'Power hour',
  'Rainy day focuser',
  'AFK',
];

export const BADGE_DETAILS: Record<Badge, string[]> = {
  'First pomodoro': ['Finish your first focus session.'],
  'Hour hero': ['Accumulate one hour of total focus time.'],
  'Early bird': ['Complete a focus session before 10:00 AM.'],
  'Night owl': ['Complete a focus session after 10:00 PM.'],
  'Power hour': [
    'Complete focus sessions during every hour from 9 AM to 4 PM on the same day.',
  ],
  'Rainy day focuser': ['Complete a focus session while it is raining.'],
  AFK: ['Take a break that lasts at least 15 minutes.'],
};
