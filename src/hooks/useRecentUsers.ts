import { useState, useEffect, useCallback } from 'react';
import { recentUsersService, RecentUser, fetchLastMessageForUser } from '../services/recentUsersService';
import { APP_CONFIG } from '../constants';

interface UseRecentUsersReturn {
  recentUsers: RecentUser[];
  loading: boolean;
  hasMore: boolean;
  error: string | null;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
  currentPage: number;
}

export const useRecentUsers = (): UseRecentUsersReturn => {
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const loadInitial = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await recentUsersService.getInitialRecentUsers(APP_CONFIG.CURRENT_USER_ID);
      
      let users = response?.users || [];
      
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
      
      // Ensure we always have an array
      setRecentUsers(users);
      setHasMore(response?.hasMore || false);
      setCurrentPage(response?.currentPage || 1);
    } catch (err) {
      console.error('Error loading recent users:', err);
      setError(err instanceof Error ? err.message : 'Failed to load recent users');
      // Set empty array on error to prevent undefined
      setRecentUsers([]);
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

      // Ensure we always have an array
      setRecentUsers(prev => [...(prev || []), ...(response?.users || [])]);
      setHasMore(response?.hasMore || false);
      setCurrentPage(nextPage);
    } catch (err) {
      console.error('Error loading more users:', err);
      setError(err instanceof Error ? err.message : 'Failed to load more users');
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
    recentUsers,
    loading: loading || loadingMore,
    hasMore,
    error,
    loadMore,
    refresh,
    currentPage,
  };
};
