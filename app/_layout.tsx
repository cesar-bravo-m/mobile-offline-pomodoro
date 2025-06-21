import { useFonts } from 'expo-font';
import * as NavigationBar from 'expo-navigation-bar';
import { StatusBar } from 'expo-status-bar';
import { Dimensions, StyleSheet, View, TouchableOpacity, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import React, { useState, useContext } from 'react';
import 'react-native-reanimated';

import Main from './(main)/index';
import Badges from './Badges';
import { GamificationProvider, GamificationContext } from '@/contexts/GamificationContext';

export default function RootLayout() {
  NavigationBar.setButtonStyleAsync('dark');
  NavigationBar.setBackgroundColorAsync('#fdf1ef');
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  const [tab, setTab] = useState<'timer' | 'badges'>('timer');

  if (!loaded) {
    return null;
  }

  return (
    <GamificationProvider>
      <View style={styles.container}>
        <Header />
        {tab === 'timer' ? <Main /> : <Badges />}
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
    height: Dimensions.get('window').height,
  },
  header: {
    paddingTop: 40,
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
