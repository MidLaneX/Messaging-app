/**
 * Message Persistence Service
 * Stores WebSocket messages in localStorage to survive page refreshes
 */

import { Message } from '../types';

class MessagePersistenceService {
  private readonly STORAGE_KEY = 'messaging_app_ws_messages';
  private readonly MAX_MESSAGES_PER_CHAT = 100; // Limit to prevent localStorage overflow

  /**
   * Save WebSocket messages to localStorage
   */
  saveWsMessages(messages: Message[]): void {
    try {
      // Group messages by conversation
      const messagesByConversation: Record<string, Message[]> = {};
      
      messages.forEach(msg => {
        const conversationId = this.getConversationId(msg);
        if (!messagesByConversation[conversationId]) {
          messagesByConversation[conversationId] = [];
        }
        messagesByConversation[conversationId].push(msg);
      });

      // Keep only the latest messages for each conversation
      Object.keys(messagesByConversation).forEach(conversationId => {
        messagesByConversation[conversationId] = messagesByConversation[conversationId]
          .sort((a, b) => new Date(b.createdAt || new Date()).getTime() - new Date(a.createdAt || new Date()).getTime())
          .slice(0, this.MAX_MESSAGES_PER_CHAT);
      });

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(messagesByConversation));
      console.log('💾 WebSocket messages saved to localStorage');
    } catch (error) {
      console.error('Failed to save WebSocket messages:', error);
    }
  }

  /**
   * Load WebSocket messages from localStorage
   */
  loadWsMessages(): Message[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) return [];

      const messagesByConversation: Record<string, Message[]> = JSON.parse(stored);
      const allMessages: Message[] = [];

      Object.values(messagesByConversation).forEach(messages => {
        allMessages.push(...messages);
      });

      console.log(`💾 Loaded ${allMessages.length} WebSocket messages from localStorage`);
      return allMessages;
    } catch (error) {
      console.error('Failed to load WebSocket messages:', error);
      return [];
    }
  }

  /**
   * Clear old WebSocket messages (older than 7 days)
   */
  cleanupOldMessages(): void {
    try {
      const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
      const messages = this.loadWsMessages();
      
      const recentMessages = messages.filter(msg => 
        new Date(msg.createdAt || new Date()).getTime() > sevenDaysAgo
      );

      this.saveWsMessages(recentMessages);
      console.log(`🗑️ Cleaned up old messages, kept ${recentMessages.length} recent messages`);
    } catch (error) {
      console.error('Failed to cleanup old messages:', error);
    }
  }

  /**
   * Get conversation ID for a message
   */
  private getConversationId(message: Message): string {
    if (message.chatType === 'GROUP') {
      return `group_${message.groupId}`;
    } else {
      // For private messages, create consistent conversation ID regardless of sender/recipient order
      const userIds = [message.senderId, message.recipientId].filter(Boolean).sort();
      return `private_${userIds.join('_')}`;
    }
  }

  /**
   * Get messages for a specific conversation
   */
  getMessagesForConversation(conversationId: string, isGroup: boolean): Message[] {
    const allMessages = this.loadWsMessages();
    
    return allMessages.filter(msg => {
      if (isGroup) {
        return msg.chatType === 'GROUP' && msg.groupId === conversationId;
      } else {
        return msg.chatType === 'PRIVATE' && (
          (msg.senderId === conversationId) || (msg.recipientId === conversationId)
        );
      }
    });
  }

  /**
   * Clear all stored messages
   */
  clearAllMessages(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    console.log('🗑️ All WebSocket messages cleared from localStorage');
  }
}

export const messagePersistence = new MessagePersistenceService();