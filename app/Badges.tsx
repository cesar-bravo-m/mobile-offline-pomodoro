import { GamificationContext, EarnedBadge } from '@/contexts/GamificationContext';
import { ALL_BADGES, BADGE_INFO, Badge } from '@/constants/badges';
import * as NavigationBar from 'expo-navigation-bar';
import React, { useContext, useEffect, useState } from 'react';
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function Badges({ highlightedBadge }: { highlightedBadge?: Badge | null }) {
  const { badges } = useContext(GamificationContext);
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);
  useEffect(() => {
    if (highlightedBadge) {
      const timer = setTimeout(() => {
        setSelectedBadge(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [highlightedBadge]);
  useEffect(() => {
    NavigationBar.setButtonStyleAsync('dark');
    NavigationBar.setBackgroundColorAsync('#000');
  }, []);

  const renderModal = () => {
    if (!selectedBadge) return null;
    const earned: EarnedBadge | undefined = badges.find((b) => b.name === selectedBadge);
    const info = BADGE_INFO[selectedBadge];
    return (
      <Modal transparent animationType="fade" visible onRequestClose={() => setSelectedBadge(null)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{selectedBadge}</Text>
            <Text style={styles.modalDescription}>{info.description}</Text>
            <View style={styles.checklist}>
              {info.checklist.map((item) => (
                <Text key={item} style={styles.checkItem}>• {item}</Text>
              ))}
            </View>
            {earned ? (
              <Text style={styles.earnedText}>Earned {new Date(earned.earnedAt).toLocaleString()}</Text>
            ) : (
              <Text style={styles.earnedText}>Not earned yet</Text>
            )}
            <TouchableOpacity style={styles.closeButton} onPress={() => setSelectedBadge(null)}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <>
      <ScrollView contentContainerStyle={styles.container}>
        {ALL_BADGES.map((badge) => {
          const earned = badges.find((b) => b.name === badge);
          const highlight = highlightedBadge === badge;
          return (
            <TouchableOpacity key={badge} style={styles.badgeWrapper} onPress={() => setSelectedBadge(badge)}>
              <View
                style={[
                  styles.badge,
                  earned ? styles.unlocked : styles.locked,
                  highlight && styles.highlight,
                ]}
              >
                <Text style={styles.badgeText}>{badge}</Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
      {renderModal()}
    </>
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
  highlight: {
    borderWidth: 3,
    borderColor: '#ffd54f',
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fdf1ef',
    borderRadius: 20,
    padding: 20,
    width: '80%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#402050',
    marginBottom: 10,
  },
  modalDescription: {
    color: '#402050',
    marginBottom: 10,
    textAlign: 'center',
  },
  checklist: {
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  checkItem: {
    color: '#402050',
    marginVertical: 2,
  },
  earnedText: {
    color: '#402050',
    marginBottom: 10,
  },
  closeButton: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    backgroundColor: '#f26b5b',
    borderRadius: 10,
  },
  closeButtonText: {
    color: '#fff',
  },
});
