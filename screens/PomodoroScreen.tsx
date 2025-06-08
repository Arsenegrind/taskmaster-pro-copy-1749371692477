import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  SafeAreaView,
  StatusBar,
  Animated,
  Easing,
  ScrollView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { usePomodoroContext, PomodoroSettings } from '../context/PomodoroContext';
import { useTaskContext } from '../context/TaskContext';
import { useNavigation } from '@react-navigation/native';
import Button from '../components/Button';
import Card from '../components/Card';

// Gradient & SVG helpers
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle } from 'react-native-svg';
// Animated SVG circle for progress
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export default function PomodoroScreen() {
  const { colors } = useTheme();
  const { 
    settings, 
    updateSettings, 
    status, 
    currentSession,
    timeRemaining, 
    startTimer, 
    pauseTimer, 
    resetTimer, 
    skipToNext 
  } = usePomodoroContext();
  const { getTasksByDate } = useTaskContext();
  const navigation = useNavigation();
  
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [settingsForm, setSettingsForm] = useState<PomodoroSettings>({
    workDuration: settings.workDuration,
    shortBreakDuration: settings.shortBreakDuration,
    longBreakDuration: settings.longBreakDuration,
    sessionsBeforeLongBreak: settings.sessionsBeforeLongBreak,
    waitingTime: settings.waitingTime,
  });
  
  // Select today's first pending task
  const todayTasks = getTasksByDate(new Date()).filter(t => t.status === 'pending');
  const [selectedTask, setSelectedTask] = useState(todayTasks[0] || null);
  useEffect(() => {
    if (todayTasks.length > 0) setSelectedTask(todayTasks[0]);
  }, [todayTasks]);
  
  // Animation values
  const progressAnimation = React.useRef(new Animated.Value(1)).current;
  const timerAnimation = React.useRef(new Animated.Value(0)).current;
  
  // Get the relevant duration based on the current status
  const getRelevantDuration = () => {
    switch (status) {
      case 'work':
        return settings.workDuration * 60;
      case 'shortBreak':
        return settings.shortBreakDuration * 60;
      case 'longBreak':
        return settings.longBreakDuration * 60;
      default:
        return settings.workDuration * 60;
    }
  };
  
  // Format time for display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Calculate progress percentage
  const progress = timeRemaining / getRelevantDuration();
  
  // Set up animations whenever the timer status or values change
  useEffect(() => {
    if (status === 'work' || status === 'shortBreak' || status === 'longBreak') {
      // Animate progress ring
      Animated.timing(progressAnimation, {
        toValue: progress,
        duration: 1000,
        useNativeDriver: true,
        easing: Easing.linear
      }).start();
      
      // Pulse animation for the timer text
      Animated.sequence([
        Animated.timing(timerAnimation, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true
        }),
        Animated.timing(timerAnimation, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true
        })
      ]).start();
    }
  }, [timeRemaining, status]);
  
  // Get the timer label based on the current status
  const getTimerLabel = () => {
    switch (status) {
      case 'work':
        return 'Focus Time';
      case 'shortBreak':
        return 'Short Break';
      case 'longBreak':
        return 'Long Break';
      case 'paused':
        return 'Paused';
      default:
        return 'Ready';
    }
  };
  
  // Get the timer color based on the current status
  const getTimerColor = () => {
    switch (status) {
      case 'work':
        return '#ef4444'; // Red
      case 'shortBreak':
        return '#10b981'; // Green
      case 'longBreak':
        return '#3b82f6'; // Blue
      default:
        return colors.primary;
    }
  };
  
  // Save settings
  const saveSettings = () => {
    updateSettings(settingsForm);
    setShowSettingsModal(false);
  };
  
  // Interpolated scale for pulsing timer
  const scale = timerAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.05],
  });
  
  /* ------------------------------------------------------------------
     Tips hover-card logic
  ------------------------------------------------------------------ */
  const [tips, setTips] = useState<string[]>([
    'Clear your workspace of distractions',
    'Set clear goals for each focus session',
    'Hydrate during breaks',
    'Stand up and stretch during short breaks',
  ]);
  const [showTips, setShowTips] = useState(false);
  const deleteTip = (index: number) => {
    setTips(prev => prev.filter((_, i) => i !== index));
  };
  
  /* ------------------------------------------------------------------
     SVG circle progress helpers
  ------------------------------------------------------------------ */
  const RADIUS = 120;
  const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
  const strokeDashoffset = progressAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [CIRCUMFERENCE, 0],
  });
  
  return (
    <SafeAreaView style={styles.flexOne}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={["#4C3AFF", "#1B1736"]} style={styles.flexOne}>
        {/* HEADER */}
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: '#ffffff' }]}>Pomodoro timer</Text>
          <View style={{ flexDirection: 'row' }}>
            {/* Tips trigger icon – press to toggle */}
            <TouchableOpacity
              onPress={() => setShowTips(prev => !prev)}
              style={{ marginRight: 12 }}
            >
              <Ionicons name="bulb-outline" size={24} color="#ffffff" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setShowSettingsModal(true)}>
              <Ionicons name="settings-outline" size={24} color="#ffffff" />
            </TouchableOpacity>
          </View>
        </View>
        {/* TASK CHIP */}
        <View style={styles.taskChipWrapper}>
          <TouchableOpacity style={styles.taskChip} onPress={() => selectedTask && navigation.navigate('TaskDetail', { taskId: selectedTask.id })}>
            <Text style={styles.taskChipText} numberOfLines={1}>
              Task: {selectedTask ? selectedTask.title : 'No task selected'}
            </Text>
            <Ionicons name="pencil" size={14} color="#ffffff" style={{ marginLeft: 4 }} />
          </TouchableOpacity>
        </View>
        {/* TIMER SECTION */}
        <View style={styles.timerSection}>
          <Svg width={RADIUS * 2 + 20} height={RADIUS * 2 + 20}>
            <Circle
              cx={RADIUS + 10}
              cy={RADIUS + 10}
              r={RADIUS}
              stroke="#2a2a4c"
              strokeWidth={12}
              fill="none"
            />
            <AnimatedCircle
              cx={RADIUS + 10}
              cy={RADIUS + 10}
              r={RADIUS}
              stroke={getTimerColor()}
              strokeWidth={12}
              fill="none"
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={strokeDashoffset}
            />
          </Svg>
          <Animated.Text
            style={[styles.timerText, { transform: [{ scale }] }]}
          >
            {formatTime(timeRemaining)}
          </Animated.Text>
        </View>
        {/* SESSION DOTS */}
        <View style={styles.sessionDotsWrapper}>
          {Array.from({ length: settings.sessionsBeforeLongBreak }).map((_, i) => (
            <View
              key={i}
              style={[styles.sessionDot, i + 1 === currentSession && { backgroundColor: getTimerColor() }]}
            />
          ))}
        </View>
        {/* MAIN CONTROL BUTTON */}
        <TouchableOpacity
          style={[styles.mainControlBtn, { backgroundColor: getTimerColor() }]}
          onPress={status === 'idle' || status === 'paused' ? startTimer : pauseTimer}
        >
          <Ionicons
            name={status === 'idle' || status === 'paused' ? 'play' : 'pause'}
            size={34}
            color="#ffffff"
          />
        </TouchableOpacity>
      </LinearGradient>
      
      {/* HOVER-ONLY TIPS CARD */}
      {showTips && (
        <View style={styles.tipsHoverCard}>
          <ScrollView>
            {tips.map((tip, idx) => (
              <View key={idx} style={styles.tipItem}>
                <Text style={[styles.tipText, { flex: 1, color: '#ffffff' }]}>{tip}</Text>
                <TouchableOpacity onPress={() => deleteTip(idx)}>
                  <Ionicons name="close-circle" size={18} color="#ffffff" />
                </TouchableOpacity>
              </View>
            ))}
            {tips.length === 0 && (
              <Text style={{ color: '#bbb', textAlign: 'center' }}>No tips</Text>
            )}
          </ScrollView>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flexOne: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  iconButton: {
    padding: 8,
  },
  timerSection: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  timerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerCircle: {
    width: 250,
    height: 250,
    borderRadius: 125,
    borderWidth: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerText: {
    position: 'absolute',
    alignSelf: 'center',
    top: '42%',
    fontSize: 46,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  timerLabel: {
    fontSize: 18,
    marginTop: 8,
  },
  sessionCounter: {
    marginTop: 16,
    marginBottom: 32,
  },
  sessionCounterText: {
    fontSize: 16,
    fontWeight: '500',
  },
  timerControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingHorizontal: 32,
  },
  controlButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  tipsCard: {
    flex: 1,
    margin: 16,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  tipText: {
    fontSize: 16,
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#DDDDDD',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalContent: {
    padding: 16,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  settingInput: {
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  settingToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#DDDDDD',
  },
  footerButton: {
    flex: 1,
    marginHorizontal: 8,
  },
  taskChipWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  taskChip: {
    backgroundColor: '#10b981',
    padding: 8,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  taskChipText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#fff',
  },
  sessionDotsWrapper: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
  },
  sessionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  controlBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingHorizontal: 32,
  },
  mainControlBtn: {
    width: 76,
    height: 76,
    borderRadius: 38,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginTop: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 6,
  },
  tipsHoverCard: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    maxHeight: 200,
    backgroundColor: 'rgba(0,0,0,0.85)',
    padding: 16,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
});