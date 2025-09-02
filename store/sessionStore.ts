import { create } from 'zustand';
import { Session, CreateSessionRequest, SessionDeleteResponse, UpdateSessionRequest } from '@/types';
import { apiClient } from '@/lib/api';
import { extractErrorMessage } from '@/lib/errorUtils';

interface SessionStore {
  // State
  sessions: Session[];
  activeSession: Session | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchSessions: () => Promise<void>;
  createSession: (sessionData: CreateSessionRequest) => Promise<Session | null>;
  updateSession: (sessionId: string, updateData: UpdateSessionRequest) => Promise<Session | null>;
  deleteSession: (sessionId: string) => Promise<SessionDeleteResponse | null>;
  setActiveSession: (session: Session | null) => void;
  clearError: () => void;
}

export const useSessionStore = create<SessionStore>((set, get) => ({
      // Initial state
      sessions: [],
      activeSession: null,
      isLoading: false,
      error: null,

      // Actions
      fetchSessions: async (): Promise<void> => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await apiClient.getSessions();
          
          if (response.success && response.data) {
            set({
              sessions: response.data,
              isLoading: false,
              error: null,
            });
          } else {
            set({
              isLoading: false,
              error: response.error ? extractErrorMessage(response.error) : 'Failed to fetch sessions',
            });
          }
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Failed to fetch sessions',
          });
        }
      },

      createSession: async (sessionData: CreateSessionRequest): Promise<Session | null> => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await apiClient.createSession(sessionData);
          
          console.log('📋 Create session response:', response);
          
          if (response.success && response.data) {
            // Convertir CreateSessionResponse a Session para el estado
            const newSession: Session = {
              sessionId: response.data.sessionId,
              name: response.data.name,
              createdAt: response.data.createdAt,
            };
            
            set((state) => ({
              sessions: [newSession, ...state.sessions],
              activeSession: newSession,
              isLoading: false,
              error: null,
            }));
            
            return newSession;
          } else {
            set({
              isLoading: false,
              error: extractErrorMessage(response.error) || 'Failed to create session',
            });
            return null;
          }
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Failed to create session',
          });
          return null;
        }
      },

      updateSession: async (sessionId: string, updateData: UpdateSessionRequest): Promise<Session | null> => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await apiClient.updateSession(sessionId, updateData);
          
          console.log('✏️ Update session response:', response);
          
          if (response.success && response.data) {
            const updatedSession = response.data;
            const state = get();
            
            // Update session in list
            const updatedSessions = state.sessions.map(s => 
              s.sessionId === sessionId ? updatedSession : s
            );
            
            // Update activeSession if it's the one being updated
            let newActiveSession = state.activeSession;
            if (state.activeSession?.sessionId === sessionId) {
              newActiveSession = updatedSession;
            }
            
            set({
              sessions: updatedSessions,
              activeSession: newActiveSession,
              isLoading: false,
              error: null,
            });
            
            return updatedSession;
          } else {
            set({
              isLoading: false,
              error: response.error ? extractErrorMessage(response.error) : 'Failed to update session',
            });
            return null;
          }
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Failed to update session',
          });
          return null;
        }
      },

      deleteSession: async (sessionId: string): Promise<SessionDeleteResponse | null> => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await apiClient.deleteSession(sessionId);
          
          console.log('🗑️ Delete session response:', response);
          
          if (response.success && response.data) {
            const state = get();
            
            // Remove session from list
            const updatedSessions = state.sessions.filter(s => s.sessionId !== sessionId);
            
            // If deleted session was active, set activeSession to null or first remaining session
            let newActiveSession = state.activeSession;
            if (state.activeSession?.sessionId === sessionId) {
              newActiveSession = updatedSessions.length > 0 ? updatedSessions[0] : null;
            }
            
            set({
              sessions: updatedSessions,
              activeSession: newActiveSession,
              isLoading: false,
              error: null,
            });
            
            return response.data;
          } else {
            set({
              isLoading: false,
              error: response.error ? extractErrorMessage(response.error) : 'Failed to delete session',
            });
            return null;
          }
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Failed to delete session',
          });
          return null;
        }
      },

      setActiveSession: (session: Session | null) => {
        set({ activeSession: session });
      },

      clearError: () => {
        set({ error: null });
      },
    }));