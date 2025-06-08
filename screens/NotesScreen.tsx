import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  Modal,
  TextInput,
  SafeAreaView,
  StatusBar
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import { useNoteContext, Note } from '../context/NoteContext';
import Card from '../components/Card';
import Button from '../components/Button';
import EmptyState from '../components/EmptyState';

export default function NotesScreen() {
  const { colors } = useTheme();
  const { notes, addNote, updateNote, deleteNote } = useNoteContext();
  const navigation = useNavigation();
  
  const [showAddNoteModal, setShowAddNoteModal] = useState(false);
  const [showNoteDetail, setShowNoteDetail] = useState(false);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  
  // Note form state
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [noteColor, setNoteColor] = useState('#3b82f6');
  const [noteTags, setNoteTags] = useState('');
  
  // Handle adding a new note
  const handleAddNote = () => {
    if (noteTitle.trim() === '') return;
    
    const tagsArray = noteTags
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag !== '');
    
    const newNote = {
      title: noteTitle,
      content: noteContent,
      color: noteColor,
      tags: tagsArray.length > 0 ? tagsArray : undefined,
    };
    
    addNote(newNote);
    resetForm();
    setShowAddNoteModal(false);
  };
  
  // Handle updating an existing note
  const handleUpdateNote = () => {
    if (!selectedNote || noteTitle.trim() === '') return;
    
    const tagsArray = noteTags
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag !== '');
    
    const updatedNote = {
      ...selectedNote,
      title: noteTitle,
      content: noteContent,
      color: noteColor,
      tags: tagsArray.length > 0 ? tagsArray : undefined,
      updatedAt: new Date()
    };
    
    updateNote(updatedNote);
    resetForm();
    setShowNoteDetail(false);
    setSelectedNote(null);
  };
  
  // Reset form fields
  const resetForm = () => {
    setNoteTitle('');
    setNoteContent('');
    setNoteColor('#3b82f6');
    setNoteTags('');
  };
  
  // Handle opening a note for editing
  const openNoteDetail = (note: Note) => {
    setSelectedNote(note);
    setNoteTitle(note.title);
    setNoteContent(note.content);
    setNoteColor(note.color || '#3b82f6');
    setNoteTags(note.tags ? note.tags.join(', ') : '');
    setShowNoteDetail(true);
  };
  
  // Handle deleting a note
  const handleDeleteNote = () => {
    if (selectedNote) {
      deleteNote(selectedNote.id);
      setShowNoteDetail(false);
      setSelectedNote(null);
    }
  };
  
  // Format date for display
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };
  
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
        <Text style={[styles.headerTitle, { color: colors.text }]}>Notes</Text>
        <TouchableOpacity style={styles.iconButton} onPress={() => {}}>
          <Ionicons name="search" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>
      
      {/* Notes List */}
      {notes.length === 0 ? (
        <EmptyState
          icon="document-text-outline"
          title="No notes yet"
          message="Tap the add button to create your first note."
        />
      ) : (
        <FlatList
          data={notes}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.notesList}
          numColumns={2}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={[
                styles.noteCard, 
                { 
                  backgroundColor: `${item.color || colors.primary}22`,
                  borderColor: item.color || colors.primary
                }
              ]}
              onPress={() => openNoteDetail(item)}
            >
              <Text style={[styles.noteTitle, { color: colors.text }]} numberOfLines={2}>
                {item.title}
              </Text>
              <Text style={[styles.noteContent, { color: `${colors.text}99` }]} numberOfLines={4}>
                {item.content}
              </Text>
              <View style={styles.noteFooter}>
                <Text style={[styles.noteDate, { color: `${colors.text}66` }]}>
                  {formatDate(item.updatedAt)}
                </Text>
                {item.tags && item.tags.length > 0 && (
                  <View style={styles.tagContainer}>
                    {item.tags.slice(0, 2).map((tag) => (
                      <View 
                        key={tag} 
                        style={[styles.tag, { backgroundColor: `${item.color || colors.primary}33` }]}
                      >
                        <Text style={[styles.tagText, { color: item.color || colors.primary }]}>
                          {tag}
                        </Text>
                      </View>
                    ))}
                    {item.tags.length > 2 && (
                      <Text style={[styles.moreTag, { color: `${colors.text}66` }]}>
                        +{item.tags.length - 2}
                      </Text>
                    )}
                  </View>
                )}
              </View>
            </TouchableOpacity>
          )}
        />
      )}
      
      {/* Add Note Button (FAB) */}
      <TouchableOpacity 
        style={[styles.addButton, { backgroundColor: colors.primary }]}
        onPress={() => setShowAddNoteModal(true)}
      >
        <Ionicons name="add" size={28} color="#FFFFFF" />
      </TouchableOpacity>
      
      {/* Add Note Modal */}
      <Modal
        visible={showAddNoteModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddNoteModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>New Note</Text>
              <TouchableOpacity onPress={() => setShowAddNoteModal(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalContent}>
              {/* Note Title Input */}
              <TextInput
                style={[
                  styles.titleInput, 
                  { 
                    color: colors.text,
                    borderBottomColor: colors.border
                  }
                ]}
                placeholder="Title"
                placeholderTextColor={`${colors.text}66`}
                value={noteTitle}
                onChangeText={setNoteTitle}
              />
              
              {/* Note Content Input */}
              <TextInput
                style={[
                  styles.contentInput, 
                  { color: colors.text }
                ]}
                placeholder="Start typing your note..."
                placeholderTextColor={`${colors.text}66`}
                value={noteContent}
                onChangeText={setNoteContent}
                multiline
                textAlignVertical="top"
              />
              
              {/* Tags Input */}
              <View style={styles.tagsContainer}>
                <Ionicons name="pricetag-outline" size={20} color={`${colors.text}99`} />
                <TextInput
                  style={[styles.tagsInput, { color: colors.text }]}
                  placeholder="Add tags separated by commas"
                  placeholderTextColor={`${colors.text}66`}
                  value={noteTags}
                  onChangeText={setNoteTags}
                />
              </View>
              
              {/* Color Selection */}
              <Text style={[styles.colorLabel, { color: colors.text }]}>Note Color</Text>
              <View style={styles.colorContainer}>
                {colorOptions.map((color) => (
                  <TouchableOpacity
                    key={color}
                    style={[
                      styles.colorOption,
                      { backgroundColor: color },
                      noteColor === color && styles.selectedColorOption
                    ]}
                    onPress={() => setNoteColor(color)}
                  >
                    {noteColor === color && (
                      <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            
            <View style={styles.modalFooter}>
              <Button 
                title="Cancel" 
                onPress={() => setShowAddNoteModal(false)} 
                type="outline"
                style={styles.footerButton}
              />
              <Button 
                title="Save Note" 
                onPress={handleAddNote}
                disabled={noteTitle.trim() === ''}
                style={styles.footerButton}
              />
            </View>
          </View>
        </View>
      </Modal>
      
      {/* Note Detail Modal */}
      <Modal
        visible={showNoteDetail}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          setShowNoteDetail(false);
          setSelectedNote(null);
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
            <View style={styles.modalHeader}>
              <TouchableOpacity 
                style={styles.deleteButton}
                onPress={handleDeleteNote}
              >
                <Ionicons name="trash-outline" size={24} color="#ef4444" />
              </TouchableOpacity>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Edit Note</Text>
              <TouchableOpacity onPress={() => {
                setShowNoteDetail(false);
                setSelectedNote(null);
              }}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalContent}>
              {/* Note Title Input */}
              <TextInput
                style={[
                  styles.titleInput, 
                  { 
                    color: colors.text,
                    borderBottomColor: colors.border
                  }
                ]}
                placeholder="Title"
                placeholderTextColor={`${colors.text}66`}
                value={noteTitle}
                onChangeText={setNoteTitle}
              />
              
              {/* Note Content Input */}
              <TextInput
                style={[
                  styles.contentInput, 
                  { color: colors.text }
                ]}
                placeholder="Start typing your note..."
                placeholderTextColor={`${colors.text}66`}
                value={noteContent}
                onChangeText={setNoteContent}
                multiline
                textAlignVertical="top"
              />
              
              {/* Tags Input */}
              <View style={styles.tagsContainer}>
                <Ionicons name="pricetag-outline" size={20} color={`${colors.text}99`} />
                <TextInput
                  style={[styles.tagsInput, { color: colors.text }]}
                  placeholder="Add tags separated by commas"
                  placeholderTextColor={`${colors.text}66`}
                  value={noteTags}
                  onChangeText={setNoteTags}
                />
              </View>
              
              {/* Color Selection */}
              <Text style={[styles.colorLabel, { color: colors.text }]}>Note Color</Text>
              <View style={styles.colorContainer}>
                {colorOptions.map((color) => (
                  <TouchableOpacity
                    key={color}
                    style={[
                      styles.colorOption,
                      { backgroundColor: color },
                      noteColor === color && styles.selectedColorOption
                    ]}
                    onPress={() => setNoteColor(color)}
                  >
                    {noteColor === color && (
                      <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            
            <View style={styles.modalFooter}>
              <Button 
                title="Cancel" 
                onPress={() => {
                  setShowNoteDetail(false);
                  setSelectedNote(null);
                }} 
                type="outline"
                style={styles.footerButton}
              />
              <Button 
                title="Update Note" 
                onPress={handleUpdateNote}
                disabled={noteTitle.trim() === ''}
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
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  iconButton: {
    padding: 8,
  },
  notesList: {
    padding: 8,
  },
  noteCard: {
    flex: 1,
    margin: 8,
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 3,
    minHeight: 150,
  },
  noteTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  noteContent: {
    fontSize: 14,
    marginBottom: 12,
    flex: 1,
  },
  noteFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  noteDate: {
    fontSize: 12,
  },
  tagContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 4,
  },
  tagText: {
    fontSize: 10,
    fontWeight: '500',
  },
  moreTag: {
    fontSize: 10,
    marginLeft: 4,
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
    height: '90%',
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
  deleteButton: {
    padding: 8,
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  titleInput: {
    fontSize: 24,
    fontWeight: 'bold',
    paddingVertical: 12,
    marginBottom: 16,
    borderBottomWidth: 1,
  },
  contentInput: {
    flex: 1,
    fontSize: 16,
    paddingTop: 8,
    textAlignVertical: 'top',
  },
  tagsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 16,
  },
  tagsInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
  },
  colorLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  colorContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  colorOption: {
    width: 36,
    height: 36,
    borderRadius: 18,
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