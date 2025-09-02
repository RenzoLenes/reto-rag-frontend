import {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  RegisterResponse,
  Session,
  CreateSessionRequest,
  CreateSessionResponse,
  SessionDeleteResponse,
  UpdateSessionRequest,
  SessionDocumentsResponse,
  SessionMessagesResponse,
  User,
  UploadDocumentResponse,
  ChatRequest,
  ChatResponse,
  HealthResponse,
  ErrorResponse,
  ApiResponse,
} from '@/types';

class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string = 'https://reto-rag-production.up.railway.app') {
    this.baseUrl = baseUrl;
    
    // Try to get token from localStorage on initialization
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('accessToken');
    }
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    return headers;
  }

  private getFormDataHeaders(): Record<string, string> {
    const headers: Record<string, string> = {};

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    return headers;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseUrl}${endpoint}`;
      
      const response = await fetch(url, {
        ...options,
        headers: {
          ...this.getHeaders(),
          ...options.headers,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data as ErrorResponse,
        };
      }

      return {
        success: true,
        data: data as T,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          detail: error instanceof Error ? error.message : 'Unknown error occurred',
          code: 'NETWORK_ERROR',
          timestamp: new Date().toISOString(),
        },
      };
    }
  }

  setToken(token: string | null) {
    this.token = token;
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('accessToken', token);
      } else {
        localStorage.removeItem('accessToken');
      }
    }
  }

  getToken(): string | null {
    return this.token;
  }

  // Auth endpoints
  async getUserInfo(): Promise<ApiResponse<User>> {
    return this.request<User>('/auth/user');
  }

  async login(credentials: LoginRequest): Promise<ApiResponse<AuthResponse>> {
    return this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: credentials.email,
        password: credentials.password,
      }),
    });
  }

  async register(userData: RegisterRequest): Promise<ApiResponse<RegisterResponse>> {
    return this.request<RegisterResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async logout(): Promise<ApiResponse<void>> {
    return this.request<void>('/auth/logout', {
      method: 'POST',
    });
  }

  async refreshToken(): Promise<ApiResponse<AuthResponse>> {
    return this.request<AuthResponse>('/auth/refresh', {
      method: 'POST',
    });
  }

  // Health check
  async health(): Promise<ApiResponse<HealthResponse>> {
    return this.request<HealthResponse>('/health');
  }

  // No existe endpoint /auth/me en tu backend, eliminar este método

  // Session endpoints
  async getSessions(): Promise<ApiResponse<Session[]>> {
    return this.request<Session[]>('/sessions/');
  }

  // Tu backend no tiene endpoint GET /sessions/{id}, solo GET /sessions/

  async createSession(sessionData: CreateSessionRequest): Promise<ApiResponse<CreateSessionResponse>> {
    return this.request<CreateSessionResponse>('/sessions/', {
      method: 'POST',
      body: JSON.stringify(sessionData),
    });
  }

  async deleteSession(sessionId: string): Promise<ApiResponse<SessionDeleteResponse>> {
    return this.request<SessionDeleteResponse>(`/sessions/${sessionId}`, {
      method: 'DELETE',
    });
  }

  async updateSession(sessionId: string, updateData: UpdateSessionRequest): Promise<ApiResponse<Session>> {
    return this.request<Session>(`/sessions/${sessionId}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });
  }

  async getSessionDocuments(sessionId: string): Promise<ApiResponse<SessionDocumentsResponse>> {
    return this.request<SessionDocumentsResponse>(`/sessions/${sessionId}/documents`);
  }

  async getSessionMessages(sessionId: string): Promise<ApiResponse<SessionMessagesResponse>> {
    return this.request<SessionMessagesResponse>(`/sessions/${sessionId}/messages`);
  }

  // Document endpoints
  // Tu backend no tiene endpoint GET /documents/, solo upload
  
  async uploadDocument(sessionId: string, file: File): Promise<ApiResponse<UploadDocumentResponse>> {
    try {
      const formData = new FormData();
      formData.append('sessionId', sessionId); // Tu backend usa 'sessionId', no 'session_id'
      formData.append('file', file);

      const url = `${this.baseUrl}/documents/upload`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: this.getFormDataHeaders(),
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data as ErrorResponse,
        };
      }

      return {
        success: true,
        data: data as UploadDocumentResponse,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          detail: error instanceof Error ? error.message : 'Upload failed',
          code: 'UPLOAD_ERROR',
          timestamp: new Date().toISOString(),
        },
      };
    }
  }

  // Tu backend no tiene endpoint para delete documents
  
  // Chat endpoints
  // Tu backend no tiene endpoint para get messages, solo query
  
  async sendMessage(chatData: ChatRequest): Promise<ApiResponse<ChatResponse>> {
    return this.request<ChatResponse>('/chat/query', {
      method: 'POST',
      body: JSON.stringify(chatData),
    });
  }

  // Tu backend no tiene endpoint para delete messages

  // Tu backend no tiene endpoint /system/info
}

// Create singleton instance
export const apiClient = new ApiClient();
export default apiClient;