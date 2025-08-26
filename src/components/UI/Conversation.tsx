import React from "react";
import { ConversationItem } from "../../hooks/useConversations";
import { formatRelativeTime } from "../../utils/dateUtils";
import { truncateText } from "../../utils";

interface ConversationProps {
  conversation: ConversationItem;
  currentUserId: string;
  isSelected: boolean;
  handleSelect: () => void;
}

const Conversation: React.FC<ConversationProps> = ({
  conversation,
  currentUserId,
  isSelected,
  handleSelect,
}) => {
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
                    
                      </h3>
                      <span className="text-xs text-green-700 ml-2 flex-shrink-0">
                        {conversation.lastMessage && conversation.lastMessage.createdAt
                          ? formatRelativeTime(new Date(conversation.lastMessage.createdAt))
                          : conversation.lastSeen
                          ? formatRelativeTime(conversation.lastSeen)
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
};

export default Conversation;