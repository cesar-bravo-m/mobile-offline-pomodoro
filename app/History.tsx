import { GamificationContext } from '@/contexts/GamificationContext';
import * as NavigationBar from 'expo-navigation-bar';
import React, { useContext, useEffect } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';

const History = () => {
  const { sessions } = useContext(GamificationContext);

  useEffect(() => {
    NavigationBar.setButtonStyleAsync('dark');
    NavigationBar.setBackgroundColorAsync('#000');
  }, []);

  return (
    <FlatList
      contentContainerStyle={styles.container}
      data={sessions.slice().reverse()}
      keyExtractor={(item, idx) => idx.toString()}
      renderItem={({ item }) => (
        <View style={styles.item}>
          <Text style={styles.itemText}>{new Date(item.timestamp).toLocaleString()}</Text>
          <Text style={styles.itemText}>{item.mode === 'focus' ? 'Focus' : 'Break'}</Text>
          <Text style={styles.itemText}>{item.completed ? 'Complete' : 'Aborted'}</Text>
        </View>
      )}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderColor: '#e0d0cc',
  },
  itemText: {
    color: '#402050',
  },
});

export default History;
