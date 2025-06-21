import { ALL_BADGES, BADGE_TIERS, TIER_UNLOCK_REQUIREMENTS } from '@/constants/badges';
import { GamificationContext } from '@/contexts/GamificationContext';
import { Ionicons } from '@expo/vector-icons';
import * as NavigationBar from 'expo-navigation-bar';
import React, { useContext, useEffect, useState } from 'react';
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function Badges() {
  const { badges } = useContext(GamificationContext);
  const [selectedBadge, setSelectedBadge] = useState<string | null>(null);

  useEffect(() => {
    NavigationBar.setButtonStyleAsync('dark');
    NavigationBar.setBackgroundColorAsync('#000');
  }, []);

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

  // Get the tier of a badge
  const getBadgeTier = (badgeName: string): number => {
    for (const [tier, badgeList] of Object.entries(BADGE_TIERS)) {
      if ((badgeList as readonly string[]).includes(badgeName)) {
        return parseInt(tier);
      }
    }
    return 1; // Default to tier 1
  };

  // Check if a tier is unlocked
  const isTierUnlocked = (tier: number): boolean => {
    const earnedBadgeCount = badges.length;
    return earnedBadgeCount >= TIER_UNLOCK_REQUIREMENTS[tier as keyof typeof TIER_UNLOCK_REQUIREMENTS];
  };

  // Check if a badge should be visible
  const isBadgeVisible = (badgeName: string): boolean => {
    const tier = getBadgeTier(badgeName);
    return isTierUnlocked(tier);
  };

  // Get unlock message for locked tiers
  const getUnlockMessage = (tier: number): string => {
    const required = TIER_UNLOCK_REQUIREMENTS[tier as keyof typeof TIER_UNLOCK_REQUIREMENTS];
    const current = badges.length;
    const remaining = required - current;
    return `Unlock ${remaining} more badge${remaining !== 1 ? 's' : ''} to access this tier`;
  };

  // Get tier completion info
  const getTierCompletion = (tierBadges: readonly string[]): { earned: number; total: number; isComplete: boolean } => {
    const earned = tierBadges.filter(badgeName => isBadgeEarned(badgeName)).length;
    const total = tierBadges.length;
    return { earned, total, isComplete: earned === total };
  };

  // Get tier completion badge icon
  const getTierCompletionIcon = (completion: { earned: number; total: number; isComplete: boolean }): string => {
    if (completion.isComplete) {
      return 'checkmark-circle';
    } else if (completion.earned > 0) {
      return 'radio-button-on';
    } else {
      return 'radio-button-off';
    }
  };

  // Get tier completion color
  const getTierCompletionColor = (completion: { earned: number; total: number; isComplete: boolean }): string => {
    if (completion.isComplete) {
      return '#4CAF50'; // Green for complete
    } else if (completion.earned > 0) {
      return '#FF9800'; // Orange for in progress
    } else {
      return '#9E9E9E'; // Gray for not started
    }
  };

  const getBadgeIcon = (badgeName: string) => {
    switch (badgeName) {
      case 'Productivity pioneer':
        return 'star';
      case 'Hour hero':
        return 'time';
      case 'Early bird':
        return 'sunny';
      case 'Night owl':
        return 'moon';
      case 'Power hour':
        return 'flash';
      case 'AFK':
        return 'cafe';
      case 'Focus sprout':
        return 'leaf';
      case 'Focus seedling':
        return 'flower';
      case 'Focus sapling':
        return 'rose';
      case 'Focus hero':
        return 'shield';
      case 'Focus legend':
        return 'medal';
      case 'Marathon mind':
        return 'barbell';
      case 'Dawn warrior':
        return 'cafe';
      case 'Midday master':
        return 'restaurant';
      case 'Twilight tactician':
        return 'wine';
      case 'Weekend warrior':
        return 'calendar';
      case 'Badge hunter':
        return 'search';
      case 'Badge collector':
        return 'bookmark';
      case 'Badge connoisseur':
        return 'library';
      case 'Completionist':
        return 'checkmark-circle';
      default:
        return 'trophy';
    }
  };

  const getBadgeColor = (badgeName: string, isEarned: boolean) => {
    if (!isEarned) {
      return '#c0c0c0'; // Gray for unearned badges
    }
    
    switch (badgeName) {
      case 'Productivity pioneer':
        return '#FFD700';
      case 'Hour hero':
        return '#FF6B6B';
      case 'Early bird':
        return '#FFA500';
      case 'Night owl':
        return '#4A90E2';
      case 'Power hour':
        return '#FFD93D';
      case 'AFK':
        return '#8B4513';
      case 'Focus sprout':
        return '#90EE90';
      case 'Focus seedling':
        return '#32CD32';
      case 'Focus sapling':
        return '#228B22';
      case 'Focus hero':
        return '#FF4500';
      case 'Focus legend':
        return '#8A2BE2';
      case 'Marathon mind':
        return '#DC143C';
      case 'Dawn warrior':
        return '#FFD700';
      case 'Midday master':
        return '#FF8C00';
      case 'Twilight tactician':
        return '#9370DB';
      case 'Weekend warrior':
        return '#00CED1';
      case 'Badge hunter':
        return '#B8860B';
      case 'Badge collector':
        return '#4169E1';
      case 'Badge connoisseur':
        return '#9932CC';
      case 'Completionist':
        return '#FF1493';
      default:
        return '#f26b5b';
    }
  };

  const getBadgeDescription = (badgeName: string) => {
    switch (badgeName) {
      case 'Productivity pioneer':
        return 'Complete your first Pomodoro session';
      case 'Hour hero':
        return 'Accumulate 1 hour of total focus time';
      case 'Early bird':
        return 'Complete a focus session before 10 AM';
      case 'Night owl':
        return 'Complete a focus session after 10 PM';
      case 'Power hour':
        return 'Complete focus sessions in 8 consecutive hours';
      case 'AFK':
        return 'Take a break longer than 15 minutes';
      case 'Focus sprout':
        return 'Complete 2 pomodoro sessions';
      case 'Focus seedling':
        return 'Reach 5 total pomodoros';
      case 'Focus sapling':
        return 'Reach 10 total pomodoros';
      case 'Focus hero':
        return 'Reach 15 total pomodoros';
      case 'Focus legend':
        return 'Reach 20 total pomodoros';
      case 'Marathon mind':
        return 'Finish 4 pomodoros in a day';
      case 'Dawn warrior':
        return 'Complete a focus session during breakfast time (6AM-10AM)';
      case 'Midday master':
        return 'Complete a focus session during lunch time (11AM-2PM)';
      case 'Twilight tactician':
        return 'Complete a focus session during dinner time (5PM-9PM)';
      case 'Weekend warrior':
        return 'Finish at least one pomodoro during the weekend';
      case 'Badge hunter':
        return 'Unlock 3 different badges';
      case 'Badge collector':
        return 'Unlock 5 badges';
      case 'Badge connoisseur':
        return 'Unlock 10 badges. Your trophy shelf is filling up fast.';
      case 'Completionist':
        return 'Earn every single badge available. The ultimate accolade.';
      default:
        return 'Achievement unlocked!';
    }
  };

  const getBadgeDetails = (badgeName: string) => {
    switch (badgeName) {
      case 'Productivity pioneer':
        return 'Start your productivity journey by completing your very first Pomodoro session. This milestone marks the beginning of your focused work habits.';
      case 'Hour hero':
        return 'Demonstrate your dedication by accumulating a full hour of focused work time. This badge rewards consistent effort and commitment to deep work.';
      case 'Early bird':
        return 'Show your morning productivity by completing a focus session before 10 AM. Early risers often achieve more and set a positive tone for the day.';
      case 'Night owl':
        return 'Prove your late-night productivity by completing a focus session after 10 PM. Sometimes the best work happens when the world is quiet.';
      case 'Power hour':
        return 'Achieve the ultimate productivity feat by completing focus sessions across 8 consecutive hours (9 AM to 5 PM). This represents a full workday of focused effort.';
      case 'AFK':
        return 'Take proper breaks by stepping away for more than 15 minutes. This badge encourages healthy work-life balance and prevents burnout.';
      case 'Focus sprout':
        return 'Your focus journey begins to take root! Complete 2 pomodoro sessions to earn this foundational badge and start growing your productivity garden.';
      case 'Focus seedling':
        return 'Your focus is starting to grow! Reach 5 total pomodoros to show that consistency is becoming a habit. Small steps lead to big achievements.';
      case 'Focus sapling':
        return 'Your productivity tree is growing strong! Complete 10 total pomodoros to demonstrate your commitment to sustained focus and continuous improvement.';
      case 'Focus hero':
        return 'You\'ve become a true champion of focus! Reach 15 total pomodoros to showcase your mastery of time management and dedicated work ethic.';
      case 'Focus legend':
        return 'Legendary status achieved! Complete 20 total pomodoros to join the elite ranks of productivity masters who understand the power of sustained focus.';
      case 'Marathon mind':
        return 'Mental endurance at its finest! Complete 4 pomodoros in a single day to prove you can maintain focus and productivity for extended periods.';
      case 'Dawn warrior':
        return 'Start your day with focus! Complete a pomodoro session during breakfast time (6AM-10AM) to fuel your mind along with your body. Morning focus sessions set a productive tone for the entire day.';
      case 'Midday master':
        return 'Midday momentum! Complete a pomodoro session during lunch hours (11AM-2PM) to maximize your energy peak. Turn your lunch break into a productivity power-up.';
      case 'Twilight tactician':
        return 'Evening excellence! Complete a pomodoro session during dinner time (5PM-9PM) to make the most of your evening hours. Perfect for winding down the day with purposeful work.';
      case 'Weekend warrior':
        return 'Dedication knows no schedule! Complete at least one pomodoro during the weekend to prove that your commitment to productivity extends beyond weekdays.';
      case 'Badge hunter':
        return 'The pursuit of excellence begins! Unlock 3 different badges to show your diverse achievements and well-rounded approach to productivity.';
      case 'Badge collector':
        return 'A true collector of achievements! Earn 5 badges to demonstrate your consistent progress across multiple areas of focus and productivity.';
      case 'Badge connoisseur':
        return 'Your trophy shelf is filling up fast! Unlock 10 badges to showcase your mastery across various aspects of productive work and time management.';
      case 'Completionist':
        return 'The ultimate accolade! Earn every single badge available to achieve the pinnacle of productivity mastery. You are the embodiment of focus excellence.';
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
          {Object.entries(BADGE_TIERS).map(([tier, tierBadges]) => {
            const tierNumber = parseInt(tier);
            const isTierVisible = isTierUnlocked(tierNumber);
            const completion = getTierCompletion(tierBadges);
            
            return (
              <View key={tier} style={styles.tierContainer}>
                {/* Tier Header */}
                <View style={styles.tierHeader}>
                  <View style={styles.tierHeaderLeft}>
                    <Text style={styles.tierTitle}>
                      Tier {tier} {tierNumber === 1 ? '(Beginner)' : tierNumber === 2 ? '(Intermediate)' : '(Advanced)'}
                    </Text>
                    <Text style={styles.tierProgress}>
                      {completion.earned}/{completion.total} badges
                    </Text>
                  </View>
                  <View style={styles.tierHeaderRight}>
                    <Ionicons 
                      name={getTierCompletionIcon(completion) as any}
                      size={24}
                      color={getTierCompletionColor(completion)}
                    />
                  </View>
                </View>
                
                {/* Badge Grid for this tier */}
                <View style={styles.tierBadgesContainer}>
                  <View style={[
                    styles.tierBadgesGrid,
                    !isTierVisible && styles.blurredTier
                  ]}>
                    {tierBadges.map((badgeName, index) => {
                      const isEarned = isBadgeEarned(badgeName);
                      return (
                        <TouchableOpacity
                          key={index}
                          style={styles.badgeGridItem}
                          onPress={() => isTierVisible ? setSelectedBadge(badgeName) : null}
                          activeOpacity={isTierVisible ? 0.7 : 1}
                          disabled={!isTierVisible}
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
                  
                  {/* Blur Overlay for locked tiers */}
                  {!isTierVisible && (
                    <View style={styles.tierOverlay}>
                      <View style={styles.overlayContent}>
                        <Ionicons name="lock-closed" size={32} color="#fff" />
                        <Text style={styles.overlayTitle}>Tier Locked</Text>
                        <Text style={styles.overlayMessage}>
                          {getUnlockMessage(tierNumber)}
                        </Text>
                      </View>
                    </View>
                  )}
                </View>
              </View>
            );
          })}
        </View>

        {/* The reset progress button has been moved to the Settings page */}
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
    paddingTop: 10,
  },
  tierContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e0d0cc',
  },
  tierHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  tierHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tierTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#402050',
    marginRight: 10,
  },
  tierProgress: {
    fontSize: 12,
    color: '#6a4c71',
  },
  tierHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tierBadgesContainer: {
    position: 'relative',
  },
  tierBadgesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  blurredTier: {
    opacity: 0.3,
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
  tierOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(64, 32, 80, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
  overlayContent: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    maxWidth: '90%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  overlayTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#402050',
    marginTop: 12,
    marginBottom: 8,
    textAlign: 'center',
  },
  overlayMessage: {
    fontSize: 14,
    color: '#6a4c71',
    textAlign: 'center',
    lineHeight: 20,
    fontWeight: '500',
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
