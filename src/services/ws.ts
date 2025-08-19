import SockJS from 'sockjs-client';
import { CompatClient, Stomp } from '@stomp/stompjs';

export interface ChatMessage {
  senderId: string;
  recipientId?: string;
  content: string;
  chatId?: string;
  chatType?: string;
  type?: string;
  // add other fields as needed
}

let stompClient: CompatClient | null = null;
let currentSubscription: any = null;
let subscriptionCounter = 0;
let isConnecting = false;
let currentUserId: string | null = null;
let connectionPromise: Promise<void> | null = null;

export function connectWebSocket(
  userId: string,
  onConnect?: () => void,
  onError?: (err: any) => void
): Promise<void> {
  // Check if already connected with the same user
  if (stompClient && stompClient.connected && currentUserId === userId) {
    console.log(`🔄 Already connected for user: ${userId}`);
    if (onConnect) onConnect();
    return Promise.resolve();
  }

  // Return existing connection promise if connecting with same user
  if (isConnecting && currentUserId === userId && connectionPromise) {
    console.log(`⏳ Reusing existing connection promise for user: ${userId}`);
    return connectionPromise;
  }

  // Disconnect if connected with different user
  if (stompClient && stompClient.connected && currentUserId !== userId) {
    console.log(`🔄 Switching user from ${currentUserId} to ${userId}`);
    disconnectWebSocket();
  }

  // Create new connection promise
  connectionPromise = new Promise<void>((resolve, reject) => {
    isConnecting = true;
    currentUserId = userId;

    console.log(
      `🔌 Connecting WebSocket for user: ${userId} to backend at localhost:8090`
    );

    // Create socket with factory function for proper reconnection support
    const socketFactory = () => new SockJS("http://localhost:8090/ws");
    stompClient = Stomp.over(socketFactory);

    // Configure STOMP client - disable debug in production
    if (process.env.NODE_ENV === "development") {
      stompClient.debug = (str) => {
        console.log("STOMP:", str);
      };
    } else {
      stompClient.debug = () => {}; // Disable debug logs in production
    }

    // Set reconnect delay
    stompClient.reconnectDelay = 5000;

    stompClient.connect(
      { userID: userId }, // Headers
      () => {
        // onConnect callback
        isConnecting = false;
        console.log(`✅ WebSocket connected successfully for user: ${userId}`);

        // Send connection acknowledgment to backend and wait for processing
        try {
          stompClient?.send(
            "/app/chat.connect",
            { userID: userId },
            JSON.stringify({
              userId: userId,
              username: `User_${userId.slice(0, 8)}`,
            })
          );
          console.log(`📤 Sent connection acknowledgment for user: ${userId}`);
          
          // Add delay to ensure backend processes the connect message
          // and sets up user principal mapping before resolving
          setTimeout(() => {
            if (onConnect) onConnect();
            resolve();
          }, 300); // 300ms delay to ensure backend user setup is complete
          
        } catch (error) {
          console.error("❌ Failed to send connection acknowledgment:", error);
          if (onConnect) onConnect();
          resolve(); // Still resolve even if connect message fails
        }
      },
        (error: any) => {
          // onError callback
          isConnecting = false;
          console.error("❌ WebSocket connection error:", error);
          stompClient = null;
          currentUserId = null;
          connectionPromise = null;
          if (onError) onError(error);
          reject(error);
        }
    );
  });

  return connectionPromise ?? Promise.resolve();
}

export function sendChatMessage(message: ChatMessage): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!stompClient || !stompClient.connected) {
      console.error("❌ Cannot send message: WebSocket not connected");
      reject(new Error("WebSocket not connected"));
      return;
    }

    try {
      console.log("📤 Sending message:", message);
      console.log("📤 Sending to endpoint: /app/chat.sendMessage");
      console.log("📤 Message headers:", { userID: message.senderId });
      console.log("📤 Current user ID:", currentUserId);

      // Ensure senderId is set correctly
      const messageToSend = {
        ...message,
        senderId: currentUserId || message.senderId,
      };

      console.log("📤 Final message to send:", messageToSend);

      stompClient.send(
        "/app/chat.sendMessage",
        { userID: currentUserId || message.senderId },
        JSON.stringify(messageToSend)
      );
      console.log("✅ Message sent successfully via WebSocket");
      resolve();
    } catch (error) {
      console.error("❌ Error sending message:", error);
      reject(error);
    }
  });
}

