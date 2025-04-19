import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  FlatList, 
  TextInput,
  Keyboard,
  Alert
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import api from '../services/api';

const ChecklistsScreen = () => {
  const [checklists, setChecklists] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [newChecklistName, setNewChecklistName] = useState('');
  const [showInput, setShowInput] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const navigation = useNavigation();
  
  // Logout function with confirmation dialog
  const handleLogout = () => {
    console.log('Simple logout called');
    navigation.navigate('Login'); // Basic navigation first
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

  const navigateToDashboard = (checklist) => {
    navigation.navigate('Dashboard', { 
      checklistId: checklist.id, 
      checklistTitle: checklist.title 
    });
  };
  // Load checklists from storage
  useEffect(() => {
    const loadChecklists = async () => {
      try {
        // Try to load from API first
        const response = await api.get('/api/checklists');
        setChecklists(response.data.checklists);
        // Save the fresh data to local storage
        await AsyncStorage.setItem('checklists', JSON.stringify(response.data.checklists));
        setIsOnline(true);
      } catch (error) {
        console.log('API failed, falling back to local storage');
        setIsOnline(false);
        // Fallback to local storage
        try {
          const localChecklists = await AsyncStorage.getItem('checklists');
          if (localChecklists) {
            setChecklists(JSON.parse(localChecklists));
          }
        } catch (localError) {
          console.error('Failed to load local checklists:', localError);
          Alert.alert('Error', 'Failed to load checklists');
        }
      }
    };
    loadChecklists();
  }, []);

  // Filter checklists based on search query
  const filteredChecklists = checklists.filter(checklist =>
    checklist.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Create new checklist
  const createChecklist = async () => {
    if (!newChecklistName.trim()) return;
    
    const newChecklist = {
      id: Date.now().toString(),
      title: newChecklistName.trim(),
      createdAt: new Date().toISOString()
    };

    // Optimistic update
    const updatedChecklists = [newChecklist, ...checklists];
    setChecklists(updatedChecklists);
    
    try {
      if (isOnline) {
        // Try API first
        const response = await api.post('/api/checklists', {
          title: newChecklistName.trim()
        });
        // Update with the server-generated ID if needed
        setChecklists([response.data.checklist, ...checklists]);
      }
      // Save to local storage regardless of online status
      await AsyncStorage.setItem('checklists', JSON.stringify(updatedChecklists));
    } catch (error) {
      console.log('Failed to sync with server, keeping local changes');
      setIsOnline(false);
    }
    
    setNewChecklistName('');
    setShowInput(false);
    Keyboard.dismiss();
  };

  // Delete checklist
  const deleteChecklist = async (checklistId) => {
    // Optimistic update
    const updatedChecklists = checklists.filter(item => item.id !== checklistId);
    setChecklists(updatedChecklists);
    
    try {
      if (isOnline) {
        await api.delete(`/api/checklists/${checklistId}`);
      }
      // Update local storage
      await AsyncStorage.setItem('checklists', JSON.stringify(updatedChecklists));
    } catch (error) {
      console.log('Failed to sync delete with server, keeping local changes');
      setIsOnline(false);
    }
  };

  // Render each checklist item
  const renderChecklistItem = ({ item }) => (
    <TouchableOpacity
      style={styles.checklistItem}
      onPress={() => navigateToDashboard(item)}
    >
      <View style={styles.checklistContent}>
        <Text style={styles.checklistTitle}>{item.title}</Text>
        <Text style={styles.checklistDate}>
          Created: {new Date(item.createdAt).toLocaleDateString()}
        </Text>
      </View>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => deleteChecklist(item.id)}
      >
        <Icon name="delete" size={20} color="#FF3B30" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

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
  // Add logout button style
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
  checklistDate: {
    fontSize: 13,
    color: '#888',
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