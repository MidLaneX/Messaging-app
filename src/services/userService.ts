import axios from 'axios';
import { APP_CONFIG } from '../constants';

export interface CollabUserProfile {
  id: string;
  username: string;
  email?: string;
  displayName?: string;
  status?: string;
  profilePictureUrl?: string;
  isOnline: boolean;
  lastSeen?: string;
  createdAt?: string;
}

class UserService {
  private axiosInstance;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: APP_CONFIG.API_BASE_URL,
      timeout: 10000,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  /**
   * Get user profile by ID
   */
  async getUserById(userId: string): Promise<CollabUserProfile | null> {
    try {
      console.log(`Fetching user profile for: ${userId}`);
      const response = await this.axiosInstance.get(`/api/users/${userId}`);
      console.log('User profile response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error(`Failed to fetch user ${userId}:`, error);
      return null;
    }
  }

  /**
   * Get user profile by username
   */
  async getUserByUsername(username: string): Promise<CollabUserProfile | null> {
    try {
      console.log(`Fetching user profile for username: ${username}`);
      const response = await this.axiosInstance.get(`/api/users/username/${username}`);
      console.log('User profile response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error(`Failed to fetch user by username ${username}:`, error);
      return null;
    }
  }

  /**
   * Get multiple users by IDs
   */
  async getUsersByIds(userIds: string[]): Promise<Map<string, CollabUserProfile>> {
    const userMap = new Map<string, CollabUserProfile>();
    
    try {
      // Fetch all users in parallel
      const promises = userIds.map(id => this.getUserById(id));
      const results = await Promise.allSettled(promises);
      
      results.forEach((result, index) => {
        if (result.status === 'fulfilled' && result.value) {
          userMap.set(userIds[index], result.value);
        }
      });
      
      console.log(`Fetched ${userMap.size} out of ${userIds.length} users`);
      return userMap;
    } catch (error) {
      console.error('Failed to fetch users:', error);
      return userMap;
    }
  }

  /**
   * Update user status
   */
  async updateUserStatus(userId: string, status: 'online' | 'offline'): Promise<void> {
    try {
      await this.axiosInstance.post(`/api/users/${userId}/status`, { status });
      console.log(`Updated user ${userId} status to ${status}`);
    } catch (error) {
      console.error(`Failed to update user status:`, error);
      throw error;
    }
  }
}

export const userService = new UserService();
