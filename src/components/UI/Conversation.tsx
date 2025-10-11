import React from "react";
import { ConversationItem } from "../../hooks/useConversations";
import { formatRelativeTime } from "../../utils/dateUtils";
import { truncateText } from "../../utils";
import { usersMap } from "../../data/users";

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
  // Get sender name for group messages
  const getSenderName = () => {
    if (!conversation.isGroup || !conversation.lastMessage) return '';
    
    const senderId = conversation.lastMessage.senderId;
    if (senderId === currentUserId) return 'You';
    
    // Try to get from senderName field first, then from usersMap
    return conversation.lastMessage.senderName || 
           usersMap.get(senderId)?.name || 
           'Someone';
  };

  // Format last message content for display
  const getLastMessagePreview = () => {
    if (!conversation.lastMessage) return '';
    
    const message = conversation.lastMessage;
    
    // Handle file messages
    if (message.type === 'FILE') {
      const fileName = message.fileAttachment?.originalName || 
                      message.fileAttachment?.fileName || 
                      message.fileName || 
                      'File';
      
      // If there's text content with the file, show the text
      if (message.content && message.content.trim()) {
        return message.content;
      }
      
      // Otherwise show file indicator with name
      const fileIcon = getFileIcon(message.fileType || message.fileAttachment?.mimeType || '');
      return `${fileIcon} ${fileName}`;
    }
    
    // Handle regular text messages
    return message.content || '';
  };

  // Helper function to get file icon (inline for now)
  const getFileIcon = (mimeType: string): string => {
    if (mimeType.startsWith('image/')) return '🖼️';
    if (mimeType.includes('pdf')) return '📄';
    if (mimeType.startsWith('video/')) return '🎥';
    if (mimeType.startsWith('audio/')) return '🎵';
    if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('archive')) return '📦';
    if (mimeType.includes('document') || mimeType.includes('word') || mimeType.includes('doc')) return '📝';
    return '📎';
  };

  const senderName = getSenderName();
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
                    <div className="w-11 h-11 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center text-lg shadow-sm border border-gray-200 overflow-hidden">
                      {conversation.avatar && conversation.avatar.startsWith('http') ? (
                        <img
                          src={conversation.avatar}
                          alt={conversation.name}
                          className="w-full h-full object-cover rounded-full"
                          onError={(e) => {
                            // Fallback to default icon if image fails to load
                            const target = e.target as HTMLImageElement;
                            const parent = target.parentElement;
                            if (parent) {
                              parent.innerHTML = conversation.isGroup ? '👥' : '👤';
                            }
                          }}
                        />
                      ) : (
                        conversation.avatar || (conversation.isGroup ? '👥' : '👤')
                      )}
                    </div>
                    {!conversation.isGroup && conversation.isOnline && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full shadow-sm"></div>
                    )}
                    {conversation.isGroup && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full shadow-sm"></div>
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
                                  <span className="font-medium text-emerald-700 text-xs flex-shrink-0">
                                    {senderName}:
                                  </span>
                                  <span className="text-gray-600 truncate">
                                    {truncateText(getLastMessagePreview(), 25)}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-gray-600 truncate block">
                                  {conversation.lastMessage.senderId === currentUserId ? 
                                    `You: ${truncateText(getLastMessagePreview(), 26)}` :
                                    truncateText(getLastMessagePreview(), 30)}
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