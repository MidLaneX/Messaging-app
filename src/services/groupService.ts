import axios, { AxiosResponse } from 'axios';
import { ChatRoom } from '../types';
import { APP_CONFIG, API_ENDPOINTS } from '../constants';

// API Group structure from backend
export interface ApiGroup {
  id: string;
  name: string;
  avatarUrl?: string;
  lastMessage?: any;
  unreadCount: number;
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
      participants: [],
      isGroup: true,
      name: api.name,
      avatar: api.avatarUrl,
      lastMessage: api.lastMessage,
      unreadCount: api.unreadCount,
    };
  }

  async getUserGroups(userId: string): Promise<ChatRoom[]> {
    const res: AxiosResponse<ApiGroup[]> = await this.axiosInstance.get(
      API_ENDPOINTS.USER_GROUPS(userId)
    );
    return res.data.map(this.convertApiGroup);
  }
}

export const groupService = new GroupService();
