export type Badge =
  // Tier 1 - Easy (Pomodoro completion based)
  | 'Productivity pioneer'
  | 'Focus sprout'
  | 'Focus seedling'
  | 'Focus sapling'
  | 'Focus hero'
  | 'Dawn warrior'
  // Tier 2 - Medium (Time/behavior based)
  | 'Hour hero'
  | 'Early bird'
  | 'Night owl'
  | 'Marathon mind'
  | 'Weekend warrior'
  | 'AFK'
  | 'Focus legend'
  | 'Midday master'
  | 'Twilight tactician'
  // Tier 3 - Hard (Collection/advanced)
  | 'Badge hunter'
  | 'Badge collector'
  | 'Power hour'
  | 'Badge connoisseur'
  | 'Completionist';

export const ALL_BADGES: Badge[] = [
  // Tier 1 - Easy (Pomodoro completion based)
  'Productivity pioneer',
  'Focus sprout',
  'Focus seedling',
  'Focus sapling',
  'Focus hero',
  'Dawn warrior',
  // Tier 2 - Medium (Time/behavior based)
  'Hour hero',
  'Early bird',
  'Night owl',
  'Marathon mind',
  'Weekend warrior',
  'AFK',
  'Focus legend',
  'Midday master',
  'Twilight tactician',
  // Tier 3 - Hard (Collection/advanced)
  'Badge hunter',
  'Badge collector',
  'Power hour',
  'Badge connoisseur',
  'Completionist',
];

export const BADGE_TIERS = {
  1: ['Productivity pioneer', 'Focus sprout', 'Focus seedling', 'Focus sapling', 'Focus hero', 'Dawn warrior'],
  2: ['Hour hero', 'Early bird', 'Night owl', 'Marathon mind', 'Weekend warrior', 'AFK', 'Focus legend', 'Midday master', 'Twilight tactician'],
  3: ['Badge hunter', 'Badge collector', 'Power hour', 'Badge connoisseur', 'Completionist'],
} as const;

export const TIER_UNLOCK_REQUIREMENTS = {
  1: 0,  // Always visible
  2: 4,  // Need 4 badges to unlock tier 2
  3: 10, // Need 10 badges to unlock tier 3 (increased due to more Tier 2 badges)
} as const;
