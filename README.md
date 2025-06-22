# Offline Pomodoro

A gamified Pomodoro timer app built with React Native and Expo

```
pomodoro/
├── app/                    # Expo Router app directory
│   ├── (main)/            # Main tab group
│   │   ├── components/    # Timer and celebration components
│   │   └── index.tsx      # Main timer screen
│   ├── _layout.tsx        # Root layout
│   ├── Badges.tsx         # Badge collection screen
│   ├── History.tsx        # Session history screen
│   └── Settings.tsx       # App settings screen
├── components/            # Reusable UI components
│   ├── ui/               # Platform-specific UI components
│   └── NotificationManager.tsx
├── contexts/             # React Context providers
│   └── GamificationContext.tsx  # Main state management
├── constants/            # App constants and configurations
│   ├── badges.ts         # Badge definitions and tiers
│   ├── objectives.ts     # Focus objectives
│   └── Colors.ts         # Theme colors
├── hooks/               # Custom React hooks
├── assets/              # Images, fonts, and sounds
└── screenshots/         # App screenshots
```

## Key Components

### CircularTimer
The main timer component featuring:
- Animated circular progress indicator
- Custom duration selection
- Objective setting
- Sound notifications
- Screen wake lock

### GamificationContext
Central state management for:
- Timer state (running, paused, completed)
- User progress (coins, level, badges)
- Session history
- Persistent storage

### Badge System
Three-tier badge system with progressive unlocking:
- **Tier 1**: Basic completion badges
- **Tier 2**: Time and behavior-based badges  
- **Tier 3**: Advanced collection badges

## Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   # or
   pnpm install
   ```

2. **Start development server**:
   ```bash
   npm start
   # or
   pnpm start
   ```

3. **Run on device**:
   - Android: `npm run android`

## Development

- **Linting**: `npm run lint`
- **Reset Project**: `npm run reset-project`

## License

   Bravo Ciencia y Tecnolog SpA 2025 - All rights reserved.