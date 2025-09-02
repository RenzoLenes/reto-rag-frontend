'use client';

import { Session } from '@/types';
import { Button } from '@/components/ui/button';
import { MoreHorizontal } from 'lucide-react';

interface ChatHeaderProps {
  session: Session;
}

export function ChatHeader({ session }: ChatHeaderProps) {

  return (
    <div className="border-b border-gray-200 p-4">
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-semibold text-gray-800 truncate">
            {session.name}
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Chat with your documents
          </p>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
        >
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}