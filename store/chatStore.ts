import { create } from 'zustand';
import { Message, ChatRequest, Source, SessionMessagesResponse } from '@/types';
import { apiClient } from '@/lib/api';
import { extractErrorMessage } from '@/lib/errorUtils';

interface ChatStore {
  // State
  messages: Record<string, Message[]>; // sessionId -> messages
  isLoading: boolean;
  isTyping: boolean; // For showing "thinking..." state
  error: string | null;

  // Actions
  sendMessage: (sessionId: string, content: string) => Promise<boolean>;
  fetchSessionMessages: (sessionId: string) => Promise<void>;
  clearError: () => void;
  setTyping: (isTyping: boolean) => void;
  addMessage: (sessionId: string, message: Message) => void;
}

export const useChatStore = create<ChatStore>((set, get) => ({
  // Initial state
  messages: {},
  isLoading: false,
  isTyping: false,
  error: null,

  // Tu backend no tiene endpoint para obtener mensajes existentes

  sendMessage: async (sessionId: string, content: string): Promise<boolean> => {
    set({ isTyping: true, error: null });
    
    try {
      // Add user message immediately to UI
      const userMessage: Message = {
        id: `user-${Date.now()}`,
        content,
        role: 'user',
        sessionId: sessionId,
        createdAt: new Date().toISOString(),
      };

      set((state) => ({
        messages: {
          ...state.messages,
          [sessionId]: [...(state.messages[sessionId] || []), userMessage],
        },
      }));

      const chatRequest: ChatRequest = {
        sessionId: sessionId,
        message: content,
      };

      console.log('💬 Sending chat message:', chatRequest);

      const response = await apiClient.sendMessage(chatRequest);
      
      console.log('💬 Chat response:', response);
      
      if (response.success && response.data) {
        const { answer, sources } = response.data;
        
        // Create assistant message
        const assistantMessage: Message = {
          id: `assistant-${Date.now()}`,
          content: answer,
          role: 'assistant',
          sessionId: sessionId,
          sources: sources,
          createdAt: new Date().toISOString(),
        };
        
        // Add assistant message
        set((state) => ({
          messages: {
            ...state.messages,
            [sessionId]: [...(state.messages[sessionId] || []), assistantMessage],
          },
          isTyping: false,
          error: null,
        }));
        
        return true;
      } else {
        // Remove the user message on error
        set((state) => ({
          messages: {
            ...state.messages,
            [sessionId]: (state.messages[sessionId] || []).slice(0, -1),
          },
          isTyping: false,
          error: response.error ? extractErrorMessage(response.error) : 'Failed to send message',
        }));
        return false;
      }
    } catch (error) {
      // Remove the user message on error
      set((state) => ({
        messages: {
          ...state.messages,
          [sessionId]: (state.messages[sessionId] || []).slice(0, -1),
        },
        isTyping: false,
        error: error instanceof Error ? error.message : 'Failed to send message',
      }));
      return false;
    }
  },

  fetchSessionMessages: async (sessionId: string): Promise<void> => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await apiClient.getSessionMessages(sessionId);
      
      console.log('💬 Fetch session messages response:', response);
      
      if (response.success && response.data) {
        const serverMessages = response.data.messages;
        const state = get();
        const existingMessages = state.messages[sessionId] || [];
        
        // Convertir mensajes del servidor al formato interno
        const convertedServerMessages: Message[] = serverMessages.map(msg => ({
          id: msg.messageId, // Usar messageId del servidor como id interno
          messageId: msg.messageId,
          content: msg.content,
          role: msg.role,
          sessionId: sessionId,
          createdAt: msg.createdAt,
          // Los mensajes del servidor de assistant no tienen sources por ahora
          sources: msg.role === 'assistant' ? [] : undefined,
        }));
        
        // Combinar mensajes: mantener mensajes locales nuevos (sin messageId) + mensajes del servidor
        const localNewMessages = existingMessages.filter(msg => !msg.messageId);
        
        // Evitar duplicados: no agregar mensajes del servidor que ya existen localmente
        const serverMessageIds = new Set(convertedServerMessages.map(msg => msg.messageId));
        const localMessagesNotFromServer = existingMessages.filter(msg => 
          !msg.messageId || !serverMessageIds.has(msg.messageId)
        );
        
        // Combinar y ordenar por fecha
        const combinedMessages = [...convertedServerMessages, ...localMessagesNotFromServer]
          .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        
        set({
          messages: {
            ...state.messages,
            [sessionId]: combinedMessages,
          },
          isLoading: false,
          error: null,
        });
      } else {
        set({
          isLoading: false,
          error: response.error ? extractErrorMessage(response.error) : 'Failed to fetch messages',
        });
      }
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch messages',
      });
    }
  },

  addMessage: (sessionId: string, message: Message) => {
    set((state) => ({
      messages: {
        ...state.messages,
        [sessionId]: [...(state.messages[sessionId] || []), message],
      },
    }));
  },

  clearError: () => {
    set({ error: null });
  },

  setTyping: (isTyping: boolean) => {
    set({ isTyping });
  },
}));