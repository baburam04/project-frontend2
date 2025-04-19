import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  FlatList, 
  TextInput,
  Keyboard,
  Alert,
  ActivityIndicator
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import api from '../services/api';

const ChecklistsScreen = () => {
  const [checklists, setChecklists] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [newChecklistName, setNewChecklistName] = useState('');
  const [showInput, setShowInput] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation();
  
  // Load token and checklists when screen focuses
  useFocusEffect(
    useCallback(() => {
      const loadData = async () => {
        setIsLoading(true);
        try {
          const token = await AsyncStorage.getItem('token');
          if (!token) {
            handleLogout();
            return;
          }
          await loadChecklists();
        } catch (error) {
          console.error('Initial load error:', error);
          Alert.alert('Error', 'Failed to load data');
        } finally {
          setIsLoading(false);
        }
      };
      loadData();
    }, [])
  );

  const handleLogout = async () => {
    try {
      await AsyncStorage.multiRemove(['token', 'checklists']);
      navigation.navigate('Login');
    } catch (error) {
      console.error('Logout error:', error);
      Alert.alert('Error', 'Failed to logout');
    }
  };

  // Set header options with logout button
  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity 
          onPress={handleLogout}
          style={styles.logoutButton}
          testID="logout-button"
        >
          <Icon name="logout" size={24} color="#FF3B30" />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  const loadChecklists = async () => {
    try {
      const response = await api.get('/api/checklists');
      const formattedChecklists = response.data.checklists.map(item => ({
        id: item._id,
        title: item.title,
        createdAt: item.createdAt,
        taskCount: item.taskCount || 0
      }));
      setChecklists(formattedChecklists);
      await AsyncStorage.setItem('checklists', JSON.stringify(formattedChecklists));
      setIsOnline(true);
    } catch (error) {
      console.log('API failed:', error.response?.data || error.message);
      setIsOnline(false);
      
      if (error.response?.status === 401) {
        Alert.alert('Session Expired', 'Please login again');
        handleLogout();
        return;
      }
      
      try {
        const localChecklists = await AsyncStorage.getItem('checklists');
        if (localChecklists) {
          setChecklists(JSON.parse(localChecklists));
        }
      } catch (localError) {
        console.error('Failed to load local checklists:', localError);
        Alert.alert('Error', 'Failed to load checklists');
      }
    } finally {
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadChecklists();
  };

  const navigateToDashboard = (checklist) => {
    navigation.navigate('Dashboard', { 
      checklistId: checklist.id, 
      checklistTitle: checklist.title 
    });
  };

  // Filter checklists based on search query
  const filteredChecklists = checklists.filter(checklist =>
    checklist.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Create new checklist
  const createChecklist = async () => {
    if (!newChecklistName.trim()) return;
    
    Keyboard.dismiss();
    
    const tempId = Date.now().toString();
    const newChecklist = {
      id: tempId,
      title: newChecklistName.trim(),
      createdAt: new Date().toISOString(),
      taskCount: 0
    };

    // Optimistic update
    setChecklists(prev => [newChecklist, ...prev]);
    
    try {
      if (isOnline) {
        const response = await api.post('/api/checklists', {
          title: newChecklistName.trim()
        });
        // Replace with server data
        setChecklists(prev => [
          {
            id: response.data.checklist._id,
            title: response.data.checklist.title,
            createdAt: response.data.checklist.createdAt,
            taskCount: 0
          },
          ...prev.filter(item => item.id !== tempId)
        ]);
      }
      // Save to local storage
      await AsyncStorage.setItem('checklists', JSON.stringify([newChecklist, ...checklists]));
    } catch (error) {
      console.log('Failed to sync with server:', error);
      setIsOnline(false);
      Alert.alert('Error', 'Failed to create checklist');
      // Revert optimistic update if API fails
      setChecklists(prev => prev.filter(item => item.id !== tempId));
    }
    
    setNewChecklistName('');
    setShowInput(false);
  };

  // Delete checklist
  const deleteChecklist = async (checklistId) => {
    Alert.alert(
      'Delete Checklist',
      'Are you sure you want to delete this checklist?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            // Optimistic update
            setChecklists(prev => prev.filter(item => item.id !== checklistId));
            
            try {
              if (isOnline) {
                await api.delete(`/api/checklists/${checklistId}`);
              }
              // Update local storage
              const updated = checklists.filter(item => item.id !== checklistId);
              await AsyncStorage.setItem('checklists', JSON.stringify(updated));
            } catch (error) {
              console.log('Failed to sync delete:', error);
              setIsOnline(false);
              // Revert if error
              setChecklists(checklists);
              Alert.alert('Error', 'Failed to delete checklist');
            }
          }
        }
      ]
    );
  };

  // Render each checklist item
  const renderChecklistItem = ({ item }) => (
    <TouchableOpacity
      style={styles.checklistItem}
      onPress={() => navigateToDashboard(item)}
    >
      <View style={styles.checklistContent}>
        <Text style={styles.checklistTitle}>{item.title}</Text>
        <View style={styles.checklistMeta}>
          <Text style={styles.checklistDate}>
            {new Date(item.createdAt).toLocaleDateString()}
          </Text>
          <Text style={styles.taskCount}>
            {item.taskCount} {item.taskCount === 1 ? 'task' : 'tasks'}
          </Text>
        </View>
      </View>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => deleteChecklist(item.id)}
      >
        <Icon name="delete" size={20} color="#FF3B30" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Offline indicator */}
      {!isOnline && (
        <View style={styles.offlineBar}>
          <Text style={styles.offlineText}>Offline Mode - Changes will sync when online</Text>
        </View>
      )}
      
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Icon name="search" size={20} color="#888" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search checklists..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#888"
        />
        {searchQuery ? (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Icon name="close" size={20} color="#888" />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* New Checklist Input */}
      {showInput && (
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            placeholder="Enter checklist name"
            value={newChecklistName}
            onChangeText={setNewChecklistName}
            autoFocus={true}
            onSubmitEditing={createChecklist}
            placeholderTextColor="#888"
          />
          <TouchableOpacity 
            style={styles.createButton} 
            onPress={createChecklist}
            disabled={!newChecklistName.trim()}
          >
            <Text style={styles.createButtonText}>Create</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Checklists List */}
      <FlatList
        data={filteredChecklists}
        renderItem={renderChecklistItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            {searchQuery ? 'No matching checklists found' : 'No checklists yet'}
          </Text>
        }
        refreshing={refreshing}
        onRefresh={handleRefresh}
      />

      {/* Add Checklist Button */}
      {!showInput && (
        <TouchableOpacity 
          style={styles.addButton} 
          onPress={() => setShowInput(true)}
        >
          <Icon name="add" size={30} color="white" />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E8F5E9",
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: "#E8F5E9",
  },
  logoutButton: {
    marginRight: 15,
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  textInput: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    marginRight: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  createButton: {
    backgroundColor: '#007AFF',
    borderRadius: 10,
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  createButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  listContainer: {
    paddingBottom: 20,
  },
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  checklistContent: {
    flex: 1,
  },
  checklistTitle: {
    fontSize: 17,
    fontWeight: '500',
    color: '#000',
    marginBottom: 4,
  },
  checklistMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  checklistDate: {
    fontSize: 13,
    color: '#888',
  },
  taskCount: {
    fontSize: 13,
    color: '#007AFF',
  },
  deleteButton: {
    padding: 8,
  },
  emptyText: {
    textAlign: 'center',
    color: '#888',
    marginTop: 40,
    fontSize: 16,
  },
  addButton: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    backgroundColor: '#007AFF',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
});

export default ChecklistsScreen;