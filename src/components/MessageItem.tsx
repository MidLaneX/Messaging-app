import React from 'react';
import { Message, User } from '../types';
import { formatMessageTime, formatMessageDate, isSameDay } from '../utils';
import { usersMap } from '../data/users';

interface MessageItemProps {
  message: Message;
  isCurrentUser: boolean;
  showAvatar: boolean;
  user: User;
  previousMessage?: Message;
  isGroupChat?: boolean;
  /** Whether the component is being used on mobile */
  isMobile?: boolean;
}

const MessageItem: React.FC<MessageItemProps> = ({ 
  message, 
  isCurrentUser, 
  showAvatar, 
  user,
  previousMessage,
  isGroupChat = false,
  isMobile = false
}) => {
  const formatTime = (date: Date): string => {
    return formatMessageTime(date);
  };

  const formatDate = (date: Date): string => {
    return formatMessageDate(date);
  };

  const shouldShowDateDivider = (messageDate: Date): boolean => {
    if (!previousMessage) return true; // Show for first message

    const prevDate = previousMessage.createdAt
      ? new Date(previousMessage.createdAt)
      : new Date();
    const currentDate = new Date(messageDate);

    return !isSameDay(prevDate, currentDate);
  };

  // Get sender information for group messages
  const getSenderInfo = () => {
    if (!isGroupChat || isCurrentUser) return null;
    
    const senderId = message.senderId;
    const senderName = message.senderName || usersMap.get(senderId)?.name || 'Unknown User';
    const senderAvatar = usersMap.get(senderId)?.avatar || '👤';
    
    return { senderName, senderAvatar };
  };

  const senderInfo = getSenderInfo();

  const getMessageStatusIcon = () => {
    if (!isCurrentUser) return null;

    const iconSize = isMobile ? 'w-2.5 h-2.5' : 'w-3 h-3';

    if (message.readAt) {
      return (
        <div className="flex items-center text-white opacity-70" title="Read">
          <svg className={iconSize} fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
          <svg
            className={`${iconSize} -ml-1`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      );
    } else {
      return (
        <div className="flex items-center text-white opacity-70" title="Delivered">
          <svg className={iconSize} fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      );
    }
  };

  return (
    <>
      {shouldShowDateDivider(
        message.createdAt ? new Date(message.createdAt) : new Date()
      ) && (
        <div className={`flex justify-center ${isMobile ? 'my-2' : 'my-4'} animate-fade-in`}>
          <span className={`bg-gray-100 text-gray-600 ${
            isMobile ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-xs'
          } rounded-full font-medium`}>
            {formatDate(
              message.createdAt ? new Date(message.createdAt) : new Date()
            )}
          </span>
        </div>
      )}

      <div
        className={`flex ${isMobile ? 'mb-1.5' : 'mb-2'} animate-slide-up group ${
          isCurrentUser ? "justify-end" : "justify-start"
        }`}
      >
        {!isCurrentUser && showAvatar && (
          <div className={`${
            isMobile ? 'w-6 h-6 text-xs mr-1.5' : 'w-8 h-8 text-xs mr-2'
          } bg-gradient-to-br from-emerald-400 to-green-500 rounded-full flex items-center justify-center flex-shrink-0 self-end`}>
            {isGroupChat && senderInfo ? senderInfo.senderAvatar : (user.avatar || "👤")}
          </div>
        )}

        <div
          className={`relative ${
            isMobile ? 'max-w-[280px] px-3 py-2' : 'max-w-xs lg:max-w-lg px-4 py-3'
          } rounded-lg transition-all duration-200 ${
            isCurrentUser
              ? "bg-green-600 text-white rounded-br-sm"
              : "bg-white text-gray-900 rounded-bl-sm border border-gray-200"
          }`}
        >
          {/* Show sender name for group messages */}
          {!isCurrentUser && showAvatar && isGroupChat && senderInfo && (
            <div className={`${
              isMobile ? 'text-xs' : 'text-sm'
            } font-semibold text-emerald-600 mb-1`}>
              {senderInfo.senderName}
            </div>
          )}

          <div className={`${
            isMobile ? 'text-sm leading-snug' : 'text-base leading-relaxed'
          } whitespace-pre-wrap break-words`}>
            {message.content}
          </div>

          <div className={`flex items-center justify-end space-x-1 mt-1 ${
            isMobile ? 'text-xs' : 'text-sm'
          } opacity-70`}>
            <span className="select-none">
              {formatTime(
                message.createdAt ? new Date(message.createdAt) : new Date()
              )}
            </span>
            {getMessageStatusIcon()}
          </div>

          {/* Message tail */}
          {showAvatar && (
            <div
              className={`absolute bottom-0 ${
                isCurrentUser
                  ? "-right-1 w-0 h-0 border-l-[8px] border-l-green-700 border-b-[8px] border-b-transparent"
                  : "-left-1 w-0 h-0 border-r-[8px] border-r-white border-b-[8px] border-b-transparent border-r-opacity-100"
              }`}
            ></div>
          )}
        </div>

        {isCurrentUser && showAvatar && (
          <div className={`${
            isMobile ? 'w-6 h-6 text-xs ml-1.5' : 'w-8 h-8 text-xs ml-2'
          } bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center flex-shrink-0 self-end`}>
            {user.avatar || "👤"}
          </div>
        )}
      </div>
    </>
  );
};

export default MessageItem;
