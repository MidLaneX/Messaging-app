/**
 * ChatWindow Constants
 * Centralized configuration and constants for the ChatWindow component
 */

export const CHAT_CONSTANTS = {
  // UI Configurations
  MAX_MESSAGE_LENGTH: 4096,
  MAX_TEXTAREA_HEIGHT: 120, // pixels (approximately 6 lines)
  SCROLL_DELAY: 50, // milliseconds
  ANIMATION_DURATION: 200, // milliseconds
  
  // Search Configuration
  SEARCH_DEBOUNCE_DELAY: 300, // milliseconds
  MIN_SEARCH_LENGTH: 1,
  
  // Message Configuration
  MESSAGE_RETRY_ATTEMPTS: 3,
  MESSAGE_TIMEOUT: 30000, // 30 seconds
  
  // Visual Feedback
  TYPING_INDICATOR_TIMEOUT: 3000, // milliseconds
  MESSAGE_STATUS_TIMEOUT: 5000, // milliseconds
  
  // Accessibility
  ARIA_LIVE_REGION_DELAY: 1000, // milliseconds
  FOCUS_TRAP_DELAY: 100, // milliseconds
} as const;

export const CHAT_CLASSES = {
  // Base Layout
  container: 'flex-1 flex flex-col h-full bg-gradient-to-b from-gray-50 to-white',
  
  // Header
  header: 'bg-white shadow-sm border-b border-gray-200 px-6 py-4 flex items-center justify-between',
  headerTitle: 'font-semibold text-lg text-gray-900 leading-tight',
  headerSubtitle: 'text-sm text-gray-500',
  
  // Avatar
  avatar: 'w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-lg font-semibold text-white shadow-md',
  avatarOnline: 'absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 border-3 border-white rounded-full shadow-sm',
  avatarGroup: 'absolute -bottom-1 -right-1 w-4 h-4 bg-blue-400 border-3 border-white rounded-full shadow-sm',
  
  // Buttons
  button: 'p-2 rounded-full hover:bg-gray-100 transition-colors duration-200 text-gray-600 hover:text-gray-800',
  sendButton: 'p-3 rounded-full transition-all duration-200',
  sendButtonActive: 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105',
  sendButtonDisabled: 'bg-gray-200 text-gray-400 cursor-not-allowed',
  
  // Messages Area
  messagesContainer: 'flex-1 overflow-hidden flex flex-col bg-gray-50',
  messagesList: 'flex-1 overflow-y-auto px-6 py-4 space-y-4',
  emptyState: 'flex items-center justify-center h-full',
  emptyStateIcon: 'w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4',
  
  // Input Area
  inputContainer: 'bg-white border-t border-gray-200 px-6 py-4',
  inputWrapper: 'flex-1 bg-gray-50 rounded-2xl border border-gray-200 focus-within:border-blue-300 focus-within:bg-white transition-all duration-200',
  textarea: 'flex-1 border-none outline-none resize-none text-gray-900 placeholder-gray-500 bg-transparent text-base leading-6 max-h-32',
  
  // Menu
  menu: 'absolute right-0 mt-2 w-52 bg-white rounded-lg shadow-lg border border-gray-200 z-20 py-2',
  menuItem: 'w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors',
  menuItemDanger: 'w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors',
  
  // Search
  searchInput: 'w-full bg-gray-100 border border-gray-200 rounded-full px-4 py-2 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all',
  searchBadge: 'inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800',
} as const;

export const CHAT_MESSAGES = {
  // Empty States
  noMessages: 'No messages yet',
  noMessagesSubtext: 'Start the conversation with a friendly message!',
  noSearchResults: (query: string) => `No messages found for "${query}"`,
  
  // Loading States
  sending: 'Sending...',
  loading: 'Loading messages...',
  
  // Error States
  sendError: 'Failed to send message',
  loadError: 'Failed to load messages',
  networkError: 'Network connection error',
  
  // Actions
  retry: 'Retry',
  refresh: 'Refresh',
  close: 'Close',
  
  // Accessibility
  sendMessage: 'Send message',
  attachFile: 'Attach file',
  searchMessages: 'Search messages',
  moreOptions: 'More options',
  closeSearch: 'Close search',
  activeNow: 'Active now',
} as const;

export default {
  CHAT_CONSTANTS,
  CHAT_CLASSES,
  CHAT_MESSAGES,
};
