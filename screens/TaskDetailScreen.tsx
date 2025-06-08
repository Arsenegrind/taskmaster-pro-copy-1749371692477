import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  TextInput,
  SafeAreaView,
  StatusBar,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import { useTaskContext, Task } from '../context/TaskContext';
import Button from '../components/Button';

export default function TaskDetailScreen() {
  const { colors } = useTheme();
  const { tasks, updateTask, deleteTask } = useTaskContext();
  const navigation = useNavigation();
  const route = useRoute();
  const taskId = route.params?.taskId;

  const [task, setTask] = useState<Task | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [notes, setNotes] = useState('');
  
  // Find task by ID when screen loads
  useEffect(() => {
    if (taskId) {
      const foundTask = tasks.find(t => t.id === taskId);
      if (foundTask) {
        setTask(foundTask);
        setTitle(foundTask.title);
        setDescription(foundTask.description || '');
        setStartTime(foundTask.startTime || '');
        setEndTime(foundTask.endTime || '');
        setNotes(foundTask.notes || '');
      }
    }
  }, [taskId, tasks]);

  // Format date for display
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Format time for display
  const formatTime = (time: string) => {
    if (!time) return '';
    
    const [hours, minutes] = time.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const formattedHour = hours % 12 || 12;
    return `${formattedHour}:${minutes.toString().padStart(2, '0')} ${period}`;
  };
  
  // Handle saving task changes
  const handleUpdateTask = () => {
    if (!task || title.trim() === '') return;
    
    const updatedTask = {
      ...task,
      title,
      description,
      startTime,
      endTime,
      notes
    };
    
    updateTask(updatedTask);
    navigation.goBack();
  };
  
  // Handle deleting task
  const handleDeleteTask = () => {
    if (!task) return;
    deleteTask(task.id);
    navigation.goBack();
  };
  
  // Handle toggling task completion status
  const handleToggleStatus = () => {
    if (!task) return;
    
    const updatedTask = {
      ...task,
      status: task.status === 'pending' ? 'completed' : 'pending'
    };
    
    updateTask(updatedTask);
    setTask(updatedTask);
  };

  if (!task) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <StatusBar barStyle={colors.background === '#121212' ? 'light-content' : 'dark-content'} />
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Task not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={colors.background === '#121212' ? 'light-content' : 'dark-content'} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Task Details</Text>
        <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteTask}>
          <Ionicons name="trash-outline" size={24} color="#ef4444" />
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.content}>
        {/* Task Title */}
        <TextInput
          style={[styles.titleInput, { color: colors.text, borderBottomColor: colors.border }]}
          value={title}
          onChangeText={setTitle}
          placeholder="Task Title"
          placeholderTextColor={`${colors.text}66`}
        />
        
        {/* Task Status */}
        <TouchableOpacity
          style={[
            styles.statusContainer, 
            { 
              backgroundColor: task.status === 'completed' ? '#10b98133' : '#3b82f633',
              borderColor: task.status === 'completed' ? '#10b981' : '#3b82f6'
            }
          ]}
          onPress={handleToggleStatus}
        >
          <Ionicons 
            name={task.status === 'completed' ? 'checkmark-circle' : 'ellipse-outline'} 
            size={20} 
            color={task.status === 'completed' ? '#10b981' : '#3b82f6'} 
          />
          <Text 
            style={[
              styles.statusText, 
              { color: task.status === 'completed' ? '#10b981' : '#3b82f6' }
            ]}
          >
            {task.status === 'completed' ? 'Completed' : 'Pending'}
          </Text>
        </TouchableOpacity>
        
        {/* Date and Time */}
        <View style={[styles.infoSection, { borderBottomColor: colors.border }]}>
          <View style={styles.infoRow}>
            <Ionicons name="calendar-outline" size={20} color={colors.primary} style={styles.infoIcon} />
            <Text style={[styles.infoText, { color: colors.text }]}>
              {formatDate(task.date)}
            </Text>
          </View>
          
          {task.type === 'planned' && (
            <>
              <View style={styles.infoRow}>
                <Ionicons name="time-outline" size={20} color={colors.primary} style={styles.infoIcon} />
                <View style={styles.timeInputContainer}>
                  <TextInput
                    style={[
                      styles.timeInput, 
                      { 
                        color: colors.text,
                        backgroundColor: colors.card,
                        borderColor: colors.border
                      }
                    ]}
                    value={startTime}
                    onChangeText={setStartTime}
                    placeholder="Start time"
                    placeholderTextColor={`${colors.text}66`}
                  />
                  <Text style={[styles.timeSeparator, { color: colors.text }]}>-</Text>
                  <TextInput
                    style={[
                      styles.timeInput, 
                      { 
                        color: colors.text,
                        backgroundColor: colors.card,
                        borderColor: colors.border
                      }
                    ]}
                    value={endTime}
                    onChangeText={setEndTime}
                    placeholder="End time"
                    placeholderTextColor={`${colors.text}66`}
                  />
                </View>
              </View>
              
              <View style={styles.infoRow}>
                <Ionicons name="hourglass-outline" size={20} color={colors.primary} style={styles.infoIcon} />
                <Text style={[styles.infoText, { color: colors.text }]}>
                  Duration: {task.duration} minutes
                </Text>
              </View>
            </>
          )}
          
          <View style={styles.infoRow}>
            <Ionicons name="repeat" size={20} color={colors.primary} style={styles.infoIcon} />
            <Text style={[styles.infoText, { color: colors.text }]}>
              Repeat: {task.repeat === 'none' ? 'Never' : task.repeat}
            </Text>
          </View>
          
          <View style={styles.infoRow}>
            <View style={[
              styles.taskTypeTag,
              { 
                backgroundColor: `${task.color || colors.primary}22`,
                borderColor: task.color || colors.primary 
              }
            ]}>
              <Ionicons 
                name={
                  task.type === 'planned' ? 'time-outline' : 
                  task.type === 'all-day' ? 'calendar-outline' : 'mail-outline'
                } 
                size={16} 
                color={task.color || colors.primary} 
                style={styles.taskTypeIcon} 
              />
              <Text style={[styles.taskTypeText, { color: task.color || colors.primary }]}>
                {task.type === 'planned' ? 'Planned' : 
                 task.type === 'all-day' ? 'All-day' : 'Inbox'}
              </Text>
            </View>
          </View>
        </View>
        
        {/* Description */}
        <View style={[styles.sectionContainer, { borderBottomColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Description</Text>
          <TextInput
            style={[
              styles.descriptionInput, 
              { 
                color: colors.text,
                backgroundColor: colors.card,
                borderColor: colors.border
              }
            ]}
            value={description}
            onChangeText={setDescription}
            placeholder="Add a description..."
            placeholderTextColor={`${colors.text}66`}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>
        
        {/* Notes */}
        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Notes</Text>
          <TextInput
            style={[
              styles.notesInput, 
              { 
                color: colors.text,
                backgroundColor: colors.card,
                borderColor: colors.border
              }
            ]}
            value={notes}
            onChangeText={setNotes}
            placeholder="Add notes..."
            placeholderTextColor={`${colors.text}66`}
            multiline
            numberOfLines={6}
            textAlignVertical="top"
          />
        </View>
      </ScrollView>
      
      {/* Save Button */}
      <View style={[styles.footer, { borderTopColor: colors.border }]}>
        <Button
          title="Save Changes"
          onPress={handleUpdateTask}
          disabled={title.trim() === ''}
        />
      </View>
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
  backButton: {
    padding: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  deleteButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  titleInput: {
    fontSize: 24,
    fontWeight: 'bold',
    paddingVertical: 8,
    marginBottom: 16,
    borderBottomWidth: 1,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 24,
  },
  statusText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '500',
  },
  infoSection: {
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoIcon: {
    marginRight: 12,
  },
  infoText: {
    fontSize: 16,
  },
  timeInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeInput: {
    width: 100,
    height: 40,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 14,
  },
  timeSeparator: {
    marginHorizontal: 8,
    fontSize: 18,
  },
  taskTypeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
  },
  taskTypeIcon: {
    marginRight: 6,
  },
  taskTypeText: {
    fontSize: 14,
    fontWeight: '500',
  },
  sectionContainer: {
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  descriptionInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  notesInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    minHeight: 120,
    textAlignVertical: 'top',
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
  },
});