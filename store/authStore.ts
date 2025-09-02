import { create } from 'zustand';
import { User, LoginRequest, RegisterRequest } from '@/types';
import { apiClient } from '@/lib/api';
import { extractErrorMessage } from '@/lib/errorUtils';

interface AuthStore {
  // State
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (credentials: LoginRequest) => Promise<boolean>;
  register: (userData: RegisterRequest) => Promise<boolean>;
  logout: () => void;
  fetchUserInfo: () => Promise<boolean>;
  clearError: () => void;
  validateToken: () => Promise<boolean>;
  setLoading: (loading: boolean) => void;
  initializeAuth: () => void;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
      // Initial state
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Actions
      login: async (credentials: LoginRequest): Promise<boolean> => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await apiClient.login(credentials);
          
          console.log('🔐 Login response:', response);
          
          if (response.success && response.data) {
            const { accessToken } = response.data;
            
            console.log('✅ Login successful, token:', accessToken ? 'RECEIVED' : 'MISSING');
            
            // Set token in API client
            apiClient.setToken(accessToken);
            
            // Set token first
            set({
              token: accessToken,
              isAuthenticated: true,
              isLoading: true, // Keep loading while fetching user info
              error: null,
            });
            
            // Fetch user information
            const userResponse = await apiClient.getUserInfo();
            
            if (userResponse.success && userResponse.data) {
              set({
                user: userResponse.data,
                isLoading: false,
              });
            } else {
              // Fallback with basic user object if getUserInfo fails
              const user: User = {
                userId: 'temp',
                email: credentials.email,
              };
              
              set({
                user,
                isLoading: false,
              });
            }
            
            // Verificar que el token se guardó
            setTimeout(() => {
              const storedToken = localStorage.getItem('accessToken');
              console.log('💾 Token stored in localStorage:', storedToken ? 'YES' : 'NO');
            }, 100);
            
            // El backend no envía user info en el login, pero tenemos el email de las credenciales
            if (!get().user) {
              set((state) => ({
                ...state,
                user: { userId: 'unknown', email: credentials.email }
              }));
            }
            
            return true;
          } else {
            set({
              isLoading: false,
              error: extractErrorMessage(response.error) || 'Login failed',
            });
            return false;
          }
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Login failed',
          });
          return false;
        }
      },

      register: async (userData: RegisterRequest): Promise<boolean> => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await apiClient.register(userData);
          
          console.log('📝 Register response:', response);
          
          if (response.success && response.data) {
            const { userId, email } = response.data;
            
            // El registro fue exitoso, pero no devuelve token
            // El usuario deberá hacer login después del registro
            set({
              user: { userId, email },
              token: null,
              isAuthenticated: false, // No autenticado hasta hacer login
              isLoading: false,
              error: null,
            });
            
            return true;
          } else {
            set({
              isLoading: false,
              error: extractErrorMessage(response.error) || 'Registration failed',
            });
            return false;
          }
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Registration failed',
          });
          return false;
        }
      },

      logout: () => {
        // Clear token from API client
        apiClient.setToken(null);
        
        // Reset auth state
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });
        
        // Call logout endpoint (fire and forget)
        apiClient.logout().catch(console.error);
      },

      fetchUserInfo: async (): Promise<boolean> => {
        try {
          const response = await apiClient.getUserInfo();
          
          if (response.success && response.data) {
            set({
              user: response.data,
              error: null,
            });
            return true;
          } else {
            set({
              error: response.error ? 'Failed to fetch user information' : 'Unknown error',
            });
            return false;
          }
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to fetch user information',
          });
          return false;
        }
      },

      clearError: () => {
        set({ error: null });
      },

      validateToken: async (): Promise<boolean> => {
        const { token } = get();
        
        if (!token) {
          return false;
        }

        set({ isLoading: true });
        
        try {
          // Use health endpoint to validate token
          const response = await apiClient.health();
          
          if (response.success) {
            set({ isLoading: false });
            return true;
          } else {
            // Token is invalid, clear auth state
            get().logout();
            set({ isLoading: false });
            return false;
          }
        } catch (error) {
          get().logout();
          set({ isLoading: false });
          return false;
        }
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      initializeAuth: () => {
        if (typeof window !== 'undefined') {
          const token = localStorage.getItem('accessToken');
          if (token) {
            apiClient.setToken(token);
            set({ token, isAuthenticated: true });
          }
        }
      },

    }));