import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Send, BookMarked, Building2 } from 'lucide-react-native';
import { Message } from '../types/chat';
import { useTheme } from './ThemeProvider';
import { generateFreeChatResponse } from '../utils/gemini';
import { v4 as uuidv4 } from 'uuid';
import { MyPromptsModal } from './MyPromptsModal';
import { searchCompanyInfo } from '../utils/companyInfo';

function useChatInitialization() {
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    const systemMessage: Message = {
      id: 'system-1',
      text: 'こんにちは！何でもお気軽にお聞きください。',
      isUser: false,
      timestamp: Date.now(),
    };
    setMessages([systemMessage]);

    return () => setMessages([]);
  }, []);

  return { messages, setMessages };
}

function useScrollToBottom(messages: Message[], scrollViewRef: React.RefObject<ScrollView>) {
  useEffect(() => {
    if (!Array.isArray(messages) || messages.length === 0) return;

    const scrollTimeout = setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);

    return () => clearTimeout(scrollTimeout);
  }, [messages, scrollViewRef]);
}

export default function ChatScreen({ scrollViewRef: externalScrollViewRef }: { scrollViewRef?: React.RefObject<ScrollView> }) {
  const { isDark } = useTheme();
  const internalScrollViewRef = useRef<ScrollView>(null);
  const scrollViewRef = externalScrollViewRef || internalScrollViewRef;
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isPromptsModalVisible, setIsPromptsModalVisible] = useState(false);
  const [hasCompanyContext, setHasCompanyContext] = useState(false);
  const { messages, setMessages } = useChatInitialization();

  useScrollToBottom(messages, scrollViewRef);

  const handleSendMessage = useCallback(async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage: Message = {
      id: uuidv4(),
      text: inputText.trim(),
      isUser: true,
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);
    setHasCompanyContext(false);

    try {
      const companyInfo = await searchCompanyInfo(inputText.trim());
      setHasCompanyContext(companyInfo.length > 0);

      const aiResponse = await generateFreeChatResponse([...messages, userMessage]);
      
      const aiMessage: Message = {
        id: uuidv4(),
        text: aiResponse,
        isUser: false,
        timestamp: Date.now(),
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error generating response:', error);
      
      const errorMessage: Message = {
        id: uuidv4(),
        text: error instanceof Error 
          ? `エラーが発生しました: ${error.message}` 
          : 'エラーが発生しました。もう一度お試しください。',
        isUser: false,
        timestamp: Date.now(),
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [inputText, isLoading, messages, setMessages]);

  const handlePromptSelect = useCallback((promptContent: string) => {
    setInputText(promptContent);
    setIsPromptsModalVisible(false);
  }, []);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <ScrollView
        ref={scrollViewRef}
        style={[
          styles.messagesContainer,
          { backgroundColor: isDark ? '#000000' : '#F2F2F7' }
        ]}
        contentContainerStyle={styles.messagesContent}
      >
        {messages.map((message, index) => (
          <View key={message.id}>
            <View
              style={[
                styles.messageBubble,
                message.isUser
                  ? [styles.userBubble, { backgroundColor: isDark ? '#0A84FF' : '#007AFF' }]
                  : [styles.aiBubble, { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' }],
              ]}
            >
              <Text
                style={[
                  styles.messageText,
                  message.isUser
                    ? { color: '#FFFFFF' }
                    : { color: isDark ? '#FFFFFF' : '#000000' },
                ]}
              >
                {message.text}
              </Text>
            </View>
            {!message.isUser && index === messages.length - 1 && hasCompanyContext && (
              <View style={[styles.contextIndicator, { backgroundColor: isDark ? '#2C2C2E' : '#F2F2F7' }]}>
                <Building2 size={12} color={isDark ? '#0A84FF' : '#007AFF'} />
                <Text style={[styles.contextText, { color: isDark ? '#0A84FF' : '#007AFF' }]}>
                  社内情報を参考にしています
                </Text>
              </View>
            )}
          </View>
        ))}
        {isLoading && (
          <View style={[
            styles.messageBubble,
            styles.aiBubble,
            { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' }
          ]}>
            <ActivityIndicator size="small" color={isDark ? '#FFFFFF' : '#007AFF'} />
          </View>
        )}
      </ScrollView>

      <View style={[
        styles.inputContainer,
        { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' }
      ]}>
        <TouchableOpacity
          style={styles.promptButton}
          onPress={() => setIsPromptsModalVisible(true)}
        >
          <BookMarked size={24} color={isDark ? '#0A84FF' : '#007AFF'} />
        </TouchableOpacity>
        
        <TextInput
          style={[
            styles.input,
            { 
              backgroundColor: isDark ? '#2C2C2E' : '#F2F2F7',
              color: isDark ? '#FFFFFF' : '#000000',
            }
          ]}
          value={inputText}
          onChangeText={setInputText}
          placeholder="メッセージを入力..."
          placeholderTextColor={isDark ? '#8E8E93' : '#8E8E93'}
          multiline
          returnKeyType="send"
          onSubmitEditing={handleSendMessage}
        />
        
        <TouchableOpacity
          style={[
            styles.sendButton,
            { opacity: inputText.trim() ? 1 : 0.5 }
          ]}
          onPress={handleSendMessage}
          disabled={!inputText.trim() || isLoading}
        >
          <Send size={24} color={isDark ? '#0A84FF' : '#007AFF'} />
        </TouchableOpacity>
      </View>

      {isPromptsModalVisible && (
        <MyPromptsModal
          visible={isPromptsModalVisible}
          onClose={() => setIsPromptsModalVisible(false)}
          onSelect={handlePromptSelect}
        />
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 20,
  },
  messageBubble: {
    borderRadius: 18,
    padding: 12,
    marginBottom: 8,
    maxWidth: '80%',
  },
  userBubble: {
    alignSelf: 'flex-end',
  },
  aiBubble: {
    alignSelf: 'flex-start',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderTopWidth: 1,
    borderTopColor: '#C6C6C8',
  },
  promptButton: {
    padding: 8,
  },
  input: {
    flex: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 8,
    fontSize: 16,
    maxHeight: 120,
  },
  sendButton: {
    padding: 8,
  },
  contextIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 4,
    marginBottom: 8,
  },
  contextText: {
    fontSize: 12,
    marginLeft: 4,
    fontWeight: '500',
  },
});