// Utility function to wait for connection
export function waitForConnection(timeout: number = 5000): Promise<void> {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new Error(`Connection timeout after ${timeout}ms`));
    }, timeout);

    if (stompClient && stompClient.connected) {
      clearTimeout(timeoutId);
      resolve();
      return;
    }

    if (connectionPromise) {
      connectionPromise
        .then(() => {
          clearTimeout(timeoutId);
          resolve();
        })
        .catch((error) => {
          clearTimeout(timeoutId);
          reject(error);
        });
      return;
    }

    // Fallback if no connection promise is in flight
    const checkConnection = () => {
      if (stompClient && stompClient.connected) {
        clearTimeout(timeoutId);
        resolve();
      } else if (!isConnecting) {
        // Stop checking if a connection attempt failed
        clearTimeout(timeoutId);
        reject(
          new Error(
            "WebSocket not connected and no connection attempt in progress."
          )
        );
      } else {
        setTimeout(checkConnection, 100);
      }
    };
    checkConnection();
  });
}

export function subscribeToChat(
  chatId: string,
  onMessage: (msg: any) => void,
  isGroup: boolean = false
): Promise<any> {
  console.log(
    "🔄 subscribeToChat called, stompClient connected:",
    stompClient?.connected,
    "currentUserId:",
    currentUserId
  );

  return waitForConnection(15000) // Increase timeout to 15 seconds
    .then(() => {
      if (!stompClient || !stompClient.connected) {
        throw new Error("STOMP client not connected after waiting");
      }

      // Unsubscribe from previous subscription if it exists
      if (currentSubscription) {
        console.log("🔄 Unsubscribing from previous subscription");
        try {
          currentSubscription.unsubscribe();
        } catch (error) {
          console.warn("⚠️ Error unsubscribing:", error);
        }
        currentSubscription = null;
      }

      const destination = isGroup
        ? `/topic/chat/${chatId}`
        : `/topic/private/${currentUserId}`; // switched to topic-based private channel

      console.log(
        `🔔 Subscribing to: ${destination} for user: ${currentUserId}`
      );

      subscriptionCounter++;
      const subscriptionId = `sub-${Date.now()}-${subscriptionCounter}`;

      console.log(
        `🔔 Creating subscription with ID: ${subscriptionId} to: ${destination}`
      );

      // Add delay to ensure backend user principal is properly set
      return new Promise((resolve, reject) => {
        // Verify connection is really active by checking readyState
        const rawSocket = (stompClient as any)._stompHandler?._webSocket;
        if (rawSocket && rawSocket.readyState !== WebSocket.OPEN) {
          console.error(
            "❌ WebSocket is not in OPEN state:",
            rawSocket.readyState
          );
          reject(new Error("WebSocket connection is not ready"));
          return;
        }

        // Add a small delay to ensure backend user principal mapping is complete
        setTimeout(() => {
          try {
            console.log(`🔔 Attempting to subscribe to: ${destination}`);

            currentSubscription = stompClient!.subscribe(
              destination,
              (message: { body: string }) => {
                console.log(
                  `📨 [${subscriptionId}] Raw message received:`,
                  message
                );
                console.log(`📨 [${subscriptionId}] Message body:`, message.body);
                console.log(
                  `📨 [${subscriptionId}] Destination was:`,
                  destination
                );
                console.log(
                  `📨 [${subscriptionId}] Current user ID:`,
                  currentUserId
                );

                try {
                  const parsedMessage = JSON.parse(message.body);
                  console.log(
                    `📨 [${subscriptionId}] Parsed message:`,
                    parsedMessage
                  );
                  console.log(`📨 [${subscriptionId}] Message details:`, {
                    id: parsedMessage.id,
                    senderId: parsedMessage.senderId,
                    recipientId: parsedMessage.recipientId,
                    content: parsedMessage.content,
                    chatType: parsedMessage.chatType,
                    createdAt: parsedMessage.createdAt,
                  });
                  console.log(
                    `📨 [${subscriptionId}] Calling onMessage callback with:`,
                    parsedMessage
                  );
                  onMessage(parsedMessage);
                } catch (error) {
                  console.error("❌ Error parsing message:", error, message.body);
                  // Try to handle non-JSON messages
                  onMessage({ content: message.body, type: "text" });
                }
              },
              { id: subscriptionId }
            );

            if (currentSubscription) {
              console.log(
                `✅ Subscription created with ID: ${
                  currentSubscription.id || subscriptionId
                }`
              );
              console.log(`✅ Successfully subscribed to: ${destination}`);
              resolve(currentSubscription);
            } else {
              reject(new Error("Failed to create subscription"));
            }
          } catch (error) {
            console.error("❌ Error creating subscription:", error);
            reject(error);
          }
        }, 500); // 500ms delay to ensure backend user principal is set
      });
    })
    .catch((error) => {
      console.error("❌ Error creating subscription:", error);
      throw error;
    });
}

