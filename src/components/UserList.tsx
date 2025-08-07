import React from 'react';
import { User, Message } from '../types';
import { formatRelativeTime, truncateText } from '../utils';

interface UserListProps {
  users: User[];
  selectedUser: User | null;
  onUserSelect: (user: User) => void;
  getLastMessage: (userId1: string, userId2: string) => Message | undefined;
  getUnreadCount: (senderId: string, receiverId: string) => number;
  currentUserId: string;
}

const UserList: React.FC<UserListProps> = ({ 
  users, 
  selectedUser, 
  onUserSelect, 
  getLastMessage,
  getUnreadCount,
  currentUserId 
}) => {
  const formatTime = (date: Date): string => {
    return formatRelativeTime(date);
  };

  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col h-full">
      {/* Header */}
      <div className="bg-whatsapp-green text-white p-5">
        <h2 className="text-xl font-semibold mb-4">Chats</h2>
        <div className="relative">
          <input 
            type="text" 
            placeholder="Search or start new chat" 
            className="w-full py-3 px-4 rounded-full bg-white text-gray-700 text-sm placeholder-whatsapp-gray focus:outline-none"
          />
          <div className="absolute right-3 top-3 text-whatsapp-gray">
            🔍
          </div>
        </div>
      </div>
      
      {/* Users List */}
      <div className="flex-1 overflow-y-auto">
        {users.map(user => {
          const lastMessage = getLastMessage(currentUserId, user.id);
          const unreadCount = getUnreadCount(user.id, currentUserId);
          const isSelected = selectedUser?.id === user.id;
          
          return (
            <div 
              key={user.id}
              className={`flex items-center p-4 cursor-pointer border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                isSelected ? 'bg-blue-50 border-r-4 border-whatsapp-green' : ''
              }`}
              onClick={() => onUserSelect(user)}
            >
              {/* Avatar */}
              <div className="relative mr-4 flex-shrink-0">
                <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center text-xl">
                  {user.avatar || '👤'}
                </div>
                {user.isOnline && (
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                )}
              </div>
              
              {/* User Info */}
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-medium text-gray-900 truncate text-base">
                    {user.name}
                  </h3>
                  <span className="text-xs text-whatsapp-gray ml-2 flex-shrink-0">
                    {lastMessage ? formatTime(lastMessage.timestamp) : 
                     user.lastSeen ? formatTime(user.lastSeen) : ''}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <p className="text-sm text-whatsapp-gray truncate flex-1">
                    {lastMessage ? (
                      <>
                        {lastMessage.senderId === currentUserId && (
                          <span className="text-blue-500 mr-1">✓</span>
                        )}
                        {truncateText(lastMessage.content, 30)}
                      </>
                    ) : (
                      <span className="italic">No messages yet</span>
                    )}
                  </p>
                  
                  {unreadCount > 0 && (
                    <div className="bg-whatsapp-green-light text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center ml-2 flex-shrink-0">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default UserList;
