import React, { useRef, useEffect } from "react";
import { User } from "../types";
import { formatRelativeTime, truncateText } from "../utils";
import { RecentUser } from "../services/recentUsersService";

interface UserListProps {
  users: RecentUser[];
  selectedUser: User | null;
  onUserSelect: (user: User) => void;
  currentUserId: string;
  loading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
}

const UserList: React.FC<UserListProps> = ({
  users,
  selectedUser,
  onUserSelect,
  currentUserId,
  loading,
  hasMore,
  onLoadMore,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const formatTime = (date: Date): string => {
    return formatRelativeTime(date);
  };

  // Handle scroll for infinite loading
  useEffect(() => {
    const handleScroll = () => {
      const scrollContainer = scrollRef.current;
      if (!scrollContainer || loading || !hasMore) return;

      const { scrollTop, scrollHeight, clientHeight } = scrollContainer;
      const isNearBottom = scrollTop + clientHeight >= scrollHeight - 100; // 100px threshold

      if (isNearBottom) {
        onLoadMore();
      }
    };

    const scrollContainer = scrollRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener("scroll", handleScroll);
      return () => scrollContainer.removeEventListener("scroll", handleScroll);
    }
  }, [loading, hasMore, onLoadMore]);

  return (
    <div className="w-100 min-w-[320px] bg-white border-r border-gray-200 flex flex-col h-full">
      {/* Header */}
      <div className="bg-green-700 text-white p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Chats</h2>
          <div className="flex space-x-2">
            <button
              className="bg-white text-green-700 font-semibold px-3 py-1 rounded-full shadow hover:bg-gray-100 transition-colors"
              title="Create Group"
              onClick={() => alert("Create Group clicked!")}
            >
              + Group
            </button>
            <button
              className="bg-white text-green-700 font-semibold px-3 py-1 rounded-full shadow hover:bg-gray-100 transition-colors"
              title="New Contact"
              onClick={() => alert("New Contact clicked!")}
            >
              + Contact
            </button>
          </div>
        </div>
        <div className="relative">
          <input
            type="text"
            placeholder="Search or start new chat"
            className="w-full py-3 px-4 rounded-full bg-white text-gray-700 text-sm placeholder-green-700 focus:outline-none"
          />
          <div className="absolute right-3 top-3 text-green-700">🔍</div>
        </div>
      </div>

      {/* Users List */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        {users && users.length > 0
          ? users.map((recentUser) => {
              const isSelected = selectedUser?.id === recentUser.id;

              return (
                <div
                  key={recentUser.id}
                  className={`flex items-center p-4 cursor-pointer border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                    isSelected ? "bg-blue-50 border-r-4 border-green-700" : ""
                  }`}
                  onClick={() => onUserSelect(recentUser)}
                >
                  {/* Avatar */}
                  <div className="relative mr-4 flex-shrink-0">
                    <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center text-xl">
                      {recentUser.avatar || "👤"}
                    </div>
                    {recentUser.isOnline && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                    )}
                  </div>

                  {/* User Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-medium text-gray-900 truncate text-base">
                        {recentUser.name}
                      </h3>
                      <span className="text-xs text-green-700 ml-2 flex-shrink-0">
                        {recentUser.lastMessage &&
                        recentUser.lastMessage.createdAt
                          ? formatTime(
                              new Date(recentUser.lastMessage.createdAt)
                            )
                          : recentUser.lastSeen
                          ? formatTime(recentUser.lastSeen)
                          : ""}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <p className="text-sm text-green-700 truncate flex-1">
                        {recentUser.lastMessage ? (
                          <>
                            {recentUser.lastMessage.senderId ===
                              currentUserId && (
                              <span className="text-blue-500 mr-1">✓</span>
                            )}
                            {truncateText(recentUser.lastMessage.content, 30)}
                          </>
                        ) : (
                          <span className="italic">No messages yet</span>
                        )}
                      </p>

                      {recentUser.unreadCount > 0 && (
                        <div className="bg-green-700 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center ml-2 flex-shrink-0">
                          {recentUser.unreadCount > 99
                            ? "99+"
                            : recentUser.unreadCount}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          : /* Empty state when no users */
            !loading && (
              <div className="flex items-center justify-center h-full">
                <div className="text-center text-green-700">
                  <div className="text-4xl mb-2">💬</div>
                  <p>No conversations yet</p>
                </div>
              </div>
            )}

        {/* Loading indicator */}
        {loading && (
          <div className="flex items-center justify-center p-4">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-whatsapp-green border-t-transparent"></div>
            <span className="ml-2 text-sm text-green-700">Loading...</span>
          </div>
        )}

        {/* No more users indicator */}
        {!hasMore && users && users.length > 0 && (
          <div className="text-center p-4 text-sm text-green-700">
            No more conversations
          </div>
        )}
      </div>
    </div>
  );
};

export default UserList;
