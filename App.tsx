import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StyleSheet } from 'react-native';
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Toaster } from 'sonner-native';
import { Ionicons } from '@expo/vector-icons';

// Screens
import HomeScreen from "./screens/HomeScreen";
import NotesScreen from "./screens/NotesScreen";
import PomodoroScreen from "./screens/PomodoroScreen";
import AssistantScreen from "./screens/AssistantScreen";
import TaskDetailScreen from "./screens/TaskDetailScreen";

// Context providers
import { ThemeProvider } from './context/ThemeContext';
import { TaskProvider } from './context/TaskContext';
import { NoteProvider } from './context/NoteContext';
import { PomodoroProvider } from './context/PomodoroContext';
import { AssistantProvider } from './context/AssistantContext';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator 
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          
          if (route.name === 'Tasks') {
            iconName = focused ? 'calendar' : 'calendar-outline';
          } else if (route.name === 'Notes') {
            iconName = focused ? 'document-text' : 'document-text-outline';
          } else if (route.name === 'Pomodoro') {
            iconName = focused ? 'timer' : 'timer-outline';
          } else if (route.name === 'Assistant') {
            iconName = focused ? 'chatbubble' : 'chatbubble-outline';
          }
          
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#3b82f6',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#121212',
          borderTopColor: '#2a2a2a',
        }
      })}
    >
      <Tab.Screen name="Tasks" component={HomeScreen} />
      <Tab.Screen name="Notes" component={NotesScreen} />
      <Tab.Screen name="Pomodoro" component={PomodoroScreen} />
      <Tab.Screen name="Assistant" component={AssistantScreen} />
    </Tab.Navigator>
  );
}

function RootStack() {
  return (
    <Stack.Navigator screenOptions={{
      headerShown: false,
      contentStyle: { backgroundColor: '#121212' }
    }}>
      <Stack.Screen name="MainTabs" component={MainTabs} />
      <Stack.Screen name="TaskDetail" component={TaskDetailScreen} options={{ presentation: 'modal' }} />
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <TaskProvider>
        <NoteProvider>
          <PomodoroProvider>
            <AssistantProvider>
              <SafeAreaProvider style={styles.container}>
                <Toaster />
                <NavigationContainer>
                  <RootStack />
                </NavigationContainer>
              </SafeAreaProvider>
            </AssistantProvider>
          </PomodoroProvider>
        </NoteProvider>
      </TaskProvider>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    userSelect: "none",
    backgroundColor: '#121212',
  }
});