import axios, { AxiosResponse } from 'axios';
import { ChatRoom } from '../types';
import { APP_CONFIG, API_ENDPOINTS } from '../constants';

// API Group structure from backend
export interface ApiGroup {
  id: string;
  name: string;
  description?: string;
  avatarUrl?: string;
  lastMessage?: any;
  unreadCount: number;
  memberCount?: number;
  createdAt?: string;
  updatedAt?: string;
  members?: string[]; // Array of member user IDs
}

class GroupService {
  private axiosInstance;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: APP_CONFIG.API_BASE_URL,
      timeout: 10000,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  private convertApiGroup(api: ApiGroup): ChatRoom {
    return {
      id: api.id,
      participants: api.members || [],
      isGroup: true,
      name: api.name,
      avatar: api.avatarUrl,
      lastMessage: api.lastMessage,
      unreadCount: api.unreadCount,
    };
  }

  async getUserGroups(userId: string): Promise<ChatRoom[]> {
    try {
      console.log(`Fetching groups for user: ${userId}`);
       const res = await this.axiosInstance.get(
         API_ENDPOINTS.USER_GROUPS(userId)
       );
       // Handle both array responses and paginated SpringPageResponse
       const data = res.data as ApiGroup[] | { content: ApiGroup[] };
       const groups: ApiGroup[] = Array.isArray(data)
         ? data
         : (data.content || []);
       return groups.map(this.convertApiGroup);
    } catch (error) {
      console.error(`Failed to fetch groups for user ${userId}:`, error);
      throw error;
    }
  }
}

export const groupService = new GroupService();
