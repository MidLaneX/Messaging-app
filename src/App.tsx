import React, { useState, useEffect } from "react";
import "./App.css";
import UserList from "./components/UserList";
import ChatWindow from "./components/ChatWindow";
import { useRecentUsers } from "./hooks";
import { APP_CONFIG } from "./constants";
import { User, Message } from "./types";
import {
  connectWebSocket,
  disconnectWebSocket,
  subscribeToChat,
  waitForConnection,
  getConnectionStatus,
  testWebSocketConnection,
} from "./services/ws";
import "./utils/websocketDebug"; // Import debug utilities

function App() {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [wsMessages, setWsMessages] = useState<Message[]>([]);
  const [connectionStatus, setConnectionStatus] = useState(
    getConnectionStatus()
  );

  // Hardcoded current user
  const currentUser: User = {
    id: APP_CONFIG.CURRENT_USER_ID,
    name: "You",
    isOnline: true,
    avatar: "😊",
  };

  // Use the new recent users hook
  const {
    recentUsers = [], // Default to empty array
    loading = false,
    hasMore = false,
    loadMore,
    error,
  } = useRecentUsers();

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
        setWsMessages([]);
        return;
      }
      setLoadingMessages(true);
      try {
        // API: /api/users/{user1Id}/chats/{user2Id}?page=0&size=50
        const axios = (await import("axios")).default;
        const res = await axios.get(
          `${APP_CONFIG.API_BASE_URL}/api/users/${currentUser.id}/chats/${selectedUser.id}?page=0&size=50`
        );
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

    let globalSubscription: any = null;

    const handleConnect = async () => {
      console.log("WebSocket connected successfully in App component");
      
      try {
        // Set up global subscription once when connected
        console.log("Setting up global message subscription for user:", currentUser.id);
        
        globalSubscription = await subscribeToChat(
          "", // chatId not needed for private messages
          (msg) => {
            console.log("🔥 RECEIVED MESSAGE IN APP:", msg);
            console.log("🔥 Message details:", {
              id: msg.id,
              senderId: msg.senderId,
              recipientId: msg.recipientId,
              currentUserId: currentUser.id,
              content: msg.content,
              chatType: msg.chatType,
              createdAt: msg.createdAt,
            });

            // Check if message is relevant to current user
            const isForCurrentUser = 
              msg.recipientId === currentUser.id || 
              msg.senderId === currentUser.id;

            if (!isForCurrentUser) {
              console.log("Message not for current user, ignoring");
              return;
            }

            console.log("✅ Message is for current user, adding to UI");
            
            // Add all messages for current user to wsMessages
            // The ChatWindow component will filter based on selected user
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

              console.log("Adding new message to UI:", newMessage);
              return [...prev, newMessage];
            });
          },
          false // false = private messages
        );

        console.log("Global message subscription established successfully");
      } catch (error) {
        console.error("Failed to establish global subscription:", error);
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
      if (globalSubscription) {
        try {
          globalSubscription.unsubscribe();
        } catch (error) {
          console.warn("Error unsubscribing:", error);
        }
      }
      disconnectWebSocket();
    };
  }, [currentUser.id]); // Only depend on currentUser.id, not selectedUser

  // Clear messages when selectedUser changes and update filtered messages
  useEffect(() => {
    console.log(`Selected user changed to: ${selectedUser?.id || 'none'}`);
    // Don't clear wsMessages here - let ChatWindow filter them
  }, [selectedUser]);

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
      {/* Debug info in development */}
      {process.env.NODE_ENV === "development" && (
        <div className="bg-yellow-100 border-b border-yellow-300 px-4 py-2 text-xs">
          <div className="flex justify-between items-center">
            <div>
              WS: {connectionStatus.connected ? "✅" : "❌"} | Sub:{" "}
              {connectionStatus.hasSubscription ? "✅" : "❌"} | User:{" "}
              {currentUser.id.slice(0, 8)} | Selected:{" "}
              {selectedUser?.id.slice(0, 8) || "none"} | WS Msgs:{" "}
              {wsMessages.length}
            </div>
            <div className="flex gap-2">
              <button
                onClick={testWebSocketConnection}
                className="bg-blue-500 text-white px-2 py-1 rounded text-xs"
              >
                Test WS
              </button>
              {selectedUser && (
                <button
                  onClick={() =>
                    (window as any).sendTestMessage?.(selectedUser.id)
                  }
                  className="bg-green-500 text-white px-2 py-1 rounded text-xs"
                >
                  Send Test
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="flex h-full">
        <UserList
          users={recentUsers}
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
          wsMessages={wsMessages}
          setWsMessages={setWsMessages}
          loadingMessages={loadingMessages}
        />
      </div>
    </div>
  );
}

export default App;
