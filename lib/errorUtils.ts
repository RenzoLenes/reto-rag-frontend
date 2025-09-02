import { ErrorResponse } from '@/types';

export function extractErrorMessage(error: ErrorResponse | string | null | undefined): string {
  if (!error) return 'An unknown error occurred';
  
  if (typeof error === 'string') {
    return error;
  }
  
  if (typeof error === 'object' && 'detail' in error) {
    const { detail } = error;
    
    // If detail is a string, return it directly
    if (typeof detail === 'string') {
      return detail;
    }
    
    // If detail is an array (Pydantic validation errors), extract messages
    if (Array.isArray(detail) && detail.length > 0) {
      // Return the first error message or combine multiple messages
      if (detail.length === 1) {
        return detail[0].msg || 'Validation error';
      } else {
        // Combine multiple error messages
        return detail.map(err => err.msg).join(', ');
      }
    }
  }
  
  return 'An error occurred';
}

export function getErrorDisplayMessage(error: unknown): string {
  return extractErrorMessage(error as ErrorResponse | string | null);
}