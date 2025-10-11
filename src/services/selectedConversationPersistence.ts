/**
 * Selected Conversation Persistence Service
 * Stores the currently selected conversation in localStorage to survive page refreshes
 */

import { User } from '../types';

class SelectedConversationPersistenceService {
  private readonly STORAGE_KEY = 'messaging_app_selected_conversation';

  /**
   * Save selected conversation to localStorage
   */
  saveSelectedConversation(user: User): void {
    try {
      const data = {
        user,
        timestamp: Date.now(),
      };
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
      console.log(`💾 Saved selected conversation: ${user.name} (${user.id})`);
    } catch (error) {
      console.error('Failed to save selected conversation:', error);
    }
  }

  /**
   * Load selected conversation from localStorage
   */
  loadSelectedConversation(): User | null {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) return null;

      const data = JSON.parse(stored);
      console.log(`💾 Loaded selected conversation: ${data.user.name} (${data.user.id})`);
      return data.user;
    } catch (error) {
      console.error('Failed to load selected conversation:', error);
      this.clearSelectedConversation();
      return null;
    }
  }

  /**
   * Clear selected conversation from localStorage
   */
  clearSelectedConversation(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
      console.log('🗑️ Cleared selected conversation from localStorage');
    } catch (error) {
      console.error('Failed to clear selected conversation:', error);
    }
  }

  /**
   * Check if a conversation is currently selected
   */
  hasSelectedConversation(): boolean {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return !!stored;
    } catch (error) {
      return false;
    }
  }
}

export const selectedConversationPersistence = new SelectedConversationPersistenceService();