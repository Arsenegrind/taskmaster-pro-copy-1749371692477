import React, { createContext, useContext, useState, useEffect } from 'react';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

interface AssistantContextType {
  conversations: Conversation[];
  currentConversation: Conversation | null;
  isLoading: boolean;
  sendMessage: (content: string) => Promise<void>;
  createNewConversation: () => void;
  selectConversation: (id: string) => void;
  deleteConversation: (id: string) => void;
}

const AssistantContext = createContext<AssistantContextType | undefined>(undefined);

export const useAssistantContext = () => {
  const context = useContext(AssistantContext);
  if (!context) {
    throw new Error('useAssistantContext must be used within an AssistantProvider');
  }
  return context;
};

export const AssistantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Load conversations from storage when component mounts
  useEffect(() => {
    // In a real app, we would load from AsyncStorage here
    const sampleConversation: Conversation = {
      id: '1',
      title: 'Getting Started',
      messages: [
        {
          id: '1',
          role: 'assistant',
          content: 'Hi there! I\'m your productivity assistant. How can I help you today?',
          timestamp: new Date(2025, 5, 6, 9, 30)
        }
      ],
      createdAt: new Date(2025, 5, 6, 9, 30),
      updatedAt: new Date(2025, 5, 6, 9, 30)
    };
    
    setConversations([sampleConversation]);
    setCurrentConversation(sampleConversation);
  }, []);

  // Save conversations to storage whenever they change
  useEffect(() => {
    // In a real app, we would save to AsyncStorage here
    // AsyncStorage.setItem('conversations', JSON.stringify(conversations));
  }, [conversations]);

  const sendMessage = async (content: string) => {
    if (!currentConversation) return;

    // Create a new user message
    const userMessage: Message = {
      id: Math.random().toString(36).substr(2, 9),
      role: 'user',
      content,
      timestamp: new Date()
    };

    // Update conversation with user message
    const updatedConversation = {
      ...currentConversation,
      messages: [...currentConversation.messages, userMessage],
      updatedAt: new Date()
    };

    setCurrentConversation(updatedConversation);
    setConversations(conversations.map(c => 
      c.id === currentConversation.id ? updatedConversation : c
    ));

    // Start AI response
    setIsLoading(true);

    try {
      // Make API call to AI service
      const response = await fetch('https://api.a0.dev/ai/llm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages: updatedConversation.messages.map(m => ({
            role: m.role,
            content: m.content
          })) 
        })
      });

      const data = await response.json();
      const assistantResponse = data.content || "I'm sorry, I couldn't process your request.";

      // Create assistant message
      const assistantMessage: Message = {
        id: Math.random().toString(36).substr(2, 9),
        role: 'assistant',
        content: assistantResponse,
        timestamp: new Date()
      };

      // Update conversation with AI response
      const finalConversation = {
        ...updatedConversation,
        messages: [...updatedConversation.messages, assistantMessage],
        updatedAt: new Date(),
        // Update title if it's the first user message
        title: updatedConversation.messages.length <= 2 
          ? content.slice(0, 30) + (content.length > 30 ? '...' : '') 
          : updatedConversation.title
      };

      setCurrentConversation(finalConversation);
      setConversations(conversations.map(c => 
        c.id === currentConversation.id ? finalConversation : c
      ));

    } catch (error) {
      console.error('Error sending message to AI', error);
      
      // Add error message
      const errorMessage: Message = {
        id: Math.random().toString(36).substr(2, 9),
        role: 'assistant',
        content: 'Sorry, I encountered an error while processing your request. Please try again.',
        timestamp: new Date()
      };

      const errorConversation = {
        ...updatedConversation,
        messages: [...updatedConversation.messages, errorMessage],
        updatedAt: new Date()
      };

      setCurrentConversation(errorConversation);
      setConversations(conversations.map(c => 
        c.id === currentConversation.id ? errorConversation : c
      ));
    } finally {
      setIsLoading(false);
    }
  };

  const createNewConversation = () => {
    const newConversation: Conversation = {
      id: Math.random().toString(36).substr(2, 9),
      title: 'New Conversation',
      messages: [
        {
          id: Math.random().toString(36).substr(2, 9),
          role: 'assistant',
          content: 'Hi there! I\'m your productivity assistant. How can I help you today?',
          timestamp: new Date()
        }
      ],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    setConversations([...conversations, newConversation]);
    setCurrentConversation(newConversation);
  };

  const selectConversation = (id: string) => {
    const conversation = conversations.find(c => c.id === id);
    if (conversation) {
      setCurrentConversation(conversation);
    }
  };

  const deleteConversation = (id: string) => {
    setConversations(conversations.filter(c => c.id !== id));
    if (currentConversation?.id === id) {
      setCurrentConversation(conversations.length > 1 ? 
        conversations.find(c => c.id !== id) || null : 
        null
      );
    }
  };

  return (
    <AssistantContext.Provider
      value={{
        conversations,
        currentConversation,
        isLoading,
        sendMessage,
        createNewConversation,
        selectConversation,
        deleteConversation
      }}
    >
      {children}
    </AssistantContext.Provider>
  );
};