export function disconnectWebSocket() {
  console.log("🔌 Disconnecting WebSocket...");

  // Unsubscribe from current subscription
  if (currentSubscription) {
    console.log("🔄 Unsubscribing from current subscription");
    try {
      currentSubscription.unsubscribe();
    } catch (error) {
      console.warn("⚠️ Error during unsubscribe:", error);
    }
    currentSubscription = null;
  }

  // Disconnect STOMP client
  if (stompClient) {
    if (stompClient.connected) {
      try {
        // Send disconnect notification before closing connection
        stompClient.send(
          "/app/chat.disconnect", 
          { userID: currentUserId },
          JSON.stringify({ userId: currentUserId })
        );
        console.log("📤 Sent disconnect notification");
      } catch (error) {
        console.warn("⚠️ Error sending disconnect notification:", error);
      }

      try {
        stompClient.disconnect(() => {
          console.log("✅ WebSocket disconnected");
        });
      } catch (error) {
        console.warn("⚠️ Error during disconnect:", error);
      }
    }
    stompClient = null;
  }

  // Reset all state
  currentUserId = null;
  isConnecting = false;
  connectionPromise = null;
}

// Debug function to check connection status
export function getConnectionStatus() {
  return {
    connected: stompClient?.connected || false,
    hasSubscription: currentSubscription !== null,
    clientExists: stompClient !== null,
    currentUserId,
    isConnecting,
  };
}

// Function to get current subscription
export function getCurrentSubscription() {
  return currentSubscription;
}

// Debug function to test WebSocket connection
export function testWebSocketConnection() {
  console.log("🔍 Testing WebSocket connection...");
  console.log("Connection status:", getConnectionStatus());
  console.log("STOMP client:", stompClient);
  console.log("Current subscription:", currentSubscription);
  console.log("Current user ID:", currentUserId);

  if (stompClient && stompClient.connected) {
    console.log("✅ WebSocket is connected");
    try {
      stompClient.send(
        "/app/chat.connect",
        { userID: currentUserId },
        JSON.stringify({
          userId: currentUserId,
          username: `Test_${Date.now()}`,
        })
      );
      console.log("✅ Test message sent successfully");
    } catch (error) {
      console.error("❌ Failed to send test message:", error);
    }
  } else {
    console.error("❌ WebSocket is not connected");
  }
}

