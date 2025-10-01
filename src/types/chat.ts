// Additional type definitions for enhanced ChatWindow component

export interface ChatWindowState {
  newMessage: string;
  isSearchVisible: boolean;
  searchQuery: string;
  isMenuOpen: boolean;
  isSending: boolean;
}

export interface ChatAction {
  type: string;
  payload?: any;
}

export interface MessageStatus {
  id: string;
  status: 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
  timestamp?: Date;
}

export interface TypingIndicator {
  userId: string;
  isTyping: boolean;
  timestamp: Date;
}

export interface ChatWindowConfig {
  enableSearch: boolean;
  enableMenu: boolean;
  enableFileAttachment: boolean;
  enableEmoji: boolean;
  maxMessageLength: number;
  autoScroll: boolean;
}

export interface ChatError {
  code: string;
  message: string;
  timestamp: Date;
  retryable: boolean;
}
