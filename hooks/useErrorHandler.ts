import { useCallback } from 'react';
import { toast } from 'sonner';
import { ErrorResponse } from '@/types';
import { extractErrorMessage } from '@/lib/errorUtils';

export function useErrorHandler() {
  const handleError = useCallback((error: ErrorResponse | string | Error | unknown) => {
    let message = 'An unexpected error occurred';
    
    if (typeof error === 'string') {
      message = error;
    } else if (error instanceof Error) {
      message = error.message;
    } else if (error && typeof error === 'object' && 'detail' in error) {
      message = extractErrorMessage(error as ErrorResponse);
    }
    
    // Special handling for common error cases
    if (message.toLowerCase().includes('network')) {
      message = 'Network error. Please check your connection and try again.';
    } else if (message.toLowerCase().includes('unauthorized')) {
      message = 'You need to log in to access this feature.';
    } else if (message.toLowerCase().includes('forbidden')) {
      message = "You don't have permission to perform this action.";
    }
    
    toast.error(message);
    
    // Log error for debugging (in development)
    if (process.env.NODE_ENV === 'development') {
      console.error('Error handled:', error);
    }
  }, []);

  const handleSuccess = useCallback((message: string) => {
    toast.success(message);
  }, []);

  const handleWarning = useCallback((message: string) => {
    toast.warning(message);
  }, []);

  const handleInfo = useCallback((message: string) => {
    toast.info(message);
  }, []);

  return {
    handleError,
    handleSuccess,
    handleWarning,
    handleInfo,
  };
}