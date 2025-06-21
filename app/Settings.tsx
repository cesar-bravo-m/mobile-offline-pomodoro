import { GamificationContext } from '@/contexts/GamificationContext';
import { Ionicons } from '@expo/vector-icons';
import * as NavigationBar from 'expo-navigation-bar';
import React, { useContext, useEffect } from 'react';
import {
  Alert,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function Settings() {
  const { resetProgress, clearLogs } = useContext(GamificationContext);

  useEffect(() => {
    NavigationBar.setButtonStyleAsync('dark');
    NavigationBar.setBackgroundColorAsync('#000');
  }, []);

  const handleResetProgress = () => {
    Alert.alert(
      'Reset Badge Progress',
      'Are you sure you want to reset your badge progress? This will clear all earned badges. Coins, levels, and logs will remain intact.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            resetProgress();
            Alert.alert('Progress Reset', 'Your badge progress has been reset.');
          },
        },
      ],
    );
  };

  const handleClearLogs = () => {
    Alert.alert(
      'Clear Logs',
      'Are you sure you want to clear all session logs? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => {
            clearLogs();
            Alert.alert('Logs Cleared', 'All session logs have been removed.');
          },
        },
      ],
    );
  };

  const openLink = async (url: string) => {
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    } else {
      Alert.alert('Error', 'Unable to open link.');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        <View style={styles.row}>
          <Text style={styles.label}>App Version</Text>
          <Text style={styles.value}>{'25.06.21'}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Links</Text>
        <TouchableOpacity
          style={styles.linkRow}
          onPress={() => openLink('https://cesar-bravo-m.github.io/mobile-offline-pomodoro/')}
        >
          <Text style={styles.linkText}>Privacy Policy</Text>
          <Ionicons name="open-outline" size={18} color="#402050" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.linkRow}
          onPress={() => openLink('https://github.com/cesar-bravo-m/mobile-offline-pomodoro')}
        >
          <Text style={styles.linkText}>GitHub Repository</Text>
          <Ionicons name="open-outline" size={18} color="#402050" />
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Danger Zone</Text>
        <TouchableOpacity style={styles.button} onPress={handleResetProgress}>
          <Ionicons name="refresh" size={20} color="#fff" />
          <Text style={styles.buttonText}>Reset Badge Progress</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.buttonSecondary} onPress={handleClearLogs}>
          <Ionicons name="trash" size={20} color="#fff" />
          <Text style={styles.buttonText}>Clear Pomodoro Logs</Text>
        </TouchableOpacity>
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fdf1ef',
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#e0d0cc',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#402050',
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    color: '#6a4c71',
  },
  value: {
    fontSize: 14,
    fontWeight: '500',
    color: '#402050',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#dc3545',
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 16,
  },
  buttonSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f26b5b',
    paddingVertical: 14,
    borderRadius: 12,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  linkText: {
    fontSize: 14,
    color: '#402050',
  },
}); 