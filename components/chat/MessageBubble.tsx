'use client';

import { Message } from '@/types';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/authStore';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { SourceList } from './SourceList';
import { Bot, Trash2, Copy } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface MessageBubbleProps {
  message: Message;
  sessionId: string;
}

export function MessageBubble({ message, sessionId }: MessageBubbleProps) {
  const { user } = useAuthStore();
  
  const isUser = message.role === 'user';

  console.log(message)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      toast.success('Message copied to clipboard');
    } catch (error) {
      toast.error('Failed to copy message');
    }
  };

  const handleDelete = () => {
    // Tu backend no soporta eliminar mensajes
    toast.info('Message deletion not available yet');
  };

  return (
    <div className={cn(
      'flex items-start gap-3 group',
      isUser && 'flex-row-reverse'
    )}>
      {/* Avatar */}
      <div className={cn(
        'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0',
        isUser ? 'bg-blue-100' : 'bg-gray-100'
      )}>
        {isUser ? (
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-blue-100 text-blue-600 text-xs">
              {user?.email?.[0]?.toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
        ) : (
          <Bot className={cn(
            'h-4 w-4',
            'text-gray-600'
          )} />
        )}
      </div>

      {/* Message Content */}
      <div className={cn(
        'flex-1 min-w-0',
        isUser && 'flex flex-col items-end'
      )}>
        {/* Message bubble */}
        <div className={cn(
          'rounded-2xl px-4 py-3 max-w-[80%] break-words',
          isUser
            ? 'bg-blue-600 text-white'
            : 'bg-white border border-gray-200'
        )}>
          <p className="text-sm leading-relaxed whitespace-pre-wrap">
            {message.content}
          </p>
        </div>

        {/* Sources (only for assistant messages) */}
        {!isUser && message.sources && message.sources.length > 0 && (
          <div className="mt-3 max-w-[80%]">
            <SourceList sources={message.sources} />
          </div>
        )}

        {/* Message actions */}
        <div className={cn(
          'flex items-center gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity',
          isUser ? 'justify-end' : 'justify-start'
        )}>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-xs text-gray-500 hover:text-gray-700"
            onClick={handleCopy}
          >
            <Copy className="h-3 w-3 mr-1" />
            Copy
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-xs text-gray-500 hover:text-red-600"
            onClick={handleDelete}
          >
            <Trash2 className="h-3 w-3 mr-1" />
            Delete
          </Button>
          
          <span className="text-xs text-gray-400 ml-2">
            {new Date(message.createdAt).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </span>
        </div>
      </div>
    </div>
  );
}