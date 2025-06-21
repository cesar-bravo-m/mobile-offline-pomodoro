import { GamificationContext } from '@/contexts/GamificationContext';
import { Ionicons } from '@expo/vector-icons';
import * as NavigationBar from 'expo-navigation-bar';
import React, { useContext, useEffect } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { OBJECTIVES } from '@/constants/objectives';

export default function History() {
  const { sessions } = useContext(GamificationContext);

  useEffect(() => {
    NavigationBar.setButtonStyleAsync('dark');
    NavigationBar.setBackgroundColorAsync('#000');
  }, []);

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };


  const emojiMap = Object.fromEntries(OBJECTIVES.map(o => [o.name, o.emoji]));

  if (sessions.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="document-text-outline" size={64} color="#c0c0c0" />
        <Text style={styles.emptyTitle}>No logs yet</Text>
        <Text style={styles.emptyMessage}>
          Your Pomodoro session logs will appear here
        </Text>
        <Text style={styles.emptySubtext}>
          Complete sessions to see your activity history
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* <View style={styles.header}>
        <Text style={styles.headerTitle}>Session Log</Text>
        <Text style={styles.headerSubtitle}>
          {sessions.length} session{sessions.length !== 1 ? 's' : ''} logged
        </Text>
      </View> */}
      {/* Summary */}
      <View style={styles.summaryContainer}>
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Focus Sessions</Text>
            <Text style={styles.summaryValue}>
              {sessions.filter(s => s.objective === 'Focus').length}
            </Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Total Sessions</Text>
            <Text style={styles.summaryValue}>{sessions.length}</Text>
          </View>
        </View>
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Total Time</Text>
            <Text style={styles.summaryValue}>
              {formatDuration(sessions.reduce((total, s) => total + s.duration, 0))}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.tableContainer}>
        {/* Table Header */}
        <View style={styles.tableHeader}>
          <View style={styles.headerCell}>
            <Text style={styles.headerText}>Type</Text>
          </View>
          <View style={styles.headerCell}>
            <Text style={styles.headerText}>Duration</Text>
          </View>
          <View style={styles.headerCell}>
            <Text style={styles.headerText}>Date</Text>
          </View>
        </View>

        {/* Table Rows */}
        {sessions.slice().reverse().map((session, index) => (
          <View key={index} style={styles.tableRow}>
            <View style={styles.cell}>
              <View style={styles.modeContainer}>
                <Text style={styles.modeText}>{emojiMap[session.objective]} {session.objective}</Text>
              </View>
            </View>
            
            <View style={styles.cell}>
              <Text style={styles.durationText}>
                {formatDuration(session.duration)}
              </Text>
            </View>
            
            <View style={styles.cell}>
              <Text style={styles.dateText}>
                {formatDate(session.timestamp)}
              </Text>
            </View>
          </View>
        ))}
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fdf1ef',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fdf1ef',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#402050',
    marginTop: 20,
    marginBottom: 10,
  },
  emptyMessage: {
    fontSize: 16,
    color: '#6a4c71',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#8a7a8a',
    textAlign: 'center',
    lineHeight: 20,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0d0cc',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#402050',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6a4c71',
  },
  tableContainer: {
    // marginTop: 20,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f8f4f3',
    borderBottomWidth: 1,
    borderBottomColor: '#e0d0cc',
  },
  headerCell: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  headerText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#402050',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  cell: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  modeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  durationText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#402050',
  },
  dateText: {
    fontSize: 11,
    color: '#6a4c71',
    textAlign: 'center',
  },
  summaryContainer: {
    marginTop: 20,
    marginBottom: 40,
    backgroundColor: '#fff',
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#6a4c71',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#402050',
  },
}); 