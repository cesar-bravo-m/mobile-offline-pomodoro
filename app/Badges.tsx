import { GamificationContext } from '@/contexts/GamificationContext';
import { ALL_BADGES } from '@/constants/badges';
import * as NavigationBar from 'expo-navigation-bar';
import React, { useContext, useEffect } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

export default function Badges() {
  const { badges } = useContext(GamificationContext);
  useEffect(() => {
    NavigationBar.setButtonStyleAsync('dark');
    NavigationBar.setBackgroundColorAsync('#000');
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {ALL_BADGES.map((badge) => (
        <View key={badge} style={styles.badgeWrapper}>
          <View
            style={[
              styles.badge,
              badges.includes(badge) ? styles.unlocked : styles.locked,
            ]}
          >
            <Text style={styles.badgeText}>{badge}</Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  badgeWrapper: {
    margin: 10,
  },
  badge: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f4d2cd',
  },
  unlocked: {
    backgroundColor: '#f26b5b',
  },
  locked: {
    opacity: 0.4,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    textAlign: 'center',
    paddingHorizontal: 5,
  },
});
