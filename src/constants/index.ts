// Function to get current user ID dynamically
const getCurrentUserId = (): string => {
  // Check if user ID is set dynamically (from user selection)
  if (typeof window !== 'undefined' && (window as any).__MESSAGING_APP_CURRENT_USER_ID__) {
    return (window as any).__MESSAGING_APP_CURRENT_USER_ID__;
  }
  
  // Check localStorage
  if (typeof window !== 'undefined') {
    const savedUser = localStorage.getItem('messaging-app-current-user');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        return userData.id;
      } catch (error) {
        console.error('Error parsing saved user data:', error);
      }
    }
  }
  
  // Fall back to environment variable or default
  return process.env.REACT_APP_CURRENT_USER_ID || "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11";
};

export const APP_CONFIG = {
  APP_NAME: "MessagingApp",
  VERSION: "1.0.0",
  API_BASE_URL: process.env.REACT_APP_API_URL || "http://localhost:8080",
  WEBSOCKET_URL: process.env.REACT_APP_WS_URL || "ws://localhost:8080",
  get CURRENT_USER_ID() {
    return getCurrentUserId();
  },
  // Performance and reliability settings
  REQUEST_TIMEOUT: 30000, // 30 seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second
  CONNECTION_RETRY_DELAY: 5000, // 5 seconds for WebSocket
  HEARTBEAT_INTERVAL: 30000, // 30 seconds
  RECONNECT_INTERVAL: 10000, // 10 seconds
} as const;

export const UI_CONFIG = {
  SIDEBAR_WIDTH: 320,
  MESSAGE_LIMIT_PER_LOAD: 50,
  TYPING_INDICATOR_TIMEOUT: 3000,
  ONLINE_STATUS_TIMEOUT: 30000,
  // Mobile optimizations
  MOBILE_BREAKPOINT: 768,
  TOUCH_TARGET_SIZE: 44, // Minimum touch target size in pixels
  ANIMATION_DURATION: 300,
  DEBOUNCE_DELAY: 300,
  SCROLL_THRESHOLD: 100,
  // Performance settings
  VIRTUAL_LIST_THRESHOLD: 100, // Start virtualizing after 100 items
  IMAGE_LAZY_LOADING_THRESHOLD: 2, // Load images 2 screens ahead
  MESSAGE_CACHE_SIZE: 1000, // Keep last 1000 messages in memory
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
    `/api/collab/users/${userId}/recent-users/initial`,
  RECENT_USERS_LOAD_MORE: (userId: string, page: number) =>
    `/api/collab/users/${userId}/recent-users/load-more?page=${page}`,
  RECENT_CONVERSATIONS: (userId: string) =>
    `/api/collab/users/${userId}/conversations`,
  SEND_MESSAGE: "/api/collab/messages/send",
  GET_MESSAGES: (userId1: string, userId2: string) =>
    `/api/collab/messages/${userId1}/${userId2}`,
  MARK_READ: (messageId: string) => `/api/collab/messages/${messageId}/read`,
  USER_GROUPS: (userId: string) => `/api/collab/groups/user/${userId}`,
  GROUP_MESSAGES: (groupId: string) => `/api/collab/chat/group/${groupId}`,
  SEND_GROUP_MESSAGE: (groupId: string) => `/api/collab/groups/${groupId}/messages`,
} as const;

export const ROUTES = {
  HOME: '/',
  CHAT: '/chat',
  SETTINGS: '/settings',
  PROFILE: '/profile',
} as const;
// REACT_APP_CURRENT_USER_ID=b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12 pnpm start