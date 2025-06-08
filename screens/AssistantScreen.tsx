import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  TextInput,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  Keyboard
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useAssistantContext, Message } from '../context/AssistantContext';
import Card from '../components/Card';
import EmptyState from '../components/EmptyState';

export default function AssistantScreen() {
  const { colors } = useTheme();
  const { 
    conversations, 
    currentConversation, 
    isLoading, 
    sendMessage, 
    createNewConversation,
    selectConversation,
    deleteConversation
  } = useAssistantContext();
  
  const [showSidebar, setShowSidebar] = useState(false);
  const [messageInput, setMessageInput] = useState('');
  const flatListRef = useRef<FlatList>(null);
  
  // Create a new conversation if there is none
  useEffect(() => {
    if (conversations.length === 0) {
      createNewConversation();
    }
  }, []);
  
  // Scroll to bottom when new message arrives
  useEffect(() => {
    if (currentConversation && currentConversation.messages.length > 0 && flatListRef.current) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [currentConversation?.messages]);
  
  // Handle sending a message
  const handleSendMessage = async () => {
    if (messageInput.trim() === '' || isLoading) return;
    
    const message = messageInput.trim();
    setMessageInput('');
    Keyboard.dismiss();
    
    await sendMessage(message);
  };
  
  // Format time for display
  const formatMessageTime = (date: Date) => {
    return new Date(date).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit'
    });
  };
  
  // Format date for conversation list
  const formatConversationDate = (date: Date) => {
    const now = new Date();
    const messageDate = new Date(date);
    
    if (
      messageDate.getDate() === now.getDate() &&
      messageDate.getMonth() === now.getMonth() &&
      messageDate.getFullYear() === now.getFullYear()
    ) {
      return 'Today';
    }
    
    if (
      messageDate.getDate() === now.getDate() - 1 &&
      messageDate.getMonth() === now.getMonth() &&
      messageDate.getFullYear() === now.getFullYear()
    ) {
      return 'Yesterday';
    }
    
    return messageDate.toLocaleDateString([], {
      month: 'short',
      day: 'numeric'
    });
  };
  
  // Render each message
  const renderMessage = ({ item }: { item: Message }) => {
    const isUser = item.role === 'user';
    
    return (
      <View style={[
        styles.messageContainer,
        isUser ? styles.userMessageContainer : styles.assistantMessageContainer
      ]}>
        <View style={[
          styles.messageBubble,
          isUser 
            ? [styles.userMessageBubble, { backgroundColor: colors.primary }]
            : [styles.assistantMessageBubble, { backgroundColor: colors.card, borderColor: colors.border }]
        ]}>
          <Text style={[
            styles.messageText,
            { color: isUser ? '#FFFFFF' : colors.text }
          ]}>
            {item.content}
          </Text>
          <Text style={[
            styles.messageTime,
            { color: isUser ? 'rgba(255, 255, 255, 0.7)' : `${colors.text}66` }
          ]}>
            {formatMessageTime(item.timestamp)}
          </Text>
        </View>
      </View>
    );
  };
  
  // Render conversation list item
  const renderConversationItem = ({ item }) => {
    const isSelected = currentConversation && item.id === currentConversation.id;
    
    return (
      <TouchableOpacity
        style={[
          styles.conversationItem,
          isSelected && { backgroundColor: `${colors.primary}33` },
        ]}
        onPress={() => {
          selectConversation(item.id);
          setShowSidebar(false);
        }}
      >
        <View style={styles.conversationIcon}>
          <Ionicons 
            name="chatbubble-ellipses" 
            size={20} 
            color={isSelected ? colors.primary : `${colors.text}99`} 
          />
        </View>
        <View style={styles.conversationDetails}>
          <Text 
            style={[
              styles.conversationTitle, 
              { color: colors.text },
              isSelected && { fontWeight: 'bold', color: colors.primary }
            ]}
            numberOfLines={1}
          >
            {item.title}
          </Text>
          <Text 
            style={[styles.conversationDate, { color: `${colors.text}66` }]}
            numberOfLines={1}
          >
            {formatConversationDate(item.updatedAt)}
          </Text>
        </View>
        {isSelected && (
          <TouchableOpacity 
            style={styles.deleteConversationButton}
            onPress={() => deleteConversation(item.id)}
          >
            <Ionicons name="trash-outline" size={16} color="#ef4444" />
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={colors.background === '#121212' ? 'light-content' : 'dark-content'} />
      
      {/* Sidebar for conversation history */}
      {showSidebar && (
        <View style={[styles.sidebar, { backgroundColor: colors.card }]}>
          <View style={styles.sidebarHeader}>
            <Text style={[styles.sidebarTitle, { color: colors.text }]}>Conversations</Text>
            <TouchableOpacity onPress={() => setShowSidebar(false)}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity 
            style={[styles.newConversationButton, { backgroundColor: colors.primary }]}
            onPress={() => {
              createNewConversation();
              setShowSidebar(false);
            }}
          >
            <Ionicons name="add" size={20} color="#FFFFFF" />
            <Text style={styles.newConversationText}>New Conversation</Text>
          </TouchableOpacity>
          
          <FlatList
            data={conversations}
            keyExtractor={(item) => item.id}
            renderItem={renderConversationItem}
            contentContainerStyle={styles.conversationList}
          />
        </View>
      )}
      
      <View style={[styles.chatContainer, showSidebar && styles.chatContainerWithSidebar]}>
        {/* Chat Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.iconButton} 
            onPress={() => setShowSidebar(!showSidebar)}
          >
            <Ionicons name="menu" size={24} color={colors.text} />
          </TouchableOpacity>
          
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            AI Assistant
          </Text>
          
          <TouchableOpacity 
            style={styles.iconButton}
            onPress={createNewConversation}
          >
            <Ionicons name="add" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
        
        {/* Messages */}
        {currentConversation ? (
          <FlatList
            ref={flatListRef}
            data={currentConversation.messages}
            keyExtractor={(item) => item.id}
            renderItem={renderMessage}
            contentContainerStyle={styles.messagesList}
          />
        ) : (
          <EmptyState
            icon="chatbubble-outline"
            title="No Conversation Selected"
            message="Select or create a new conversation to get started."
          />
        )}
        
        {/* Input Area */}
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
          style={[
            styles.inputContainer,
            { borderTopColor: colors.border }
          ]}
        >
          <TextInput
            style={[
              styles.input,
              { 
                backgroundColor: colors.card,
                color: colors.text,
                borderColor: colors.border
              }
            ]}
            placeholder="Ask me anything..."
            placeholderTextColor={`${colors.text}66`}
            value={messageInput}
            onChangeText={setMessageInput}
            multiline
            returnKeyType="send"
            blurOnSubmit
            onSubmitEditing={handleSendMessage}
          />
          
          <TouchableOpacity
            style={[
              styles.sendButton,
              { backgroundColor: colors.primary },
              (!messageInput.trim() || isLoading) && { opacity: 0.5 }
            ]}
            onPress={handleSendMessage}
            disabled={!messageInput.trim() || isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Ionicons name="send" size={20} color="#FFFFFF" />
            )}
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
  },
  sidebar: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: 280,
    zIndex: 10,
    borderRightWidth: 1,
    borderRightColor: '#DDDDDD',
  },
  sidebarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#DDDDDD',
  },
  sidebarTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  newConversationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 16,
    padding: 10,
    borderRadius: 8,
  },
  newConversationText: {
    color: '#FFFFFF',
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '500',
  },
  conversationList: {
    paddingHorizontal: 8,
  },
  conversationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginVertical: 4,
  },
  conversationIcon: {
    marginRight: 12,
  },
  conversationDetails: {
    flex: 1,
  },
  conversationTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  conversationDate: {
    fontSize: 12,
  },
  deleteConversationButton: {
    padding: 8,
  },
  chatContainer: {
    flex: 1,
  },
  chatContainerWithSidebar: {
    opacity: 0.3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  iconButton: {
    padding: 8,
  },
  messagesList: {
    padding: 16,
  },
  messageContainer: {
    marginBottom: 16,
    flexDirection: 'row',
  },
  userMessageContainer: {
    justifyContent: 'flex-end',
  },
  assistantMessageContainer: {
    justifyContent: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    borderRadius: 16,
    padding: 12,
    paddingBottom: 8,
  },
  userMessageBubble: {
    borderBottomRightRadius: 4,
  },
  assistantMessageBubble: {
    borderBottomLeftRadius: 4,
    borderWidth: 1,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  messageTime: {
    fontSize: 10,
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderTopWidth: 1,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 16,
    maxHeight: 120,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
});