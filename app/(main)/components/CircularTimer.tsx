import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, Easing, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

const TOTAL_SECONDS = 15 * 60;

const CircularTimer = () => {
  const [secondsLeft, setSecondsLeft] = useState(TOTAL_SECONDS);
  const [isRunning, setIsRunning] = useState(true);
  const [title, setTitle] = useState('Focus');
  const [isEditing, setIsEditing] = useState(false);
  const [tempTitle, setTempTitle] = useState(title);
  const [wasRunningBeforeEdit, setWasRunningBeforeEdit] = useState(false);
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

  const handleEdit = () => {
    setWasRunningBeforeEdit(isRunning);
    if (isRunning) {
      pauseTimer();
    }
    setIsEditing(true);
    setTempTitle(title);
  };

  const handleSave = () => {
    setTitle(tempTitle);
    setIsEditing(false);
    if (wasRunningBeforeEdit) {
      startTimer();
    }
  };

  const handleCancel = () => {
    setTempTitle(title);
    setIsEditing(false);
    if (wasRunningBeforeEdit) {
      startTimer();
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.titleContainer}>
        <Text style={styles.title}>{title}</Text>
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
            <Text style={styles.modalTitle}>Edit Objective</Text>
            <TextInput
              style={styles.modalInput}
              value={tempTitle}
              onChangeText={setTempTitle}
              autoFocus
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity onPress={handleSave} style={[styles.modalButton, styles.saveButton]}>
                <Ionicons name="checkmark" size={24} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleCancel} style={[styles.modalButton, styles.cancelButton]}>
                <Ionicons name="close" size={24} color="#fff" />
              </TouchableOpacity>
            </View>
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
      </View>
      <View style={styles.timerTextContainer}>
        <Text style={styles.timeText}>{formatTime(secondsLeft)}</Text>
        <Text style={styles.runningText}>{isRunning ? 'Running...' : 'Paused'}</Text>
      </View>
      <View style={styles.buttonContainer}>
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
    backgroundColor: '#fdf1ef',
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
  }
});

export default CircularTimer;
