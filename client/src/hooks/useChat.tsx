import { useState, useCallback } from 'react';

export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

export interface ChatHistory {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
}

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatHistory, setChatHistory] = useState<ChatHistory[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const addMessage = useCallback((content: string, role: 'user' | 'assistant') => {
    const newMessage: Message = {
      id: Date.now().toString(),
      content,
      role,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newMessage]);
    return newMessage;
  }, []);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return;

    // Add user message
    addMessage(content, 'user');
    setIsLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const responses = [
        "I understand your question. Let me help you with that.",
        "That's an interesting point. Here's what I think...",
        "I'd be happy to assist you with this topic.",
        "Let me provide you with some information about that.",
        "Great question! Here's my perspective on this matter."
      ];
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      addMessage(randomResponse, 'assistant');
      setIsLoading(false);
    }, 1000 + Math.random() * 2000);
  }, [addMessage]);

  const startNewChat = useCallback(() => {
    if (messages.length > 0) {
      // Save current chat to history
      const newChat: ChatHistory = {
        id: Date.now().toString(),
        title: messages[0]?.content.slice(0, 50) + '...' || 'New Chat',
        messages: [...messages],
        createdAt: new Date()
      };
      setChatHistory(prev => [newChat, ...prev]);
    }
    setMessages([]);
    setCurrentChatId(null);
  }, [messages]);

  const loadChat = useCallback((chatId: string) => {
    const chat = chatHistory.find(c => c.id === chatId);
    if (chat) {
      setMessages(chat.messages);
      setCurrentChatId(chatId);
    }
  }, [chatHistory]);

  return {
    messages,
    chatHistory,
    currentChatId,
    isLoading,
    sendMessage,
    startNewChat,
    loadChat
  };
}