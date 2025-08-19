import { User, Message } from '../types';

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
