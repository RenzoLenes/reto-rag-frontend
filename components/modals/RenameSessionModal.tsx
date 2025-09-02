'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { useSessionStore } from '@/store/sessionStore';
import { Session } from '@/types';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface RenameSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: Session | null;
}

export function RenameSessionModal({ isOpen, onClose, session }: RenameSessionModalProps) {
  const [sessionName, setSessionName] = useState('');
  const [isRenaming, setIsRenaming] = useState(false);
  const { updateSession } = useSessionStore();

  // Update session name when session prop changes
  useEffect(() => {
    if (session && isOpen) {
      setSessionName(session.name);
    }
  }, [session, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!session) return;
    
    if (!sessionName.trim()) {
      toast.error('Please enter a session name');
      return;
    }

    if (sessionName.trim() === session.name) {
      onClose();
      return;
    }

    setIsRenaming(true);
    
    try {
      const result = await updateSession(session.sessionId, { name: sessionName.trim() });
      
      if (result) {
        toast.success('Session renamed successfully!');
        onClose();
      } else {
        toast.error('Failed to rename session');
      }
    } finally {
      setIsRenaming(false);
    }
  };

  const handleClose = () => {
    if (!isRenaming) {
      setSessionName(session?.name || '');
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Rename Session</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="sessionName" className="text-sm font-medium">
                Session Name
              </label>
              <Input
                id="sessionName"
                value={sessionName}
                onChange={(e) => setSessionName(e.target.value)}
                placeholder="Enter session name..."
                disabled={isRenaming}
                maxLength={100}
                autoFocus
              />
            </div>
          </div>
          
          <DialogFooter className="space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isRenaming}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isRenaming || !sessionName.trim() || sessionName.trim() === session?.name}
            >
              {isRenaming ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Renaming...
                </>
              ) : (
                'Rename Session'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}