import { Ionicons } from '@expo/vector-icons';
import { useFonts } from 'expo-font';
import * as NavigationBar from 'expo-navigation-bar';
import { StatusBar } from 'expo-status-bar';
import React, { useContext, useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { GamificationContext, GamificationProvider } from '@/contexts/GamificationContext';
import Main from './(main)/index';
import Badges from './Badges';

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  const [tab, setTab] = useState<'timer' | 'badges'>('timer');
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
        </View>
        <View style={styles.tabBar}>
          <TouchableOpacity style={styles.tabItem} onPress={() => setTab('timer')}>
            <Ionicons name="timer" size={24} color={tab === 'timer' ? '#f26b5b' : '#402050'} />
            <Text style={styles.tabLabel}>Timer</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.tabItem} onPress={() => setTab('badges')}>
            <Ionicons name="ribbon" size={24} color={tab === 'badges' ? '#f26b5b' : '#402050'} />
            <Text style={styles.tabLabel}>Badges</Text>
          </TouchableOpacity>
        </View>
        <StatusBar style="dark" />
      </View>
    </GamificationProvider>
  );
}

const Header = () => {
  const { coins, level } = useContext(GamificationContext);
  return (
    <View style={styles.header}>
      <Text style={styles.headerText}>Lvl {level} • {coins} coins</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    backgroundColor: '#fdf1ef',
  },
  header: {
    paddingTop: 10,
    paddingBottom: 10,
  },
  headerText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#402050',
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
