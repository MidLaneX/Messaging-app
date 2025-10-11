import axios from 'axios';
import { APP_CONFIG } from '../constants';
import { ConversationItem } from './conversationPersistence';
import { userService, CollabUserProfile } from './userService';
import { createSafeDate } from '../utils';

export interface StartChatRequest {
  email: string;
}

export interface StartChatResponse {
  success: boolean;
  user?: CollabUserProfile;
  conversation?: ConversationItem;
  message?: string;
}

class ConversationService {
  private axiosInstance;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: APP_CONFIG.API_BASE_URL,
      timeout: 10000,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  /**
   * Start a new chat with a user by their email
   */
  async startChatByEmail(email: string, currentUserId: string): Promise<StartChatResponse> {
    try {
      console.log(`Starting chat with email: ${email}`);
      
      // First, search for the user by email
      const targetUser = await userService.getUserByEmail(email);
      
      if (!targetUser) {
        return {
          success: false,
          message: `No user found with email: ${email}`
        };
      }

      if (targetUser.id === currentUserId) {
        return {
          success: false,
          message: "You cannot start a chat with yourself"
        };
      }

      // Create conversation item for the UI
      const conversation: ConversationItem = {
        id: targetUser.id,
        name: targetUser.displayName || targetUser.username,
        avatar: targetUser.profilePictureUrl,
        lastMessage: undefined,
        unreadCount: 0,
        lastSeen: createSafeDate(targetUser.lastSeen),
        isOnline: targetUser.isOnline,
        isGroup: false,
        userId: targetUser.id
      };

      console.log('Chat started successfully with user:', targetUser);
      
      return {
        success: true,
        user: targetUser,
        conversation,
        message: `Chat started with ${targetUser.displayName || targetUser.username}`
      };

    } catch (error: any) {
      console.error('Error starting chat by email:', error);
      return {
        success: false,
        message: 'Failed to start chat. Please try again.'
      };
    }
  }

  /**
   * Search for users by query (username or email)
   */
  async searchUsers(query: string): Promise<CollabUserProfile[]> {
    try {
      return await userService.searchUsers(query);
    } catch (error) {
      console.error('Error searching users:', error);
      return [];
    }
  }

  /**
   * Get recent users for suggestions
   */
  async getRecentUsers(currentUserId: string, limit: number = 5): Promise<CollabUserProfile[]> {
    try {
      // This would typically come from a backend endpoint
      // For now, we'll return empty array and let suggestions be handled by search
      console.log('Getting recent users for suggestions');
      return [];
    } catch (error) {
      console.error('Error getting recent users:', error);
      return [];
    }
  }

  /**
   * Get user suggestions for new chat
   */
  async getUserSuggestions(currentUserId: string): Promise<string[]> {
    try {
      // This could be enhanced to return actual user suggestions from backend
      // For now, return some mock suggestions
      const mockSuggestions = [
        'john.doe@example.com',
        'sarah.smith@company.com', 
        'mike.johnson@organization.org'
      ];
      
      return mockSuggestions;
    } catch (error) {
      console.error('Error getting user suggestions:', error);
      return [];
    }
  }
}

export const conversationService = new ConversationService();