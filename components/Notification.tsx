import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, PanResponder, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface NotificationProps {
  visible: boolean;
  title: string;
  message: string;
  type: 'success' | 'info' | 'warning';
  onHide: () => void;
  onVisibilityChange: (isVisible: boolean) => void;
  isTop: boolean;
  stackIndex: number;
  totalCount: number;
}

const Notification: React.FC<NotificationProps> = ({
  visible,
  title,
  message,
  type,
  onHide,
  onVisibilityChange,
  isTop,
  stackIndex,
  totalCount,
}) => {
  const translateY = useRef(new Animated.Value(-100)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const pan = useRef(new Animated.Value(0)).current;
  const progress = useRef(new Animated.Value(100)).current;
  const [isPaused, setIsPaused] = useState(false);
  const [currentProgress, setCurrentProgress] = useState(100);
  const progressAnimation = useRef<Animated.CompositeAnimation | null>(null);

  // Memoize colors to prevent unnecessary recalculations
  const colors = useMemo(() => {
    const getColor = () => {
      switch (type) {
        case 'success': return '#4CAF50';
        case 'warning': return '#FF9800';
        case 'info': return '#2196F3';
        default: return '#4CAF50';
      }
    };

    const getBackgroundColor = () => {
      switch (type) {
        case 'success': return '#E8F5E8';
        case 'warning': return '#FFF3E0';
        case 'info': return '#E3F2FD';
        default: return '#E8F5E8';
      }
    };

    return {
      color: getColor(),
      backgroundColor: getBackgroundColor(),
    };
  }, [type]);

  // Memoize icon to prevent unnecessary recalculations
  const iconName = useMemo(() => {
    switch (type) {
      case 'success': return 'checkmark-circle';
      case 'warning': return 'warning';
      case 'info': return 'information-circle';
      default: return 'checkmark-circle';
    }
  }, [type]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => isTop,
      onMoveShouldSetPanResponder: () => isTop,
      onPanResponderGrant: () => {
        pan.setValue(0);
      },
      onPanResponderMove: (_, gestureState) => {
        if (isTop) {
          pan.setValue(gestureState.dx);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (Math.abs(gestureState.dx) > 100) {
          hideNotification();
        } else {
          Animated.spring(pan, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  const startProgressAnimation = useCallback(() => {
    if (progressAnimation.current) {
      progressAnimation.current.stop();
    }
    
    setCurrentProgress(100);
    progress.setValue(100);
    progressAnimation.current = Animated.timing(progress, {
      toValue: 0,
      duration: 8000,
      useNativeDriver: false,
    });
    
    progressAnimation.current.start(({ finished }) => {
      if (finished) {
        hideNotification();
      }
    });
  }, [progress]);

  const pauseProgressAnimation = useCallback(() => {
    if (progressAnimation.current) {
      progressAnimation.current.stop();
    }
  }, []);

  const resumeProgressAnimation = useCallback(() => {
    if (!isPaused) {
      const remainingDuration = (currentProgress / 100) * 1000; // 8 seconds total
      
      progressAnimation.current = Animated.timing(progress, {
        toValue: 0,
        duration: remainingDuration,
        useNativeDriver: false,
      });
      
      progressAnimation.current.start(({ finished }) => {
        if (finished) {
          hideNotification();
        }
      });
    }
  }, [isPaused, progress, currentProgress]);

  useEffect(() => {
    if (visible) {
      onVisibilityChange(true);
      setIsPaused(false);
      
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      startProgressAnimation();

      return () => {
        if (progressAnimation.current) {
          progressAnimation.current.stop();
        }
      };
    } else {
      hideNotification();
    }
  }, [visible, startProgressAnimation]);

  // Handle pause/resume when isPaused changes
  useEffect(() => {
    if (isPaused) {
      pauseProgressAnimation();
    } else {
      resumeProgressAnimation();
    }
  }, [isPaused, pauseProgressAnimation, resumeProgressAnimation]);

  // Update currentProgress when animation runs
  useEffect(() => {
    const listener = progress.addListener(({ value }) => {
      setCurrentProgress(value);
    });
    
    return () => {
      progress.removeListener(listener);
    };
  }, [progress]);

  const hideNotification = useCallback(() => {
    if (progressAnimation.current) {
      progressAnimation.current.stop();
    }
    onVisibilityChange(false);
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onHide();
    });
  }, [onHide, onVisibilityChange, translateY, opacity]);

  const handleLongPress = useCallback(() => {
    setIsPaused(true);
  }, []);

  const handleLongPressEnd = useCallback(() => {
    setIsPaused(false);
  }, []);

  // Calculate position based on stack index
  const topOffset = stackIndex * 100; // 100px per notification (increased from 80px to prevent overlap)
  const zIndex = totalCount - stackIndex; // Higher index = higher z-index

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [
            { translateY: Animated.add(translateY, topOffset) },
            { translateX: isTop ? pan : 0 },
          ],
          opacity,
          zIndex,
        },
      ]}
    >
      <TouchableOpacity
        onLongPress={handleLongPress}
        onPressOut={handleLongPressEnd}
        delayLongPress={200}
        activeOpacity={1}
        {...panResponder.panHandlers}
      >
        <View>
          <Animated.View
            style={[
              styles.notification,
              {
                backgroundColor: colors.backgroundColor,
                borderLeftColor: colors.color,
              },
            ]}
          >
            <View style={styles.iconContainer}>
              <Ionicons name={iconName as any} size={24} color={colors.color} />
            </View>
            <View style={styles.content}>
              <Text style={styles.title}>{title}</Text>
              <Text style={styles.message}>{message}</Text>
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={hideNotification}>
              <Ionicons name="close" size={20} color="#666" />
            </TouchableOpacity>
          </Animated.View>
          <View style={styles.progressContainer}>
            <Animated.View
              style={[
                styles.progressBar,
                {
                  width: progress.interpolate({
                    inputRange: [0, 100],
                    outputRange: ['0%', '100%'],
                  }),
                  backgroundColor: colors.color,
                },
              ]}
            />
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
  },
  notification: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  iconContainer: {
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  message: {
    fontSize: 14,
    color: '#666',
  },
  closeButton: {
    padding: 4,
  },
  progressContainer: {
    height: 3,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 12,
  },
});

export default Notification; 