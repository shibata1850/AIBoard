import AsyncStorage from '@react-native-async-storage/async-storage';
import { ChatContext, ChatHistory } from '@/types/chat';

const CHAT_HISTORY_KEY = 'chat_history';
const MAX_CONTEXTS = 10;

export async function saveContext(context: ChatContext): Promise<void> {
  try {
    const history = await getChatHistory();
    
    const existingIndex = history.contexts.findIndex(c => c.contextId === context.contextId);
    if (existingIndex !== -1) {
      history.contexts[existingIndex] = context;
    } else {
      history.contexts.unshift(context);
      if (history.contexts.length > MAX_CONTEXTS) {
        history.contexts = history.contexts.slice(0, MAX_CONTEXTS);
      }
    }

    await AsyncStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(history));
  } catch (error) {
    console.error('Error saving chat context:', error);
  }
}

export async function getChatHistory(): Promise<ChatHistory> {
  try {
    const historyString = await AsyncStorage.getItem(CHAT_HISTORY_KEY);
    if (historyString) {
      return JSON.parse(historyString);
    }
    return { contexts: [] };
  } catch (error) {
    console.error('Error getting chat history:', error);
    return { contexts: [] };
  }
}

export async function getContext(contextId: string): Promise<ChatContext | null> {
  try {
    const history = await getChatHistory();
    return history.contexts.find(c => c.contextId === contextId) || null;
  } catch (error) {
    console.error('Error getting chat context:', error);
    return null;
  }
}

export async function clearChatHistory(): Promise<void> {
  try {
    await AsyncStorage.removeItem(CHAT_HISTORY_KEY);
  } catch (error) {
    console.error('Error clearing chat history:', error);
  }
}
