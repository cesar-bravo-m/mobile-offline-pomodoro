import { Ionicons } from '@expo/vector-icons';
import { useFonts } from 'expo-font';
import * as NavigationBar from 'expo-navigation-bar';
import { StatusBar } from 'expo-status-bar';
import React, { useContext, useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { NotificationProvider } from '@/components/NotificationManager';
import { GamificationContext, GamificationProvider } from '@/contexts/GamificationContext';

import Main from './(main)/index';
import Badges from './Badges';
import History from './History';

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  const [tab, setTab] = useState<'timer' | 'badges' | 'history'>('timer');
  const insets = useSafeAreaInsets();

  // Set Android navigation bar buttons to dark
  useEffect(() => {
    NavigationBar.setButtonStyleAsync('dark');
    NavigationBar.setBackgroundColorAsync('#000');
  }, []);

  if (!loaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NotificationProvider>
        <GamificationProvider>
          <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
            <Header />
            <View style={{ flex: 1 }}>
              <View style={{ display: tab === 'timer' ? 'flex' : 'none', flex: 1 }}>
                <Main />
              </View>
              <View style={{ display: tab === 'badges' ? 'flex' : 'none', flex: 1 }}>
                <Badges />
              </View>
              <View style={{ display: tab === 'history' ? 'flex' : 'none', flex: 1 }}>
                <History />
              </View>
            </View>
            <View style={styles.tabBar}>
              <TouchableOpacity style={styles.tabItem} onPress={() => setTab('timer')}>
                <Ionicons name="timer" size={24} color={tab === 'timer' ? '#f26b5b' : '#402050'} />
                <Text style={styles.tabLabel}>Timer</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.tabItem} onPress={() => setTab('badges')}>
                <Ionicons name="trophy" size={24} color={tab === 'badges' ? '#f26b5b' : '#402050'} />
                <Text style={styles.tabLabel}>Badges</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.tabItem} onPress={() => setTab('history')}>
                <Ionicons name="document-text" size={24} color={tab === 'history' ? '#f26b5b' : '#402050'} />
                <Text style={styles.tabLabel}>Log</Text>
              </TouchableOpacity>
            </View>
            <StatusBar style="dark" />
          </View>
        </GamificationProvider>
      </NotificationProvider>
    </GestureHandlerRootView>
  );
}

const Header = () => {
  const { coins, level, isTimerRunning, currentSessionMode, currentSessionStartTime, currentSessionDuration } = useContext(GamificationContext);
  const [currentTime, setCurrentTime] = useState(Date.now());

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setCurrentTime(Date.now());
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getRemainingTime = () => {
    if (!isTimerRunning || !currentSessionStartTime || !currentSessionDuration) {
      return null;
    }
    
    const elapsed = Math.floor((currentTime - currentSessionStartTime) / 1000);
    const remaining = currentSessionDuration - elapsed;
    return remaining > 0 ? remaining : 0;
  };

  const remainingTime = getRemainingTime();
  const isSessionComplete = remainingTime === 0;

  return (
    <View style={styles.header}>
      {isTimerRunning && !isSessionComplete ? (
        <View style={styles.timerHeader}>
          <View style={styles.timerInfo}>
            <Ionicons 
              name={currentSessionMode === 'focus' ? 'timer' : 'cafe'} 
              size={16} 
              color={currentSessionMode === 'focus' ? '#f26b5b' : '#4CAF50'} 
            />
            <Text style={styles.timerText}>
              {currentSessionMode === 'focus' ? 'Focus' : 'Break'} • {formatTime(remainingTime || 0)}
            </Text>
          </View>
          <Text style={styles.statsText}>Lvl {level} • {coins} coins</Text>
        </View>
      ) : (
        <Text style={styles.headerText}>Lvl {level} • {coins} coins</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    width: '100%',
    backgroundColor: '#fdf1ef',
  },
  header: {
    paddingTop: 10,
    paddingBottom: 10,
    alignItems: 'center',
  },
  headerText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#402050',
  },
  timerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 20,
  },
  timerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  timerText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#402050',
  },
  statsText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6a4c71',
  },
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingVertical: 10,
    backgroundColor: '#fdf1ef',
    borderTopWidth: 1,
    borderTopColor: '#e0d0cc',
  },
  tabItem: {
    alignItems: 'center',
  },
  tabLabel: {
    fontSize: 12,
    color: '#402050',
  },
});
