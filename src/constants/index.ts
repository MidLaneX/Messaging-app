export const APP_CONFIG = {
  APP_NAME: 'MessagingApp',
  VERSION: '1.0.0',
  API_BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:3001',
  WEBSOCKET_URL: process.env.REACT_APP_WS_URL || 'ws://localhost:3001',
} as const;

export const UI_CONFIG = {
  SIDEBAR_WIDTH: 320,
  MESSAGE_LIMIT_PER_LOAD: 50,
  TYPING_INDICATOR_TIMEOUT: 3000,
  ONLINE_STATUS_TIMEOUT: 30000,
} as const;

export const MESSAGE_CONFIG = {
  MAX_MESSAGE_LENGTH: 4096,
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  SUPPORTED_FILE_TYPES: [
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/pdf',
    'text/plain',
  ],
} as const;

export const ROUTES = {
  HOME: '/',
  CHAT: '/chat',
  SETTINGS: '/settings',
  PROFILE: '/profile',
} as const;
