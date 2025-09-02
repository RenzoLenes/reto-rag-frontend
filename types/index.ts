// Auth Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
}

export interface RegisterResponse {
  userId: string;
  email: string;
}

export interface User {
  userId: string;
  email: string;
}

// Session Types
export interface Session {
  sessionId: string;
  name: string;
  createdAt: string;
}

export interface CreateSessionRequest {
  name: string;
}

export interface CreateSessionResponse {
  sessionId: string;
  name: string;
  createdAt: string;
}

export interface SessionDeleteResponse {
  message: string;
  sessionId: string;
  documentsDeleted: number;
  embeddingsDeleted: number;
  messagesDeleted: number;
}

export interface UpdateSessionRequest {
  name: string;
}

export interface SessionDocumentsResponse {
  sessionId: string;
  documents: {
    documentId: string;
    fileName: string;
    s3Key?: string;
    pages: number;
    chunksIndexed: number;
    upload_status?: 'uploading' | 'processing' | 'completed' | 'failed';
    processingStatus?: string; // Por si el servidor usa nombre diferente
    status?: string; // Backup por si usa 'status' simple
    createdAt?: string;
  }[];
}

// Document Types
export interface Document {
  documentId: string;
  fileName: string;
  s3Key: string;
  pages: number;
  chunksIndexed: number;
  sessionId: string; // Para uso interno del frontend
  upload_status?: 'uploading' | 'processing' | 'completed' | 'failed'; // Para UI
}

export interface UploadDocumentResponse {
  documentId: string;
  fileName: string;
  s3Key: string;
  pages: number;
  chunksIndexed: number;
}

// Chat Types
export interface Message {
  id: string; // Generado por el frontend para UI
  messageId?: string; // ID del servidor cuando existe
  content: string;
  role: 'user' | 'assistant';
  sessionId: string;
  sources?: Source[];
  createdAt: string; // Timestamp ISO
}

export interface Source {
  documentId: string;
  fileName: string;
  page: number;
  source: string; // "pdf_text"
  excerpt: string;
  relevance_score: number;
}

export interface ChatRequest {
  sessionId: string;
  message: string;
}

export interface ChatResponse {
  answer: string;
  sources: Source[];
}

export interface SessionMessagesResponse {
  sessionId: string;
  messages: {
    messageId: string;
    role: 'user' | 'assistant';
    content: string;
    createdAt: string;
  }[];
  totalMessages: number;
}

// Error Types
export interface ErrorResponse {
  detail: string | Array<{
    type: string;
    loc: string[];
    msg: string;
    input?: any;
    url?: string;
  }>;
  code?: string;
  timestamp?: string;
}

// API Response wrapper
export interface ApiResponse<T> {
  data?: T;
  error?: ErrorResponse;
  success: boolean;
}

// Health Check
export interface HealthResponse {
  status: string;
  service: string;
  version: string;
}

// Pagination
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

// UI State Types
export interface ChatState {
  messages: Record<string, Message[]>;
  isLoading: boolean;
  error: string | null;
}

export interface SessionState {
  sessions: Session[];
  activeSession: Session | null;
  isLoading: boolean;
  error: string | null;
}

export interface DocumentState {
  documents: Record<string, Document[]>;
  isUploading: boolean;
  uploadProgress: number;
  error: string | null;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}