import React, { useRef, useEffect, useState, useMemo } from "react";
import { User } from "../types";
import { formatRelativeTime, truncateText } from "../utils";
import { ConversationItem } from "../hooks/useConversations";

interface UserListProps {
  /** List of conversation items including users and groups */
  /** List of conversation items including users and groups */
    /** List of conversation items including users and groups */
    conversations: ConversationItem[];
  selectedUser: User | null;
  onUserSelect: (user: User) => void;
  currentUserId: string;
  loading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
}

type TabType = 'all' | 'users' | 'groups';

const UserList: React.FC<UserListProps> = ({
  conversations,
  selectedUser,
  onUserSelect,
  currentUserId,
  loading,
  hasMore,
  onLoadMore,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<TabType>('all');

  // Filter conversations based on active tab
  const filteredConversations = useMemo(() => {
    switch (activeTab) {
      case 'users':
        return conversations.filter((conv: ConversationItem) => !conv.isGroup);
      case 'groups':
        return conversations.filter((conv: ConversationItem) => conv.isGroup);
      case 'all':
      default:
        return conversations;
    }
  }, [conversations, activeTab]);

  // Count conversations by type
  const counts = useMemo(() => {
    const usersCount = conversations.filter((conv: ConversationItem) => !conv.isGroup).length;
    const groupsCount = conversations.filter((conv: ConversationItem) => conv.isGroup).length;
    return { users: usersCount, groups: groupsCount, all: conversations.length };
  }, [conversations]);

  const formatTime = (date: Date): string => {
    return formatRelativeTime(date);
  };

  // Handle scroll for infinite loading
  useEffect(() => {
    const handleScroll = () => {
      const scrollContainer = scrollRef.current;
      if (!scrollContainer || loading || !hasMore || activeTab === 'groups') return; // Only load more on 'all' tab

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
  }, [loading, hasMore, onLoadMore, activeTab]);

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
        
        {/* Search Bar */}
        <div className="relative mb-4">
          <input
            type="text"
            placeholder="Search or start new chat"
            className="w-full py-3 px-4 rounded-full bg-white text-gray-700 text-sm placeholder-green-700 focus:outline-none"
          />
          <div className="absolute right-3 top-3 text-green-700">🔍</div>
        </div>
      </div>

      {/* Tabs for filtering */}
      <div className="bg-white p-2 flex space-x-4 border-b border-gray-200">
        <button
          className={`flex-1 py-2 ${activeTab === 'all' ? 'border-b-2 border-green-700 text-green-700' : 'text-gray-500'}`}
          onClick={() => setActiveTab('all')}
        >All</button>
  <button 
          className={`flex-1 py-2 ${activeTab === 'users' ? 'border-b-2 border-green-700 text-green-700' : 'text-gray-500'}`}
          onClick={() => setActiveTab('users')}
        >Users</button>
        <button
          className={`flex-1 py-2 ${activeTab === 'groups' ? 'border-b-2 border-green-700 text-green-700' : 'text-gray-500'}`}
          onClick={() => setActiveTab('groups')}
        >Groups</button>
      </div>

      {/* Conversations List */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        {/* Tab Content Header */}
        {activeTab !== 'all' && (
          <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
            <h3 className="text-sm font-medium text-gray-600">
              {activeTab === 'users' ? 'Direct Messages' : 'Group Conversations'} 
            </h3>
          </div>
        )}

        {filteredConversations.length > 0
          ? filteredConversations.map((conversation: ConversationItem) => {
              const isSelected = selectedUser?.id === conversation.id;
              const handleSelect = () => {
                if (!conversation.isGroup) {
                  const user: User = {
                    id: conversation.id,
                    name: conversation.name,
                    avatar: conversation.avatar,
                    lastSeen: conversation.lastSeen,
                    isOnline: conversation.isOnline,
                  };
                  onUserSelect(user);
                } else {
                  // Convert group conversation into a User object with group metadata
                  const groupAsUser: User = {
                    id: conversation.id,
                    name: conversation.name,
                    avatar: conversation.avatar,
                    lastSeen: undefined,
                    isOnline: false,
                    isGroup: true,
                    participants: conversation.participants,
                  };
                  onUserSelect(groupAsUser);
                }
              };

              return (
                <div
                  key={conversation.id}
                  className={`flex items-center p-4 cursor-pointer border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                    isSelected ? 'bg-blue-50 border-r-4 border-green-700' : ''
                  }`}
                  onClick={handleSelect}
                >
                  {/* Avatar */}
                  <div className="relative mr-4 flex-shrink-0">
                    <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center text-xl">
                      {conversation.avatar || (conversation.isGroup ? '👥' : '👤')}
                    </div>
                    {!conversation.isGroup && conversation.isOnline && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                    )}
                    {conversation.isGroup && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-blue-500 border-2 border-white rounded-full"></div>
                    )}
                  </div>

                  {/* Conversation Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-medium text-gray-900 truncate text-base">
                        {conversation.name}
                        {conversation.isGroup && (
                          <span className="ml-1 text-xs text-gray-500">
                            ({conversation.participants?.length || 0} members)
                          </span>
                        )}
                      </h3>
                      <span className="text-xs text-green-700 ml-2 flex-shrink-0">
                        {conversation.lastMessage && conversation.lastMessage.createdAt
                          ? formatTime(new Date(conversation.lastMessage.createdAt))
                          : conversation.lastSeen
                          ? formatTime(conversation.lastSeen)
                          : ''}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <p className="text-sm text-green-700 truncate flex-1">
                        {conversation.lastMessage ? (
                          <>
                            {conversation.lastMessage.senderId === currentUserId && (
                              <span className="text-blue-500 mr-1">✓</span>
                            )}
                            {!conversation.isGroup && truncateText(conversation.lastMessage.content, 30)}
                            {conversation.isGroup && (
                              <span className="text-gray-600 mr-1">
                                {conversation.lastMessage.senderName || 'Someone'}:
                              </span>
                            )}
                            {truncateText(conversation.lastMessage.content, 30)}
                          </>
                        ) : (
                          <span className="italic">
                            {conversation.isGroup ? 'No messages in group yet' : 'No messages yet'}
                          </span>
                        )}
                      </p>

                      {conversation.unreadCount > 0 && (
                        <div className="bg-green-700 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center ml-2 flex-shrink-0">
                          {conversation.unreadCount > 99 ? '99+' : conversation.unreadCount}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          : /* Empty state when no conversations */
            !loading && (
              <div className="flex items-center justify-center h-full">
                <div className="text-center text-green-700">
                  <div className="text-4xl mb-2">
                    {activeTab === 'users' ? '👤' : activeTab === 'groups' ? '👥' : '💬'}
                  </div>
                  <p>
                    {activeTab === 'users' 
                      ? 'No direct messages yet'
                      : activeTab === 'groups'
                      ? 'No group conversations yet'
                      : 'No conversations yet'
                    }
                  </p>
                  {activeTab === 'groups' && (
                    <button
                      onClick={() => alert("Create Group clicked!")}
                      className="mt-3 bg-green-700 text-white px-4 py-2 rounded-full text-sm hover:bg-green-800 transition-colors"
                    >
                      Create your first group
                    </button>
                  )}
                </div>
              </div>
            )}

        {/* Loading indicator - only show on 'all' tab or when initially loading */}
        {loading && (activeTab === 'all' || conversations.length === 0) && (
          <div className="flex items-center justify-center p-4">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-green-700 border-t-transparent"></div>
            <span className="ml-2 text-sm text-green-700">Loading conversations...</span>
          </div>
        )}

        {/* No more conversations indicator - only on 'all' tab */}
        {!hasMore && activeTab === 'all' && conversations && conversations.length > 0 && (
          <div className="text-center p-4 text-sm text-green-700">
            No more conversations
          </div>
        )}
      </div>
    </div>
  );
};

export default UserList;
