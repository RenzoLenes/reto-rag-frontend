'use client';

import { Message } from '@/types';
import { MessageBubble } from './MessageBubble';
import { useChatStore } from '@/store/chatStore';
import { Loader2, Bot } from 'lucide-react';

interface MessageListProps {
  messages: Message[];
  sessionId: string;
}

export function MessageList({ messages, sessionId }: MessageListProps) {
  const { isTyping } = useChatStore();

  if (messages.length === 0 && !isTyping) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center">
          <Bot className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-700 mb-2">
            Ready to help with your documents
          </h3>
          <p className="text-gray-500 max-w-md">
            Upload documents to the sidebar and start asking questions. 
            I&apos;ll provide answers based on your document content with relevant sources.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      {messages.map((message) => (
        <MessageBubble 
          key={message.id} 
          message={message}
          sessionId={sessionId}
        />
      ))}
      
      {/* Typing indicator */}
      {isTyping && (
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
            <Bot className="h-4 w-4 text-blue-600" />
          </div>
          <div className="flex-1">
            <div className="bg-gray-100 rounded-2xl px-4 py-3 max-w-xs">
              <div className="flex items-center gap-2 text-gray-600">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Thinking...</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}