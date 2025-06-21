export type Badge =
  | 'First pomodoro'
  | 'Hour hero'
  | 'Early bird'
  | 'Night owl'
  | 'Power hour'
  | 'Rainy day focuser'
  | 'AFK';

export interface BadgeInfo {
  description: string;
  checklist: string[];
}

export const ALL_BADGES: Badge[] = [
  'First pomodoro',
  'Hour hero',
  'Early bird',
  'Night owl',
  'Power hour',
  'Rainy day focuser',
  'AFK',
];

export const BADGE_INFO: Record<Badge, BadgeInfo> = {
  'First pomodoro': {
    description: 'Complete your first focus session',
    checklist: ['Start a focus timer', 'Let it run until the end'],
  },
  'Hour hero': {
    description: 'Accumulate one hour of focus time',
    checklist: ['Finish focus sessions totalling 60 minutes'],
  },
  'Early bird': {
    description: 'Finish a focus session before 10 AM',
    checklist: ['Start and finish a focus timer before 10 AM'],
  },
  'Night owl': {
    description: 'Finish a focus session after 10 PM',
    checklist: ['Start and finish a focus timer after 10 PM'],
  },
  'Power hour': {
    description: 'Focus every hour from 9 AM to 4 PM in one day',
    checklist: [
      'Finish at least one focus session in every hour from 9 AM to 4 PM',
    ],
  },
  'Rainy day focuser': {
    description: 'Focus while it is raining',
    checklist: ['Complete a focus session when the weather is rainy'],
  },
  AFK: {
    description: 'Take a break for 15 minutes or more',
    checklist: ['Start a break session of at least 15 minutes'],
  },
};
