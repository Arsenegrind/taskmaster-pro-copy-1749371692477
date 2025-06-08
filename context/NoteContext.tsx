import React, { createContext, useContext, useState, useEffect } from 'react';

export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  color?: string;
  tags?: string[];
}

interface NoteContextType {
  notes: Note[];
  addNote: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateNote: (note: Note) => void;
  deleteNote: (id: string) => void;
  getNoteById: (id: string) => Note | undefined;
}

const NoteContext = createContext<NoteContextType | undefined>(undefined);

export const useNoteContext = () => {
  const context = useContext(NoteContext);
  if (!context) {
    throw new Error('useNoteContext must be used within a NoteProvider');
  }
  return context;
};

export const NoteProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notes, setNotes] = useState<Note[]>([]);

  // Load notes from storage when component mounts
  useEffect(() => {
    // In a real app, we would load from AsyncStorage here
    const sampleNotes: Note[] = [
      {
        id: '1',
        title: 'Meeting Notes',
        content: 'Discussed project timeline and resource allocation for Q3.',
        createdAt: new Date(2025, 5, 5),
        updatedAt: new Date(2025, 5, 5),
        color: '#3b82f6',
        tags: ['meeting', 'project']
      },
      {
        id: '2',
        title: 'Ideas for Mobile App',
        content: 'Add dark mode support\nImplement push notifications\nOptimize performance',
        createdAt: new Date(2025, 5, 3),
        updatedAt: new Date(2025, 5, 4),
        color: '#10b981',
        tags: ['ideas', 'development']
      }
    ];
    
    setNotes(sampleNotes);
  }, []);

  // Save notes to storage whenever they change
  useEffect(() => {
    // In a real app, we would save to AsyncStorage here
    // AsyncStorage.setItem('notes', JSON.stringify(notes));
  }, [notes]);

  const addNote = (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date();
    const newNote: Note = {
      ...note,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: now,
      updatedAt: now,
    };
    setNotes([...notes, newNote]);
  };

  const updateNote = (updatedNote: Note) => {
    const now = new Date();
    updatedNote.updatedAt = now;
    setNotes(notes.map(note => note.id === updatedNote.id ? updatedNote : note));
  };

  const deleteNote = (id: string) => {
    setNotes(notes.filter(note => note.id !== id));
  };

  const getNoteById = (id: string) => {
    return notes.find(note => note.id === id);
  };

  return (
    <NoteContext.Provider 
      value={{ 
        notes, 
        addNote, 
        updateNote, 
        deleteNote, 
        getNoteById
      }}
    >
      {children}
    </NoteContext.Provider>
  );
};