import { GamificationContext } from '@/contexts/GamificationContext';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { activateKeepAwake, deactivateKeepAwake } from 'expo-keep-awake';
import * as NavigationBar from 'expo-navigation-bar';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { Animated, Easing, Modal, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import Fireworks from './Fireworks';

const TIMER_INTERVALS = [5, 10, 15, 20, 25, 30, 45];
const DEFAULT_MINUTES = 15;
const TOTAL_SECONDS = DEFAULT_MINUTES * 60;
const DEFAULT_BACKGROUND = '#fdf1ef';
const BREAK_BACKGROUND = '#e8f5e9';

const CircularTimer = () => {
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;
  const isTablet = width >= 600;
  const timerSize = isTablet ? 300 : 250;
  const [secondsLeft, setSecondsLeft] = useState(TOTAL_SECONDS);
  const [totalSeconds, setTotalSeconds] = useState(TOTAL_SECONDS);
  const [isRunning, setIsRunning] = useState(false);
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
  const { completePomodoro } = useContext(GamificationContext);
  const rewardGiven = useRef(false);

  useEffect(() => {
    NavigationBar.setButtonStyleAsync('dark');
    NavigationBar.setBackgroundColorAsync('#000');
  }, []);

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

  useEffect(() => {
    if (secondsLeft === 0) {
      if (!rewardGiven.current && mode === 'focus') {
        completePomodoro();
        rewardGiven.current = true;
      }
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
      rewardGiven.current = false;
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
    <View style={[styles.container, { backgroundColor, width: '100%', height: '100%' }]}>
      <Fireworks isActive={showCelebration} />
      <View style={[styles.mainContent, isLandscape && styles.mainContentLandscape]}>
        <View style={styles.leftSection}>
          <View style={[styles.titleContainer, isLandscape && styles.titleContainerLandscape]}>
            <Text style={styles.title}>{mode === 'focus' ? 'Focus' : 'Break'}</Text>
            <TouchableOpacity onPress={handleEdit} style={styles.iconButton}>
              <Ionicons name="pencil" size={20} color="#402050" />
            </TouchableOpacity>
          </View>

          <View style={[styles.svgContainer, isLandscape && styles.svgContainerLandscape]}>
            <View style={styles.timerWrapper}>
              <Svg height={timerSize} width={timerSize} viewBox="0 0 220 220">
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
              <View style={styles.timerTextOverlay}>
                <View style={styles.timerTextRow}>
                  <Text style={[styles.timeText, isTablet && styles.timeTextTablet]}>{formatTime(secondsLeft)}</Text>
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
                  isRunning && <Text style={[styles.runningText, isTablet && styles.runningTextTablet]}>Running...</Text>
                }
                {
                  !isRunning && secondsLeft > 0 && <Text style={[styles.runningText, isTablet && styles.runningTextTablet]}>Paused</Text>
                }
                {
                  !isRunning && secondsLeft === 0 && <Text style={[styles.runningText, isTablet && styles.runningTextTablet]}>Done! 🎉</Text>
                }
              </View>
            </View>
          </View>
        </View>

        <View style={[styles.rightSection, isLandscape && styles.rightSectionLandscape]}>
          <View style={[styles.buttonContainer, isLandscape && styles.buttonContainerLandscape]}>
            {
              !isRunning && secondsLeft === totalSeconds && (
                <TouchableOpacity style={[styles.button, isTablet && styles.buttonTablet]} onPress={startTimer}>
                  <Text style={[styles.buttonText, isTablet && styles.buttonTextTablet]}>Start</Text>
                </TouchableOpacity>
              )
            }
            {
              !isRunning && secondsLeft !== totalSeconds && secondsLeft > 0 && (
                <TouchableOpacity style={[styles.button, isTablet && styles.buttonTablet]} onPress={startTimer}>
                  <Text style={[styles.buttonText, isTablet && styles.buttonTextTablet]}>Resume</Text>
                </TouchableOpacity>
              )
            }
            {
              isRunning && (
                <TouchableOpacity style={[styles.button, isTablet && styles.buttonTablet]} onPress={pauseTimer}>
                  <Text style={[styles.buttonText]}>Pause</Text>
                </TouchableOpacity>
              )
            }
            {
              !isRunning && secondsLeft !== totalSeconds && (
                <TouchableOpacity style={[styles.resetButton, isTablet && styles.buttonTablet]} onPress={resetTimer}>
                  <Text style={[styles.buttonText, isTablet && styles.buttonTextTablet]}>Reset</Text>
                </TouchableOpacity>
              )
            }
          </View>

          <View style={[styles.settingsContainer, isTablet && styles.settingsContainerLandscape]}>
            <View style={[styles.settingRow]}>
              <Text style={[styles.keepAwakeText, isTablet && styles.keepAwakeTextTablet]}>Keep screen on</Text>
              <Switch
                value={keepScreenOn}
                onValueChange={setKeepScreenOn}
                trackColor={{ false: '#f4d2cd', true: '#f26b5b' }}
                thumbColor={keepScreenOn ? '#fff' : '#f4f3f4'}
              />
            </View>
            <View style={[styles.settingRow]}>
              <Text style={[styles.keepAwakeText, isTablet && styles.keepAwakeTextTablet]}>Chime on finish</Text>
              <Switch
                value={alarmSound}
                onValueChange={setAlarmSound}
                trackColor={{ false: '#f4d2cd', true: '#f26b5b' }}
                thumbColor={alarmSound ? '#fff' : '#f4f3f4'}
              />
            </View>
          </View>
        </View>
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
    </View>
  );
};

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DEFAULT_BACKGROUND,
  },
  mainContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainContentLandscape: {
    flexDirection: 'row',
    paddingHorizontal: 20,
  },
  leftSection: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  rightSection: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  rightSectionLandscape: {
    marginLeft: 40,
    marginTop: 0,
    flex: 1,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  titleContainerLandscape: {
    position: 'absolute',
    top: 20,
    left: 20,
  },
  svgContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  svgContainerLandscape: {
    marginTop: 60,
  },
  timerWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerTextOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
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
    textAlign: 'center',
  },
  timeTextTablet: {
    fontSize: 48,
  },
  runningText: {
    fontSize: 14,
    color: '#6a4c71',
    marginTop: 4,
    textAlign: 'center',
  },
  runningTextTablet: {
    fontSize: 18,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    marginBottom: 30,
  },
  buttonContainerLandscape: {
    justifyContent: 'flex-start',
    marginLeft: 0,
    marginRight: 30,
  },
  button: {
    backgroundColor: '#f26b5b',
    paddingHorizontal: 40,
    paddingVertical: 12,
    borderRadius: 16,
  },
  buttonTablet: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  buttonTextTablet: {
    fontSize: 20,
  },
  resetButton: {
    backgroundColor: '#f26b5b',
    paddingHorizontal: 40,
    paddingVertical: 12,
    borderRadius: 16,
  },
  settingsContainer: {
    width: '100%',
    alignItems: 'center',
  },
  settingsContainerLandscape: {
    alignItems: 'flex-start',
    marginRight: 20,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 15,
  },
  keepAwakeText: {
    color: '#402050',
    fontSize: 16,
  },
  keepAwakeTextTablet: {
    fontSize: 18,
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
  iconButton: {
    padding: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#402050',
    marginBottom: 10,
  },
});

export default CircularTimer;
