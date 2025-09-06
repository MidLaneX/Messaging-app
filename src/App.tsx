import React, { useState, useEffect, useMemo } from "react";
import "./App.css";
import UserList from "./components/UserList";
import ChatWindow from "./components/ChatWindow";
import Login from "./components/Login";
import { UserProvider, useUser } from "./context/UserContext";
import { useConversations } from "./hooks";
import { APP_CONFIG } from "./constants";
import { User, Message } from "./types";
import {
  connectWebSocket,
  disconnectWebSocket,
  subscribeToChat,
  unsubscribeFromDestination,
  waitForConnection,
  getConnectionStatus,
  testWebSocketConnection,
} from "./services/ws";
import "./utils/websocketDebug"; // Import debug utilities

// Main chat application component
const ChatApp: React.FC = () => {
  const { currentUserId, currentUserName, isLoggedIn } = useUser();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [wsMessages, setWsMessages] = useState<Message[]>([]);
  const [connectionStatus, setConnectionStatus] = useState(
    getConnectionStatus()
  );

  // Return early if not logged in
  if (!isLoggedIn || !currentUserId) {
    return null;
  }

  // Current user object
  const currentUser: User = {
    id: currentUserId,
    name: currentUserName || "User",
    isOnline: true,
    avatar: currentUserName === "Parakrama" ? "👨‍💼" : "👨‍�",
  };

  // Use the new conversations hook
  const {
    conversations = [], // Default to empty array
    loading = false,
    hasMore = false,
    loadMore,
    error,
  } = useConversations();
  
  // Function to get the latest message for a conversation from WebSocket messages
  const getLatestWSMessageForConversation = (conversationId: string, isGroup: boolean): Message | undefined => {
    const relevantMessages = wsMessages.filter((msg) => {
      if (isGroup) {
        return msg.chatType === "GROUP" && msg.groupId === conversationId;
      } else {
        return msg.chatType === "PRIVATE" && 
               ((msg.senderId === currentUser.id && msg.recipientId === conversationId) ||
                (msg.senderId === conversationId && msg.recipientId === currentUser.id));
      }
    });
    
    // Return the most recent message
    return relevantMessages.length > 0 
      ? relevantMessages.sort((a, b) => 
          new Date(b.createdAt || "").getTime() - new Date(a.createdAt || "").getTime()
        )[0]
      : undefined;
  };

  // Enhanced conversations with latest WebSocket messages
  const enhancedConversations = useMemo(() => {
    return conversations.map(conv => {
      const latestWSMessage = getLatestWSMessageForConversation(conv.id, conv.isGroup);
      
      // If we have a WebSocket message, check if it's newer than the REST API message
      if (latestWSMessage && conv.lastMessage) {
        const wsMessageTime = new Date(latestWSMessage.createdAt || "").getTime();
        const restMessageTime = new Date(conv.lastMessage.createdAt).getTime();
        
        // Use WebSocket message if it's newer
        if (wsMessageTime > restMessageTime) {
          return {
            ...conv,
            lastMessage: latestWSMessage
          };
        }
      } else if (latestWSMessage && !conv.lastMessage) {
        // If there's no REST API message but we have a WebSocket message, use it
        return {
          ...conv,
          lastMessage: latestWSMessage
        };
      }
      
      // Otherwise, use the original conversation (with REST API lastMessage)
      return conv;
    });
  }, [conversations, wsMessages, currentUser.id]);


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
        console.error('Error fetching messages:', err);
        setMessages([]);
      } finally {
        setLoadingMessages(false);
      }
    };
    fetchMessages();
  }, [selectedUser, currentUser.id]);

  // Connect WebSocket and set up subscription on mount
  useEffect(() => {
    console.log(`Setting up WebSocket connection for user: ${currentUser.id}`);

    let globalPrivateSubscription: any = null;

    const handleConnect = async () => {
      console.log("WebSocket connected successfully in App component");
      
      try {
        // Set up global private message subscription once when connected
        console.log("Setting up global private message subscription for user:", currentUser.id);
        
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
              msg.chatType === "PRIVATE" && (
                msg.recipientId === currentUser.id || 
                msg.senderId === currentUser.id
              );

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
                  new Date(existingMsg.createdAt ?? new Date().toISOString()).getTime() -
                  new Date(msg.createdAt || new Date().toISOString()).getTime()
                );

                return (
                  existingMsg.senderId === msg.senderId &&
                  existingMsg.content === msg.content &&
                  timeDiff < 2000 // 2 seconds tolerance
                );
              });

              if (isDuplicate) {
                console.log("Duplicate message detected, skipping");
                return prev;
              }

              const newMessage = {
                ...msg,
                id: msg.id || crypto.randomUUID(),
                createdAt: msg.createdAt || new Date().toISOString(),
              };

              console.log("Adding new private message to UI:", newMessage);
              return [...prev, newMessage];
            });
          },
          false // false = private messages
        );

        console.log("Global private message subscription established successfully");
      } catch (error) {
        console.error("Failed to establish global private subscription:", error);
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
    const groupConversations = conversations.filter((conv) => conv.isGroup);
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
                      new Date(existingMsg.createdAt ?? new Date().toISOString()).getTime() -
                        new Date(msg.createdAt || new Date().toISOString()).getTime()
                    );
                    return (
                      existingMsg.senderId === msg.senderId &&
                      existingMsg.content === msg.content &&
                      existingMsg.groupId === msg.groupId &&
                      timeDiff < 2000
                    );
                  });
                  
                  if (isDuplicate) {
                    console.log("Duplicate group message detected, skipping");
                    return prev;
                  }
                  
                  const newMessage = {
                    ...msg,
                    id: msg.id || crypto.randomUUID(),
                    createdAt: msg.createdAt || new Date().toISOString(),
                  };
                  
                  console.log("Adding new group message to UI:", newMessage);
                  return [...prev, newMessage];
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
    console.log(`Selected user changed to: ${selectedUser?.id || 'none'}`);
    
    // Clear old WebSocket messages to prevent memory bloat
    // Keep only messages relevant to all potential conversations
    setWsMessages(prev => prev.filter(msg => {
      // Keep messages where current user is involved (private or group)
      return msg.senderId === currentUser.id || 
             msg.recipientId === currentUser.id ||
             (msg.chatType === "GROUP" && msg.groupId); // Keep all group messages for now
    }));
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
          (msg.senderId === currentUser.id && msg.recipientId === selectedUser.id) ||
          (msg.senderId === selectedUser.id && msg.recipientId === currentUser.id);
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
    <div className="h-screen bg-gray-100">
      <div className="flex h-full">
        <UserList
          conversations={enhancedConversations}
          selectedUser={selectedUser}
          onUserSelect={setSelectedUser}
          currentUserId={currentUser.id}
          loading={loading}
          hasMore={hasMore}
          onLoadMore={loadMore}
        />
        <ChatWindow
          selectedUser={selectedUser}
          currentUser={currentUser}
          messages={messages}
          wsMessages={filteredWsMessages}
          setWsMessages={setWsMessages}
          loadingMessages={loadingMessages}
        />
      </div>
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
  const { isLoggedIn, setCurrentUserId } = useUser();

  const handleUserSelect = (userId: string) => {
    setCurrentUserId(userId);
  };

  if (!isLoggedIn) {
    return <Login onUserSelect={handleUserSelect} />;
  }

  return <ChatApp />;
};

export default App;
