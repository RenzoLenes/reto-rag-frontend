'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { Loader2 } from 'lucide-react';

interface AuthProviderProps {
  children: React.ReactNode;
}

const publicRoutes = ['/login', '/register'];

export function AuthProvider({ children }: AuthProviderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isLoading, validateToken, token, initializeAuth } = useAuthStore();

  useEffect(() => {
    const initAuth = async () => {
      // Initialize auth from localStorage first
      initializeAuth();
      
      // If there's a token, validate it
      const currentToken = useAuthStore.getState().token;
      if (currentToken) {
        const isValid = await validateToken();
        
        // If token is invalid and we're not on a public route, redirect to login
        if (!isValid && !publicRoutes.includes(pathname)) {
          router.push('/login');
        }
        
        // If token is valid and we're on a public route, redirect to chat
        if (isValid && publicRoutes.includes(pathname)) {
          router.push('/chat');
        }
      } else {
        // No token and not on public route, redirect to login
        if (!publicRoutes.includes(pathname)) {
          router.push('/login');
        }
      }
    };

    initAuth();
  }, [pathname, router, validateToken, initializeAuth]);

  // Show loading spinner during initial auth check
  if (isLoading && !publicRoutes.includes(pathname)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="text-gray-600">Loading...</span>
        </div>
      </div>
    );
  }

  // For public routes, always show the content
  if (publicRoutes.includes(pathname)) {
    return <>{children}</>;
  }

  // For protected routes, only show content if authenticated
  if (isAuthenticated) {
    return <>{children}</>;
  }

  // Show loading for protected routes when not yet authenticated
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex items-center gap-2">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span className="text-gray-600">Checking authentication...</span>
      </div>
    </div>
  );
}