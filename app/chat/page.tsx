'use client';

import { useEffect, useRef } from 'react';
import { useSessionStore } from '@/store/sessionStore';
import { useAuthStore } from '@/store/authStore';
import { Sidebar } from '@/components/sidebar/Sidebar';
import { ChatInterface } from '@/components/chat/ChatInterface';
import { Loader2 } from 'lucide-react';

export default function ChatPage() {
  const { isAuthenticated } = useAuthStore();
  const { activeSession, sessions, fetchSessions, createSession, isLoading } = useSessionStore();
  
  // Track if we've already tried to create a session
  const hasTriedCreateSession = useRef(false);
  const hasTriedFetchSessions = useRef(false);

  // Fetch sessions when authenticated (only once)
  useEffect(() => {
    if (isAuthenticated && !hasTriedFetchSessions.current) {
      hasTriedFetchSessions.current = true;
      fetchSessions();
    }
  }, [isAuthenticated]);

  // Auto-create first session if none exist (only once and when user is ready to chat)
  useEffect(() => {
    if (isAuthenticated && 
        sessions.length === 0 && 
        !activeSession && 
        !isLoading && 
        !hasTriedCreateSession.current) {
      // Only auto-create if user has been on the page for a moment
      // This prevents immediate creation on first load
      const timer = setTimeout(() => {
        if (sessions.length === 0 && !activeSession) {
          hasTriedCreateSession.current = true;
          createSession({ name: 'Mi primera sesión' });
        }
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, sessions.length, activeSession, isLoading]);

  // Reset flags when user logs out
  useEffect(() => {
    if (!isAuthenticated) {
      hasTriedFetchSessions.current = false;
      hasTriedCreateSession.current = false;
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="text-gray-600">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        <Sidebar />
      </div>
      
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {activeSession ? (
          <ChatInterface session={activeSession} />
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-gray-700 mb-2">
                No Session Selected
              </h2>
              <p className="text-gray-500">
                Select a session from the sidebar or create a new one to start chatting.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}