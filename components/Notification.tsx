import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { PanGestureHandler, PanGestureHandlerGestureEvent } from 'react-native-gesture-handler';


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

  useEffect(() => {
    if (visible) {
      onVisibilityChange(true);
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

      // Auto-hide after 4 seconds
      const timer = setTimeout(() => {
        hideNotification();
      }, 4000);

      return () => clearTimeout(timer);
    } else {
      hideNotification();
    }
  }, [visible]);

  const hideNotification = () => {
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
  };

  const onGestureEvent = Animated.event(
    [{ nativeEvent: { translationX: pan } }],
    { useNativeDriver: true }
  );

  const onHandlerStateChange = (event: PanGestureHandlerGestureEvent) => {
    if (event.nativeEvent.state === 5) { // END
      if (Math.abs(event.nativeEvent.translationX) > 100) {
        hideNotification();
      } else {
        Animated.spring(pan, {
          toValue: 0,
          useNativeDriver: true,
        }).start();
      }
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return 'checkmark-circle';
      case 'warning':
        return 'warning';
      case 'info':
        return 'information-circle';
      default:
        return 'checkmark-circle';
    }
  };

  const getColor = () => {
    switch (type) {
      case 'success':
        return '#4CAF50';
      case 'warning':
        return '#FF9800';
      case 'info':
        return '#2196F3';
      default:
        return '#4CAF50';
    }
  };

  const getBackgroundColor = () => {
    switch (type) {
      case 'success':
        return '#E8F5E8';
      case 'warning':
        return '#FFF3E0';
      case 'info':
        return '#E3F2FD';
      default:
        return '#E8F5E8';
    }
  };

  // Calculate position based on stack index
  const topOffset = stackIndex * 80; // 80px per notification
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
      <PanGestureHandler
        onGestureEvent={onGestureEvent}
        onHandlerStateChange={onHandlerStateChange}
        enabled={isTop}
      >
        <Animated.View
          style={[
            styles.notification,
            {
              backgroundColor: getBackgroundColor(),
              borderLeftColor: getColor(),
            },
          ]}
        >
          <View style={styles.iconContainer}>
            <Ionicons name={getIcon() as any} size={24} color={getColor()} />
          </View>
          <View style={styles.content}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.message}>{message}</Text>
          </View>
          <TouchableOpacity style={styles.closeButton} onPress={hideNotification}>
            <Ionicons name="close" size={20} color="#666" />
          </TouchableOpacity>
        </Animated.View>
      </PanGestureHandler>
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
    borderRadius: 12,
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
});

export default Notification; 