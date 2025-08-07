import React from 'react';
import { Message, User } from '../types';
import { formatMessageTime, formatMessageDate, isSameDay } from '../utils';

interface MessageItemProps {
  message: Message;
  isCurrentUser: boolean;
  showAvatar: boolean;
  user: User;
  previousMessage?: Message;
}

const MessageItem: React.FC<MessageItemProps> = ({ 
  message, 
  isCurrentUser, 
  showAvatar, 
  user,
  previousMessage
}) => {
  const formatTime = (date: Date): string => {
    return formatMessageTime(date);
  };

  const formatDate = (date: Date): string => {
    return formatMessageDate(date);
  };

  const shouldShowDateDivider = (messageDate: Date): boolean => {
    if (!previousMessage) return true; // Show for first message
    
    const prevDate = new Date(previousMessage.timestamp);
    const currentDate = new Date(messageDate);
    
    return !isSameDay(prevDate, currentDate);
  };

  const getMessageStatusIcon = () => {
    if (!isCurrentUser) return null;
    
    if (message.isRead) {
      return (
        <div className="flex items-center text-blue-400" title="Read">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          <svg className="w-4 h-4 -ml-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </div>
      );
    } else {
      return (
        <div className="flex items-center text-whatsapp-gray" title="Delivered">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </div>
      );
    }
  };

  return (
    <>
      {shouldShowDateDivider(message.timestamp) && (
        <div className="flex justify-center my-6 animate-fade-in">
          <span className="bg-whatsapp-gray-light text-whatsapp-gray-dark px-4 py-2 rounded-full text-xs font-medium shadow-sm border">
            {formatDate(message.timestamp)}
          </span>
        </div>
      )}
      
      <div className={`flex mb-1 animate-slide-up group ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
        {!isCurrentUser && showAvatar && (
          <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-sm mr-3 flex-shrink-0 self-end shadow-md">
            {user.avatar || '👤'}
          </div>
        )}
        
        <div className={`relative max-w-xs lg:max-w-md px-4 py-3 rounded-2xl transition-all duration-200 hover:shadow-lg ${
          isCurrentUser 
            ? 'bg-whatsapp-bubble-out text-gray-900 rounded-br-md shadow-md' 
            : 'bg-whatsapp-bubble-in text-gray-900 rounded-bl-md shadow-md border border-gray-100'
        }`}>
          {!isCurrentUser && showAvatar && (
            <div className="text-xs font-semibold text-whatsapp-green mb-1">
              {user.name}
            </div>
          )}
          
          <div className="text-sm leading-relaxed whitespace-pre-wrap break-words">
            {message.content}
          </div>
          
          <div className="flex items-center justify-end space-x-1 mt-2 text-xs text-whatsapp-gray">
            <span className="select-none">{formatTime(message.timestamp)}</span>
            {getMessageStatusIcon()}
          </div>
          
          {/* Enhanced Message tail with better styling */}
          {showAvatar && (
            <div className={`absolute bottom-0 ${
              isCurrentUser 
                ? '-right-1 w-0 h-0 border-l-[8px] border-l-whatsapp-bubble-out border-b-[8px] border-b-transparent'
                : '-left-1 w-0 h-0 border-r-[8px] border-r-whatsapp-bubble-in border-b-[8px] border-b-transparent'
            }`}></div>
          )}
        </div>
        
        {isCurrentUser && showAvatar && (
          <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center text-sm ml-3 flex-shrink-0 self-end shadow-md">
            {user.avatar || '👤'}
          </div>
        )}
      </div>
    </>
  );
};

export default MessageItem;
