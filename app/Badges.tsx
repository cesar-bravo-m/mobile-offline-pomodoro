import { ALL_BADGES } from '@/constants/badges';
import { GamificationContext } from '@/contexts/GamificationContext';
import { Ionicons } from '@expo/vector-icons';
import * as NavigationBar from 'expo-navigation-bar';
import React, { useContext, useEffect, useState } from 'react';
import { Alert, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function Badges() {
  const { badges, coins, level, resetProgress } = useContext(GamificationContext);
  const [selectedBadge, setSelectedBadge] = useState<string | null>(null);

  useEffect(() => {
    NavigationBar.setButtonStyleAsync('dark');
    NavigationBar.setBackgroundColorAsync('#000');
  }, []);

  const handleResetProgress = () => {
    Alert.alert(
      'Reset Progress',
      'Are you sure you want to reset all your progress? This will clear all badges, coins, levels, and session history. This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Reset All',
          style: 'destructive',
          onPress: () => {
            resetProgress();
            Alert.alert('Progress Reset', 'All progress has been reset successfully.');
          },
        },
      ]
    );
  };

  // Helper function to get badge name (handles both string and object formats)
  const getBadgeName = (badge: any): string => {
    if (typeof badge === 'string') {
      return badge;
    }
    if (badge && typeof badge === 'object' && badge.name) {
      return badge.name;
    }
    return 'Unknown Badge';
  };

  // Check if a badge is earned
  const isBadgeEarned = (badgeName: string): boolean => {
    return badges.some(badge => getBadgeName(badge) === badgeName);
  };

  const getBadgeIcon = (badgeName: string) => {
    switch (badgeName) {
      case 'First pomodoro':
        return 'star';
      case 'Hour hero':
        return 'time';
      case 'Early bird':
        return 'sunny';
      case 'Night owl':
        return 'moon';
      case 'Power hour':
        return 'flash';
      case 'Rainy day focuser':
        return 'rainy';
      default:
        return 'trophy';
    }
  };

  const getBadgeColor = (badgeName: string, isEarned: boolean) => {
    if (!isEarned) {
      return '#c0c0c0'; // Gray for unearned badges
    }
    
    switch (badgeName) {
      case 'First pomodoro':
        return '#FFD700';
      case 'Hour hero':
        return '#FF6B6B';
      case 'Early bird':
        return '#FFA500';
      case 'Night owl':
        return '#4A90E2';
      case 'Power hour':
        return '#FFD93D';
      case 'Rainy day focuser':
        return '#87CEEB';
      default:
        return '#f26b5b';
    }
  };

  const getBadgeDescription = (badgeName: string) => {
    switch (badgeName) {
      case 'First pomodoro':
        return 'Complete your first Pomodoro session';
      case 'Hour hero':
        return 'Accumulate 1 hour of total focus time';
      case 'Early bird':
        return 'Complete a focus session before 10 AM';
      case 'Night owl':
        return 'Complete a focus session after 10 PM';
      case 'Power hour':
        return 'Complete focus sessions in 8 consecutive hours';
      case 'Rainy day focuser':
        return 'Focus during rainy weather';
      default:
        return 'Achievement unlocked!';
    }
  };

  const getBadgeDetails = (badgeName: string) => {
    switch (badgeName) {
      case 'First pomodoro':
        return 'Start your productivity journey by completing your very first Pomodoro session. This milestone marks the beginning of your focused work habits.';
      case 'Hour hero':
        return 'Demonstrate your dedication by accumulating a full hour of focused work time. This badge rewards consistent effort and commitment to deep work.';
      case 'Early bird':
        return 'Show your morning productivity by completing a focus session before 10 AM. Early risers often achieve more and set a positive tone for the day.';
      case 'Night owl':
        return 'Prove your late-night productivity by completing a focus session after 10 PM. Sometimes the best work happens when the world is quiet.';
      case 'Power hour':
        return 'Achieve the ultimate productivity feat by completing focus sessions across 8 consecutive hours (9 AM to 5 PM). This represents a full workday of focused effort.';
      case 'Rainy day focuser':
        return 'Maintain your focus even when the weather tries to distract you. This badge celebrates your ability to stay productive regardless of external conditions.';
      default:
        return 'An achievement that showcases your dedication to productivity and focus.';
    }
  };

  const earnedBadges = badges.length;

  return (
    <>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Badges</Text>
          <Text style={styles.headerSubtitle}>
            {earnedBadges} of {ALL_BADGES.length} badges earned
          </Text>
        </View>
        {/* Stats DO NOT DELETE JUST YET */}
        {/* <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Level</Text>
            <Text style={styles.statValue}>{level}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Coins</Text>
            <Text style={styles.statValue}>{coins}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Badges</Text>
            <Text style={styles.statValue}>{earnedBadges}/{ALL_BADGES.length}</Text>
          </View>
        </View> */}

        <View style={styles.badgesGrid}>
          {ALL_BADGES.map((badgeName, index) => {
            const isEarned = isBadgeEarned(badgeName);
            return (
              <TouchableOpacity
                key={index}
                style={styles.badgeGridItem}
                onPress={() => setSelectedBadge(badgeName)}
                activeOpacity={0.7}
              >
                <View style={[
                  styles.badgeGridIcon, 
                  { backgroundColor: getBadgeColor(badgeName, isEarned) }
                ]}>
                  <Ionicons 
                    name={getBadgeIcon(badgeName) as any} 
                    size={28} 
                    color={isEarned ? "#fff" : "#999"} 
                  />
                </View>
                <Text style={[
                  styles.badgeGridName,
                  !isEarned && styles.unearnedBadgeGridName
                ]}>
                  {badgeName}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Reset Button */}
        <TouchableOpacity
          style={styles.resetButton}
          onPress={handleResetProgress}
          activeOpacity={0.7}
        >
          <Ionicons name="refresh" size={20} color="#fff" />
          <Text style={styles.resetButtonText}>Reset All Progress</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Badge Detail Modal */}
      <Modal
        visible={selectedBadge !== null}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setSelectedBadge(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedBadge && (
              <>
                <View style={styles.modalHeader}>
                  <View style={[
                    styles.modalBadgeIcon,
                    { backgroundColor: getBadgeColor(selectedBadge, isBadgeEarned(selectedBadge)) }
                  ]}>
                    <Ionicons 
                      name={getBadgeIcon(selectedBadge) as any} 
                      size={32} 
                      color={isBadgeEarned(selectedBadge) ? "#fff" : "#999"} 
                    />
                  </View>
                  <Text style={styles.modalTitle}>{selectedBadge}</Text>
                  <Text style={styles.modalSubtitle}>
                    {isBadgeEarned(selectedBadge) ? '✅ Earned' : '🔒 Not earned yet'}
                  </Text>
                </View>
                
                <View style={styles.modalBody}>
                  <Text style={styles.modalDescription}>
                    {getBadgeDescription(selectedBadge)}
                  </Text>
                  <Text style={styles.modalDetails}>
                    {getBadgeDetails(selectedBadge)}
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setSelectedBadge(null)}
                >
                  <Text style={styles.closeButtonText}>Close</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fdf1ef',
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
  badgesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 10,
    paddingTop: 20,
  },
  badgeGridItem: {
    width: '33.33%',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 8,
  },
  badgeGridIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  badgeGridName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#402050',
    textAlign: 'center',
    lineHeight: 16,
  },
  unearnedBadgeGridName: {
    color: '#8a7a8a',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 40,
    backgroundColor: '#fff',
    borderRadius: 12,
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
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#6a4c71',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#402050',
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#dc3545',
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 40,
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  resetButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  modalBadgeIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#402050',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#6a4c71',
    textAlign: 'center',
  },
  modalBody: {
    marginBottom: 24,
  },
  modalDescription: {
    fontSize: 18,
    fontWeight: '600',
    color: '#402050',
    marginBottom: 12,
    textAlign: 'center',
  },
  modalDetails: {
    fontSize: 16,
    color: '#6a4c71',
    lineHeight: 24,
    textAlign: 'center',
  },
  closeButton: {
    backgroundColor: '#f26b5b',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
