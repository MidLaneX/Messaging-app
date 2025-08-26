export const APP_CONFIG = {
  APP_NAME: "MessagingApp",
  VERSION: "1.0.0",
  API_BASE_URL: process.env.REACT_APP_API_URL || "http://localhost:8090",
  WEBSOCKET_URL: process.env.REACT_APP_WS_URL || "ws://localhost:8090",
  CURRENT_USER_ID:
    process.env.REACT_APP_CURRENT_USER_ID ||
    "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
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
    "image/jpeg",
    "image/png",
    "image/gif",
    "application/pdf",
    "text/plain",
  ],
} as const;

export const API_ENDPOINTS = {
  RECENT_USERS_INITIAL: (userId: string) =>
    `/api/users/${userId}/recent-users/initial`,
  RECENT_USERS_LOAD_MORE: (userId: string, page: number) =>
    `/api/users/${userId}/recent-users/load-more?page=${page}`,
  RECENT_CONVERSATIONS: (userId: string) =>
    `/api/users/${userId}/conversations`,
  SEND_MESSAGE: "/api/messages/send",
  GET_MESSAGES: (userId1: string, userId2: string) =>
    `/api/messages/${userId1}/${userId2}`,
  MARK_READ: (messageId: string) => `/api/messages/${messageId}/read`,
  USER_GROUPS: (userId: string) => `/api/groups/user/${userId}`,
} as const;

export const ROUTES = {
  HOME: '/',
  CHAT: '/chat',
  SETTINGS: '/settings',
  PROFILE: '/profile',
} as const;
// REACT_APP_CURRENT_USER_ID=b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12 pnpm start