'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useSessionStore } from '@/store/sessionStore';
import { RenameSessionModal } from '@/components/modals/RenameSessionModal';
import { Session } from '@/types';
import { 
  MessageSquare, 
  MoreHorizontal, 
  Pencil, 
  Trash2, 
  Loader2,
  Square,
  CheckSquare,
  X
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface SessionListProps {
  searchQuery: string;
}

export function SessionList({ searchQuery }: SessionListProps) {
  const { 
    sessions, 
    activeSession, 
    setActiveSession,
    deleteSession,
    isLoading 
  } = useSessionStore();
  
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [selectedSessions, setSelectedSessions] = useState<Set<string>>(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [renameSession, setRenameSession] = useState<Session | null>(null);

  // Filter sessions based on search query
  const filteredSessions = sessions.filter((session) =>
    session.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectSession = (session: Session) => {
    if (isSelectionMode) {
      toggleSessionSelection(session.sessionId);
    } else {
      setActiveSession(session);
      setMenuOpenId(null);
    }
  };

  const toggleSessionSelection = (sessionId: string) => {
    setSelectedSessions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sessionId)) {
        newSet.delete(sessionId);
      } else {
        newSet.add(sessionId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedSessions.size === filteredSessions.length) {
      setSelectedSessions(new Set());
    } else {
      setSelectedSessions(new Set(filteredSessions.map(s => s.sessionId)));
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedSessions.size === 0) return;
    
    const count = selectedSessions.size;
    if (!confirm(`¿Estás seguro de que quieres eliminar ${count} sesión${count > 1 ? 'es' : ''}? Esta acción eliminará todos los datos relacionados.`)) {
      return;
    }

    let successCount = 0;
    for (const sessionId of selectedSessions) {
      const result = await deleteSession(sessionId);
      if (result) successCount++;
    }

    if (successCount === selectedSessions.size) {
      toast.success(`${successCount} sesión${successCount > 1 ? 'es' : ''} eliminada${successCount > 1 ? 's' : ''} exitosamente`);
    } else {
      toast.error(`Solo se pudieron eliminar ${successCount} de ${selectedSessions.size} sesiones`);
    }

    setSelectedSessions(new Set());
    setIsSelectionMode(false);
  };

  const exitSelectionMode = () => {
    setIsSelectionMode(false);
    setSelectedSessions(new Set());
  };

  const handleEditStart = (session: Session) => {
    setRenameSession(session);
    setMenuOpenId(null);
  };


  const handleDelete = async (sessionId: string) => {
    setMenuOpenId(null);
    
    // Mostrar confirmación
    if (!confirm('¿Estás seguro de que quieres eliminar esta sesión? Esta acción eliminará todos los documentos, mensajes y datos relacionados.')) {
      return;
    }

    const result = await deleteSession(sessionId);
    
    if (result) {
      toast.success(`Sesión eliminada exitosamente. Se eliminaron ${result.documentsDeleted} documentos, ${result.embeddingsDeleted} embeddings y ${result.messagesDeleted} mensajes.`);
    } else {
      toast.error('Error al eliminar la sesión');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="flex items-center gap-2 text-gray-500">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm">Loading sessions...</span>
        </div>
      </div>
    );
  }

  if (filteredSessions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 px-4">
        <MessageSquare className="h-8 w-8 text-gray-400 mb-2" />
        <p className="text-sm text-gray-500 text-center">
          {searchQuery ? 'No sessions found' : 'No sessions yet'}
        </p>
        {!searchQuery && (
          <p className="text-xs text-gray-400 text-center mt-1">
            Create a new session to get started
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Selection Mode Toolbar */}
      {isSelectionMode && (
        <div className="px-2 py-2 bg-blue-50 border-b border-blue-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={handleSelectAll}
                className="h-7 px-2 text-xs"
              >
                {selectedSessions.size === filteredSessions.length ? (
                  <>
                    <CheckSquare className="h-3 w-3 mr-1" />
                    Deseleccionar todo
                  </>
                ) : (
                  <>
                    <Square className="h-3 w-3 mr-1" />
                    Seleccionar todo
                  </>
                )}
              </Button>
              <span className="text-xs text-blue-600">
                {selectedSessions.size} seleccionada{selectedSessions.size !== 1 ? 's' : ''}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Button
                size="sm"
                variant="destructive"
                onClick={handleDeleteSelected}
                disabled={selectedSessions.size === 0}
                className="h-7 px-2 text-xs"
              >
                <Trash2 className="h-3 w-3 mr-1" />
                Eliminar
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={exitSelectionMode}
                className="h-7 w-7 p-0"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {/* Sessions List */}
      <div className="py-2 overflow-y-auto flex-1 min-h-0">
      {filteredSessions.map((session) => (
        <div
          key={session.sessionId}
          className={cn(
            'group relative mx-2 mb-1 rounded-lg transition-colors',
            activeSession?.sessionId === session.sessionId
              ? 'bg-blue-50 border border-blue-200'
              : 'hover:bg-gray-50'
          )}
        >
          {/* Always show normal mode since backend doesn't support editing */}
            <div
              className="flex items-center gap-3 p-3 cursor-pointer"
              onClick={() => handleSelectSession(session)}
            >
              {isSelectionMode ? (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleSessionSelection(session.sessionId);
                  }}
                  className="flex-shrink-0"
                >
                  {selectedSessions.has(session.sessionId) ? (
                    <CheckSquare className="h-4 w-4 text-blue-600" />
                  ) : (
                    <Square className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              ) : (
                <MessageSquare className="h-4 w-4 text-gray-500 flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">
                  {session.name}
                </p>
                <p className="text-xs text-gray-500">
                  {new Date(session.createdAt).toLocaleDateString()}
                </p>
              </div>
              
              {/* Menu button */}
              <div className="relative">
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuOpenId(menuOpenId === session.sessionId ? null : session.sessionId);
                  }}
                >
                  <MoreHorizontal className="h-3 w-3" />
                </Button>
                
                {/* Dropdown menu */}
                {menuOpenId === session.sessionId && !isSelectionMode && (
                  <div className="absolute right-0 top-full mt-1 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-10">
                    <button
                      className="flex items-center gap-2 px-3 py-1.5 text-xs text-blue-600 hover:bg-blue-50 w-full text-left"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsSelectionMode(true);
                        setMenuOpenId(null);
                      }}
                    >
                      <CheckSquare className="h-3 w-3" />
                      Seleccionar múltiples
                    </button>
                    <button
                      className="flex items-center gap-2 px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50 w-full text-left"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditStart(session);
                      }}
                    >
                      <Pencil className="h-3 w-3" />
                      Rename
                    </button>
                    <button
                      className="flex items-center gap-2 px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 w-full text-left"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(session.sessionId);
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
        </div>
      ))}
      </div>

      {/* Rename Session Modal */}
      <RenameSessionModal 
        isOpen={!!renameSession}
        onClose={() => setRenameSession(null)}
        session={renameSession}
      />
    </div>
  );
}