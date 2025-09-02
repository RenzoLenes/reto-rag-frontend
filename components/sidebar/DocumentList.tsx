'use client';

import { useCallback, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useSessionStore } from '@/store/sessionStore';
import { useDocumentStore } from '@/store/documentStore';
import { Document } from '@/types';
import { 
  FileText, 
  Upload, 
  MoreHorizontal, 
  Trash2, 
  Loader2,
  CheckCircle,
  AlertCircle,
  Clock
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface DocumentListProps {
  searchQuery: string;
}

export function DocumentList({ searchQuery }: DocumentListProps) {
  const { activeSession } = useSessionStore();
  const { 
    documents, 
    fetchSessionDocuments,
    uploadDocument,
    stopPollingForSession,
    isUploading,
    isLoading,
    uploadProgress
  } = useDocumentStore();
  
  const [dragActive, setDragActive] = useState(false);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);

  const currentDocuments = activeSession ? documents[activeSession.sessionId] || [] : [];
  
  // Filter documents based on search query
  const filteredDocuments = currentDocuments.filter((doc) =>
    doc.fileName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Fetch documents when active session changes
  useEffect(() => {
    if (activeSession) {
      fetchSessionDocuments(activeSession.sessionId);
    }
    
    // Cleanup: stop polling for previous session when session changes
    return () => {
      if (activeSession) {
        stopPollingForSession(activeSession.sessionId);
      }
    };
  }, [activeSession?.sessionId, fetchSessionDocuments, stopPollingForSession]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragIn = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setDragActive(true);
    }
  }, []);

  const handleDragOut = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  }, []);

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      if (!activeSession) {
        toast.error('Please select a session first');
        return;
      }

      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        const file = e.dataTransfer.files[0];
        
        // Check if it's a PDF
        if (file.type !== 'application/pdf') {
          toast.error('Only PDF files are supported');
          return;
        }

        const result = await uploadDocument(activeSession.sessionId, file);
        if (result) {
          toast.success(`${file.name} uploaded successfully!`);
        }
      }
    },
    [activeSession, uploadDocument]
  );

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!activeSession) {
      toast.error('Please select a session first');
      return;
    }

    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        toast.error('Only PDF files are supported');
        return;
      }

      const result = await uploadDocument(activeSession.sessionId, file);
      if (result) {
        toast.success(`${file.name} uploaded successfully!`);
      }
    }
    
    // Reset input
    e.target.value = '';
  };

  const handleDelete = (documentId: string) => {
    // Tu backend no soporta eliminar documentos
    toast.info('Document deletion not available yet');
    setMenuOpenId(null);
  };

  const getStatusIcon = (status: Document['upload_status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'processing':
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'uploading':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <FileText className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  if (!activeSession) {
    return (
      <div className="flex flex-col items-center justify-center py-8 px-4">
        <FileText className="h-8 w-8 text-gray-400 mb-2" />
        <p className="text-sm text-gray-500 text-center">
          Select a session to view documents
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Upload Area */}
      <div className="p-4 border-b border-gray-200">
        <div
          className={cn(
            'relative border-2 border-dashed rounded-lg p-6 transition-colors',
            dragActive
              ? 'border-blue-400 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400'
          )}
          onDragEnter={handleDragIn}
          onDragLeave={handleDragOut}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            type="file"
            accept=".pdf"
            onChange={handleFileInput}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            disabled={isUploading}
          />
          
          <div className="text-center">
            <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
            <p className="text-sm text-gray-600">
              {isUploading ? 'Uploading...' : 'Drop PDF files here or click to browse'}
            </p>
            {isUploading && (
              <div className="mt-3">
                <div className="bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">{uploadProgress}%</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Document List */}
      <div className="flex-1 overflow-y-auto py-2">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="flex items-center gap-2 text-gray-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">Loading documents...</span>
            </div>
          </div>
        ) : filteredDocuments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 px-4">
            <FileText className="h-8 w-8 text-gray-400 mb-2" />
            <p className="text-sm text-gray-500 text-center">
              {searchQuery ? 'No documents found' : 'No documents uploaded'}
            </p>
            {!searchQuery && (
              <p className="text-xs text-gray-400 text-center mt-1">
                Upload PDF files to start building your knowledge base
              </p>
            )}
          </div>
        ) : (
          filteredDocuments.map((document) => (
            <div
              key={document.documentId}
              className="group relative mx-2 mb-1 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3 p-3">
                {getStatusIcon('completed')}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">
                    {document.fileName}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-xs text-gray-500">
                      {document.pages} page{document.pages !== 1 ? 's' : ''}
                    </p>
                    <span className="text-xs text-gray-400">•</span>
                    <p className="text-xs text-gray-500">
                      {document.chunksIndexed} chunks
                    </p>
                  </div>
                </div>
                
                {/* Menu button */}
                <div className="relative">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation();
                      setMenuOpenId(menuOpenId === document.documentId ? null : document.documentId);
                    }}
                  >
                    <MoreHorizontal className="h-3 w-3" />
                  </Button>
                  
                  {/* Dropdown menu */}
                  {menuOpenId === document.documentId && (
                    <div className="absolute right-0 top-full mt-1 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-10">
                      <button
                        className="flex items-center gap-2 px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 w-full text-left"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(document.documentId);
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
          ))
        )}
      </div>
    </div>
  );
}