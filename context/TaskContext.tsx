import React, { createContext, useContext, useState, useEffect } from 'react';

export type TaskType = 'planned' | 'all-day' | 'inbox';
export type TaskStatus = 'pending' | 'completed';
export type RepeatOption = 'none' | 'daily' | 'weekly' | 'monthly';

export interface Task {
  id: string;
  title: string;
  description?: string;
  date: Date;
  startTime?: string;
  endTime?: string;
  duration?: number; // in minutes
  type: TaskType;
  status: TaskStatus;
  color?: string;
  emoji?: string;
  repeat: RepeatOption;
  notes?: string;
}

interface TaskContextType {
  tasks: Task[];
  addTask: (task: Omit<Task, 'id'>) => void;
  updateTask: (task: Task) => void;
  deleteTask: (id: string) => void;
  getTasksByDate: (date: Date) => Task[];
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const useTaskContext = () => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTaskContext must be used within a TaskProvider');
  }
  return context;
};

export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>([]);

  // Load tasks from storage when component mounts
  useEffect(() => {
    // In a real app, we would load from AsyncStorage here
    const sampleTasks: Task[] = [
      {
        id: '1',
        title: 'Review project proposal',
        description: 'Go through the new project requirements',
        date: new Date(2025, 5, 6), // June 6, 2025
        startTime: '10:00',
        endTime: '11:00',
        duration: 60,
        type: 'planned',
        status: 'pending',
        color: '#3b82f6',
        repeat: 'none',
      },
      {
        id: '2',
        title: 'Team meeting',
        description: 'Weekly sync with the development team',
        date: new Date(2025, 5, 6), // June 6, 2025
        startTime: '14:00',
        endTime: '15:00',
        duration: 60,
        type: 'planned',
        status: 'pending',
        color: '#10b981',
        repeat: 'weekly',
      }
    ];
    
    setTasks(sampleTasks);
  }, []);

  // Save tasks to storage whenever they change
  useEffect(() => {
    // In a real app, we would save to AsyncStorage here
    // AsyncStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  const addTask = (task: Omit<Task, 'id'>) => {
    const newTask = {
      ...task,
      id: Math.random().toString(36).substr(2, 9),
    };
    setTasks([...tasks, newTask as Task]);
  };

  const updateTask = (updatedTask: Task) => {
    setTasks(tasks.map(task => task.id === updatedTask.id ? updatedTask : task));
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  const getTasksByDate = (date: Date) => {
    return tasks.filter(task => {
      const taskDate = new Date(task.date);
      return (
        taskDate.getDate() === date.getDate() &&
        taskDate.getMonth() === date.getMonth() &&
        taskDate.getFullYear() === date.getFullYear()
      );
    });
  };

  return (
    <TaskContext.Provider 
      value={{ 
        tasks, 
        addTask, 
        updateTask, 
        deleteTask, 
        getTasksByDate
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};