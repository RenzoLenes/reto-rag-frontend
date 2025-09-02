import { create } from 'zustand';
import { Document, SessionDocumentsResponse } from '@/types';
import { apiClient } from '@/lib/api';
import { extractErrorMessage } from '@/lib/errorUtils';

interface DocumentStore {
  // State
  documents: Record<string, Document[]>; // sessionId -> documents
  isUploading: boolean;
  uploadProgress: number;
  isLoading: boolean;
  error: string | null;
  pollingIntervals: Record<string, NodeJS.Timeout>; // sessionId -> interval

  // Actions
  fetchSessionDocuments: (sessionId: string) => Promise<void>;
  uploadDocument: (sessionId: string, file: File) => Promise<Document | null>;
  startPollingForSession: (sessionId: string) => void;
  stopPollingForSession: (sessionId: string) => void;
  clearError: () => void;
  setUploadProgress: (progress: number) => void;
}

export const useDocumentStore = create<DocumentStore>((set, get) => ({
  // Initial state
  documents: {},
  isUploading: false,
  uploadProgress: 0,
  isLoading: false,
  error: null,
  pollingIntervals: {},

  fetchSessionDocuments: async (sessionId: string): Promise<void> => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await apiClient.getSessionDocuments(sessionId);
      
      
      if (response.success && response.data) {
        // Convertir documentos del servidor al formato interno
        const convertedDocuments: Document[] = response.data.documents.map(doc => {
          // Determinar el estado de procesamiento con lógica más robusta
          let upload_status: Document['upload_status'] = 'processing';
          
          // Prioridad de campos de estado
          if (doc.upload_status) {
            upload_status = doc.upload_status;
          } else if (doc.processingStatus) {
            const status = doc.processingStatus.toLowerCase();
            if (status === 'completed' || status === 'complete' || status === 'ready' || status === 'done') {
              upload_status = 'completed';
            } else if (status === 'failed' || status === 'error') {
              upload_status = 'failed';
            } else if (status === 'uploading') {
              upload_status = 'uploading';
            } else {
              upload_status = 'processing';
            }
          } else if (doc.status) {
            const status = doc.status.toLowerCase();
            if (status === 'completed' || status === 'complete' || status === 'ready' || status === 'done') {
              upload_status = 'completed';
            } else if (status === 'failed' || status === 'error') {
              upload_status = 'failed';
            } else if (status === 'uploading') {
              upload_status = 'uploading';
            } else {
              upload_status = 'processing';
            }
          } else if (doc.chunksIndexed > 0) {
            upload_status = 'completed';
          }
          
          return {
            documentId: doc.documentId,
            fileName: doc.fileName,
            s3Key: doc.s3Key || '',
            pages: doc.pages,
            chunksIndexed: doc.chunksIndexed,
            sessionId: sessionId,
            upload_status,
          };
        });
        
        const totalChunks = convertedDocuments.reduce((sum, doc) => sum + (doc.chunksIndexed || 0), 0);
        
        set((state) => ({
          documents: {
            ...state.documents,
            [sessionId]: convertedDocuments,
          },
          isLoading: false,
          error: null,
        }));
        
        // No hacer polling automático - solo cuando se solicite explícitamente
      } else {
        set({
          isLoading: false,
          error: response.error ? extractErrorMessage(response.error) : 'Failed to fetch documents',
        });
      }
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch documents',
      });
    }
  },

  uploadDocument: async (sessionId: string, file: File): Promise<Document | null> => {
    set({ isUploading: true, uploadProgress: 0, error: null });
    
    try {
      // Simulate upload progress (in real app, you'd implement proper progress tracking)
      const progressInterval = setInterval(() => {
        set((state) => ({
          uploadProgress: Math.min(state.uploadProgress + 10, 90),
        }));
      }, 200);

      const response = await apiClient.uploadDocument(sessionId, file);
      
      clearInterval(progressInterval);
      
      console.log('🔍 [DEBUG] Upload response:', JSON.stringify(response, null, 2));
      
      if (response.success && response.data) {
        console.log('🔍 [DEBUG] Upload successful, data:', response.data);
        
        // Convertir UploadDocumentResponse a Document
        const newDocument: Document = {
          documentId: response.data.documentId,
          fileName: response.data.fileName,
          s3Key: response.data.s3Key,
          pages: response.data.pages,
          chunksIndexed: response.data.chunksIndexed,
          sessionId: sessionId,
          // TODO: El servidor podría retornar status, no asumir 'completed'
          upload_status: (response.data as any).status || 'processing',
        };
        
        console.log('📄 Document uploaded:', newDocument);
        
        // Primero actualizar con el documento subido
        set((state) => ({
          documents: {
            ...state.documents,
            [sessionId]: [
              ...(state.documents[sessionId] || []),
              newDocument,
            ],
          },
          isUploading: false,
          uploadProgress: 100,
          error: null,
        }));
        
        // Refrescar la lista completa para obtener estado real del servidor
        setTimeout(() => {
          get().fetchSessionDocuments(sessionId);
        }, 1000);
        
        // Reset progress after a short delay
        setTimeout(() => {
          set({ uploadProgress: 0 });
        }, 1000);
        
        return newDocument;
      } else {
        set({
          isUploading: false,
          uploadProgress: 0,
          error: response.error ? extractErrorMessage(response.error) : 'Failed to upload document',
        });
        return null;
      }
    } catch (error) {
      set({
        isUploading: false,
        uploadProgress: 0,
        error: error instanceof Error ? error.message : 'Failed to upload document',
      });
      return null;
    }
  },

  // Tu backend no tiene endpoint para eliminar documentos

  clearError: () => {
    set({ error: null });
  },

  setUploadProgress: (progress: number) => {
    set({ uploadProgress: progress });
  },

  startPollingForSession: (sessionId: string) => {
    const state = get();
    
    // Detener polling existente si hay uno
    if (state.pollingIntervals[sessionId]) {
      clearInterval(state.pollingIntervals[sessionId]);
    }
    
    // Iniciar nuevo polling cada 3 segundos
    const intervalId = setInterval(async () => {
      
      try {
        // Hacer fetch silencioso (sin loading state)
        const response = await apiClient.getSessionDocuments(sessionId);
        
        if (response.success && response.data) {
          const convertedDocuments: Document[] = response.data.documents.map(doc => {
            // Use the same robust status mapping logic as fetchSessionDocuments
            let upload_status: Document['upload_status'] = 'processing';
            
            if (doc.upload_status) {
              upload_status = doc.upload_status;
            } else if (doc.processingStatus) {
              const status = doc.processingStatus.toLowerCase();
              if (status === 'completed' || status === 'complete' || status === 'ready' || status === 'done') {
                upload_status = 'completed';
              } else if (status === 'failed' || status === 'error') {
                upload_status = 'failed';
              } else if (status === 'uploading') {
                upload_status = 'uploading';
              } else {
                upload_status = 'processing';
              }
            } else if (doc.status) {
              const status = doc.status.toLowerCase();
              if (status === 'completed' || status === 'complete' || status === 'ready' || status === 'done') {
                upload_status = 'completed';
              } else if (status === 'failed' || status === 'error') {
                upload_status = 'failed';
              } else if (status === 'uploading') {
                upload_status = 'uploading';
              } else {
                upload_status = 'processing';
              }
            } else if (doc.chunksIndexed > 0) {
              upload_status = 'completed';
            }
            
            return {
              documentId: doc.documentId,
              fileName: doc.fileName,
              s3Key: doc.s3Key || '',
              pages: doc.pages,
              chunksIndexed: doc.chunksIndexed,
              sessionId: sessionId,
              upload_status,
            };
          });

          const totalChunks = convertedDocuments.reduce((sum, doc) => sum + (doc.chunksIndexed || 0), 0);
          
          // Actualizar documentos
          set((state) => ({
            documents: {
              ...state.documents,
              [sessionId]: convertedDocuments,
            },
          }));
          
          // Detener polling si todos están completos
          const hasProcessingDocs = convertedDocuments.some(doc => 
            doc.upload_status === 'processing' || doc.upload_status === 'uploading'
          );
          
          if (!hasProcessingDocs) {
            get().stopPollingForSession(sessionId);
          }
        }
      } catch (error) {
        console.error('❌ [POLLING] Error checking document status:', error);
      }
    }, 3000); // Poll every 3 seconds
    
    // Guardar el interval ID
    set((state) => ({
      pollingIntervals: {
        ...state.pollingIntervals,
        [sessionId]: intervalId,
      },
    }));
  },

  stopPollingForSession: (sessionId: string) => {
    const state = get();
    
    if (state.pollingIntervals[sessionId]) {
      clearInterval(state.pollingIntervals[sessionId]);
      
      set((state) => {
        const newIntervals = { ...state.pollingIntervals };
        delete newIntervals[sessionId];
        return {
          pollingIntervals: newIntervals,
        };
      });
      
    }
  },
}));