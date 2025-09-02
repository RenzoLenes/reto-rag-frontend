'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useChatStore } from '@/store/chatStore';
import { Send, Paperclip } from 'lucide-react';

interface MessageInputProps {
  sessionId: string;
}

export function MessageInput({ sessionId }: MessageInputProps) {
  const [message, setMessage] = useState('');
  const { sendMessage, isTyping } = useChatStore();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim() || isTyping) return;
    
    const messageContent = message.trim();
    setMessage('');
    
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
    
    const success = await sendMessage(sessionId, messageContent);
    if (!success) {
      // Restore message on failure
      setMessage(messageContent);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    
    // Auto-resize textarea
    const textarea = e.target;
    textarea.style.height = 'auto';
    const newHeight = Math.min(textarea.scrollHeight, 120); // Max height
    textarea.style.height = `${newHeight}px`;
  };

  return (
    <div className="space-y-3">
      {/* Input form */}
      <form onSubmit={handleSubmit} className="flex items-end gap-3">
        <div className="flex-1 relative">
          <Textarea
            ref={textareaRef}
            placeholder="Ask anything about your documents..."
            value={message}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyDown}
            disabled={isTyping}
            className="min-h-[44px] max-h-[120px] resize-none pr-12 py-3"
            rows={1}
          />
          
          {/* Attach button (placeholder for future file attachment) */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-2 top-2 h-7 w-7 p-0 text-gray-400 hover:text-gray-600"
            disabled={true} // Disabled for now
            title="File attachment (coming soon)"
          >
            <Paperclip className="h-4 w-4" />
          </Button>
        </div>
        
        <Button
          type="submit"
          disabled={!message.trim() || isTyping}
          className="h-11 w-11 p-0 flex-shrink-0"
        >
          <Send className="h-4 w-4" />
        </Button>
      </form>
      
      {/* Help text */}
      <p className="text-xs text-gray-500">
        Press <kbd className="px-1.5 py-0.5 text-xs bg-gray-100 rounded">Enter</kbd> to send, 
        <kbd className="px-1.5 py-0.5 text-xs bg-gray-100 rounded ml-1">Shift + Enter</kbd> for new line
      </p>
    </div>
  );
}