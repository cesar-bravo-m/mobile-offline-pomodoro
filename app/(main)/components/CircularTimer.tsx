import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Audio } from 'expo-av';
import * as BackgroundFetch from 'expo-background-fetch';
import { activateKeepAwake, deactivateKeepAwake } from 'expo-keep-awake';
import * as TaskManager from 'expo-task-manager';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, AppState, Dimensions, Easing, Modal, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import Fireworks from './Fireworks';

const TIMER_INTERVALS = [5, 10, 15, 20, 25, 30, 45];
const DEFAULT_MINUTES = 15;
const TOTAL_SECONDS = DEFAULT_MINUTES * 60;
const TIMER_STATE_KEY = '@timer_state';
const BACKGROUND_TIMER_TASK = 'BACKGROUND_TIMER_TASK';
const DEFAULT_BACKGROUND = '#fdf1ef';
const BREAK_BACKGROUND = '#e8f5e9';

TaskManager.defineTask(BACKGROUND_TIMER_TASK, async () => {
  try {
    const savedState = await AsyncStorage.getItem(TIMER_STATE_KEY);
    if (savedState) {
      const state: TimerState = JSON.parse(savedState);
      const now = Date.now();
      const elapsedSeconds = Math.floor((now - state.lastUpdated) / 1000);
      
      let newSecondsLeft = state.secondsLeft;
      if (state.isRunning) {
        newSecondsLeft = Math.max(0, state.secondsLeft - elapsedSeconds);
      }
      
      const newState: TimerState = {
        secondsLeft: newSecondsLeft,
        isRunning: state.isRunning && newSecondsLeft > 0,
        lastUpdated: now,
        totalSeconds: state.totalSeconds,
        mode: state.mode,
      };
      
      await AsyncStorage.setItem(TIMER_STATE_KEY, JSON.stringify(newState));
    }
    return BackgroundFetch.BackgroundFetchResult.NewData;
  } catch (error) {
    console.error('Background task error:', error);
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

interface TimerState {
  secondsLeft: number;
  isRunning: boolean;
  lastUpdated: number;
  totalSeconds: number;
  mode: 'focus' | 'break';
}

const CircularTimer = () => {
  const [secondsLeft, setSecondsLeft] = useState(TOTAL_SECONDS);
  const [totalSeconds, setTotalSeconds] = useState(TOTAL_SECONDS);
  const [isRunning, setIsRunning] = useState(true);
  const [mode, setMode] = useState<'focus' | 'break'>('focus');
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingDuration, setIsEditingDuration] = useState(false);
  const [tempTitle, setTempTitle] = useState('Focus');
  const [wasRunningBeforeEdit, setWasRunningBeforeEdit] = useState(false);
  const [backgroundColor, setBackgroundColor] = useState(DEFAULT_BACKGROUND);
  const [showCelebration, setShowCelebration] = useState(false);
  const [keepScreenOn, setKeepScreenOn] = useState(true);
  const [alarmSound, setAlarmSound] = useState(true);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const animatedValue = useRef(new Animated.Value(0)).current;
  const gradientAnim = useRef(new Animated.Value(0)).current;
  const intervalRef = useRef<number | null>(null);
  const [customMinutes, setCustomMinutes] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  useEffect(() => {
    activateKeepAwake();
  }, [])

  useEffect(() => {
    if (keepScreenOn) {
      activateKeepAwake();
    } else {
      deactivateKeepAwake();
    }
  }, [keepScreenOn]);

  // Register background task
  useEffect(() => {
    const registerBackgroundTask = async () => {
      try {
        await BackgroundFetch.registerTaskAsync(BACKGROUND_TIMER_TASK, {
          minimumInterval: 1, // 1 second
          stopOnTerminate: false,
          startOnBoot: true,
        });
      } catch (err) {
        console.error("Task registration failed:", err);
      }
    };

    registerBackgroundTask();
  }, []);

  // Load saved timer state when component mounts
  useEffect(() => {
    const loadTimerState = async () => {
      try {
        const savedState = await AsyncStorage.getItem(TIMER_STATE_KEY);
        if (savedState) {
          const state: TimerState = JSON.parse(savedState);
          const now = Date.now();
          const elapsedSeconds = Math.floor((now - state.lastUpdated) / 1000);
          
          let newSecondsLeft = state.secondsLeft;
          if (state.isRunning) {
            newSecondsLeft = Math.max(0, state.secondsLeft - elapsedSeconds);
          }
          
          setSecondsLeft(newSecondsLeft);
          setIsRunning(state.isRunning && newSecondsLeft > 0);
          setTotalSeconds(state.totalSeconds);
          setMode(state.mode || 'focus');
          
          const progress = newSecondsLeft / state.totalSeconds;
          animatedValue.setValue(progress);
        }
      } catch (error) {
        console.error('Error loading timer state:', error);
      }
    };

    loadTimerState();
  }, []);

  // Save timer state whenever it changes
  useEffect(() => {
    const saveTimerState = async () => {
      try {
        const state: TimerState = {
          secondsLeft,
          isRunning,
          lastUpdated: Date.now(),
          totalSeconds,
          mode,
        };
        await AsyncStorage.setItem(TIMER_STATE_KEY, JSON.stringify(state));
      } catch (error) {
        console.error('Error saving timer state:', error);
      }
    };

    saveTimerState();
  }, [secondsLeft, isRunning, totalSeconds, mode]);

  // Handle app state changes
  useEffect(() => {
    const handleAppStateChange = async (nextAppState: string) => {
      if (nextAppState === 'active') {
        // App came to foreground, load the latest state
        const savedState = await AsyncStorage.getItem(TIMER_STATE_KEY);
        if (savedState) {
          const state: TimerState = JSON.parse(savedState);
          const now = Date.now();
          const elapsedSeconds = Math.floor((now - state.lastUpdated) / 1000);
          
          let newSecondsLeft = state.secondsLeft;
          if (state.isRunning) {
            newSecondsLeft = Math.max(0, state.secondsLeft - elapsedSeconds);
          }
          
          setSecondsLeft(newSecondsLeft);
          setIsRunning(state.isRunning && newSecondsLeft > 0);
          setTotalSeconds(state.totalSeconds);
          setMode(state.mode || 'focus');
          
          const progress = newSecondsLeft / TOTAL_SECONDS;
          animatedValue.setValue(progress);
        }
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => {
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    if (secondsLeft === 0) {
      setShowCelebration(true);

      // Reset and start rainbow animation (two cycles)
      gradientAnim.setValue(0);
      const loop = Animated.loop(
        Animated.timing(gradientAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.linear,
          useNativeDriver: false,
        }),
        { iterations: 2 }
      );
      loop.start();

      const celebrationTimeout = setTimeout(() => {
        setShowCelebration(false);
      }, 5000);

      return () => {
        loop.stop();
        clearTimeout(celebrationTimeout);
      };
    } else {
      setShowCelebration(false);
      gradientAnim.stopAnimation();
    }
  }, [secondsLeft]);

  const strokeDashoffset = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [2 * Math.PI * 100, 0],
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
        duration: secondsLeft * 1000,
        useNativeDriver: false,
        easing: Easing.linear,
      }).start();
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, animatedValue, secondsLeft]);

  const formatTime = (sec: number) => {
    const min = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${min.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const pauseTimer = () => {
    setIsRunning(false);
    clearInterval(intervalRef.current!);
    animatedValue.stopAnimation();
  };

  const resetTimer = () => {
    setSecondsLeft(totalSeconds);
    setIsRunning(false);
    setBackgroundColor(DEFAULT_BACKGROUND);
    animatedValue.setValue(0);
  };

  const startTimer = () => {
    setIsRunning(true);
    if (secondsLeft === totalSeconds) {
      animatedValue.setValue(0);
    }
  };

  const handleEdit = () => {
    setWasRunningBeforeEdit(isRunning);
    if (isRunning) {
      pauseTimer();
    }
    setIsEditing(true);
    setTempTitle(mode === 'focus' ? 'Focus' : 'Break');
  };

  const handleSave = () => {
    setMode(mode === 'focus' ? 'focus' : 'break');
    setIsEditing(false);
    if (wasRunningBeforeEdit) {
      startTimer();
    }
  };

  const handleCancel = () => {
    setTempTitle(mode === 'focus' ? 'Focus' : 'Break');
    setIsEditing(false);
    if (wasRunningBeforeEdit) {
      startTimer();
    }
  };

  const handleDurationSelect = (minutes: number) => {
    const newTotalSeconds = minutes * 60;
    setTotalSeconds(newTotalSeconds);
    setSecondsLeft(newTotalSeconds);
    setIsEditingDuration(false);
    setIsRunning(false);
    setBackgroundColor(mode === 'focus' ? DEFAULT_BACKGROUND : BREAK_BACKGROUND);
    animatedValue.setValue(0);
    setShowCustomInput(false);
    setCustomMinutes('');
  };

  const handleCustomDuration = () => {
    const minutes = parseInt(customMinutes);
    if (minutes >= 1 && minutes <= 120) {
      handleDurationSelect(minutes);
    }
  };

  const handleModeSelect = (selectedMode: 'focus' | 'break') => {
    setMode(selectedMode);
    setIsEditing(false);
    // Reset timer when mode changes
    setSecondsLeft(totalSeconds);
    setIsRunning(false);
    animatedValue.setValue(0);
    if (wasRunningBeforeEdit) {
      startTimer();
    }
  };

  const rainbowColors = ['#f26b5b', '#FF6b5b', '#f26b5b'];
  const inputRange = rainbowColors.map((_, idx) => idx / (rainbowColors.length - 1));
  const strokeColor = secondsLeft === 0 ? gradientAnim.interpolate({ inputRange, outputRange: rainbowColors }) : '#f26b5b';

  useEffect(() => {
    const loadSound = async () => {
      try {
        const { sound } = await Audio.Sound.createAsync(
          require('../../../assets/sounds/chime-alert.mp3')
        );
        setSound(sound);
      } catch (error) {
        console.error('Error loading sound:', error);
      }
    };

    loadSound();

    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, []);

  // Play sound when timer reaches 0
  useEffect(() => {
    const playAlarm = async () => {
      if (secondsLeft === 0 && alarmSound && sound) {
        try {
          await sound.setPositionAsync(0);
          await sound.playAsync();
        } catch (error) {
          console.error('Error playing sound:', error);
        }
      }
    };

    playAlarm();
  }, [secondsLeft, alarmSound, sound]);

  // Update background color when mode changes
  useEffect(() => {
    setBackgroundColor(mode === 'focus' ? DEFAULT_BACKGROUND : BREAK_BACKGROUND);
  }, [mode]);

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <Fireworks isActive={showCelebration} />
      <View style={styles.titleContainer}>
        <Text style={styles.title}>{mode === 'focus' ? 'Focus' : 'Break'}</Text>
        <TouchableOpacity onPress={handleEdit} style={styles.iconButton}>
          <Ionicons name="pencil" size={20} color="#402050" />
        </TouchableOpacity>
      </View>

      <Modal
        animationType="fade"
        transparent={true}
        visible={isEditing}
        onRequestClose={handleCancel}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Mode</Text>
            <View style={styles.modeButtons}>
              <TouchableOpacity
                style={[
                  styles.modeButton,
                  mode === 'focus' && styles.selectedModeButton
                ]}
                onPress={() => handleModeSelect('focus')}
              >
                <Text style={[
                  styles.modeButtonText,
                  mode === 'focus' && styles.selectedModeButtonText
                ]}>
                  Focus
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modeButton,
                  mode === 'break' && styles.selectedModeButton
                ]}
                onPress={() => handleModeSelect('break')}
              >
                <Text style={[
                  styles.modeButtonText,
                  mode === 'break' && styles.selectedModeButtonText
                ]}>
                  Break
                </Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={handleCancel}
            >
              <Text style={styles.closeButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <View style={styles.svgContainer}>
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
            stroke={strokeColor as any}
            strokeWidth="12"
            strokeDasharray={2 * Math.PI * 100}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="none"
            rotation="-90"
            origin="110, 110"
          />
        </Svg>
      </View>
      <View style={styles.timerTextContainer}>
        <View style={styles.timerTextRow}>
          <Text style={styles.timeText}>{formatTime(secondsLeft)}</Text>
          <TouchableOpacity 
            onPress={() => {
              setWasRunningBeforeEdit(isRunning);
              if (isRunning) {
                pauseTimer();
              }
              setIsEditingDuration(true);
            }} 
            style={styles.iconButton}
          >
            <Ionicons name="pencil" size={20} color="#402050" />
          </TouchableOpacity>
        </View>
        { 
          isRunning && <Text style={styles.runningText}>Running...</Text>
        }
        {
          !isRunning && secondsLeft > 0 && <Text style={styles.runningText}>Paused</Text>
        }
        {
          !isRunning && secondsLeft === 0 && <Text style={styles.runningText}>Done! 🎉</Text>
        }
      </View>

      <Modal
        animationType="fade"
        transparent={true}
        visible={isEditingDuration}
        onRequestClose={() => {
          setIsEditingDuration(false);
          setShowCustomInput(false);
          setCustomMinutes('');
          if (wasRunningBeforeEdit) {
            startTimer();
          }
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Duration</Text>
            {!showCustomInput ? (
              <>
                <View style={styles.durationGrid}>
                  {TIMER_INTERVALS.map((minutes) => (
                    <TouchableOpacity
                      key={minutes}
                      style={[
                        styles.durationButton,
                        minutes === totalSeconds / 60 && styles.selectedDurationButton
                      ]}
                      onPress={() => handleDurationSelect(minutes)}
                    >
                      <Text style={[
                        styles.durationButtonText,
                        minutes === totalSeconds / 60 && styles.selectedDurationButtonText
                      ]}>
                        {minutes}m
                      </Text>
                    </TouchableOpacity>
                  ))}
                  <TouchableOpacity
                    style={[styles.durationButton, styles.customDurationButton]}
                    onPress={() => setShowCustomInput(true)}
                  >
                    <Text style={styles.durationButtonText}>Custom</Text>
                  </TouchableOpacity>
                </View>
                <TouchableOpacity 
                  style={styles.closeButton}
                  onPress={() => {
                    setIsEditingDuration(false);
                    if (wasRunningBeforeEdit) {
                      startTimer();
                    }
                  }}
                >
                  <Text style={styles.closeButtonText}>Close</Text>
                </TouchableOpacity>
              </>
            ) : (
              <View style={styles.customInputContainer}>
                <Text style={styles.customInputLabel}>Enter minutes (1-120)</Text>
                <TextInput
                  style={styles.customInput}
                  value={customMinutes}
                  onChangeText={setCustomMinutes}
                  keyboardType="number-pad"
                  maxLength={3}
                  autoFocus
                />
                <View style={styles.customInputButtons}>
                  <TouchableOpacity 
                    style={[styles.customInputButton, styles.cancelCustomButton]}
                    onPress={() => {
                      setShowCustomInput(false);
                      setCustomMinutes('');
                    }}
                  >
                    <Text style={styles.customInputButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.customInputButton, styles.confirmCustomButton]}
                    onPress={handleCustomDuration}
                  >
                    <Text style={styles.customInputButtonText}>Confirm</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        </View>
      </Modal>

      <View style={styles.buttonContainer}>
        {
          !isRunning && secondsLeft === totalSeconds && (
            <TouchableOpacity style={styles.button} onPress={startTimer}>
              <Text style={styles.buttonText}>Start</Text>
            </TouchableOpacity>
          )
        }
        {
          !isRunning && secondsLeft !== totalSeconds && secondsLeft > 0 && (
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
          !isRunning && secondsLeft !== totalSeconds && (
            <TouchableOpacity style={styles.resetButton} onPress={resetTimer}>
              <Text style={styles.buttonText}>Reset</Text>
            </TouchableOpacity>
          )
        }
        {/* DEV ONLY: Jump to 0 */}
        {/* <TouchableOpacity style={styles.button} onPress={() => setSecondsLeft(0)}>
          <Text style={styles.buttonText}>Jump to 0</Text>
        </TouchableOpacity> */}
      </View>

      <View style={styles.keepAwakeContainer}>
        <Text style={styles.keepAwakeText}>Keep screen on</Text>
        <Switch
          value={keepScreenOn}
          onValueChange={setKeepScreenOn}
          trackColor={{ false: '#f4d2cd', true: '#f26b5b' }}
          thumbColor={keepScreenOn ? '#fff' : '#f4f3f4'}
        />
      </View>

      <View style={[styles.keepAwakeContainer, { bottom: 80 }]}>
        <Text style={styles.keepAwakeText}>Chime on finish</Text>
        <Switch
          value={alarmSound}
          onValueChange={setAlarmSound}
          trackColor={{ false: '#f4d2cd', true: '#f26b5b' }}
          thumbColor={alarmSound ? '#fff' : '#f4f3f4'}
        />
      </View>
    </View>
  );
};

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    alignItems: 'center',
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
    flex: 1,
  },
  containerLandscape: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
    flex: 1,
  },
  svgContainer: {
    position: 'absolute',
    top: (Dimensions.get('window').height - 250)/2,
    left: (Dimensions.get('window').width - 250)/2,
  },
  titleContainer: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Dimensions.get('window').height/4,
    marginBottom: 10,
  },
  titleInput: {
    fontSize: 20,
    fontWeight: '600',
    color: '#402050',
    borderBottomWidth: 1,
    borderBottomColor: '#402050',
    paddingHorizontal: 5,
    marginRight: 8,
  },
  iconButton: {
    padding: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#402050',
    marginBottom: 10,
  },
  timerTextContainer: {
    marginTop: Dimensions.get('window').height/2.2,
    marginLeft: 10,
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerTextRow: {
    flexDirection: 'row',
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
    backgroundColor: '#f26b5b',
    paddingHorizontal: 40,
    paddingVertical: 12,
    borderRadius: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fdf1ef',
    borderRadius: 20,
    padding: 20,
    width: '80%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#402050',
    marginBottom: 20,
  },
  modalInput: {
    fontSize: 18,
    color: '#402050',
    borderBottomWidth: 1,
    borderBottomColor: '#402050',
    paddingHorizontal: 10,
    paddingVertical: 5,
    width: '100%',
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 20,
  },
  modalButton: {
    padding: 10,
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
  },
  cancelButton: {
    backgroundColor: '#f26b5b',
  },
  buttonContainer: {
    position: 'absolute',
    bottom: Dimensions.get('window').height/4,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  durationGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
    marginTop: 20,
  },
  durationButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#f4d2cd',
    justifyContent: 'center',
    alignItems: 'center',
    margin: 5,
  },
  selectedDurationButton: {
    backgroundColor: '#f26b5b',
  },
  durationButtonText: {
    fontSize: 18,
    color: '#402050',
    fontWeight: '600',
  },
  selectedDurationButtonText: {
    color: '#fff',
  },
  closeButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#f26b5b',
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  keepAwakeContainer: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  keepAwakeText: {
    color: '#402050',
    fontSize: 16,
  },
  modeButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginTop: 20,
  },
  modeButton: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#f4d2cd',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedModeButton: {
    backgroundColor: '#f26b5b',
  },
  modeButtonText: {
    fontSize: 20,
    color: '#402050',
    fontWeight: '600',
  },
  selectedModeButtonText: {
    color: '#fff',
  },
  customInputContainer: {
    width: '100%',
    alignItems: 'center',
    padding: 20,
  },
  customInputLabel: {
    fontSize: 16,
    color: '#402050',
    marginBottom: 10,
  },
  customInput: {
    fontSize: 24,
    color: '#402050',
    borderBottomWidth: 1,
    borderBottomColor: '#402050',
    paddingHorizontal: 10,
    paddingVertical: 5,
    width: '100%',
    textAlign: 'center',
    marginBottom: 20,
  },
  customInputButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    gap: 10,
  },
  customInputButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelCustomButton: {
    backgroundColor: '#f26b5b',
  },
  confirmCustomButton: {
    backgroundColor: '#f26b5b',
  },
  customInputButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  customDurationButton: {
    borderRadius: 15,
  },
});

export default CircularTimer;
