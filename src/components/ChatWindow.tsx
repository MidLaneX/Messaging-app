/**
 * ChatWindow Component - Professional messaging interface
 * 
 * Features:
 * - Real-time messaging with WebSocket support
 * - Message deduplication and merging
 * - Search functionality with highlighting
 * - Responsive design with modern UI
 * - Accessibility features (ARIA labels, keyboard navigation)
 * - Auto-scrolling and textarea auto-resize
 * - Loading states and error handling
 * - Optimistic UI updates
 */

import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { User, Message } from "../types";
import { formatLastSeen, generateUUID } from "../utils";
import MessageItem from "./MessageItem";
import ModernChatLanding from "./UI/ModernChatLanding";
import EmojiPicker from "./UI/EmojiPicker";
import FileAttachmentMenu from "./UI/FileAttachmentMenu";
import { sendChatMessage } from "../services/ws";

interface ChatWindowProps {
  /** Currently selected user/group for conversation */
  selectedUser: User | null;
  /** Current authenticated user */
  currentUser: User;
  /** Loading state for message fetching */
  loadingMessages: boolean;
  /** Messages from API/database */
  messages: Message[];
  /** Real-time messages from WebSocket (pre-filtered for selected user) */
  wsMessages: Message[];
  /** Function to update WebSocket messages */
  setWsMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  /** Whether the component is being used on mobile */
  isMobile?: boolean;
  /** Callback for back button press on mobile */
  onBackPress?: () => void;
  /** Whether keyboard is open on mobile (for layout adjustments) */
  isKeyboardOpen?: boolean;
}

