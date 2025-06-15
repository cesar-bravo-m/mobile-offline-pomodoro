import React, { useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, Easing, StyleSheet, View } from 'react-native';

interface Rocket {
  id: number;
  x: number;
  top: Animated.Value;
  scale: Animated.Value;
  opacity: Animated.Value;
  color: string;
}

const COLORS = [
  '#ff3333',
  '#ff9933',
  '#ffff33',
  '#33ff33',
  '#33ffff',
  '#3333ff',
  '#9933ff',
];
const MAX_ROCKETS = 10;

const Fireworks = ({ isActive }: { isActive: boolean }) => {
  const [rockets, setRockets] = useState<Rocket[]>([]);
  const rocketId = useRef(0);
  const screenWidth = Dimensions.get('window').width;
  const screenHeight = Dimensions.get('window').height;

  useEffect(() => {
    if (isActive) {
      // Reset state
      setRockets([]);
      rocketId.current = 0;

      // Launch up to MAX_ROCKETS rockets, staggered 300 ms apart
      for (let i = 0; i < MAX_ROCKETS; i++) {
        setTimeout(() => {
          launchRocket();
        }, i * 300);
      }
    } else {
      // Cleanup when not active
      setRockets([]);
    }
  }, [isActive]);

  const launchRocket = () => {
    const id = rocketId.current++;
    const xPosition = Math.random() * screenWidth;
    const top = new Animated.Value(screenHeight + 20);
    const scale = new Animated.Value(1);
    const opacity = new Animated.Value(1);
    const color = COLORS[Math.floor(Math.random() * COLORS.length)];

    const newRocket: Rocket = { id, x: xPosition, top, scale, opacity, color };
    setRockets((prev) => [...prev, newRocket]);

    const targetY = screenHeight * (0.3 + Math.random() * 0.3); // between 30% and 60% from top

    Animated.sequence([
      // Ascend
      Animated.timing(top, {
        toValue: targetY,
        duration: 800,
        easing: Easing.out(Easing.quad),
        useNativeDriver: false,
      }),
      // Explosion effect
      Animated.parallel([
        Animated.timing(scale, {
          toValue: 3,
          duration: 300,
          useNativeDriver: false,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: false,
        }),
      ]),
    ]).start(() => {
      // Remove rocket after animation
      setRockets((prev) => prev.filter((r) => r.id !== id));
    });
  };

  if (!isActive) return null;

  return (
    <View style={styles.container} pointerEvents="none">
      {rockets.map((rocket) => (
        <Animated.View
          key={rocket.id}
          style={[
            styles.rocket,
            {
              backgroundColor: rocket.color,
              left: rocket.x,
              top: rocket.top,
              transform: [{ scale: rocket.scale }],
              opacity: rocket.opacity,
            },
          ]}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 10000,
  },
  rocket: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});

export default Fireworks; 