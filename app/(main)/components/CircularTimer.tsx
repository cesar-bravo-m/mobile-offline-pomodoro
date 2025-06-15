import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

const TOTAL_SECONDS = 15 * 60;

const CircularTimer = () => {
  const [secondsLeft, setSecondsLeft] = useState(TOTAL_SECONDS);
  const [isRunning, setIsRunning] = useState(true);
  const animatedValue = useRef(new Animated.Value(0)).current;
  const intervalRef = useRef<number | null>(null);

  const strokeDashoffset = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 2 * Math.PI * 100],
  });

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setSecondsLeft(prev => {
          if (prev <= 1) {
            clearInterval(intervalRef.current!);
            setIsRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      Animated.timing(animatedValue, {
        toValue: 1,
        duration: TOTAL_SECONDS * 1000,
        useNativeDriver: false,
        easing: Easing.linear,
      }).start();
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, animatedValue]);

  const formatTime = (sec: number) => {
    const min = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${min.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const pauseTimer = () => {
    setIsRunning(false);
    clearInterval(intervalRef.current!);
  };

  const resetTimer = () => {
    setSecondsLeft(TOTAL_SECONDS);
    setIsRunning(false);
    animatedValue.setValue(0);
  };

  const startTimer = () => {
    setIsRunning(true);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Focus</Text>
      <Svg height={250} width={250} viewBox="0 0 220 220">
        <Circle
          cx="110"
          cy="110"
          r="100"
          stroke="#f4d2cd"
          strokeWidth="12"
          fill="none"
        />
        <AnimatedCircle
          cx="110"
          cy="110"
          r="100"
          stroke="#f26b5b"
          strokeWidth="12"
          strokeDasharray={2 * Math.PI * 100}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="none"
          rotation="-90"
          origin="110, 110"
        />
      </Svg>
      <View style={styles.timerTextContainer}>
        <Text style={styles.timeText}>{formatTime(secondsLeft)}</Text>
        <Text style={styles.runningText}>{isRunning ? 'Running...' : 'Paused'}</Text>
      </View>
      {
        !isRunning && secondsLeft === TOTAL_SECONDS && (
          <TouchableOpacity style={styles.button} onPress={startTimer}>
            <Text style={styles.buttonText}>Start</Text>
          </TouchableOpacity>
        )
      }
      {
        !isRunning && secondsLeft !== TOTAL_SECONDS && (
          <TouchableOpacity style={styles.button} onPress={startTimer}>
            <Text style={styles.buttonText}>Resume</Text>
          </TouchableOpacity>
        )
      }
      {
        isRunning && (
          <TouchableOpacity style={styles.button} onPress={pauseTimer}>
            <Text style={styles.buttonText}>Pause</Text>
          </TouchableOpacity>
        )
      }
      {
        !isRunning && (
          <TouchableOpacity style={styles.resetButton} onPress={resetTimer}>
            <Text style={styles.buttonText}>Reset</Text>
          </TouchableOpacity>
        )
      }
    </View>
  );
};

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    alignItems: 'center',
    paddingTop: 50,
    backgroundColor: '#fdf1ef',
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#402050',
    marginBottom: 10,
  },
  timerTextContainer: {
    marginTop: 180,
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2d1436',
  },
  runningText: {
    fontSize: 14,
    color: '#6a4c71',
    marginTop: 4,
  },
  button: {
    marginTop: 30,
    backgroundColor: '#f26b5b',
    paddingHorizontal: 40,
    paddingVertical: 12,
    borderRadius: 16,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  resetButton: {
    marginTop: 10,
    backgroundColor: '#f26b5b',
    paddingHorizontal: 40,
    paddingVertical: 12,
    borderRadius: 16,
  },
});

export default CircularTimer;
