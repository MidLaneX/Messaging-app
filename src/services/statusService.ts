import { StatusUpdate } from '../types';
import { APP_CONFIG } from '../constants';

/**
 * Service for handling user status updates
 */
export class StatusService {
  private onlineUsers: Record<string, boolean> = {};
  private lastSeenTimes: Record<string, Date> = {};

  /**
   * Update user online status
   */
  updateUserStatus(statusUpdate: StatusUpdate) {
    const isOnline = statusUpdate.status === 'ONLINE';
    this.onlineUsers[statusUpdate.userId] = isOnline;
    
    if (!isOnline && statusUpdate.lastSeen) {
      this.lastSeenTimes[statusUpdate.userId] = new Date(statusUpdate.lastSeen);
    }
  }

  /**
   * Get current online status for a user
   */
  isUserOnline(userId: string): boolean {
    return this.onlineUsers[userId] ?? false;
  }

  /**
   * Get last seen time for a user
   */
  getLastSeen(userId: string): Date | undefined {
    return this.lastSeenTimes[userId];
  }

  /**
   * Get all online users
   */
  getOnlineUsers(): string[] {
    return Object.keys(this.onlineUsers).filter(userId => this.onlineUsers[userId]);
  }

  /**
   * Clear all status data
   */
  clear() {
    this.onlineUsers = {};
    this.lastSeenTimes = {};
  }
}

export const statusService = new StatusService();
