import axios, { AxiosResponse } from 'axios';
import { User, Message } from '../types';
import { APP_CONFIG, API_ENDPOINTS } from '../constants';

// API User structure from backend
export interface ApiUser {
  id: string;
  username: string;
  email: string;
  displayName: string;
  status: string;
  createdAt: string;
  lastSeen: string;
  online: boolean;
}

// API Conversation structure from backend
export interface ApiConversation {
  id: string;
  user: ApiUser;
  lastMessage?: {
    id: string;
    senderId: string;
    recipientId: string;
    content: string;
    type: string;
    chatType: string;
    createdAt: string;
  };
  unreadCount: number;
}

// Spring Boot Page response structure
export interface SpringPageResponse<T> {
  content: T[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: {
      sorted: boolean;
      unsorted: boolean;
      empty: boolean;
    };
    offset: number;
    paged: boolean;
    unpaged: boolean;
  };
  totalPages: number;
  totalElements: number;
  last: boolean;
  sort: {
    sorted: boolean;
    unsorted: boolean;
    empty: boolean;
  };
  numberOfElements: number;
  first: boolean;
  size: number;
  number: number;
  empty: boolean;
}

export interface RecentUser extends User {
  lastMessage?: Message;
  unreadCount: number;
}

export interface RecentUsersResponse {
  users: RecentUser[];
  hasMore: boolean;
  currentPage: number;
  totalPages: number;
}

