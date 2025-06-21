import { GamificationContext } from '@/contexts/GamificationContext';
import { Ionicons } from '@expo/vector-icons';
import * as NavigationBar from 'expo-navigation-bar';
import React, { useContext, useEffect } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';

export default function History() {
  const { sessions } = useContext(GamificationContext);

  useEffect(() => {
    NavigationBar.setButtonStyleAsync('dark');
    NavigationBar.setBackgroundColorAsync('#000');
  }, []);

  const renderItem = ({ item }: any) => {
    const date = new Date(item.timestamp);
    const time = date.toLocaleString();
    return (
      <View style={styles.item}>
        <Ionicons
          name={item.mode === 'focus' ? 'timer' : 'cafe'}
          color={item.completed ? '#4caf50' : '#f26b5b'}
          size={20}
          style={{ marginRight: 8 }}
        />
        <View style={{ flex: 1 }}>
          <Text style={styles.itemText}>{time}</Text>
          <Text style={styles.subText}>
            {item.mode} • {Math.round(item.duration / 60)}m •{' '}
            {item.completed ? 'completed' : 'stopped'}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <FlatList
      data={[...sessions].reverse()}
      keyExtractor={(item) => String(item.timestamp)}
      renderItem={renderItem}
      contentContainerStyle={styles.container}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ddd',
  },
  itemText: {
    fontSize: 16,
    color: '#402050',
  },
  subText: {
    fontSize: 12,
    color: '#666',
  },
});
