// API Configuration
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://reto-rag-production.up.railway.app';

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK: 'Network error. Please check your connection and try again.',
  UNAUTHORIZED: 'You need to log in to access this feature.',
  FORBIDDEN: "You don't have permission to perform this action.",
  NOT_FOUND: 'The requested resource was not found.',
  SERVER_ERROR: 'Internal server error. Please try again later.',
  UNKNOWN: 'An unexpected error occurred. Please try again.',
  
  // Auth specific
  LOGIN_FAILED: 'Invalid email or password.',
  REGISTRATION_FAILED: 'Registration failed. Please try again.',
  PASSWORD_TOO_SHORT: 'Password must be at least 6 characters long.',
  INVALID_EMAIL: 'Please enter a valid email address.',
  
  // Session specific
  SESSION_CREATE_FAILED: 'Failed to create session. Please try again.',
  SESSION_DELETE_FAILED: 'Failed to delete session. Please try again.',
  SESSION_UPDATE_FAILED: 'Failed to update session. Please try again.',
  
  // Document specific
  DOCUMENT_UPLOAD_FAILED: 'Document upload failed. Please try again.',
  DOCUMENT_DELETE_FAILED: 'Failed to delete document. Please try again.',
  INVALID_FILE_TYPE: 'Only PDF files are supported.',
  FILE_TOO_LARGE: 'File size must be less than 10MB.',
  
  // Chat specific
  MESSAGE_SEND_FAILED: 'Failed to send message. Please try again.',
  MESSAGE_DELETE_FAILED: 'Failed to delete message. Please try again.',
  NO_DOCUMENTS: 'Please upload at least one document before chatting.',
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  LOGIN: 'Login successful!',
  REGISTRATION: 'Registration successful! Welcome!',
  LOGOUT: 'Logged out successfully',
  
  SESSION_CREATED: 'New session created!',
  SESSION_DELETED: 'Session deleted successfully',
  SESSION_RENAMED: 'Session renamed successfully',
  
  DOCUMENT_UPLOADED: 'Document uploaded successfully!',
  DOCUMENT_DELETED: 'Document deleted successfully',
  
  MESSAGE_DELETED: 'Message deleted',
  MESSAGE_COPIED: 'Message copied to clipboard',
} as const;

// App Configuration
export const APP_CONFIG = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  SUPPORTED_FILE_TYPES: ['application/pdf'],
  MAX_MESSAGE_LENGTH: 2000,
  SESSION_NAME_MAX_LENGTH: 100,
} as const;

// Local Storage Keys
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'accessToken',
  USER: 'user',
  THEME: 'theme',
} as const;