// Debug function to send a test chat message
export function sendTestMessage(recipientId: string) {
  console.log("🧪 Sending test message...");
  const testMessage = {
    senderId: currentUserId!,
    recipientId: recipientId,
    content: `Test message at ${new Date().toLocaleTimeString()}`,
    chatType: "PRIVATE",
    type: "TEXT",
  };

  return sendChatMessage(testMessage)
    .then(() => {
      console.log("✅ Test message sent successfully:", testMessage);
    })
    .catch((error) => {
      console.error("❌ Failed to send test message:", error);
    });
}

// Make test functions available globally for debugging
if (typeof window !== "undefined") {
  (window as any).testWebSocket = testWebSocketConnection;
  (window as any).sendTestMessage = sendTestMessage;
  (window as any).getConnectionStatus = getConnectionStatus;
  (window as any).getWebSocketStatus = getWebSocketStatus;
  (window as any).sendPing = sendPing;
  (window as any).testSubscription = testSubscription;
  (window as any).testRealTimeMessage = testRealTimeMessage;
}

// Export additional diagnostic functions for debugging
export function getWebSocketStatus() {
  console.log("🔍 WebSocket Status Diagnostic:");
  console.log("  - STOMP Client exists:", !!stompClient);
  console.log("  - STOMP Client connected:", stompClient?.connected);
  console.log("  - Current User ID:", currentUserId);
  console.log("  - Current Subscription exists:", !!currentSubscription);
  console.log("  - Current Subscription ID:", currentSubscription?.id);

  if (stompClient) {
    const rawSocket = (stompClient as any)._stompHandler?._webSocket;
    if (rawSocket) {
      console.log("  - Raw WebSocket ready state:", rawSocket.readyState);
      console.log("  - Raw WebSocket URL:", rawSocket.url);
      console.log("  - Raw WebSocket protocol:", rawSocket.protocol);
    } else {
      console.log("  - Raw WebSocket: not found");
    }
  }

  return {
    stompClientExists: !!stompClient,
    stompClientConnected: stompClient?.connected,
    currentUserId,
    hasSubscription: !!currentSubscription,
    subscriptionId: currentSubscription?.id,
    rawSocketState: (stompClient as any)?._stompHandler?._webSocket?.readyState,
  };
}

// Test function to send a ping message
export function sendPing() {
  console.log("🏓 Sending ping test...");
  const pingMessage = {
    senderId: currentUserId!,
    recipientId: currentUserId!,
    content: "PING TEST",
    chatType: "PRIVATE" as const,
    type: "TEXT" as const,
  };
  return sendChatMessage(pingMessage);
}

// Test subscription function with detailed logging
export function testSubscription() {
  console.log("🧪 Testing subscription...");
  console.log("🧪 Current connection status:", getConnectionStatus());
  
  return subscribeToChat(
    "test-chat",
    (msg) => {
      console.log("🧪 TEST MESSAGE RECEIVED:", msg);
      console.log("🧪 Message timestamp:", new Date().toLocaleTimeString());
    },
    false
  ).then((subscription) => {
    console.log("🧪 Test subscription created successfully:", subscription?.id);
    return subscription;
  }).catch((error) => {
    console.error("🧪 Test subscription failed:", error);
    throw error;
  });
}

// Enhanced test to verify real-time message flow
export function testRealTimeMessage(recipientId: string = currentUserId || "test-recipient") {
  console.log("🧪 Testing real-time message flow...");
  
  const testMessage = {
    senderId: currentUserId!,
    recipientId: recipientId,
    content: `Real-time test message sent at ${new Date().toLocaleTimeString()}`,
    chatType: "PRIVATE" as const,
    type: "TEXT" as const,
  };

  console.log("🧪 Sending test message:", testMessage);
  
  return sendChatMessage(testMessage)
    .then(() => {
      console.log("🧪 ✅ Test message sent successfully");
      console.log("🧪 If you don't see a message received log, there may be a subscription issue");
    })
    .catch((error) => {
      console.error("🧪 ❌ Test message failed:", error);
    });
}


