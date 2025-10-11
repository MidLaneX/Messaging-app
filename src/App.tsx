import React, { useState, useEffect, useMemo, useCallback, Suspense } from "react";
import "./App.css";
import AuthPage from "./components/AuthPage";
import { UserProvider, useUser } from "./context/UserContext";
import { useConversations, ConversationItem } from "./hooks";
import { useIsMobile, useViewportHeight } from "./hooks/useMediaQuery";
import { APP_CONFIG } from "./constants";
import { User, Message } from "./types";
import { generateUUID } from "./utils";
import { messagePersistence } from "./services/messagePersistence";
import { selectedConversationPersistence } from "./services/selectedConversationPersistence";
import { conversationPersistence } from "./services/conversationPersistence";
import { userService } from "./services/userService";
import {
  connectWebSocket,
  disconnectWebSocket,
  subscribeToChat,
  unsubscribeFromDestination,
  getConnectionStatus,
  testWebSocketConnection,
} from "./services/ws";
import "./utils/websocketDebug"; // Import debug utilities

// Lazy load heavy components
const UserList = React.lazy(() => import("./components/UserList"));
const ChatWindow = React.lazy(() => import("./components/ChatWindow"));

// Loading component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center h-full">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
  </div>
);

// Main chat application component
const ChatApp: React.FC = () => {
  const { currentUserId, currentUserName, isLoggedIn } = useUser();
  const [selectedUser, setSelectedUser] = useState<User | null>(() => {
    // Try to restore selected conversation from localStorage
    return selectedConversationPersistence.loadSelectedConversation();
  });
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [wsMessages, setWsMessages] = useState<Message[]>(() => {
    // Clean up old messages first
    messagePersistence.cleanupOldMessages();

    // Load persisted WebSocket messages on initialization
    const persistedMessages = messagePersistence.loadWsMessages();
    console.log(
      `📱 Loaded ${persistedMessages.length} persisted WebSocket messages`
    );
    return persistedMessages;
  });
  const [connectionStatus, setConnectionStatus] = useState(
    getConnectionStatus()
  );

  // Mobile-specific state for navigation
  const isMobile = useIsMobile();
  const { viewportHeight, isKeyboardOpen } = useViewportHeight();
  const [showChatView, setShowChatView] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);

  // Fetch current user profile
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (currentUserId) {
        const profile = await userService.getUserById(currentUserId);
        if (profile) {
          setUserProfile(profile);
          console.log("✅ Fetched user profile:", profile);
        }
      }
    };
    fetchUserProfile();
  }, [currentUserId]);

  // Return early if not logged in
  if (!isLoggedIn || !currentUserId) {
    return null;
  }

  // Current user object with profile data
  const currentUser: User = {
    id: currentUserId,
    name: userProfile?.username || currentUserName || "User",
    isOnline: true,
    avatar:
      userProfile?.profilePictureUrl ||
      (currentUserName === "Parakrama" ? "👨‍💼" : "👨‍💻"),
  };

  // Use the new conversations hook
  const {
    conversations = [], // Default to empty array
    loading = false,
    hasMore = false,
    loadMore,
    addConversation,
    error,
  } = useConversations();

  // Function to get the latest message for a conversation from WebSocket messages
  const getLatestWSMessageForConversation = (
    conversationId: string,
    isGroup: boolean
  ): Message | undefined => {
    console.log(
      `🔍 Getting latest WS message for ${
        isGroup ? "group" : "user"
      } ${conversationId}`
    );
    console.log(`🔍 Total wsMessages: ${wsMessages.length}`);

    const relevantMessages = wsMessages.filter((msg) => {
      if (isGroup) {
        const isRelevant =
          msg.chatType === "GROUP" && msg.groupId === conversationId;
        console.log(
          `🔍 Group message check: ${msg.id} - chatType: ${msg.chatType}, groupId: ${msg.groupId}, conversationId: ${conversationId}, relevant: ${isRelevant}`
        );
        return isRelevant;
      } else {
        const isRelevant =
          msg.chatType === "PRIVATE" &&
          ((msg.senderId === currentUser.id &&
            msg.recipientId === conversationId) ||
            (msg.senderId === conversationId &&
              msg.recipientId === currentUser.id));
        return isRelevant;
      }
    });

    console.log(
      `🔍 Found ${relevantMessages.length} relevant messages for ${
        isGroup ? "group" : "user"
      } ${conversationId}`
    );

    // Return the most recent message
    const latest =
      relevantMessages.length > 0
        ? relevantMessages.sort(
            (a, b) =>
              new Date(b.createdAt || "").getTime() -
              new Date(a.createdAt || "").getTime()
          )[0]
        : undefined;

    console.log(
      `🔍 Latest WS message for ${
        isGroup ? "group" : "user"
      } ${conversationId}:`,
      latest
    );
    return latest;
  };

  // Enhanced conversations with latest WebSocket messages
  const enhancedConversations = useMemo(() => {
    return conversations.map((conv: ConversationItem) => {
      const latestWSMessage = getLatestWSMessageForConversation(
        conv.id,
        conv.isGroup
      );

      // If we have a WebSocket message, check if it's newer than the REST API message
      if (latestWSMessage && conv.lastMessage) {
        const wsMessageTime = new Date(
          latestWSMessage.createdAt || ""
        ).getTime();
        // Fix: Handle both string and potentially undefined createdAt for REST API messages
        const restMessageTime = new Date(
          conv.lastMessage.createdAt || conv.lastMessage.timestamp || ""
        ).getTime();

        console.log(
          `Comparing messages for ${conv.isGroup ? "group" : "user"} ${
            conv.id
          }:`,
          {
            wsMessageTime,
            restMessageTime,
            wsMessage: latestWSMessage,
            restMessage: conv.lastMessage,
            wsNewer: wsMessageTime > restMessageTime,
          }
        );

        // Use WebSocket message if it's newer
        if (wsMessageTime > restMessageTime) {
          console.log(
            `Using WebSocket message for ${conv.isGroup ? "group" : "user"} ${
              conv.id
            }`
          );
          return {
            ...conv,
            lastMessage: latestWSMessage,
          };
        }
      } else if (latestWSMessage && !conv.lastMessage) {
        // If there's no REST API message but we have a WebSocket message, use it
        console.log(
          `Using WebSocket message for ${conv.isGroup ? "group" : "user"} ${
            conv.id
          } (no REST message)`
        );
        return {
          ...conv,
          lastMessage: latestWSMessage,
        };
      }

      // Otherwise, use the original conversation (with REST API lastMessage)
      return conv;
    });
  }, [conversations, wsMessages, currentUser.id]);

  // Helper function to update conversation cache when new messages arrive
  const updateConversationWithNewMessage = useCallback(
    (message: Message) => {
      const cachedConversations = conversationPersistence.loadConversations();
      if (!cachedConversations) return;

      let conversationId: string;
      let isGroup: boolean;

      if (message.chatType === "GROUP") {
        conversationId = message.groupId || "";
        isGroup = true;
      } else {
        // For private messages, determine the other user's ID
        conversationId =
          message.senderId === currentUser.id
            ? message.recipientId || ""
            : message.senderId || "";
        isGroup = false;
      }

      if (!conversationId) return;

      // Find and update the conversation in cache
      const updatedConversations = cachedConversations.map((conv) => {
        if (conv.id === conversationId && conv.isGroup === isGroup) {
          return {
            ...conv,
            lastMessage: message,
            unreadCount:
              message.senderId !== currentUser.id
                ? (conv.unreadCount || 0) + 1
                : conv.unreadCount,
          };
        }
        return conv;
      });

      // Sort by last message time and save
      updatedConversations.sort((a, b) => {
        const aTime = a.lastMessage?.createdAt
          ? new Date(a.lastMessage.createdAt).getTime()
          : -1;
        const bTime = b.lastMessage?.createdAt
          ? new Date(b.lastMessage.createdAt).getTime()
          : -1;
        return bTime - aTime;
      });

      conversationPersistence.saveConversations(updatedConversations);
    },
    [currentUser.id]
  );

  // Mobile-friendly user selection handler
  const handleUserSelect = (user: User) => {
    setSelectedUser(user);
    selectedConversationPersistence.saveSelectedConversation(user);
    if (isMobile) {
      setShowChatView(true);
    }
  };

  // Mobile back button handler
  const handleBackToUserList = () => {
    if (isMobile) {
      setShowChatView(false);
      setSelectedUser(null);
      selectedConversationPersistence.clearSelectedConversation();
    }
  };

  // Update connection status periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setConnectionStatus(getConnectionStatus());
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // Fetch chat messages when selectedUser changes
  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedUser) {
        setMessages([]);
        return;
      }
      setLoadingMessages(true);
      try {
        const axios = (await import("axios")).default;
        let res;

        if (selectedUser.isGroup) {
          // For groups, use group messages endpoint
          res = await axios.get(
            `${APP_CONFIG.API_BASE_URL}/api/chat/group/${selectedUser.id}?page=0&size=50`
          );
        } else {
          // For private chats, use existing endpoint
          res = await axios.get(
            `${APP_CONFIG.API_BASE_URL}/api/users/${currentUser.id}/chats/${selectedUser.id}?page=0&size=50`
          );
        }

        // Map API response to Message[] with timestamp as Date
        setMessages(
          (res.data.content || [])
            .sort(
              (a: any, b: any) =>
                new Date(a.createdAt).getTime() -
                new Date(b.createdAt).getTime()
            )
            .map((msg: any) => ({
              ...msg,
            }))
        );
      } catch (err) {
        console.error("Error fetching messages:", err);
        setMessages([]);
      } finally {
        setLoadingMessages(false);
      }
    };
    fetchMessages();
  }, [selectedUser, currentUser.id]);

  // Persist WebSocket messages to localStorage whenever they change
  useEffect(() => {
    if (wsMessages.length > 0) {
      messagePersistence.saveWsMessages(wsMessages);
    }
  }, [wsMessages]);

  // Connect WebSocket and set up subscription on mount
  useEffect(() => {
    console.log(`Setting up WebSocket connection for user: ${currentUser.id}`);

    let globalPrivateSubscription: any = null;

    const handleConnect = async () => {
      console.log("WebSocket connected successfully in App component");

      try {
        // Set up global private message subscription once when connected
        console.log(
          "Setting up global private message subscription for user:",
          currentUser.id
        );

        globalPrivateSubscription = await subscribeToChat(
          "", // chatId not needed for private messages
          (msg) => {
            console.log("🔥 RECEIVED PRIVATE MESSAGE IN APP:", msg);
            console.log("🔥 Message details:", {
              id: msg.id,
              senderId: msg.senderId,
              recipientId: msg.recipientId,
              currentUserId: currentUser.id,
              content: msg.content,
              chatType: msg.chatType,
              createdAt: msg.createdAt,
            });

            // Check if private message is relevant to current user
            const isPrivateForCurrentUser =
              msg.chatType === "PRIVATE" &&
              (msg.recipientId === currentUser.id ||
                msg.senderId === currentUser.id);

            if (!isPrivateForCurrentUser) {
              console.log("Private message not for current user, ignoring");
              return;
            }

            console.log("✅ Private message is for current user, adding to UI");

            // Add message to wsMessages
            setWsMessages((prev) => {
              // Check for duplicates
              const isDuplicate = prev.some((existingMsg) => {
                if (msg.id && existingMsg.id === msg.id) {
                  return true;
                }

                const timeDiff = Math.abs(
                  new Date(
                    existingMsg.createdAt ?? new Date().toISOString()
                  ).getTime() -
                    new Date(
                      msg.createdAt || new Date().toISOString()
                    ).getTime()
                );

                // For file messages, also check fileAttachment
                if (msg.type === "FILE" && existingMsg.type === "FILE") {
                  return (
                    existingMsg.senderId === msg.senderId &&
                    existingMsg.fileAttachment?.originalName ===
                      msg.fileAttachment?.originalName &&
                    existingMsg.fileAttachment?.fileSize ===
                      msg.fileAttachment?.fileSize &&
                    timeDiff < 2000 // 2 seconds tolerance
                  );
                }

                return (
                  existingMsg.senderId === msg.senderId &&
                  existingMsg.content === msg.content &&
                  existingMsg.type === msg.type &&
                  timeDiff < 2000 // 2 seconds tolerance
                );
              });

              if (isDuplicate) {
                console.log("Duplicate message detected, skipping");
                return prev;
              }

              const newMessage = {
                ...msg,
                id: msg.id || generateUUID(),
                createdAt: msg.createdAt || new Date().toISOString(),
              };

              console.log("Adding new private message to UI:", newMessage);

              // Update conversation cache with new message
              updateConversationWithNewMessage(newMessage);

              return [...prev, newMessage];
            });
          },
          false // false = private messages
        );

        console.log(
          "Global private message subscription established successfully"
        );
      } catch (error) {
        console.error(
          "Failed to establish global private subscription:",
          error
        );
      }
    };

    const handleError = (error: any) => {
      console.error("WebSocket connection error in App component:", error);
    };

    // Use the promise-based connection
    connectWebSocket(currentUser.id, handleConnect, handleError).catch(
      (error) => {
        console.error("Failed to establish WebSocket connection:", error);
      }
    );

    return () => {
      console.log("Cleaning up WebSocket connection and subscription");
      if (globalPrivateSubscription) {
        try {
          globalPrivateSubscription.unsubscribe();
        } catch (error) {
          console.warn("Error unsubscribing:", error);
        }
      }
      disconnectWebSocket();
    };
  }, [currentUser.id]); // Only depend on currentUser.id, not selectedUser

  // Global group subscriptions for all groups to update last messages
  useEffect(() => {
    const groupConversations = conversations.filter(
      (conv: ConversationItem) => conv.isGroup
    );
    const subscriptions: any[] = [];

    const setupGlobalGroupSubscriptions = async () => {
      for (const group of groupConversations) {
        try {
          const subscription = await subscribeToChat(
            group.id,
            (msg) => {
              if (msg.chatType === "GROUP" && msg.groupId === group.id) {
                console.log(`🔥 RECEIVED GROUP MESSAGE for ${group.id}:`, msg);

                setWsMessages((prev) => {
                  const isDuplicate = prev.some((existingMsg) => {
                    if (msg.id && existingMsg.id === msg.id) return true;
                    const timeDiff = Math.abs(
                      new Date(
                        existingMsg.createdAt ?? new Date().toISOString()
                      ).getTime() -
                        new Date(
                          msg.createdAt || new Date().toISOString()
                        ).getTime()
                    );

                    // For file messages, also check fileAttachment
                    if (msg.type === "FILE" && existingMsg.type === "FILE") {
                      return (
                        existingMsg.senderId === msg.senderId &&
                        existingMsg.fileAttachment?.originalName ===
                          msg.fileAttachment?.originalName &&
                        existingMsg.fileAttachment?.fileSize ===
                          msg.fileAttachment?.fileSize &&
                        existingMsg.groupId === msg.groupId &&
                        timeDiff < 2000
                      );
                    }

                    return (
                      existingMsg.senderId === msg.senderId &&
                      existingMsg.content === msg.content &&
                      existingMsg.groupId === msg.groupId &&
                      existingMsg.type === msg.type &&
                      timeDiff < 2000
                    );
                  });

                  if (isDuplicate) {
                    console.log("Duplicate group message detected, skipping");
                    return prev;
                  }

                  const newMessage = {
                    ...msg,
                    id: msg.id || generateUUID(),
                    createdAt: msg.createdAt || new Date().toISOString(),
                  };

                  console.log(
                    "Adding new group message to wsMessages:",
                    newMessage
                  );
                  console.log("Current wsMessages length:", prev.length);

                  // Update conversation cache with new message
                  updateConversationWithNewMessage(newMessage);

                  const updatedMessages = [...prev, newMessage];
                  console.log(
                    "Updated wsMessages length:",
                    updatedMessages.length
                  );
                  return updatedMessages;
                });
              }
            },
            true
          );
          subscriptions.push({ subscription, groupId: group.id });
        } catch (error) {
          console.error(`Failed to subscribe to group ${group.id}:`, error);
        }
      }
    };

    setupGlobalGroupSubscriptions();

    return () => {
      subscriptions.forEach(({ subscription, groupId }) => {
        try {
          unsubscribeFromDestination(`/topic/chat/${groupId}`);
        } catch (error) {
          console.warn(`Error unsubscribing from group ${groupId}:`, error);
        }
      });
    };
  }, [conversations]);

  // Clear messages when selectedUser changes and update filtered messages
  useEffect(() => {
    console.log(`Selected user changed to: ${selectedUser?.id || "none"}`);

    // Clear old WebSocket messages to prevent memory bloat
    // Keep only messages relevant to all potential conversations
    setWsMessages((prev) =>
      prev.filter((msg) => {
        // Keep messages where current user is involved (private or group)
        return (
          msg.senderId === currentUser.id ||
          msg.recipientId === currentUser.id ||
          (msg.chatType === "GROUP" && msg.groupId)
        ); // Keep all group messages for now
      })
    );
  }, [selectedUser, currentUser.id]);

  // Memoize filtered messages for performance
  const filteredWsMessages = useMemo(() => {
    if (!selectedUser) return [];

    return wsMessages.filter((msg) => {
      if (selectedUser.isGroup) {
        // For groups, show messages with matching groupId
        return msg.chatType === "GROUP" && msg.groupId === selectedUser.id;
      } else {
        // For private chats, show messages between current user and selected user
        const isRelevantMessage =
          (msg.senderId === currentUser.id &&
            msg.recipientId === selectedUser.id) ||
          (msg.senderId === selectedUser.id &&
            msg.recipientId === currentUser.id);
        return isRelevantMessage;
      }
    });
  }, [wsMessages, selectedUser, currentUser.id]);

  if (error) {
    return (
      <div className="h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-2">⚠️</div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            Error Loading Conversations
          </h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`bg-gray-100 overflow-hidden h-[100dvh] ${
        isMobile ? "  mobile-layout" : ""
      }`}
    >
      {isMobile ? (
        // Mobile Layout with sliding animation and fixed positioning
        <div className="relative w-full h-full">
          {/* User List - slides left when chat is open */}
          <div
            className={`absolute inset-0 transition-transform duration-300 ease-in-out ${
              showChatView ? "-translate-x-full" : "translate-x-0"
            }`}
          >
            <Suspense fallback={<LoadingSpinner />}>
              <UserList
                conversations={enhancedConversations}
                selectedUser={selectedUser}
                onUserSelect={handleUserSelect}
                currentUserId={currentUser.id}
                loading={loading}
                hasMore={hasMore}
                onLoadMore={loadMore}
                onConversationAdd={addConversation}
                isMobile={true}
                currentUserProfile={userProfile}
              />
            </Suspense>
          </div>

          {/* Chat Window - slides in from right when chat is selected */}
          {selectedUser && (
            <div
              className={`absolute inset-0 transition-transform duration-300 ease-in-out ${
                showChatView ? "translate-x-0" : "translate-x-full"
              }`}
            >
              <Suspense fallback={<LoadingSpinner />}>
                <ChatWindow
                  selectedUser={selectedUser}
                  currentUser={currentUser}
                  messages={messages}
                  wsMessages={filteredWsMessages}
                  setWsMessages={setWsMessages}
                  loadingMessages={loadingMessages}
                  isMobile={true}
                  onBackPress={handleBackToUserList}
                  isKeyboardOpen={isKeyboardOpen}
                  onUserSelect={handleUserSelect}
                />
              </Suspense>
            </div>
          )}
        </div>
      ) : (
        // Desktop Layout - side by side
        <div className="flex h-full">
          <Suspense fallback={<LoadingSpinner />}>
            <UserList
              conversations={enhancedConversations}
              selectedUser={selectedUser}
              onUserSelect={handleUserSelect}
              currentUserId={currentUser.id}
              loading={loading}
              hasMore={hasMore}
              onLoadMore={loadMore}
              onConversationAdd={addConversation}
              isMobile={false}
              currentUserProfile={userProfile}
            />
          </Suspense>
          <Suspense fallback={<LoadingSpinner />}>
            <ChatWindow
              selectedUser={selectedUser}
              currentUser={currentUser}
              messages={messages}
              wsMessages={filteredWsMessages}
              setWsMessages={setWsMessages}
              loadingMessages={loadingMessages}
              isMobile={false}
              onUserSelect={handleUserSelect}
            />
          </Suspense>
        </div>
      )}
    </div>
  );
};

// Main App wrapper component
function App() {
  return (
    <UserProvider>
      <AppContent />
    </UserProvider>
  );
}

// App content component that handles login state
const AppContent: React.FC = () => {
  const { isLoggedIn, setUserData } = useUser();

  const handleAuthSuccess = (
    mainUserId: number,
    collabUserId: string,
    userName: string
  ) => {
    setUserData(mainUserId, collabUserId, userName);
  };

  if (!isLoggedIn) {
    return <AuthPage onAuthSuccess={handleAuthSuccess} />;
  }

  return <ChatApp />;
};

export default App;
