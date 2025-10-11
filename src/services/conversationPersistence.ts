/**
 * Conversation Persistence Service
 * Stores conversation list in localStorage to survive page refreshes
 */

// Define ConversationItem interface here to avoid circular imports
export interface ConversationItem {
  id: string;
  name: string;
  avatar?: string;
  lastMessage?: any;
  unreadCount: number;
  lastSeen?: Date;
  isOnline: boolean;
  isGroup: boolean;
  // For groups
  participants?: string[];
  memberCount?: number;
  // For users
  userId?: string;
}

class ConversationPersistenceService {
  private readonly STORAGE_KEY = 'messaging_app_conversations';
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

  /**
   * Save conversations to localStorage with timestamp
   */
  saveConversations(conversations: ConversationItem[]): void {
    try {
      const data = {
        conversations,
        timestamp: Date.now(),
      };
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
      console.log(`💾 Saved ${conversations.length} conversations to localStorage`);
    } catch (error) {
      console.error('Failed to save conversations:', error);
    }
  }

  /**
   * Load conversations from localStorage if not expired
   */
  loadConversations(): ConversationItem[] | null {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) return null;

      const data = JSON.parse(stored);
      const { conversations, timestamp } = data;

      // Check if cache is still valid (not expired)
      const isExpired = Date.now() - timestamp > this.CACHE_DURATION;
      if (isExpired) {
        console.log('📱 Conversations cache expired, will refetch from API');
        this.clearConversations();
        return null;
      }

      console.log(`💾 Loaded ${conversations.length} conversations from localStorage cache`);
      return conversations;
    } catch (error) {
      console.error('Failed to load conversations:', error);
      this.clearConversations();
      return null;
    }
  }

  /**
   * Update a specific conversation in the stored list
   */
  updateConversation(conversationId: string, updates: Partial<ConversationItem>): void {
    try {
      const conversations = this.loadConversations();
      if (!conversations) return;

      const updatedConversations = conversations.map(conv =>
        conv.id === conversationId ? { ...conv, ...updates } : conv
      );

      this.saveConversations(updatedConversations);
      console.log(`💾 Updated conversation ${conversationId} in localStorage`);
    } catch (error) {
      console.error('Failed to update conversation:', error);
    }
  }

  /**
   * Add or update a conversation in the stored list
   */
  upsertConversation(conversation: ConversationItem): void {
    try {
      const conversations = this.loadConversations() || [];
      const existingIndex = conversations.findIndex(conv => conv.id === conversation.id);

      if (existingIndex >= 0) {
        // Update existing conversation
        conversations[existingIndex] = { ...conversations[existingIndex], ...conversation };
      } else {
        // Add new conversation at the beginning
        conversations.unshift(conversation);
      }

      // Sort by last message timestamp (most recent first)
      conversations.sort((a, b) => {
        const aTime = a.lastMessage?.createdAt ? new Date(a.lastMessage.createdAt).getTime() : -1;
        const bTime = b.lastMessage?.createdAt ? new Date(b.lastMessage.createdAt).getTime() : -1;
        return bTime - aTime;
      });

      this.saveConversations(conversations);
      console.log(`💾 Upserted conversation ${conversation.id} in localStorage`);
    } catch (error) {
      console.error('Failed to upsert conversation:', error);
    }
  }

  /**
   * Remove a conversation from the stored list
   */
  removeConversation(conversationId: string): void {
    try {
      const conversations = this.loadConversations();
      if (!conversations) return;

      const filteredConversations = conversations.filter(conv => conv.id !== conversationId);
      this.saveConversations(filteredConversations);
      console.log(`💾 Removed conversation ${conversationId} from localStorage`);
    } catch (error) {
      console.error('Failed to remove conversation:', error);
    }
  }

  /**
   * Clear all stored conversations
   */
  clearConversations(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
      console.log('🗑️ Cleared all conversations from localStorage');
    } catch (error) {
      console.error('Failed to clear conversations:', error);
    }
  }

  /**
   * Check if conversations cache is valid (not expired)
   */
  isCacheValid(): boolean {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) return false;

      const data = JSON.parse(stored);
      const { timestamp } = data;

      return Date.now() - timestamp <= this.CACHE_DURATION;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get cache age in minutes
   */
  getCacheAge(): number {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) return -1;

      const data = JSON.parse(stored);
      const { timestamp } = data;

      return Math.floor((Date.now() - timestamp) / (60 * 1000));
    } catch (error) {
      return -1;
    }
  }
}

export const conversationPersistence = new ConversationPersistenceService();