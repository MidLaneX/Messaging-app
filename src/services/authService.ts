/**
 * Authentication Service for Messaging App
 * 
 * This service handles authentication using the main app's user service database.
 * It communicates with the main app's authentication endpoints to login/register users.
 */

import { APP_CONFIG } from '../constants';

// Get the main app API URL from environment variable
const MAIN_APP_API_URL = process.env.REACT_APP_MAIN_APP_API_URL || 'http://localhost:8080/api';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  phone?: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  user_email: string;
  role: string;
  user_id: number;
}

export interface RefreshTokenRequest {
  refreshToken: string;
  deviceInfo: string;
}

export interface UserProfile {
  user_id: number;
  email: string;
  phone: string;
  first_name: string;
  last_name: string;
  job_title: string;
  department: string;
  role: {
    id: number;
    name: string;
    permissions: string;
    created_at: string;
    updated_at: string;
  };
  created_at: string;
}

class AuthService {
  private baseURL: string;

  constructor() {
    this.baseURL = MAIN_APP_API_URL;
  }

  /**
   * Login user with email and password
   */
  async login(data: LoginRequest): Promise<AuthResponse> {
    try {
      console.log('🔐 Attempting login to main app...');
      
      const response = await fetch(`${this.baseURL}/auth/initial/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Login failed: ${response.statusText}`);
      }

      const authData: AuthResponse = await response.json();
      console.log('✅ Login successful, user_id:', authData.user_id);
      
      return authData;
    } catch (error: any) {
      console.error('❌ Login error:', error);
      throw new Error(error.message || 'Failed to login');
    }
  }

  /**
   * Register new user
   */
  async register(data: RegisterRequest): Promise<AuthResponse> {
    try {
      console.log('📝 Attempting registration to main app...');
      
      const response = await fetch(`${this.baseURL}/auth/initial/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Registration failed: ${response.statusText}`);
      }

      const authData: AuthResponse = await response.json();
      console.log('✅ Registration successful, user_id:', authData.user_id);
      
      return authData;
    } catch (error: any) {
      console.error('❌ Registration error:', error);
      throw new Error(error.message || 'Failed to register');
    }
  }

  /**
   * Refresh access token
   */
  async refreshToken(data: RefreshTokenRequest): Promise<AuthResponse> {
    try {
      console.log('🔄 Refreshing token...');
      
      const response = await fetch(`${this.baseURL}/auth/initial/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Token refresh failed: ${response.statusText}`);
      }

      const authData: AuthResponse = await response.json();
      console.log('✅ Token refreshed successfully');
      
      return authData;
    } catch (error: any) {
      console.error('❌ Token refresh error:', error);
      throw new Error(error.message || 'Failed to refresh token');
    }
  }

  /**
   * Get user profile from main app
   */
  async getUserProfile(userId: number, accessToken: string): Promise<UserProfile> {
    try {
      console.log('👤 Fetching user profile from main app...');
      
      const response = await fetch(`${this.baseURL}/auth/user/profile/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to fetch user profile: ${response.statusText}`);
      }

      const profile: UserProfile = await response.json();
      console.log('✅ User profile fetched successfully');
      
      return profile;
    } catch (error: any) {
      console.error('❌ Get user profile error:', error);
      throw new Error(error.message || 'Failed to fetch user profile');
    }
  }

  /**
   * Logout user (call main app logout endpoint)
   */
  async logout(accessToken: string): Promise<void> {
    try {
      console.log('👋 Logging out from main app...');
      
      await fetch(`${this.baseURL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      console.log('✅ Logout successful');
    } catch (error: any) {
      console.error('❌ Logout error:', error);
      // Don't throw error on logout, just log it
    }
  }
}

export const authService = new AuthService();
