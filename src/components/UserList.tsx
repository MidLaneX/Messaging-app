import React, { useRef, useEffect, useState, useMemo } from "react";
import { User } from "../types";
import { formatRelativeTime, truncateText } from "../utils";
import { ConversationItem } from "../hooks/useConversations";
import { useUser } from "../context/UserContext";
import Conversation from "./UI/Conversation";
import { SettingsModal, NewChatModal, CreateGroupModal } from "./modals";

interface UserListProps {
  /** List of conversation items including users and groups */
  conversations: ConversationItem[];
  selectedUser: User | null;
  onUserSelect: (user: User) => void;
  currentUserId: string;
  loading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  /** Whether the component is being used on mobile */
  isMobile?: boolean;
  /** Current user profile data with profile picture URL */
  currentUserProfile?: {
    username?: string;
    profilePictureUrl?: string;
    displayName?: string;
  };
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
  isMobile = false,
  currentUserProfile,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showNewChat, setShowNewChat] = useState(false);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const { currentUserName, logout } = useUser();

  const handleLogout = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    logout();
    setShowLogoutConfirm(false);
  };

  const cancelLogout = () => {
    setShowLogoutConfirm(false);
  };

  const handleSettings = () => {
    setShowSettings(true);
  };

  const handleNewChat = () => {
    setShowNewChat(true);
  };

  const handleCreateGroup = () => {
    setShowCreateGroup(true);
  };

  const handleNewChatSubmit = (email: string) => {
    console.log('Adding contact:', email);
    // TODO: Implement contact addition logic
    alert(`Contact request sent to: ${email}`);
  };

  const handleCreateGroupSubmit = (groupData: { name: string; description: string }) => {
    console.log('Creating group:', groupData);
    // TODO: Implement group creation logic
    alert(`Group "${groupData.name}" created successfully!`);
  };

  // Filter conversations based on active tab and search query
  const filteredConversations = useMemo(() => {
    let filtered = conversations;

    // Filter by tab
    switch (activeTab) {
      case 'users':
        filtered = filtered.filter((conv: ConversationItem) => !conv.isGroup);
        break;
      case 'groups':
        filtered = filtered.filter((conv: ConversationItem) => conv.isGroup);
        break;
      case 'all':
      default:
        break;
    }

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter((conv: ConversationItem) =>
        conv.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (conv.lastMessage?.content?.toLowerCase().includes(searchQuery.toLowerCase()) || false)
      );
    }

    return filtered;
  }, [conversations, activeTab, searchQuery]);

  // Count conversations by type
  const counts = useMemo(() => {
    const usersCount = conversations.filter((conv: ConversationItem) => !conv.isGroup).length;
    const groupsCount = conversations.filter((conv: ConversationItem) => conv.isGroup).length;
    return { users: usersCount, groups: groupsCount, all: conversations.length };
  }, [conversations]);

  const getUserAvatar = () => {
    // If we have a profile picture URL, return an img element
    if (currentUserProfile?.profilePictureUrl) {
      return (
        <img
          src={currentUserProfile.profilePictureUrl}
          alt={currentUserProfile.displayName || currentUserProfile.username || currentUserName || "User"}
          className="w-full h-full object-cover rounded-full"
          onError={(e) => {
            // Fallback to emoji if image fails to load
            const target = e.target as HTMLImageElement;
            const parent = target.parentElement;
            if (parent) {
              parent.innerHTML = currentUserName === "Parakrama" ? "👨‍💼" : "👨‍💻";
            }
          }}
        />
      );
    }
    // Fallback to emoji avatars
    return currentUserName === "Parakrama" ? "👨‍💼" : "👨‍💻";
  };

  const getUserStatusColor = () => {
    return "bg-green-500"; // Always online for demo
  };

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
    <div className={`${
      isMobile ? 'w-full  h-[100dvh] flex flex-col' : 'w-[400px] min-w-[400px] '
    } bg-white border-r border-gray-200 flex flex-col h-full shadow-sm`}>
      {/* Professional Green Header */}
      <div className={`bg-gradient-to-r from-emerald-800 to-green-700 text-white shadow-lg ${
        isMobile ? 'flex-shrink-0' : ''
      }`}>
        {/* User Profile Section */}
        <div className={`${isMobile ? 'p-3' : 'px-5 py-6'} border-b border-emerald-600`}>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className={`${
                isMobile ? 'w-10 h-10 text-lg' : 'w-12 h-12 text-xl'
              } bg-white bg-opacity-15 rounded-full backdrop-blur-sm ring-2 ring-white ring-opacity-30 shadow-lg flex items-center justify-center overflow-hidden`}>
                {getUserAvatar()}
              </div>
              <div className={`absolute -bottom-1 -right-1 ${
                isMobile ? 'w-3 h-3' : 'w-3.5 h-3.5'
              } ${getUserStatusColor()} rounded-full border-2 border-white shadow-md`}></div>
            </div>
            <div className="flex-1 min-w-0">
              <h2 className={`${
                isMobile ? 'text-lg' : 'text-xl'
              } font-bold text-white truncate tracking-tight`}>
                {currentUserProfile?.displayName || currentUserProfile?.username || currentUserName}
              </h2>
              <p className="text-emerald-100 font-medium mt-0.5">
                Available
              </p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={handleSettings}
                className={`${
                  isMobile ? 'p-2' : 'p-2.5'
                } hover:bg-white hover:bg-opacity-20 rounded-lg transition-all duration-200 group flex items-center justify-center`}
                title="Settings"
              >
                <svg className={`${
                  isMobile ? 'w-5 h-5' : 'w-6 h-6'
                } text-emerald-100 group-hover:text-white transition-colors`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
              <button
                onClick={handleNewChat}
                className={`${
                  isMobile ? 'p-2' : 'p-2.5'
                } hover:bg-white hover:bg-opacity-20 rounded-lg transition-all duration-200 group flex items-center justify-center`}
                title="New Chat"
              >
                <svg className={`${
                  isMobile ? 'w-5 h-5' : 'w-6 h-6'
                } text-emerald-100 group-hover:text-white transition-colors`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
              <button
                onClick={handleCreateGroup}
                className={`${
                  isMobile ? 'p-2' : 'p-2.5'
                } hover:bg-white hover:bg-opacity-20 rounded-lg transition-all duration-200 group flex items-center justify-center`}
                title="Create Group"
              >
                <svg className={`${
                  isMobile ? 'w-5 h-5' : 'w-6 h-6'
                } text-emerald-100 group-hover:text-white transition-colors`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Enhanced Search Bar */}
        <div className={`${isMobile ? 'p-3' : 'p-5'}`}>
          <div className="relative">
            {/* icon */}
            <div className="absolute inset-y-0 z-10 left-0 pl-4 flex items-center pointer-events-none">
              <svg className={`${isMobile ? 'h-4.5 w-4.5' : 'h-5 w-5'} text-emerald-200`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            {/* input */}
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`block w-full ${
                isMobile ? 'pl-10 pr-3 py-2.5 text-sm' : 'pl-12 pr-4 py-3 text-base'
              } border-0 rounded-xl bg-white bg-opacity-15 backdrop-blur-sm text-white placeholder-emerald-200 focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:bg-opacity-25 transition-all duration-200 shadow-inner`}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-4 flex items-center group z-10"
              >
                <svg className={`${isMobile ? 'h-4.5 w-4.5' : 'h-5 w-5'} text-emerald-300 group-hover:text-white transition-colors`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Professional Green Tabs */}
      <div className={`bg-white border-b border-green-100 ${
        isMobile ? 'flex-shrink-0' : ''
      }`}>
        <div className="flex">
          <button
            className={`flex-1 ${
              isMobile ? 'py-2 px-2 text-xs' : 'py-3 px-4 text-sm'
            } font-medium transition-all duration-200 relative ${
              activeTab === 'all'
                ? 'text-green-700 bg-green-50'
                : 'text-gray-500 hover:text-green-600 hover:bg-green-50'
            }`}
            onClick={() => setActiveTab('all')}
          >
            All Chats
            {activeTab === 'all' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-600 rounded-t-sm"></div>
            )}
          </button>
          <button
            className={`flex-1 ${
              isMobile ? 'py-2 px-2 text-xs' : 'py-3 px-4 text-sm'
            } font-medium transition-all duration-200 relative ${
              activeTab === 'users'
                ? 'text-green-700 bg-green-50'
                : 'text-gray-500 hover:text-green-600 hover:bg-green-50'
            }`}
            onClick={() => setActiveTab('users')}
          >
            Direct
            {activeTab === 'users' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-600 rounded-t-sm"></div>
            )}
          </button>
          <button
            className={`flex-1 ${
              isMobile ? 'py-2 px-2 text-xs' : 'py-3 px-4 text-sm'
            } font-medium transition-all duration-200 relative ${
              activeTab === 'groups'
                ? 'text-green-700 bg-green-50'
                : 'text-gray-500 hover:text-green-600 hover:bg-green-50'
            }`}
            onClick={() => setActiveTab('groups')}
          >
            Groups
            {activeTab === 'groups' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-600 rounded-t-sm"></div>
            )}
          </button>
        </div>
      </div>

      {/* Conversations List */}
      <div ref={scrollRef} className={`flex-1 overflow-y-auto bg-gray-50 ${
        isMobile ? 'min-h-0' : ''
      }`}>
        {searchQuery && (
          <div className="px-4 py-2 bg-white border-b border-gray-100">
            <p className="text-sm text-gray-600">
              {filteredConversations.length} result{filteredConversations.length !== 1 ? 's' : ''} for "{searchQuery}"
            </p>
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
                    memberCount: conversation.memberCount,
                  };
                  onUserSelect(groupAsUser);
                }
              };

              return (
                <div key={conversation.id} className="bg-white border-b border-gray-100 last:border-b-0">
                  <Conversation
                    conversation={conversation}
                    currentUserId={currentUserId}
                    isSelected={isSelected}
                    handleSelect={handleSelect}
                  />
                </div>
              );
            })
          : !loading && (
              <div className="flex items-center justify-center h-full bg-white">
                <div className="text-center text-gray-500 p-8">
                  <div className="text-5xl mb-4 opacity-50">
                    {searchQuery ? '🔍' : activeTab === 'users' ? '👤' : activeTab === 'groups' ? '👥' : '💬'}
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {searchQuery ? 'No matches found' : 
                     activeTab === 'users' ? 'No direct messages' :
                     activeTab === 'groups' ? 'No group conversations' : 
                     'No conversations yet'}
                  </h3>
                  <p className="text-gray-500 mb-4">
                    {searchQuery ? `No conversations match "${searchQuery}"` :
                     activeTab === 'users' ? 'Start a new conversation with someone' :
                     activeTab === 'groups' ? 'Create a group to start chatting' :
                     'Start your first conversation'}
                  </p>
                  {!searchQuery && activeTab === 'groups' && (
                    <button
                      onClick={handleCreateGroup}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors shadow-sm"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Create Group
                    </button>
                  )}
                </div>
              </div>
            )}

        {/* Professional Green Loading Indicator */}
        {loading && (activeTab === 'all' || conversations.length === 0) && (
          <div className="flex items-center justify-center p-6 bg-white">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-green-600 border-t-transparent"></div>
              <span className="text-sm text-gray-600 font-medium">Loading conversations...</span>
            </div>
          </div>
        )}

        {/* Green Load More Indicator */}
        {!hasMore && activeTab === 'all' && conversations && conversations.length > 0 && !searchQuery && (
          <div className="text-center p-4 bg-white">
            <div className="inline-flex items-center text-sm text-gray-500">
              <svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              All conversations loaded
            </div>
          </div>
        )}
      </div>

      {/* Professional Green Footer with Logout */}
      <div className={`bg-white border-t border-green-100 ${
        isMobile ? 'flex-shrink-0 p-3' : 'p-4'
      }`}>
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center space-x-3 py-3 px-4 text-gray-700 hover:bg-green-50 rounded-lg transition-all duration-200 group border border-transparent hover:border-green-200"
        >
          <svg className="w-5 h-5 text-gray-400 group-hover:text-green-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span className="font-medium group-hover:text-green-600 transition-colors">Sign Out</span>
        </button>
      </div>

      {/* Professional Modal Components */}
      <SettingsModal 
        isOpen={showSettings} 
        onClose={() => setShowSettings(false)} 
      />
      
      <NewChatModal 
        isOpen={showNewChat} 
        onClose={() => setShowNewChat(false)}
        onSubmit={handleNewChatSubmit}
      />
      
      <CreateGroupModal 
        isOpen={showCreateGroup} 
        onClose={() => setShowCreateGroup(false)}
        onSubmit={handleCreateGroupSubmit}
      />

      {/* Professional Green Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full mx-4 overflow-hidden border border-green-100">
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">Sign Out</h3>
                  <p className="text-sm text-green-600">Confirm your action</p>
                </div>
              </div>
              <p className="text-gray-600 mb-6">
                Are you sure you want to sign out? You'll need to select your account again to continue chatting.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={cancelLogout}
                  className="flex-1 py-2.5 px-4 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors border border-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmLogout}
                  className="flex-1 py-2.5 px-4 text-white bg-green-600 hover:bg-green-700 rounded-lg font-medium transition-colors shadow-sm"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserList;
