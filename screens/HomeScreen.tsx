import React, { useState, useMemo } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  FlatList,
  SafeAreaView,
  StatusBar,
  Modal,
  TextInput
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import { useTaskContext, Task, TaskType } from '../context/TaskContext';
import Card from '../components/Card';
import Button from '../components/Button';
import EmptyState from '../components/EmptyState';

const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export default function HomeScreen() {
  const { colors } = useTheme();
  const { tasks, addTask, updateTask, deleteTask, getTasksByDate } = useTaskContext();
  const navigation = useNavigation();
  
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  
  // Task form state
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [taskStartTime, setTaskStartTime] = useState('');
  const [taskEndTime, setTaskEndTime] = useState('');
  const [taskDuration, setTaskDuration] = useState('15');
  const [taskType, setTaskType] = useState<TaskType>('planned');
  const [taskColor, setTaskColor] = useState('#3b82f6');

  // Calculate calendar days
  const calendarDays = useMemo(() => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    const daysInMonth = lastDay.getDate();
    const days = [];
    
    // Current date for highlighting today
    const today = new Date();
    const isCurrentMonth = 
      today.getMonth() === month && 
      today.getFullYear() === year;
    
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
      days.push({
        date,
        dayOfWeek: date.getDay(),
        isToday: isCurrentMonth && today.getDate() === i,
        isSelected: selectedDate.getDate() === i,
      });
    }
    
    return days;
  }, [selectedDate]);
  
  // Tasks for the selected date
  const dayTasks = useMemo(() => {
    return getTasksByDate(selectedDate);
  }, [selectedDate, tasks]);
  
  // Handle adding a new task
  const handleAddTask = () => {
    if (taskTitle.trim() === '') return;
    
    const newTask = {
      title: taskTitle,
      description: taskDescription,
      date: selectedDate,
      startTime: taskStartTime,
      endTime: taskEndTime,
      duration: parseInt(taskDuration, 10),
      type: taskType,
      status: 'pending',
      color: taskColor,
      repeat: 'none',
    };
    
    addTask(newTask);
    resetForm();
    setShowAddTaskModal(false);
  };
  
  // Reset form fields
  const resetForm = () => {
    setTaskTitle('');
    setTaskDescription('');
    setTaskStartTime('');
    setTaskEndTime('');
    setTaskDuration('15');
    setTaskType('planned');
    setTaskColor('#3b82f6');
  };
  
  // Navigate to previous month
  const goToPreviousMonth = () => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(newDate.getMonth() - 1);
    setSelectedDate(newDate);
  };
  
  // Navigate to next month
  const goToNextMonth = () => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(newDate.getMonth() + 1);
    setSelectedDate(newDate);
  };
  
  // Format time for display (e.g., "14:00" to "2:00 PM")
  const formatTime = (time: string) => {
    if (!time) return '';
    
    const [hours, minutes] = time.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const formattedHour = hours % 12 || 12;
    return `${formattedHour}:${minutes.toString().padStart(2, '0')} ${period}`;
  };
  
  // Toggle task completion status
  const toggleTaskStatus = (task: Task) => {
    const updatedTask = {
      ...task,
      status: task.status === 'pending' ? 'completed' : 'pending'
    };
    updateTask(updatedTask);
  };

  // Prepare task type options
  const taskTypeOptions = [
    { label: 'Planned', value: 'planned', icon: 'time-outline' },
    { label: 'All-day', value: 'all-day', icon: 'calendar-outline' },
    { label: 'Inbox', value: 'inbox', icon: 'mail-outline' },
  ];
  
  // Prepare color options
  const colorOptions = [
    '#3b82f6', // Blue
    '#10b981', // Green
    '#ef4444', // Red
    '#f59e0b', // Orange
    '#8b5cf6', // Purple
    '#ec4899', // Pink
  ];
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={colors.background === '#121212' ? 'light-content' : 'dark-content'} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconButton} onPress={() => {}}>
          <Ionicons name="calendar-outline" size={24} color={colors.primary} />
        </TouchableOpacity>
        
        <View style={styles.titleContainer}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            {monthNames[selectedDate.getMonth()]} {selectedDate.getFullYear()}
          </Text>
        </View>
        
        <TouchableOpacity style={styles.iconButton} onPress={() => {}}>
          <Ionicons name="search" size={24} color={colors.text} />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.iconButton} onPress={() => {}}>
          <Ionicons name="settings-outline" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>
      
      {/* Calendar */}
      <View style={[styles.calendar, { borderColor: colors.border }]}>
        <View style={styles.monthNavigation}>
          <TouchableOpacity onPress={goToPreviousMonth} style={styles.navButton}>
            <Ionicons name="chevron-back" size={24} color={colors.text} />
          </TouchableOpacity>
          
          <Text style={[styles.monthYearText, { color: colors.text }]}>
            {monthNames[selectedDate.getMonth()]} {selectedDate.getFullYear()}
          </Text>
          
          <TouchableOpacity onPress={goToNextMonth} style={styles.navButton}>
            <Ionicons name="chevron-forward" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
        
        {/* Day of week headers */}
        <View style={styles.weekDayHeader}>
          {weekDays.map((day) => (
            <Text key={day} style={[styles.weekDayText, { color: colors.text }]}>
              {day}
            </Text>
          ))}
        </View>
        
        {/* Calendar days */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.daysContainer}>
            {calendarDays.map((day, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.dayButton,
                  day.isSelected && { 
                    borderColor: colors.primary,
                    backgroundColor: `${colors.primary}33`,
                  }
                ]}
                onPress={() => {
                  const newDate = new Date(selectedDate);
                  newDate.setDate(day.date.getDate());
                  setSelectedDate(newDate);
                }}
              >
                <Text style={[
                  styles.dayOfWeek, 
                  { color: day.isToday ? colors.primary : colors.text }
                ]}>
                  {weekDays[day.dayOfWeek]}
                </Text>
                
                <Text style={[
                  styles.dayNumber,
                  { color: day.isToday ? colors.primary : colors.text },
                  day.isSelected && { color: colors.primary, fontWeight: 'bold' }
                ]}>
                  {day.date.getDate()}
                </Text>
                
                {/* Task indicator dots */}
                <View style={styles.taskIndicators}>
                  {getTasksByDate(day.date).length > 0 && (
                    <View style={[styles.taskDot, { backgroundColor: colors.primary }]} />
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>
      
      {/* Task List */}
      <View style={styles.taskList}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          {selectedDate.toDateString()}
        </Text>
        
        {dayTasks.length === 0 ? (
          <EmptyState
            icon="calendar-outline"
            title="No tasks scheduled"
            message="Tap the Add button to create a new task for this date."
          />
        ) : (
          <FlatList
            data={dayTasks}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity 
                style={[styles.taskItem, { borderLeftColor: item.color || colors.primary }]}
                onPress={() => navigation.navigate('TaskDetail', { taskId: item.id })}
              >
                <TouchableOpacity 
                  style={[
                    styles.checkbox, 
                    item.status === 'completed' && { backgroundColor: item.color || colors.primary }
                  ]}
                  onPress={() => toggleTaskStatus(item)}
                >
                  {item.status === 'completed' && (
                    <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                  )}
                </TouchableOpacity>
                
                <View style={styles.taskContent}>
                  <Text style={[
                    styles.taskTitle, 
                    { color: colors.text },
                    item.status === 'completed' && styles.completedTaskTitle
                  ]}>
                    {item.title}
                  </Text>
                  
                  {item.description ? (
                    <Text style={[styles.taskDescription, { color: `${colors.text}99` }]} numberOfLines={1}>
                      {item.description}
                    </Text>
                  ) : null}
                  
                  {item.startTime ? (
                    <View style={styles.taskTimeContainer}>
                      <Ionicons name="time-outline" size={14} color={`${colors.text}99`} style={styles.taskTimeIcon} />
                      <Text style={[styles.taskTime, { color: `${colors.text}99` }]}>
                        {formatTime(item.startTime)} {item.endTime ? `- ${formatTime(item.endTime)}` : ''}
                      </Text>
                    </View>
                  ) : null}
                </View>
                
                <TouchableOpacity style={styles.taskAction}>
                  <Ionicons name="ellipsis-horizontal" size={20} color={colors.text} />
                </TouchableOpacity>
              </TouchableOpacity>
            )}
          />
        )}
      </View>
      
      {/* Add Task Button (FAB) */}
      <TouchableOpacity 
        style={[styles.addButton, { backgroundColor: colors.primary }]}
        onPress={() => setShowAddTaskModal(true)}
      >
        <Ionicons name="add" size={28} color="#FFFFFF" />
      </TouchableOpacity>
      
      {/* Add Task Modal */}
      <Modal
        visible={showAddTaskModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddTaskModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Add New Task</Text>
              <TouchableOpacity onPress={() => setShowAddTaskModal(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalContent}>
              {/* Task Title Input */}
              <Text style={[styles.inputLabel, { color: colors.text }]}>Task Name</Text>
              <TextInput
                style={[
                  styles.input, 
                  { 
                    color: colors.text,
                    backgroundColor: `${colors.card}`,
                    borderColor: colors.border
                  }
                ]}
                placeholder="Enter task name"
                placeholderTextColor={`${colors.text}66`}
                value={taskTitle}
                onChangeText={setTaskTitle}
              />
              
              {/* Task Description Input */}
              <Text style={[styles.inputLabel, { color: colors.text }]}>Description (optional)</Text>
              <TextInput
                style={[
                  styles.textArea, 
                  { 
                    color: colors.text,
                    backgroundColor: `${colors.card}`,
                    borderColor: colors.border
                  }
                ]}
                placeholder="Enter description"
                placeholderTextColor={`${colors.text}66`}
                value={taskDescription}
                onChangeText={setTaskDescription}
                multiline
                numberOfLines={3}
              />
              
              {/* Task Type Selection */}
              <Text style={[styles.inputLabel, { color: colors.text }]}>Task Type</Text>
              <View style={styles.taskTypeContainer}>
                {taskTypeOptions.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.taskTypeOption,
                      taskType === option.value && {
                        backgroundColor: `${colors.primary}33`,
                        borderColor: colors.primary,
                      },
                      { borderColor: colors.border }
                    ]}
                    onPress={() => setTaskType(option.value as TaskType)}
                  >
                    <Ionicons 
                      name={option.icon} 
                      size={18} 
                      color={taskType === option.value ? colors.primary : colors.text} 
                    />
                    <Text style={[
                      styles.taskTypeText,
                      { color: taskType === option.value ? colors.primary : colors.text }
                    ]}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              
              {/* Time Selection for planned tasks */}
              {taskType === 'planned' && (
                <>
                  <Text style={[styles.inputLabel, { color: colors.text }]}>Duration</Text>
                  <View style={styles.durationContainer}>
                    <TextInput
                      style={[
                        styles.durationInput, 
                        { 
                          color: colors.text,
                          backgroundColor: `${colors.card}`,
                          borderColor: colors.border
                        }
                      ]}
                      placeholder="15"
                      placeholderTextColor={`${colors.text}66`}
                      value={taskDuration}
                      onChangeText={setTaskDuration}
                      keyboardType="number-pad"
                    />
                    <Text style={[styles.durationUnit, { color: colors.text }]}>minutes</Text>
                  </View>
                  
                  <View style={styles.timeInputRow}>
                    <View style={styles.timeInputHalf}>
                      <Text style={[styles.inputLabel, { color: colors.text }]}>Start Time</Text>
                      <TextInput
                        style={[
                          styles.input, 
                          { 
                            color: colors.text,
                            backgroundColor: `${colors.card}`,
                            borderColor: colors.border
                          }
                        ]}
                        placeholder="10:00"
                        placeholderTextColor={`${colors.text}66`}
                        value={taskStartTime}
                        onChangeText={setTaskStartTime}
                      />
                    </View>
                    
                    <View style={styles.timeInputHalf}>
                      <Text style={[styles.inputLabel, { color: colors.text }]}>End Time</Text>
                      <TextInput
                        style={[
                          styles.input, 
                          { 
                            color: colors.text,
                            backgroundColor: `${colors.card}`,
                            borderColor: colors.border
                          }
                        ]}
                        placeholder="10:15"
                        placeholderTextColor={`${colors.text}66`}
                        value={taskEndTime}
                        onChangeText={setTaskEndTime}
                      />
                    </View>
                  </View>
                </>
              )}
              
              {/* Color Selection */}
              <Text style={[styles.inputLabel, { color: colors.text }]}>Color</Text>
              <View style={styles.colorContainer}>
                {colorOptions.map((color) => (
                  <TouchableOpacity
                    key={color}
                    style={[
                      styles.colorOption,
                      { backgroundColor: color },
                      taskColor === color && styles.selectedColorOption
                    ]}
                    onPress={() => setTaskColor(color)}
                  >
                    {taskColor === color && (
                      <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
            
            <View style={styles.modalFooter}>
              <Button 
                title="Cancel" 
                onPress={() => setShowAddTaskModal(false)} 
                type="outline"
                style={styles.footerButton}
              />
              <Button 
                title="Save Task" 
                onPress={handleAddTask}
                disabled={taskTitle.trim() === ''}
                style={styles.footerButton}
              />
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  iconButton: {
    padding: 8,
  },
  calendar: {
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  monthNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginTop: 8,
    marginBottom: 16,
  },
  navButton: {
    padding: 6,
  },
  monthYearText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  weekDayHeader: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 8,
    justifyContent: 'space-around',
  },
  weekDayText: {
    fontSize: 12,
    width: 44,
    textAlign: 'center',
  },
  daysContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  dayButton: {
    width: 44,
    height: 70,
    marginHorizontal: 5,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  dayOfWeek: {
    fontSize: 12,
    marginBottom: 2,
  },
  dayNumber: {
    fontSize: 18,
    fontWeight: '500',
  },
  taskIndicators: {
    flexDirection: 'row',
    marginTop: 4,
  },
  taskDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginHorizontal: 2,
  },
  taskList: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 10,
    marginBottom: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  taskContent: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  completedTaskTitle: {
    textDecorationLine: 'line-through',
    opacity: 0.7,
  },
  taskDescription: {
    fontSize: 14,
    marginBottom: 4,
  },
  taskTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  taskTimeIcon: {
    marginRight: 4,
  },
  taskTime: {
    fontSize: 12,
  },
  taskAction: {
    padding: 8,
  },
  addButton: {
    position: 'absolute',
    right: 24,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
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
    maxHeight: '90%',
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
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingTop: 12,
    marginBottom: 16,
    fontSize: 16,
    textAlignVertical: 'top',
  },
  taskTypeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  taskTypeOption: {
    flex: 1,
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  taskTypeText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
  durationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  durationInput: {
    height: 50,
    width: 80,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    textAlign: 'center',
  },
  durationUnit: {
    fontSize: 16,
    marginLeft: 12,
  },
  timeInputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  timeInputHalf: {
    width: '48%',
  },
  colorContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  colorOption: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginHorizontal: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedColorOption: {
    borderWidth: 2,
    borderColor: '#FFFFFF',
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
});