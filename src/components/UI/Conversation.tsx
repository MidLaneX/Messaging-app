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
      className={`flex items-center p-4 cursor-pointer border-b border-gray-100 hover:bg-gray-50 transition-all duration-200 ${
        isSelected ? 'bg-emerald-50 border-r-4 border-emerald-600 shadow-sm' : ''
      }`}
      onClick={handleSelect}
    >     
                  {/* Avatar */}
                  <div className="relative mr-4 flex-shrink-0">
                    <div className="w-12 h-12 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center text-xl shadow-sm border border-gray-200">
                      {conversation.avatar || (conversation.isGroup ? '👥' : '👤')}
                    </div>
                    {!conversation.isGroup && conversation.isOnline && (
                      <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full shadow-sm"></div>
                    )}
                    {conversation.isGroup && (
                      <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-blue-500 border-2 border-white rounded-full shadow-sm"></div>
                    )}
                  </div>

                  {/* Conversation Info */}
    <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-semibold text-gray-900 truncate text-base">
                        {conversation.name}
                      </h3>
                      <div className="text-xs text-emerald-600 ml-2 flex-shrink-0 font-medium">
                        {conversation.lastMessage && conversation.lastMessage.createdAt
                          ? formatRelativeTime(new Date(conversation.lastMessage.createdAt))
                          : conversation.lastSeen
                          ? formatRelativeTime(conversation.lastSeen)
                          : ''}
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <div className="text-sm truncate flex-1">
                        {conversation.lastMessage ? (
                          <div className="flex items-center space-x-1">
                            {/* Message Status Indicator */}
                            {conversation.lastMessage.senderId === currentUserId && (
                              <div className="flex-shrink-0">
                                <svg className="w-3.5 h-3.5 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              </div>
                            )}
                            
                            {/* Message Content */}
                            <div className="flex-1 min-w-0">
                              {conversation.isGroup ? (
                                <div className="flex items-center space-x-1">
                                  <span className="font-medium text-emerald-700 text-xs">
                                    {conversation.lastMessage.senderName || 'Someone'}:
                                  </span>
                                  <span className="text-gray-600 truncate">
                                    {truncateText(conversation.lastMessage.content, 25)}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-gray-600 truncate block">
                                  {truncateText(conversation.lastMessage.content, 30)}
                                </span>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center">
                            <span className="text-gray-400 italic text-xs">
                              {conversation.isGroup ? 'Group created' : 'Start your conversation'}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Unread Count Badge */}
                      {conversation.unreadCount > 0 && (
                        <div className="bg-gradient-to-r from-emerald-600 to-green-600 text-white text-xs font-semibold rounded-full min-w-[20px] h-5 flex items-center justify-center ml-3 px-1.5 shadow-sm">
                          {conversation.unreadCount > 99 ? '99+' : conversation.unreadCount}
                        </div>
                      )}
                    </div>
                  </div>
    </div>
  );
};

export default Conversation;