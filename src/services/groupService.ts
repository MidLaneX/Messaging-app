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
    // Use memberCount if available, otherwise fall back to members array length
    const participantCount = api.memberCount || (api.members ? api.members.length : 0);
    
    return {
      id: api.id,
      participants: api.members || [],
      isGroup: true,
      name: api.name,
      avatar: api.avatarUrl,
      lastMessage: api.lastMessage,
      unreadCount: api.unreadCount,
      memberCount: participantCount, // Add this field to track member count
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
       
       // Log the raw API data to debug member count issues
       console.log('📊 Raw groups data from API:', groups.map(g => ({
         id: g.id,
         name: g.name,
         memberCount: g.memberCount,
         membersLength: g.members?.length,
         members: g.members
       })));
       
       const convertedGroups = groups.map(this.convertApiGroup);
       console.log('📊 Converted groups:', convertedGroups.map(g => ({
         id: g.id,
         name: g.name,
         memberCount: g.memberCount,
         participantsLength: g.participants.length
       })));
       
       return convertedGroups;
    } catch (error) {
      console.error(`Failed to fetch groups for user ${userId}:`, error);
      throw error;
    }
  }
}

export const groupService = new GroupService();