class RecentUsersService {
  private axiosInstance;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: APP_CONFIG.API_BASE_URL,
      timeout: 10000, // 10 seconds timeout
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor for adding auth headers if needed
    this.axiosInstance.interceptors.request.use(
      (config) => {
        // Add auth token if available
        // const token = localStorage.getItem('authToken');
        // if (token) {
        //   config.headers.Authorization = `Bearer ${token}`;
        // }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor for handling common errors
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Handle unauthorized access
          console.error('Unauthorized access - redirecting to login');
          // Could dispatch logout action here
        }
        return Promise.reject(error);
      }
    );
  }

  // Convert API user to our RecentUser format
  private convertApiUserToRecentUser(apiUser: ApiUser): RecentUser {
    return {
      id: apiUser.id,
      name: apiUser.displayName || apiUser.username,
      avatar: "👤", // Default avatar since API doesn't provide one
      lastSeen: new Date(apiUser.lastSeen),
      isOnline: apiUser.online,
      lastMessage: undefined, // TODO: Fetch last message separately if needed
      unreadCount: 0, // TODO: Fetch unread count separately if needed
    };
  }

  // Convert API conversation to our RecentUser format
  private convertApiConversationToRecentUser(apiConversation: ApiConversation): RecentUser {
    const user = apiConversation.user;
    return {
      id: user.id,
      name: user.displayName || user.username,
      avatar: "👤", // Default avatar since API doesn't provide one
      lastSeen: new Date(user.lastSeen),
      isOnline: user.online,
      lastMessage: apiConversation.lastMessage ? {
        id: apiConversation.lastMessage.id,
        senderId: apiConversation.lastMessage.senderId,
        recipientId: apiConversation.lastMessage.recipientId,
        content: apiConversation.lastMessage.content,
        type: apiConversation.lastMessage.type as any,
        chatType: apiConversation.lastMessage.chatType as any,
        createdAt: apiConversation.lastMessage.createdAt,
      } : undefined,
      unreadCount: apiConversation.unreadCount,
    };
  }

  async getInitialRecentUsers(userId: string): Promise<RecentUsersResponse> {
    try {
      // Try to fetch conversations first (with last messages)
      try {
        const conversationResponse: AxiosResponse<ApiConversation[]> = await this.axiosInstance.get(
          API_ENDPOINTS.RECENT_CONVERSATIONS(userId)
        );

        const recentUsers = conversationResponse.data.map(conversation => 
          this.convertApiConversationToRecentUser(conversation)
        );

        return {
          users: recentUsers,
          hasMore: false, // Conversations endpoint doesn't support pagination yet
          currentPage: 1,
          totalPages: 1,
        };
      } catch (conversationError) {
        console.warn('Conversations endpoint not available, falling back to users endpoint:', conversationError);
        
        // Fallback to the original users endpoint
        const response: AxiosResponse<SpringPageResponse<ApiUser>> = await this.axiosInstance.get(
          API_ENDPOINTS.RECENT_USERS_INITIAL(userId)
        );

        const pageData = response.data;
        const recentUsers = pageData.content.map(apiUser => this.convertApiUserToRecentUser(apiUser));

        return {
          users: recentUsers,
          hasMore: !pageData.last,
          currentPage: pageData.number,
          totalPages: pageData.totalPages,
        };
      }
    } catch (error) {
      console.error('Error fetching initial recent users:', error);
      // Return empty result as fallback
      return {
        users: [],
        hasMore: false,
        currentPage: 1,
        totalPages: 1,
      };
    }
  }

  async loadMoreRecentUsers(userId: string, page: number): Promise<RecentUsersResponse> {
    try {
      const response: AxiosResponse<SpringPageResponse<ApiUser>> = await this.axiosInstance.get(
        API_ENDPOINTS.RECENT_USERS_LOAD_MORE(userId, page)
      );

      const pageData = response.data;
      const recentUsers = pageData.content.map(apiUser => this.convertApiUserToRecentUser(apiUser));

      return {
        users: recentUsers,
        hasMore: !pageData.last,
        currentPage: pageData.number,
        totalPages: pageData.totalPages,
      };
    } catch (error) {
      console.error('Error loading more recent users:', error);
      
      // Log more details about the error
      if (axios.isAxiosError(error)) {
        console.error('Axios error details:', {
          message: error.message,
          status: error.response?.status,
          statusText: error.response?.statusText,
          url: error.config?.url,
        });
      }
      
      // Return empty result as fallback
      return {
        users: [],
        hasMore: false,
        currentPage: page,
        totalPages: page,
      };
    }
  }

  // Additional method to send a message (for future use)
  async sendMessage(senderId: string, receiverId: string, content: string): Promise<Message> {
    try {
      const response: AxiosResponse<Message> = await this.axiosInstance.post('/api/messages/send', {
        senderId,
        receiverId,
        content,
        type: 'text',
      });

      return response.data;
    } catch (error) {
      console.error('Error sending message:', error);
      
      if (axios.isAxiosError(error)) {
        console.error('Axios error details:', {
          message: error.message,
          status: error.response?.status,
          statusText: error.response?.statusText,
        });
      }
      
      throw error;
    }
  }

  // Method to mark messages as read
  async markMessagesAsRead(messageIds: string[]): Promise<void> {
    try {
      await this.axiosInstance.post('/api/messages/mark-read', {
        messageIds,
      });
    } catch (error) {
      console.error('Error marking messages as read:', error);
      
      if (axios.isAxiosError(error)) {
        console.error('Axios error details:', {
          message: error.message,
          status: error.response?.status,
          statusText: error.response?.statusText,
        });
      }
      
      throw error;
    }
  }

  // Method to get messages between two users
  async getMessagesBetweenUsers(userId1: string, userId2: string, page: number = 1, limit: number = 50): Promise<{
    messages: Message[];
    hasMore: boolean;
    currentPage: number;
    totalPages: number;
  }> {
    try {
      const response = await this.axiosInstance.get(`/api/messages/${userId1}/${userId2}`, {
        params: { page, limit },
      });

      return response.data;
    } catch (error) {
      console.error('Error fetching messages:', error);
      
      if (axios.isAxiosError(error)) {
        console.error('Axios error details:', {
          message: error.message,
          status: error.response?.status,
          statusText: error.response?.statusText,
        });
      }
      
      // Return empty result as fallback
      return {
        messages: [],
        hasMore: false,
        currentPage: 1,
        totalPages: 1,
      };
    }
  }

}

export const recentUsersService = new RecentUsersService();

// Helper function to fetch last message for a user pair
export async function fetchLastMessageForUser(currentUserId: string, otherUserId: string): Promise<Message | undefined> {
  try {
    const axios = (await import('axios')).default;
    const response = await axios.get(
      `${APP_CONFIG.API_BASE_URL}/api/users/${currentUserId}/chats/${otherUserId}?page=0&size=1`
    );
    
    const messages = response.data.content;
    if (messages && messages.length > 0) {
      return messages[0]; // Return the most recent message
    }
    return undefined;
  } catch (error) {
    console.warn(`Failed to fetch last message for user ${otherUserId}:`, error);
    return undefined;
  }
}