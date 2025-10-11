import { useState, useEffect, useCallback } from 'react';
import { recentUsersService, RecentUser, fetchLastMessageForUser } from '../services/recentUsersService';
import { groupService } from '../services/groupService';
import { conversationPersistence, ConversationItem } from '../services/conversationPersistence';
import { APP_CONFIG } from '../constants';
import { ChatRoom } from '../types';

// Re-export ConversationItem for backward compatibility
export type { ConversationItem };

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

      // First, try to load from cache if available and not expired
      const cachedConversations = conversationPersistence.loadConversations();
      if (cachedConversations && cachedConversations.length > 0) {
        setConversations(cachedConversations);
        setLoading(false);
        console.log('📱 Using cached conversations');
        return;
      }

      // Load fresh data from API
      console.log('🔄 Loading conversations from API...');
      const usersResponse = await recentUsersService.getInitialRecentUsers(APP_CONFIG.CURRENT_USER_ID);
      const groupsResponse = await groupService.getUserGroups(APP_CONFIG.CURRENT_USER_ID).catch(() => []);
      
      const users = usersResponse?.users || [];
      const groups = Array.isArray(groupsResponse) ? groupsResponse : [];
      
      // Convert to conversation items
      const userConversations = users.map(convertUserToConversation);
      const groupConversations = groups.map(convertGroupToConversation);
      
      // Combine and sort by last message timestamp
      const allConversations = [...userConversations, ...groupConversations];
      allConversations.sort((a, b) => {
        const aTime = a.lastMessage?.createdAt ? new Date(a.lastMessage.createdAt).getTime() : -1;
        const bTime = b.lastMessage?.createdAt ? new Date(b.lastMessage.createdAt).getTime() : -1;
        return bTime - aTime;
      });
      
      setConversations(allConversations);
      setHasMore(usersResponse?.hasMore || false);
      setCurrentPage(usersResponse?.currentPage || 1);

      // Save to cache
      conversationPersistence.saveConversations(allConversations);

    } catch (err) {
      console.error('Error loading conversations:', err);
      setError(err instanceof Error ? err.message : 'Failed to load conversations');
      setConversations([]);
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
        const sorted = combined.sort((a, b) => {
          const aTime = a.lastMessage?.createdAt ? new Date(a.lastMessage.createdAt).getTime() : -1;
          const bTime = b.lastMessage?.createdAt ? new Date(b.lastMessage.createdAt).getTime() : -1;
          return bTime - aTime;
        });

        // Update cache with new conversations
        conversationPersistence.saveConversations(sorted);
        return sorted;
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
    conversationPersistence.clearConversations();
    await loadInitial();
  }, [loadInitial]);

  useEffect(() => {
    loadInitial();
  }, [loadInitial]);

  return {
    conversations,
    loading,
    hasMore,
    error,
    loadMore,
    refresh,
    currentPage,
  };
};
