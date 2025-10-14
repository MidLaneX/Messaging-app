/**
 * User Mapping Service
 * 
 * This service handles the mapping between main app user IDs and collaboration service user IDs.
 * It fetches the collab service user ID using the main app user ID via the /by-user-id/{userId} endpoint.
 */

import { APP_CONFIG } from '../constants';

const COLLAB_API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

export interface CollabUser {
  id: string;
  userId: number; // Main app user ID
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  profilePictureUrl?: string;
  createdAt: string;
  updatedAt: string;
}

class UserMappingService {
  private readonly STORAGE_KEY = 'collab_user_mapping';
  private readonly MAIN_USER_ID_KEY = 'main_user_id';
  private readonly COLLAB_USER_ID_KEY = 'collab_user_id';
  private readonly ACCESS_TOKEN_KEY = 'access_token';

  /**
   * Get collab service user ID by main app user ID
   */
  async getCollabUserByMainUserId(mainUserId: number, accessToken?: string): Promise<CollabUser> {
    try {
      console.log(`🔍 Fetching collab user for main user ID: ${mainUserId}`);
      
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      
      // Add authorization header if token is provided
      if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
      }

      const response = await fetch(`${COLLAB_API_URL}/api/collab/users/by-user-id/${mainUserId}`, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('User not found in collaboration service. Please contact administrator.');
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to fetch collab user: ${response.statusText}`);
      }

      const collabUser: CollabUser = await response.json();
      console.log('✅ Collab user fetched successfully:', collabUser.id);
      
      // Store the mapping
      this.saveMapping(mainUserId, collabUser.id);
      
      return collabUser;
    } catch (error: any) {
      console.error('❌ Error fetching collab user:', error);
      throw new Error(error.message || 'Failed to fetch collaboration user');
    }
  }

  /**
   * Save user mapping to local storage
   */
  saveMapping(mainUserId: number, collabUserId: string): void {
    try {
      const mapping = {
        mainUserId,
        collabUserId,
        timestamp: new Date().toISOString(),
      };
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(mapping));
      localStorage.setItem(this.MAIN_USER_ID_KEY, mainUserId.toString());
      localStorage.setItem(this.COLLAB_USER_ID_KEY, collabUserId);
      
      console.log('💾 User mapping saved to local storage:', mapping);
    } catch (error) {
      console.error('❌ Error saving user mapping:', error);
    }
  }

  /**
   * Get saved mapping from local storage
   */
  getMapping(): { mainUserId: number; collabUserId: string } | null {
    try {
      const mappingStr = localStorage.getItem(this.STORAGE_KEY);
      if (!mappingStr) {
        return null;
      }
      
      const mapping = JSON.parse(mappingStr);
      return {
        mainUserId: mapping.mainUserId,
        collabUserId: mapping.collabUserId,
      };
    } catch (error) {
      console.error('❌ Error getting user mapping:', error);
      return null;
    }
  }

  /**
   * Get main app user ID from local storage
   */
  getMainUserId(): number | null {
    try {
      const userIdStr = localStorage.getItem(this.MAIN_USER_ID_KEY);
      return userIdStr ? parseInt(userIdStr, 10) : null;
    } catch (error) {
      console.error('❌ Error getting main user ID:', error);
      return null;
    }
  }

  /**
   * Get collab service user ID from local storage
   */
  getCollabUserId(): string | null {
    try {
      return localStorage.getItem(this.COLLAB_USER_ID_KEY);
    } catch (error) {
      console.error('❌ Error getting collab user ID:', error);
      return null;
    }
  }

  /**
   * Clear user mapping from local storage
   */
  clearMapping(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
      localStorage.removeItem(this.MAIN_USER_ID_KEY);
      localStorage.removeItem(this.COLLAB_USER_ID_KEY);
      console.log('🗑️ User mapping cleared from local storage');
    } catch (error) {
      console.error('❌ Error clearing user mapping:', error);
    }
  }

  /**
   * Save access token to local storage
   */
  saveAccessToken(token: string): void {
    try {
      localStorage.setItem(this.ACCESS_TOKEN_KEY, token);
      console.log('💾 Access token saved to local storage');
    } catch (error) {
      console.error('❌ Error saving access token:', error);
    }
  }

  /**
   * Get access token from local storage
   */
  getAccessToken(): string | null {
    try {
      return localStorage.getItem(this.ACCESS_TOKEN_KEY);
    } catch (error) {
      console.error('❌ Error getting access token:', error);
      return null;
    }
  }

  /**
   * Clear access token from local storage
   */
  clearAccessToken(): void {
    try {
      localStorage.removeItem(this.ACCESS_TOKEN_KEY);
      console.log('🗑️ Access token cleared from local storage');
    } catch (error) {
      console.error('❌ Error clearing access token:', error);
    }
  }

  /**
   * Clear all stored data
   */
  clearAll(): void {
    this.clearMapping();
    this.clearAccessToken();
  }
}

export const userMappingService = new UserMappingService();