const ChatWindow: React.FC<ChatWindowProps> = ({
  selectedUser,
  currentUser,
  messages,
  wsMessages, // Now pre-filtered for the selected user
  setWsMessages,
  isMobile = false,
  onBackPress,
  isKeyboardOpen = false,
}) => {
  const [newMessage, setNewMessage] = useState("");
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const attachmentMenuRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Function to deduplicate and merge messages prioritizing WebSocket messages
  const getMergedMessages = useCallback(() => {
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
  }, [selectedUser, messages, wsMessages]);

  const scrollToBottom = useCallback((behavior: 'auto' | 'smooth' = 'auto') => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
    // Fallback to scrollIntoView
    messagesEndRef.current?.scrollIntoView({ behavior });
  }, []);

  // Auto-resize textarea
  const adjustTextareaHeight = useCallback(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      const maxHeight = 120; // 6 lines roughly
      textareaRef.current.style.height = `${Math.min(scrollHeight, maxHeight)}px`;
    }
  }, []);

  // Handle message input change
  const handleMessageChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewMessage(e.target.value);
    adjustTextareaHeight();
  }, [adjustTextareaHeight]);

  // Handle search functionality
  const handleSearchToggle = useCallback(() => {
    setIsSearchVisible(prev => !prev);
    setSearchQuery("");
  }, []);

  // Handle menu toggle
  const handleMenuToggle = useCallback(() => {
    setIsMenuOpen(prev => !prev);
  }, []);

  // Handle emoji selection
  const handleEmojiSelect = useCallback((emoji: string) => {
    setNewMessage(prev => prev + emoji);
    setShowEmojiPicker(false);
    adjustTextareaHeight();
    // Focus back to textarea
    textareaRef.current?.focus();
  }, [adjustTextareaHeight]);

  // Handle file attachment
  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      console.log('Selected file:', file);
      
      // Check file size (limit to 10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        alert('File size too large. Please select a file under 10MB.');
        return;
      }
      
      // TODO: Implement file upload logic here
      // For now, just add a placeholder message with file info
      const fileInfo = `📎 ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`;
      setNewMessage(prev => prev + fileInfo + ' ');
      adjustTextareaHeight();
    }
    setShowAttachmentMenu(false);
    // Reset the input value so the same file can be selected again
    event.target.value = '';
  }, [adjustTextareaHeight]);

  // Handle attachment menu actions
  const handleAttachmentAction = useCallback((action: string) => {
    if (fileInputRef.current) {
      switch (action) {
        case 'image':
          fileInputRef.current.accept = 'image/*,video/*';
          fileInputRef.current.click();
          break;
        case 'document':
          fileInputRef.current.accept = '.pdf,.doc,.docx,.txt,.xls,.xlsx,.ppt,.pptx';
          fileInputRef.current.click();
          break;
        case 'camera':
          // TODO: Implement camera capture
          fileInputRef.current.accept = 'image/*';
          fileInputRef.current.setAttribute('capture', 'environment');
          fileInputRef.current.click();
          break;
        default:
          break;
      }
    }
    setShowAttachmentMenu(false);
  }, []);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false);
      }
      if (attachmentMenuRef.current && !attachmentMenuRef.current.contains(event.target as Node)) {
        setShowAttachmentMenu(false);
      }
    };

    if (isMenuOpen || showEmojiPicker || showAttachmentMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMenuOpen, showEmojiPicker, showAttachmentMenu]);

  // Immediately scroll to bottom when chat opens
  useEffect(() => {
    if (selectedUser) {
      // Use setTimeout to ensure DOM is updated
      setTimeout(() => scrollToBottom('auto'), 0);
      // Clear search when switching users
      setSearchQuery("");
      setIsSearchVisible(false);
      setIsMenuOpen(false);
      setShowEmojiPicker(false);
      setShowAttachmentMenu(false);
    }
  }, [selectedUser, scrollToBottom]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom('auto');
  }, [messages.length, wsMessages.length, scrollToBottom]);

  // Auto-resize textarea on mount and message change
  useEffect(() => {
    adjustTextareaHeight();
  }, [newMessage, adjustTextareaHeight]);

  // Handle iOS Safari keyboard behavior
  useEffect(() => {
    if (!isMobile) return;

    const handleFocusIn = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        // Prevent automatic zoom on iOS
        target.style.fontSize = '16px';
        // Scroll to input after a delay
        setTimeout(() => {
          target.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 300);
      }
    };

    const handleFocusOut = () => {
      // Reset any zoom that might have occurred
      const bodyStyle = document.body.style as any;
      if (bodyStyle.zoom) {
        bodyStyle.zoom = '1';
      }
    };

    document.addEventListener('focusin', handleFocusIn);
    document.addEventListener('focusout', handleFocusOut);

    return () => {
      document.removeEventListener('focusin', handleFocusIn);
      document.removeEventListener('focusout', handleFocusOut);
    };
  }, [isMobile]);

  // Get merged and deduplicated messages
  const allMessages = useMemo(() => getMergedMessages(), [getMergedMessages]);

  const filteredMessages = useMemo(
    () => allMessages.filter(message =>
      message.content.toLowerCase().includes(searchQuery.toLowerCase())
    ),
    [allMessages, searchQuery]
  );

  const formatLastSeenText = useCallback((lastSeen: Date | undefined): string => {
    return formatLastSeen(lastSeen);
  }, []);

  const handleSendMessage = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUser || isSending) return;

    setIsSending(true);
    const messageId = generateUUID();
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
    
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
    
    // Smooth scroll for sending new message
    setTimeout(() => scrollToBottom('smooth'), 0);

    // Send via WebSocket
    const wsMessage = {
      senderId: currentUser.id,
      ...(selectedUser.isGroup 
        ? { groupId: selectedUser.id, chatType: "GROUP" }
        : { recipientId: selectedUser.id, chatType: "PRIVATE" }
      ),
      content: message.content,
      type: "TEXT",
    };

    try {
      await sendChatMessage(wsMessage);
      console.log("Message sent successfully");
      // Remove the optimistic message - the real one will come via WebSocket
      setWsMessages((prev) => prev.filter((msg) => msg.id !== messageId));
    } catch (error) {
      console.error("Failed to send message:", error);
      // Remove the optimistic message on error
      setWsMessages((prev) => prev.filter((msg) => msg.id !== messageId));
      // Re-add the text to input for retry
      setNewMessage(message.content);
    } finally {
      setIsSending(false);
    }
  }, [newMessage, selectedUser, isSending, currentUser.id, setWsMessages, scrollToBottom]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      if (isSearchVisible) {
        setIsSearchVisible(false);
        setSearchQuery("");
      } else if (isMenuOpen) {
        setIsMenuOpen(false);
      } else if (showEmojiPicker) {
        setShowEmojiPicker(false);
      } else if (showAttachmentMenu) {
        setShowAttachmentMenu(false);
      }
    }
  }, [isSearchVisible, isMenuOpen, showEmojiPicker, showAttachmentMenu]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  }, [handleSendMessage]);

  if (!selectedUser) {
    return <ModernChatLanding />;
  }

  return (
    <div 
      className={`flex-1 flex flex-col bg-gray-50 ${
        isMobile ? 'h-full relative' : 'h-full'
      }`}
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      {/* Chat Header */}
      <div className={`bg-gradient-to-r from-emerald-800 to-green-700 text-white shadow-md border-b border-emerald-700 ${
        isMobile ? 'fixed top-0 left-0 right-0 z-50 px-4 py-3' : 'px-6 py-4'
      } flex items-center justify-between`}
      style={isMobile ? { 
        paddingTop: 'max(12px, env(safe-area-inset-top))',
        paddingLeft: 'max(16px, env(safe-area-inset-left))',
        paddingRight: 'max(16px, env(safe-area-inset-right))'
      } : {}}>
        {!isSearchVisible ? (
          <>
            <div className="flex items-center">
              {/* Back button for mobile */}
              {isMobile && onBackPress && (
                <button
                  onClick={onBackPress}
                  className="p-2 mr-2.5 rounded-full hover:bg-emerald-500 hover:bg-opacity-20 transition-colors duration-200 text-white"
                  title="Back to conversations"
                  aria-label="Back to conversations"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
              )}
              
              <div className={`relative flex-shrink-0 ${isMobile ? 'mr-3' : 'mr-4'}`}>
                <div className={`${
                  isMobile ? 'w-10 h-10 text-base' : 'w-12 h-12 text-lg'
                } bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center font-semibold text-white shadow-lg ring-2 ring-emerald-400 ring-opacity-50`}>
                  {selectedUser.avatar || (selectedUser.isGroup ? "👥" : selectedUser.name.charAt(0).toUpperCase())}
                </div>
                {!selectedUser.isGroup && selectedUser.isOnline && (
                  <div className={`absolute -bottom-0.5 -right-0.5 ${
                    isMobile ? 'w-3 h-3' : 'w-3.5 h-3.5'
                  } bg-emerald-400 border-2 border-white rounded-full shadow-md`}></div>
                )}
                {selectedUser.isGroup && (
                  <div className={`absolute -bottom-0.5 -right-0.5 ${
                    isMobile ? 'w-3 h-3' : 'w-3.5 h-3.5'
                  } bg-emerald-500 border-2 border-white rounded-full shadow-md`}></div>
                )}
              </div>
              <div className="flex flex-col justify-center">
                <h3 className={`${
                  isMobile ? 'text-base' : 'text-xl'
                } font-semibold text-white leading-tight tracking-tight`}>{selectedUser.name}</h3>
                <p className={`${
                  isMobile ? 'text-xs' : 'text-sm'
                } text-emerald-100 font-medium`}>
                  {selectedUser.isGroup
                    ? `${selectedUser.memberCount || selectedUser.participants?.length || 0} members`
                    : selectedUser.isOnline
                    ? "Active now"
                    : formatLastSeenText(selectedUser.lastSeen)}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={handleSearchToggle}
                className={`${
                  isMobile ? 'p-2' : 'p-2.5'
                } rounded-full hover:bg-emerald-500 hover:bg-opacity-30 transition-colors duration-200 text-white flex items-center justify-center`}
                title="Search messages"
                aria-label="Search messages"
              >
                <svg className={`${isMobile ? 'w-4.5 h-4.5' : 'w-5 h-5'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
              <div className="relative" ref={menuRef}>
                <button
                  onClick={handleMenuToggle}
                  className={`${
                    isMobile ? 'p-2' : 'p-2.5'
                  } rounded-full hover:bg-emerald-500 hover:bg-opacity-30 transition-colors duration-200 text-white flex items-center justify-center`}
                  title="More options"
                  aria-label="More options"
                >
                  <svg className={`${isMobile ? 'w-4.5 h-4.5' : 'w-5 h-5'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                  </svg>
                </button>
                {isMenuOpen && (
                  <div className={`absolute right-0 mt-2 ${
                    isMobile ? 'w-48' : 'w-52'
                  } bg-white rounded-lg shadow-lg border border-gray-200 z-20 py-2`}>
                    <button className={`w-full text-left ${
                      isMobile ? 'px-3 py-2 text-xs' : 'px-4 py-2 text-sm'
                    } text-gray-700 hover:bg-gray-50 transition-colors`}>
                      Contact info
                    </button>
                    <button className={`w-full text-left ${
                      isMobile ? 'px-3 py-2 text-xs' : 'px-4 py-2 text-sm'
                    } text-gray-700 hover:bg-gray-50 transition-colors`}>
                      Select messages
                    </button>
                    <button className={`w-full text-left ${
                      isMobile ? 'px-3 py-2 text-xs' : 'px-4 py-2 text-sm'
                    } text-gray-700 hover:bg-gray-50 transition-colors`}>
                      Mute notifications
                    </button>
                    <hr className="my-2 border-gray-100" />
                    <button className={`w-full text-left ${
                      isMobile ? 'px-3 py-2 text-xs' : 'px-4 py-2 text-sm'
                    } text-gray-700 hover:bg-gray-50 transition-colors`}>
                      Clear messages
                    </button>
                    <button className={`w-full text-left ${
                      isMobile ? 'px-3 py-2 text-xs' : 'px-4 py-2 text-sm'
                    } text-red-600 hover:bg-red-50 transition-colors`}>
                      Delete chat
                    </button>
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="w-full flex items-center space-x-3">
            <button
              onClick={handleSearchToggle}
              className={`${
                isMobile ? 'p-1.5' : 'p-2'
              } rounded-full hover:bg-emerald-500 hover:bg-opacity-20 transition-colors text-white`}
              title="Close search"
              aria-label="Close search"
            >
              <svg className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="flex-1 relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search messages..."
                className={`w-full bg-emerald-100 border border-emerald-200 rounded-full ${
                  isMobile ? 'px-3 py-1.5 text-sm' : 'px-4 py-2 text-base'
                } text-gray-900 placeholder-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-transparent transition-all`}
                autoFocus
              />
              <svg className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${
                isMobile ? 'w-3 h-3' : 'w-4 h-4'
              } text-gray-400`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        )}
      </div>

      {/* Messages Area */}
      <div className={`flex-1 overflow-hidden flex flex-col bg-gray-100 ${
        isMobile ? 'mobile-messages-container' : ''
      } ${
        isMobile && isKeyboardOpen ? 'keyboard-open' : ''
      }`}
      style={isMobile ? {
        paddingTop: 'calc(64px + env(safe-area-inset-top))',
        paddingBottom: 'calc(80px + env(safe-area-inset-bottom))'
      } : {}}>
        <div 
          ref={messagesContainerRef}
          className={`flex-1 overflow-y-auto ${
            isMobile ? 'px-2 py-1' : 'px-4 py-2'
          } space-y-1`} 
          style={{ scrollBehavior: 'auto' }}
        >
          {searchQuery && filteredMessages.length > 0 && (
            <div className="text-center">
              <span className={`inline-flex items-center ${
                isMobile ? 'px-2 py-1 text-xs' : 'px-3 py-1 text-sm'
              } rounded-full font-medium bg-emerald-100 text-emerald-800`}>
                {filteredMessages.length} message{filteredMessages.length !== 1 ? 's' : ''} found
              </span>
            </div>
          )}

          {filteredMessages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className={`${
                  isMobile ? 'w-12 h-12' : 'w-16 h-16'
                } bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4`}>
                  <svg className={`${
                    isMobile ? 'w-6 h-6' : 'w-8 h-8'
                  } text-gray-400`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <p className={`text-gray-500 ${
                  isMobile ? 'text-lg' : 'text-xl'
                } font-medium`}>
                  {searchQuery ? `No messages found for "${searchQuery}"` : "No messages yet"}
                </p>
                {!searchQuery && (
                  <p className={`text-gray-400 ${
                    isMobile ? 'text-sm' : 'text-base'
                  } mt-2`}>
                    Start the conversation with a friendly message!
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-1">
              {filteredMessages.map((message, index, arr) => {
                const isCurrentUser = message.senderId === currentUser.id;
                const previousMessage = index > 0 ? arr[index - 1] : undefined;

                return (
                  <MessageItem
                    key={message.id || `${message.senderId}-${index}`}
                    message={message}
                    isCurrentUser={isCurrentUser}
                    showAvatar={true}
                    user={isCurrentUser ? currentUser : selectedUser}
                    previousMessage={previousMessage}
                    isGroupChat={selectedUser.isGroup}
                    isMobile={isMobile}
                  />
                );
              })}
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Message Input */}
      <div className={`bg-white border-t border-gray-200 ${
        isMobile 
          ? 'fixed bottom-0 left-0 right-0 z-40 mobile-input-container px-3 py-2'
          : 'px-6 py-4'
      } flex-shrink-0`}
      style={isMobile ? {
        paddingBottom: 'max(8px, env(safe-area-inset-bottom))',
        paddingLeft: 'max(12px, env(safe-area-inset-left))',
        paddingRight: 'max(12px, env(safe-area-inset-right))'
      } : {}}>
        <form onSubmit={handleSendMessage} className={`flex items-center ${
          isMobile ? 'space-x-1' : 'space-x-3'
        }`}>
          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="*/*"
            onChange={handleFileSelect}
            className="hidden"
          />
          
          <div className="relative  flex-shrink-0" ref={attachmentMenuRef}>
            <button
              type="button"
              onClick={() => setShowAttachmentMenu(!showAttachmentMenu)}
              className={`${
                isMobile ? 'p-1.5' : 'p-3'
              } text-gray-500 hover:text-gray-700 transition-colors rounded-full hover:bg-gray-100 flex items-center justify-center`}
              title="Attach file"
              aria-label="Attach file"
            >
              <svg className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
              </svg>
            </button>
            
            <FileAttachmentMenu
              isVisible={showAttachmentMenu}
              onClose={() => setShowAttachmentMenu(false)}
              onSelectImage={() => handleAttachmentAction('image')}
              onSelectDocument={() => handleAttachmentAction('document')}
              onSelectCamera={() => handleAttachmentAction('camera')}
            />
          </div>

          <div className={`flex-1 bg-gray-100 ${
            isMobile ? 'rounded-xl' : 'rounded-3xl'
          } border border-gray-200 focus-within:border-emerald-300 focus-within:bg-white transition-all duration-200`}>
            <div className={`flex items-center ${
              isMobile ? 'px-2 py-1' : 'px-4 py-2'
            }`}>
              <textarea
                ref={textareaRef}
                value={newMessage}
                onChange={handleMessageChange}
                onKeyPress={handleKeyPress}
                placeholder="Type a message..."
                className={`flex-1 border-none outline-none resize-none text-gray-900 placeholder-gray-500 bg-transparent ${
                  isMobile ? 'text-sm leading-5 py-1' : 'text-base leading-6 py-1'
                } ${
                  isMobile 
                    ? isKeyboardOpen 
                      ? 'max-h-16' 
                      : 'max-h-24'
                    : 'max-h-32'
                }`}
                rows={1}
                disabled={isSending}
              />
              <div className="flex-shrink-0" ref={emojiPickerRef}>
                <button
                  type="button"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className={`${isMobile ? 'p-1.5' : 'p-2'} text-gray-500 hover:text-gray-700 transition-colors flex items-center justify-center`}
                  title="Add emoji"
                  aria-label="Add emoji"
                >
                  <svg className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'}`} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 100-2 1 1 0 000 2zm7-1a1 1 0 11-2 0 1 1 0 012 0zm-.464 5.535a1 1 0 10-1.415-1.414 3 3 0 01-4.242 0 1 1 0 00-1.415 1.414 5 5 0 007.072 0z" clipRule="evenodd" />
                  </svg>
                </button>
                
                <EmojiPicker
                  isVisible={showEmojiPicker}
                  onEmojiSelect={handleEmojiSelect}
                  onClose={() => setShowEmojiPicker(false)}
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={!newMessage.trim() || isSending}
            className={`flex-shrink-0 flex items-center justify-center ${
              isMobile ? 'w-8 h-8' : 'w-12 h-12'
            } rounded-full transition-all duration-200 ${
              newMessage.trim() && !isSending
                ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
            title={isSending ? "Sending..." : "Send message"}
            aria-label={isSending ? "Sending message" : "Send message"}
          >
            {isSending ? (
              <svg className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'} animate-spin`} fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatWindow;
