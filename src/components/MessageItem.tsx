import React from 'react';
import { Message, User } from '../types';
import { formatMessageTime, formatMessageDate, isSameDay } from '../utils';
import { usersMap } from '../data/users';
import { CollabUserProfile } from "../services/userService";
import FileAttachment from './UI/FileAttachment';

interface MessageItemProps {
  message: Message;
  isCurrentUser: boolean;
  showAvatar: boolean;
  user: User;
  previousMessage?: Message;
  isGroupChat?: boolean;
  /** Whether the component is being used on mobile */
  isMobile?: boolean;
  /** Current user ID for file access control */
  currentUserId?: string;
  /** User profiles map for displaying profile pictures */
  userProfiles?: Map<string, CollabUserProfile>;
}

const MessageItem: React.FC<MessageItemProps> = ({
  message,
  isCurrentUser,
  showAvatar,
  user,
  previousMessage,
  isGroupChat = false,
  isMobile = false,
  currentUserId = "",
  userProfiles,
}) => {
  const isImageUrl = (url: string): boolean => {
    try {
      const urlObj = new URL(url);
      // Check for common image domains and file extensions
      const isGoogleusercontent = urlObj.hostname.includes(
        "googleusercontent.com"
      );
      const hasImageExtension = /\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i.test(
        urlObj.pathname
      );
      const isProfilePicture =
        urlObj.search.includes("s96-c") || urlObj.search.includes("photo"); // Google profile pic indicators

      return isGoogleusercontent || hasImageExtension || isProfilePicture;
    } catch {
      return false;
    }
  };

  const isUrl = (text: string): boolean => {
    try {
      new URL(text);
      return true;
    } catch {
      return false;
    }
  };

  const renderMessageContent = (content: string) => {
    // Split content by spaces to check each word
    const words = content.split(/(\s+)/);

    return words.map((word, index) => {
      const trimmedWord = word.trim();

      // Check if the word is a URL
      if (trimmedWord && isUrl(trimmedWord)) {
        // Check if it's an image URL
        if (isImageUrl(trimmedWord)) {
          return (
            <div key={index} className="my-2">
              <img
                src={trimmedWord}
                alt="Shared image"
                className={`max-w-full rounded-lg shadow-sm ${
                  isMobile ? "max-h-48" : "max-h-64"
                }`}
                style={{ maxWidth: isMobile ? "200px" : "300px" }}
                onError={(e) => {
                  // If image fails to load, show as link instead
                  const target = e.target as HTMLImageElement;
                  const linkElement = document.createElement("a");
                  linkElement.href = trimmedWord;
                  linkElement.target = "_blank";
                  linkElement.rel = "noopener noreferrer";
                  linkElement.className =
                    "text-blue-400 hover:text-blue-300 underline break-all";
                  linkElement.textContent = trimmedWord;
                  target.parentNode?.replaceChild(linkElement, target);
                }}
              />
            </div>
          );
        } else {
          // Regular URL - render as clickable link
          return (
            <a
              key={index}
              href={trimmedWord}
              target="_blank"
              rel="noopener noreferrer"
              className={`${
                isCurrentUser
                  ? "text-blue-200 hover:text-blue-100"
                  : "text-blue-600 hover:text-blue-800"
              } underline break-all`}
            >
              {trimmedWord}
            </a>
          );
        }
      }

      // Return regular text (including spaces)
      return word;
    });
  };

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
    const userProfile = userProfiles?.get(senderId);

    // Use profile data if available, otherwise fallback to usersMap
    const senderName =
      userProfile?.displayName ||
      userProfile?.username ||
      message.senderName ||
      usersMap.get(senderId)?.name ||
      "Unknown User";

    const senderAvatar =
      userProfile?.profilePictureUrl || usersMap.get(senderId)?.avatar || "👤";

    return {
      senderName,
      senderAvatar,
      hasProfilePicture: !!userProfile?.profilePictureUrl,
    };
  };

  const senderInfo = getSenderInfo();

  const getMessageStatusIcon = () => {
    if (!isCurrentUser) return null;

    const iconSize = isMobile ? "w-2.5 h-2.5" : "w-3 h-3";

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
        <div
          className="flex items-center text-white opacity-70"
          title="Delivered"
        >
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
        <div
          className={`flex justify-center ${
            isMobile ? "my-2" : "my-4"
          } animate-fade-in`}
        >
          <span
            className={`bg-gray-100 text-gray-600 ${
              isMobile ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-xs"
            } rounded-full font-medium`}
          >
            {formatDate(
              message.createdAt ? new Date(message.createdAt) : new Date()
            )}
          </span>
        </div>
      )}

      <div
        className={`flex ${
          isMobile ? "mb-1.5" : "mb-2"
        } animate-slide-up group ${
          isCurrentUser ? "justify-end" : "justify-start"
        }`}
      >
        {!isCurrentUser && showAvatar && (
          <div
            className={`${
              isMobile ? "w-6 h-6 mr-1.5" : "w-8 h-8 mr-2"
            } rounded-full flex items-center justify-center flex-shrink-0 self-end overflow-hidden ${
              (isGroupChat && senderInfo?.hasProfilePicture) ||
              userProfiles?.get(message.senderId)?.profilePictureUrl
                ? "bg-gray-200"
                : "bg-gradient-to-br from-emerald-400 to-green-500"
            }`}
          >
            {(() => {
              // For group chats, use sender info
              if (isGroupChat && senderInfo) {
                if (
                  senderInfo.hasProfilePicture &&
                  senderInfo.senderAvatar.startsWith("http")
                ) {
                  return (
                    <img
                      src={senderInfo.senderAvatar}
                      alt={senderInfo.senderName}
                      className="w-full h-full object-cover rounded-full"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        const parent = target.parentElement;
                        if (parent) {
                          parent.className = parent.className.replace(
                            "bg-gray-200",
                            "bg-gradient-to-br from-emerald-400 to-green-500"
                          );
                          parent.innerHTML = "👤";
                        }
                      }}
                    />
                  );
                } else {
                  return (
                    <span
                      className={`${
                        isMobile ? "text-xs" : "text-xs"
                      } text-white`}
                    >
                      {senderInfo.senderAvatar}
                    </span>
                  );
                }
              }

              // For direct chats, use user profile
              const userProfile = userProfiles?.get(message.senderId);
              if (userProfile?.profilePictureUrl) {
                return (
                  <img
                    src={userProfile.profilePictureUrl}
                    alt={
                      userProfile.displayName || userProfile.username || "User"
                    }
                    className="w-full h-full object-cover rounded-full"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      const parent = target.parentElement;
                      if (parent) {
                        parent.className = parent.className.replace(
                          "bg-gray-200",
                          "bg-gradient-to-br from-emerald-400 to-green-500"
                        );
                        parent.innerHTML = user.avatar || "👤";
                      }
                    }}
                  />
                );
              }

              // Fallback to emoji avatar
              return (
                <span
                  className={`${isMobile ? "text-xs" : "text-xs"} text-white`}
                >
                  {user.avatar || "👤"}
                </span>
              );
            })()}
          </div>
        )}

        <div
          className={`relative ${
            isMobile ? "max-w-[280px]" : "max-w-xs lg:max-w-lg"
          } ${
            message.type === "FILE"
              ? ""
              : `${isMobile ? "px-3 py-2" : "px-4 py-3"}`
          } rounded-lg transition-all duration-200 ${
            isCurrentUser
              ? message.type === "FILE"
                ? "" // No background for file messages
                : "bg-green-600 text-white rounded-br-sm"
              : message.type === "FILE"
              ? "" // No background for file messages
              : "bg-white text-gray-900 rounded-bl-sm border border-gray-200"
          }`}
        >
          {/* Show sender name for group messages */}
          {!isCurrentUser &&
            showAvatar &&
            isGroupChat &&
            senderInfo &&
            message.type !== "FILE" && (
              <div
                className={`${
                  isMobile ? "text-xs" : "text-sm"
                } font-semibold text-emerald-600 mb-1`}
              >
                {senderInfo.senderName}
              </div>
            )}

          {/* Message Content */}
          {message.type === "FILE" && message.fileAttachment ? (
            <div className="space-y-2">
              {/* Sender name for file messages in group chat */}
              {!isCurrentUser && showAvatar && isGroupChat && senderInfo && (
                <div
                  className={`${
                    isMobile ? "text-xs" : "text-sm"
                  } font-semibold text-emerald-600 mb-2`}
                >
                  {senderInfo.senderName}
                </div>
              )}

              {/* File Attachment - clean presentation */}
              <FileAttachment
                fileAttachment={message.fileAttachment}
                currentUserId={currentUserId}
                isMobile={isMobile}
                isCurrentUser={isCurrentUser}
              />

              {/* Text content if any - shown below file */}
              {message.content && message.content.trim() && (
                <div
                  className={`${isMobile ? "px-3 py-2" : "px-4 py-3"} ${
                    isCurrentUser
                      ? "bg-green-600 text-white rounded-lg"
                      : "bg-white text-gray-900 rounded-lg border border-gray-200"
                  }`}
                >
                  <div
                    className={`${
                      isMobile
                        ? "text-sm leading-snug"
                        : "text-base leading-relaxed"
                    } whitespace-pre-wrap break-words`}
                  >
                    {renderMessageContent(message.content)}
                  </div>
                  <div
                    className={`flex items-center justify-end space-x-1 mt-1 ${
                      isMobile ? "text-xs" : "text-sm"
                    } opacity-70`}
                  >
                    <span className="select-none">
                      {formatTime(
                        message.createdAt
                          ? new Date(message.createdAt)
                          : new Date()
                      )}
                    </span>
                    {getMessageStatusIcon()}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Regular text message */
            <>
              <div
                className={`${
                  isMobile
                    ? "text-sm leading-snug"
                    : "text-base leading-relaxed"
                } whitespace-pre-wrap break-words`}
              >
                {renderMessageContent(message.content)}
              </div>
              <div
                className={`flex items-center justify-end space-x-1 mt-1 ${
                  isMobile ? "text-xs" : "text-sm"
                } opacity-70`}
              >
                <span className="select-none">
                  {formatTime(
                    message.createdAt ? new Date(message.createdAt) : new Date()
                  )}
                </span>
                {getMessageStatusIcon()}
              </div>
            </>
          )}

          {/* Message tail - hide for file-only messages */}
          {showAvatar && message.type !== "FILE" && (
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
          <div
            className={`${
              isMobile ? "w-6 h-6 ml-1.5" : "w-8 h-8 ml-2"
            } rounded-full flex items-center justify-center flex-shrink-0 self-end overflow-hidden ${
              user.avatar?.startsWith("http")
                ? "bg-gray-200"
                : "bg-gradient-to-br from-green-400 to-emerald-500"
            }`}
          >
            {user.avatar?.startsWith("http") ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="w-full h-full object-cover rounded-full"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  const parent = target.parentElement;
                  if (parent) {
                    parent.className = parent.className.replace(
                      "bg-gray-200",
                      "bg-gradient-to-br from-green-400 to-emerald-500"
                    );
                    parent.innerHTML = "👤";
                  }
                }}
              />
            ) : (
              <span
                className={`${isMobile ? "text-xs" : "text-xs"} text-white`}
              >
                {user.avatar || "👤"}
              </span>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default MessageItem;
