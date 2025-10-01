import { useState, useEffect, useCallback } from 'react';
import { recentUsersService, RecentUser, fetchLastMessageForUser } from '../services/recentUsersService';
import { groupService } from '../services/groupService';
import { APP_CONFIG } from '../constants';
import { ChatRoom } from '../types';

// Combined conversation item that can be either a user or group
export interface ConversationItem {
  id: string;
  name: string;
  avatar?: string;
  lastMessage?: any;
  unreadCount: number;
  lastSeen?: Date;
  isOnline: boolean;
  isGroup: boolean;
  // For groups
  participants?: string[];
  memberCount?: number;
  // For users
  userId?: string;
}

interface UseConversationsReturn {
  conversations: ConversationItem[];
  loading: boolean;
  hasMore: boolean;
  error: string | null;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
  currentPage: number;
}

// Helper function to convert RecentUser to ConversationItem
const convertUserToConversation = (user: RecentUser): ConversationItem => ({
  id: user.id,
  name: user.name,
  avatar: user.avatar,
  lastMessage: user.lastMessage,
  unreadCount: user.unreadCount,
  lastSeen: user.lastSeen,
  isOnline: user.isOnline,
  isGroup: false,
  userId: user.id,
});

// Helper function to convert ChatRoom (group) to ConversationItem
const convertGroupToConversation = (group: ChatRoom): ConversationItem => ({
  id: group.id,
  name: group.name || `Group ${group.id}`,
  avatar: group.avatar || '👥',
  lastMessage: group.lastMessage,
  unreadCount: group.unreadCount,
  lastSeen: undefined,
  isOnline: false, // Groups don't have online status
  isGroup: true,
  participants: group.participants,
  memberCount: group.memberCount,
});

export const useConversations = (): UseConversationsReturn => {
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const loadInitial = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch both recent users and groups in parallel
      console.log('Loading initial conversations for user:', APP_CONFIG.CURRENT_USER_ID);
      const usersPromise = recentUsersService.getInitialRecentUsers(APP_CONFIG.CURRENT_USER_ID);
      const groupsPromise = groupService.getUserGroups(APP_CONFIG.CURRENT_USER_ID)
        .then(groups => {
          console.log(`Fetched ${groups.length} groups for user ${APP_CONFIG.CURRENT_USER_ID}`);
          return groups;
        })
        .catch(err => {
          console.error('Error fetching groups in useConversations:', err);
          return [] as import('../types').ChatRoom[];
        });
      const [usersResponse, groupsResponse] = await Promise.all([usersPromise, groupsPromise]);
      
      let users = usersResponse?.users || [];
      let groups = Array.isArray(groupsResponse) ? groupsResponse : [];
      
      // If users don't have last messages, try to fetch them
      if (users.length > 0 && users.some(user => !user.lastMessage)) {
        console.log('Fetching last messages for users without them...');
        const usersWithMessages = await Promise.all(
          users.map(async (user) => {
            if (!user.lastMessage) {
              const lastMessage = await fetchLastMessageForUser(APP_CONFIG.CURRENT_USER_ID, user.id);
              return { ...user, lastMessage };
            }
            return user;
          })
        );
        users = usersWithMessages;
      }
      
      // If groups don't have last messages, try to fetch them
      if (groups.length > 0 && groups.some(group => !group.lastMessage)) {
        console.log('Fetching last messages for groups without them...');
        const { fetchLastMessageForGroup } = await import('../services/recentUsersService');
        const groupsWithMessages = await Promise.all(
          groups.map(async (group) => {
            if (!group.lastMessage) {
              const lastMessage = await fetchLastMessageForGroup(group.id);
              return { ...group, lastMessage };
            }
            return group;
          })
        );
        groups = groupsWithMessages;
      }
      
      // Convert to conversation items
      const userConversations = users.map(convertUserToConversation);
      const groupConversations = groups.map(convertGroupToConversation);
      
      console.log('🔍 Converted user conversations:', userConversations.map(c => ({
        id: c.id,
        name: c.name,
        lastMessage: c.lastMessage,
        isGroup: c.isGroup
      })));
      
      console.log('🔍 Converted group conversations:', groupConversations.map(c => ({
        id: c.id,
        name: c.name,
        lastMessage: c.lastMessage,
        isGroup: c.isGroup
      })));
      
      // Combine and sort by last message timestamp (most recent first)
      const allConversations = [...userConversations, ...groupConversations];
      allConversations.sort((a, b) => {
        const aTime = a.lastMessage?.createdAt ? new Date(a.lastMessage.createdAt).getTime() : -1;
        const bTime = b.lastMessage?.createdAt ? new Date(b.lastMessage.createdAt).getTime() : -1;
        return bTime - aTime;
      });
      
      setConversations(allConversations);
      setHasMore(usersResponse?.hasMore || false); // Only users have pagination for now
      setCurrentPage(usersResponse?.currentPage || 1);
    } catch (err) {
      console.error('Error loading conversations:', err);
      setError(err instanceof Error ? err.message : 'Failed to load conversations');
      setConversations([]);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;

    try {
      setLoadingMore(true);
      setError(null);

      const nextPage = currentPage + 1;
      const response = await recentUsersService.loadMoreRecentUsers(
        APP_CONFIG.CURRENT_USER_ID,
        nextPage
      );

      // Convert new users to conversations
      const newUserConversations = (response?.users || []).map(convertUserToConversation);
      
      // Add to existing conversations (groups are only loaded once)
      setConversations(prev => {
        const combined = [...(prev || []), ...newUserConversations];
        // Re-sort after adding new items
        return combined.sort((a, b) => {
          const aTime = a.lastMessage?.createdAt ? new Date(a.lastMessage.createdAt).getTime() : -1;
          const bTime = b.lastMessage?.createdAt ? new Date(b.lastMessage.createdAt).getTime() : -1;
          return bTime - aTime;
        });
      });
      
      setHasMore(response?.hasMore || false);
      setCurrentPage(nextPage);
    } catch (err) {
      console.error('Error loading more conversations:', err);
      setError(err instanceof Error ? err.message : 'Failed to load more conversations');
    } finally {
      setLoadingMore(false);
    }
  }, [currentPage, hasMore, loadingMore]);

  const refresh = useCallback(async () => {
    setCurrentPage(1);
    await loadInitial();
  }, [loadInitial]);

  useEffect(() => {
    loadInitial();
  }, [loadInitial]);

  return {
    conversations,
    loading: loading || loadingMore,
    hasMore,
    error,
    loadMore,
    refresh,
    currentPage,
  };
};
