import { User, Message } from '../types';
import { APP_CONFIG } from '../constants';

// Enhanced API client with timeout and retry logic
class ApiClient {
  private baseURL: string;
  private timeout: number;
  private retryAttempts: number;

  constructor() {
    this.baseURL = APP_CONFIG.API_BASE_URL;
    this.timeout = APP_CONFIG.REQUEST_TIMEOUT;
    this.retryAttempts = APP_CONFIG.RETRY_ATTEMPTS;
  }

  async request<T>(url: string, options: RequestInit = {}): Promise<T> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    const requestOptions: RequestInit = {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
      try {
        const response = await fetch(`${this.baseURL}${url}`, requestOptions);
        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        return await response.json();
      } catch (error) {
        if (attempt === this.retryAttempts) {
          throw error;
        }
        
        // Exponential backoff
        const delay = APP_CONFIG.RETRY_DELAY * Math.pow(2, attempt - 1);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw new Error('Max retry attempts reached');
  }

  async get<T>(url: string): Promise<T> {
    return this.request<T>(url, { method: 'GET' });
  }

  async post<T>(url: string, data?: any): Promise<T> {
    return this.request<T>(url, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(url: string, data?: any): Promise<T> {
    return this.request<T>(url, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(url: string): Promise<T> {
    return this.request<T>(url, { method: 'DELETE' });
  }
}

export const apiClient = new ApiClient();

export interface MessageService {
  sendMessage(content: string, senderId: string, receiverId: string): Promise<Message>;
  getMessages(userId1: string, userId2: string): Promise<Message[]>;
  markAsRead(messageId: string): Promise<void>;
  subscribeToMessages(callback: (message: Message) => void): () => void;
}

export interface UserService {
  getUsers(): Promise<User[]>;
  getCurrentUser(): Promise<User>;
  updateUserStatus(userId: string, isOnline: boolean): Promise<void>;
  subscribeToUserUpdates(callback: (user: User) => void): () => void;
}

// Mock implementations for development
export class MockMessageService implements MessageService {
  async sendMessage(content: string, senderId: string, receiverId: string): Promise<Message> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    return {
      id: `msg-${Date.now()}`,
      senderId,
      recipientId: receiverId,
      content,
      createdAt: new Date().toISOString(),
      type: "TEXT",
      chatType: "PRIVATE",
    };
  }

  async getMessages(userId1: string, userId2: string): Promise<Message[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Return mock messages - in real app, this would fetch from API
    return [];
  }

  async markAsRead(messageId: string): Promise<void> {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 50));
  }

  subscribeToMessages(callback: (message: Message) => void): () => void {
    // Mock WebSocket subscription
    const interval = setInterval(() => {
      // Simulate receiving a message occasionally
      if (Math.random() > 0.99) {
        callback({
          id: `msg-${Date.now()}`,
          senderId: "user-1",
          recipientId: "current-user",
          content: "Mock real-time message",
          createdAt: new Date().toISOString(),
          type: "TEXT",
          chatType: "PRIVATE", // or 'group' depending on your ChatType enum/type
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }
}

export class MockUserService implements UserService {
  async getUsers(): Promise<User[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Return mock users - in real app, this would fetch from API
    return [];
  }

  async getCurrentUser(): Promise<User> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    return {
      id: 'current-user',
      name: 'You',
      isOnline: true,
    };
  }

  async updateUserStatus(userId: string, isOnline: boolean): Promise<void> {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  subscribeToUserUpdates(callback: (user: User) => void): () => void {
    // Mock WebSocket subscription for user status updates
    const interval = setInterval(() => {
      // Simulate user status changes occasionally
      if (Math.random() > 0.95) {
        callback({
          id: 'user-1',
          name: 'Alice Johnson',
          avatar: '👩‍💼',
          isOnline: Math.random() > 0.5,
          lastSeen: new Date(),
        });
      }
    }, 5000);

    return () => clearInterval(interval);
  }
}
