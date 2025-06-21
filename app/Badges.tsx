import { GamificationContext } from '@/contexts/GamificationContext';
import { ALL_BADGES, BADGE_DETAILS, Badge } from '@/constants/badges';
import * as NavigationBar from 'expo-navigation-bar';
import React, { useContext, useEffect, useState } from 'react';
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function Badges({ highlightBadge, clearHighlight }: { highlightBadge?: Badge | null; clearHighlight?: () => void; }) {
  const { badges, badgeDates } = useContext(GamificationContext);
  const [selected, setSelected] = useState<Badge | null>(null);
  const [highlight, setHighlight] = useState<Badge | null>(null);
  useEffect(() => {
    NavigationBar.setButtonStyleAsync('dark');
    NavigationBar.setBackgroundColorAsync('#000');
  }, []);

  useEffect(() => {
    if (highlightBadge) {
      setHighlight(highlightBadge);
      const t = setTimeout(() => {
        setHighlight(null);
        clearHighlight && clearHighlight();
      }, 3000);
      return () => clearTimeout(t);
    }
  }, [highlightBadge]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {ALL_BADGES.map((badge) => (
        <TouchableOpacity key={badge} style={styles.badgeWrapper} onPress={() => setSelected(badge)}>
          <View
            style={[
              styles.badge,
              badges.includes(badge) ? styles.unlocked : styles.locked,
              highlight === badge && styles.highlight,
            ]}
          >
            <Text style={styles.badgeText}>{badge}</Text>
          </View>
        </TouchableOpacity>
      ))}
      <Modal transparent visible={selected !== null} animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            {selected && (
              <>
                <Text style={styles.modalTitle}>{selected}</Text>
                {badges.includes(selected) ? (
                  <Text style={styles.earnedText}>
                    Earned on {badgeDates[selected] ? new Date(badgeDates[selected]!).toLocaleDateString() : ''}
                  </Text>
                ) : (
                  <Text style={styles.earnedText}>Not earned yet</Text>
                )}
                {BADGE_DETAILS[selected].map((d, i) => (
                  <Text key={i} style={styles.detailItem}>• {d}</Text>
                ))}
                <TouchableOpacity onPress={() => setSelected(null)} style={styles.closeModal}>
                  <Text style={styles.closeText}>Close</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
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
  highlight: {
    borderWidth: 3,
    borderColor: '#ffd700',
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
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    color: '#402050',
    textAlign: 'center',
  },
  earnedText: {
    marginBottom: 10,
    color: '#402050',
  },
  detailItem: {
    color: '#402050',
    alignSelf: 'flex-start',
  },
  closeModal: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#f26b5b',
    borderRadius: 8,
  },
  closeText: {
    color: '#fff',
    fontWeight: '600',
  },
});
