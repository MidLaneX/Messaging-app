import React, { useState, useRef, useEffect } from "react";
import { User, Message } from "../types";
import { formatLastSeen } from "../utils";
import MessageItem from "./MessageItem";
import ModernChatLanding from "./UI/ModernChatLanding";
import { sendChatMessage } from "../services/ws";

interface ChatWindowProps {
  selectedUser: User | null;
  currentUser: User;
  loadingMessages: boolean;
  messages: Message[];
  wsMessages: Message[];
  setWsMessages: React.Dispatch<React.SetStateAction<Message[]>>;
}

const ChatWindow: React.FC<ChatWindowProps> = ({
  selectedUser,
  currentUser,
  messages,
  wsMessages, // Now pre-filtered for the selected user
  setWsMessages,
}) => {
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Function to deduplicate and merge messages prioritizing WebSocket messages
  const getMergedMessages = () => {
    if (!selectedUser) return [];

    // Create a map to track unique messages by content + timestamp + sender
    const messageMap = new Map<string, Message>();

    // First add API messages
    messages.forEach(msg => {
      const key = `${msg.senderId}-${msg.content}-${new Date(msg.createdAt || "").getTime()}`;
      messageMap.set(key, msg);
    });

    // Then add WebSocket messages (they will overwrite API messages if they're the same)
    wsMessages.forEach(msg => {
      const key = `${msg.senderId}-${msg.content}-${new Date(msg.createdAt || "").getTime()}`;
      // WebSocket messages take precedence
      messageMap.set(key, msg);
    });

    // Convert back to array and sort by timestamp
    return Array.from(messageMap.values()).sort(
      (a, b) =>
        new Date(a.createdAt || "").getTime() -
        new Date(b.createdAt || "").getTime()
    );
  };

  const scrollToBottom = (behavior: 'auto' | 'smooth' = 'auto') => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
    // Fallback to scrollIntoView
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  // Immediately scroll to bottom when chat opens
  useEffect(() => {
    if (selectedUser) {
      // Use setTimeout to ensure DOM is updated
      setTimeout(() => scrollToBottom('auto'), 0);
    }
  }, [selectedUser]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom('auto');
  }, [messages, wsMessages]);

  // Get merged and deduplicated messages
  const mergedMessages = getMergedMessages();

  // Ensure we're at bottom after component renders
  useEffect(() => {
    if (selectedUser && mergedMessages.length > 0) {
      // Small delay to ensure DOM is fully rendered
      const timer = setTimeout(() => scrollToBottom('auto'), 50);
      return () => clearTimeout(timer);
    }
  }, [selectedUser, mergedMessages.length]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() && selectedUser) {
      const messageId = crypto.randomUUID();
      const message: Message = {
        id: messageId,
        senderId: currentUser.id,
        ...(selectedUser.isGroup 
          ? { groupId: selectedUser.id, chatType: "GROUP" as const }
          : { recipientId: selectedUser.id, chatType: "PRIVATE" as const }
        ),
        createdAt: new Date().toISOString(),
        content: newMessage.trim(),
        type: "TEXT" as Message["type"],
      };

      console.log("Sending message for user:", currentUser.id);
      console.log("Message type:", selectedUser.isGroup ? "GROUP" : "PRIVATE");

      // Optimistically add message to UI
      setWsMessages((prev) => [...prev, message]);
      setNewMessage("");
      
      // Smooth scroll for sending new message
      setTimeout(() => scrollToBottom('smooth'), 0);

      // Send via WebSocket
      const wsMessage = {
        senderId: currentUser.id,
        ...(selectedUser.isGroup 
          ? { groupId: selectedUser.id, chatType: "GROUP" }
          : { recipientId: selectedUser.id, chatType: "PRIVATE" }
        ),
        content: newMessage.trim(),
        type: "TEXT",
      };

      sendChatMessage(wsMessage)
        .then(() => {
          console.log("Message sent successfully");
          // Remove the optimistic message - the real one will come via WebSocket
          setWsMessages((prev) => prev.filter((msg) => msg.id !== messageId));
        })
        .catch((error) => {
          console.error("Failed to send message:", error);
          // Remove the optimistic message on error
          setWsMessages((prev) => prev.filter((msg) => msg.id !== messageId));
          // Re-add the text to input for retry
          setNewMessage(message.content);
        });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  const formatLastSeenText = (lastSeen: Date | undefined): string => {
    return formatLastSeen(lastSeen);
  };

  if (!selectedUser) {
    return <ModernChatLanding />;
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-whatsapp-bg bg-whatsapp-pattern">
      {/* Chat Header */}
      <div className="bg-green-700 text-white px-5 py-4 flex items-center justify-between border-b border-gray-200">
        <div className="flex items-center">
          <div className="relative mr-4">
            <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center text-lg">
              {selectedUser.avatar || (selectedUser.isGroup ? "👥" : "👤")}
            </div>
            {!selectedUser.isGroup && selectedUser.isOnline && (
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></div>
            )}
            {selectedUser.isGroup && (
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-blue-400 border-2 border-white rounded-full"></div>
            )}
          </div>
          <div>
            <h3 className="font-medium text-lg">
              {selectedUser.name}
            
            </h3>
            <p className="text-sm text-green-100">
              {selectedUser.isGroup ? (() => {
                const memberCount = selectedUser.memberCount || selectedUser.participants?.length || 0;
                console.log(`📊 Group ${selectedUser.name} member info:`, {
                  memberCount: selectedUser.memberCount,
                  participantsLength: selectedUser.participants?.length,
                  finalCount: memberCount,
                  participants: selectedUser.participants
                });
                return `Group • ${memberCount} members`;
              })()
                : selectedUser.isOnline
                ? "online"
                : formatLastSeenText(selectedUser.lastSeen)}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            className="p-2 rounded-full hover:bg-white hover:bg-opacity-10 transition-colors"
            title="Search"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                clipRule="evenodd"
              />
            </svg>
          </button>
          <button
            className="p-2 rounded-full hover:bg-white hover:bg-opacity-10 transition-colors"
            title="More options"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <div 
          ref={messagesContainerRef}
          className="flex-1 overflow-y-auto p-5" 
          style={{ scrollBehavior: 'auto' }}
        >
        

          {mergedMessages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-whatsapp-gray italic">
                No messages yet. Start the conversation!
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {mergedMessages.map((message, index, arr) => {
                  const isCurrentUser = message.senderId === currentUser.id;
                  const previousMessage =
                    index > 0 ? arr[index - 1] : undefined;

                  return (
                    <MessageItem
                      key={message.id || index}
                      message={message}
                      isCurrentUser={isCurrentUser}
                      showAvatar={
                        index === 0 ||
                        arr[index - 1].senderId !== message.senderId
                      }
                      user={isCurrentUser ? currentUser : selectedUser}
                      previousMessage={previousMessage}
                    />
                  );
                })}
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Message Input */}
      <div className="bg-whatsapp-gray-light px-5 py-3 border-t border-gray-200">
        <form onSubmit={handleSendMessage} className="flex items-end space-x-3">
          <button
            type="button"
            className="p-2 text-whatsapp-gray hover:text-whatsapp-gray-dark transition-colors"
            title="Attach file"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a1 1 0 112 0v4a7 7 0 11-14 0V7a5 5 0 0110 0v4a3 3 0 11-6 0V7a1 1 0 012 0v4a1 1 0 102 0V7a3 3 0 00-3-3z"
                clipRule="evenodd"
              />
            </svg>
          </button>

          <div className="flex-1 bg-white rounded-full px-4 py-2 flex items-center shadow-sm">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message"
              className="flex-1 border-none outline-none resize-none text-base leading-6 max-h-24"
              rows={1}
            />
            <button
              type="button"
              className="ml-2 p-1 text-whatsapp-gray hover:text-whatsapp-gray-dark"
              title="Add emoji"
            >
              😊
            </button>
          </div>

          <button
            type="submit"
            disabled={!newMessage.trim()}
            className={`p-3 rounded-full transition-colors ${
              newMessage.trim()
                ? "bg-green-700 hover:bg-green-700-dark text-white"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
            title="Send message"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatWindow;
