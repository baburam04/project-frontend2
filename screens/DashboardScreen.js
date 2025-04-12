import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useRoute } from '@react-navigation/native';
import api from '../services/api';

const COLORS = ['#FFD180', '#80D8FF', '#CFD8DC', '#AED581', '#FF8A80'];

const DashboardScreen = ({ navigation }) => {
  const route = useRoute();
  const { checklistId, checklistTitle } = route.params;
  
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [selectedColor, setSelectedColor] = useState('#80D8FF');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [isOnline, setIsOnline] = useState(true);

  // Load tasks for this checklist
  useEffect(() => {
    const loadTasks = async () => {
      try {
        // Try API first
        const response = await api.get(`/api/tasks/checklist/${checklistId}`);
        setTasks(response.data.tasks);
        // Save fresh data to local storage
        await AsyncStorage.setItem(`tasks_${checklistId}`, JSON.stringify(response.data.tasks));
        setIsOnline(true);
      } catch (error) {
        console.log('API failed, falling back to local storage');
        setIsOnline(false);
        // Fallback to local storage
        try {
          const localTasks = await AsyncStorage.getItem(`tasks_${checklistId}`);
          if (localTasks) {
            setTasks(JSON.parse(localTasks));
          }
        } catch (localError) {
          console.error('Failed to load local tasks:', localError);
          Alert.alert('Error', 'Failed to load tasks');
        }
      }
    };
    loadTasks();
  }, [checklistId]);

  const addTask = async () => {
    if (!newTask.trim()) return;

    const newTaskObj = {
      id: Date.now().toString(),
      text: newTask.trim(),
      color: selectedColor,
      completed: false,
      pinned: false,
      createdAt: new Date().toISOString()
    };

    // Optimistic update
    const updatedTasks = [newTaskObj, ...tasks];
    setTasks(updatedTasks);
    
    try {
      if (isOnline) {
        // Try API first
        const response = await api.post('/api/tasks', {
          title: newTask.trim(),
          checklist: checklistId,
          color: selectedColor
        });
        // Update with server-generated ID if needed
        setTasks([response.data.task, ...tasks]);
      }
      // Save to local storage regardless
      await AsyncStorage.setItem(`tasks_${checklistId}`, JSON.stringify(updatedTasks));
    } catch (error) {
      console.log('Failed to sync with server, keeping local changes');
      setIsOnline(false);
    }
    
    setNewTask('');
    setShowColorPicker(false);
  };

  const toggleComplete = async (taskId) => {
    // Optimistic update
    const updatedTasks = tasks.map(task => 
      task.id === taskId ? {...task, completed: !task.completed} : task
    );
    setTasks(updatedTasks);

    try {
      if (isOnline) {
        await api.patch(`/api/tasks/${taskId}`, {
          completed: !tasks.find(t => t.id === taskId).completed
        });
      }
      // Update local storage
      await AsyncStorage.setItem(`tasks_${checklistId}`, JSON.stringify(updatedTasks));
    } catch (error) {
      console.log('Failed to sync completion status, keeping local changes');
      setIsOnline(false);
    }
  };

  const togglePin = async (taskId) => {
    // Optimistic update
    const updatedTasks = tasks.map(task => 
      task.id === taskId ? {...task, pinned: !task.pinned} : task
    );
    setTasks(updatedTasks);

    try {
      if (isOnline) {
        await api.patch(`/api/tasks/${taskId}`, {
          pinned: !tasks.find(t => t.id === taskId).pinned
        });
      }
      // Update local storage
      await AsyncStorage.setItem(`tasks_${checklistId}`, JSON.stringify(updatedTasks));
    } catch (error) {
      console.log('Failed to sync pin status, keeping local changes');
      setIsOnline(false);
    }
  };

 const deleteTask = async (taskId) => {
  // Optimistic update
  const updatedTasks = tasks.filter(task => task.id !== taskId);
  setTasks(updatedTasks);
  
  try {
    if (isOnline) {
      await api.delete(`/api/tasks/${taskId}`);
    }
    // Update local storage
    await AsyncStorage.setItem(
      `tasks_${checklistId}`,
      JSON.stringify(updatedTasks)
    );
  } catch (error) {
    console.log('Failed to sync task deletion with server, keeping local changes');
    setIsOnline(false);
  }
};
  
  const TaskItem = ({ task }) => (
    <View style={[styles.taskItem, {backgroundColor: task.color}]}>
      <TouchableOpacity onPress={() => toggleComplete(task.id)}>
        <Icon 
          name={task.completed ? "check-box" : "check-box-outline-blank"} 
          size={24} 
          color={task.completed ? "#000" : "rgba(0,0,0,0.7)"}
        />
      </TouchableOpacity>

      <Text style={[styles.taskText, task.completed && styles.completedText]}>
        {task.text}
      </Text>

      <View style={styles.taskActions}>
        <TouchableOpacity onPress={() => togglePin(task.id)}>
          <Icon 
            name={task.pinned ? "push-pin" : "outlined-flag"} 
            size={20} 
            color={task.pinned ? "#000" : "rgba(0,0,0,0.7)"}
          />
        </TouchableOpacity>
        
        <TouchableOpacity onPress={() => deleteTask(task.id)}>
          <Icon name="delete" size={20} color="rgba(0,0,0,0.7)" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Offline indicator */}
      {!isOnline && (
        <View style={styles.offlineBar}>
          <Text style={styles.offlineText}>Offline Mode - Changes will sync when online</Text>
        </View>
      )}
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>{checklistTitle || 'Tasks'}</Text>
        <View style={{ width: 24 }} /> {/* Spacer for alignment */}
      </View>
      
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Add a new task..."
          value={newTask}
          onChangeText={setNewTask}
          onSubmitEditing={addTask}
          placeholderTextColor="#888"
        />
        <TouchableOpacity 
          style={[styles.colorPreview, {backgroundColor: selectedColor}]}
          onPress={() => setShowColorPicker(!showColorPicker)}
        />
        <TouchableOpacity style={styles.addButton} onPress={addTask}>
          <Icon name="add" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {showColorPicker && (
        <View style={styles.colorPicker}>
          {COLORS.map(color => (
            <TouchableOpacity
              key={color}
              style={[
                styles.colorOption, 
                {backgroundColor: color},
                selectedColor === color && styles.selectedColor
              ]}
              onPress={() => {
                setSelectedColor(color);
                setShowColorPicker(false);
              }}
            />
          ))}
        </View>
      )}

      <ScrollView style={styles.tasksContainer}>
        {/* Pinned Tasks */}
        {tasks.filter(t => t.pinned).map(task => (
          <TaskItem key={task.id} task={task} />
        ))}
        
        {/* Unpinned Tasks */}
        {tasks.filter(t => !t.pinned).map(task => (
          <TaskItem key={task.id} task={task} />
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E8F5E9",
    padding: 20,
  },
  offlineBar: {
    backgroundColor: '#FFCC00',
    padding: 10,
    marginBottom: 16,
    borderRadius: 5,
  },
  offlineText: {
    color: '#000',
    textAlign: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    flex: 1,
  },
  inputContainer: {
    flexDirection: 'row',
    marginBottom: 15,
    alignItems: 'center',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    backgroundColor: 'white',
    fontSize: 16,
    marginRight: 10,
  },
  colorPreview: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 2,
    borderColor: '#fff',
  },
  colorPicker: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
    padding: 10,
    backgroundColor: 'white',
    borderRadius: 8,
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedColor: {
    borderColor: '#000',
  },
  addButton: {
    backgroundColor: '#4CAF50',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tasksContainer: {
    flex: 1,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  taskText: {
    flex: 1,
    fontSize: 16,
    color: '#000',
    marginHorizontal: 15,
    fontWeight: '500',
  },
  completedText: {
    textDecorationLine: 'line-through',
    opacity: 0.7,
  },
  taskActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
});

export default DashboardScreen;