'use client';

import { useEffect, useRef } from 'react';
import { Session } from '@/types';
import { useChatStore } from '@/store/chatStore';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { ChatHeader } from './ChatHeader';
import { Loader2 } from 'lucide-react';

interface ChatInterfaceProps {
  session: Session;
}

export function ChatInterface({ session }: ChatInterfaceProps) {
  const { messages, isLoading, fetchSessionMessages } = useChatStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const sessionMessages = messages[session.sessionId] || [];

  // Fetch messages when session changes
  useEffect(() => {
    if (session?.sessionId) {
      fetchSessionMessages(session.sessionId);
    }
  }, [session?.sessionId, fetchSessionMessages]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [sessionMessages]);

  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <ChatHeader session={session} />
      
      {/* Messages Area */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {isLoading && sessionMessages.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="flex items-center gap-2 text-gray-500">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Loading messages...</span>
            </div>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto">
              <MessageList 
                messages={sessionMessages} 
                sessionId={session.sessionId}
              />
              <div ref={messagesEndRef} />
            </div>
            
            {/* Message Input */}
            <div className="border-t border-gray-200 p-4">
              <MessageInput sessionId={session.sessionId} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}