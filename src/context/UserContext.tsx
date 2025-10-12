import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { userMappingService } from "../services/userMappingService";
import { messagePersistence } from "../services/messagePersistence";
import { conversationPersistence } from "../services/conversationPersistence";
import { selectedConversationPersistence } from "../services/selectedConversationPersistence";

interface UserContextType {
  // Collab service user ID (used for messaging)
  currentUserId: string | null;
  // Main app user ID (used for authentication)
  mainUserId: number | null;
  currentUserName: string | null;
  setUserData: (
    mainUserId: number,
    collabUserId: string,
    userName: string
  ) => void;
  logout: () => void;
  isLoggedIn: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

interface UserProviderProps {
  children: ReactNode;
}

const USER_STORAGE_KEY = 'messaging-app-current-user';

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  // Collab service user ID for messaging
  const [currentUserId, setCurrentUserIdState] = useState<string | null>(null);
  // Main app user ID for authentication
  const [mainUserId, setMainUserIdState] = useState<number | null>(null);
  const [currentUserName, setCurrentUserName] = useState<string | null>(null);

  // Load user from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem(USER_STORAGE_KEY);
    const mapping = userMappingService.getMapping();

    if (savedUser && mapping) {
      try {
        const userData = JSON.parse(savedUser);
        setCurrentUserIdState(mapping.collabUserId);
        setMainUserIdState(mapping.mainUserId);
        setCurrentUserName(userData.name);

        console.log("✅ User data restored from localStorage");
        console.log("Main User ID:", mapping.mainUserId);
        console.log("Collab User ID:", mapping.collabUserId);
      } catch (error) {
        console.error("Error parsing saved user data:", error);
        localStorage.removeItem(USER_STORAGE_KEY);
        userMappingService.clearAll();
        // Clear all messaging data if user data is corrupt
        messagePersistence.clearAllMessages();
        conversationPersistence.clearConversations();
        selectedConversationPersistence.clearSelectedConversation();
      }
    } else {
      // If no user data or mapping, ensure we clear any stale messaging data
      console.log("🧹 No valid user session found, clearing all messaging data");
      messagePersistence.clearAllMessages();
      conversationPersistence.clearConversations();
      selectedConversationPersistence.clearSelectedConversation();
    }
  }, []);

  const setUserData = (mainId: number, collabId: string, userName: string) => {
    console.log("🔄 Setting new user data...");
    
    // Check if this is the same user (no need to clear data)
    const isSameUser = mainUserId === mainId && currentUserId === collabId;
    
    if (!isSameUser) {
      console.log("👤 Different user detected, clearing previous user's data...");
      // Clear all previous user's data only if it's a different user
      messagePersistence.clearAllMessages();
      conversationPersistence.clearConversations();
      selectedConversationPersistence.clearSelectedConversation();
    } else {
      console.log("👤 Same user detected, preserving existing data...");
    }
    
    // Set new user data
    setMainUserIdState(mainId);
    setCurrentUserIdState(collabId);
    setCurrentUserName(userName);

    // Save to localStorage
    const userData = {
      mainUserId: mainId,
      collabUserId: collabId,
      name: userName,
    };
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));

    // Update the APP_CONFIG dynamically (use collab ID for messaging)
    if (typeof window !== "undefined") {
      (window as any).__MESSAGING_APP_CURRENT_USER_ID__ = collabId;
    }

    console.log("✅ User data set successfully");
    console.log("Main User ID:", mainId);
    console.log("Collab User ID:", collabId);
    console.log("User Name:", userName);
  };

  const logout = () => {
    console.log("🚪 Starting logout process...");
    
    // Clear user state
    setCurrentUserIdState(null);
    setMainUserIdState(null);
    setCurrentUserName(null);
    
    // Clear user data from localStorage
    localStorage.removeItem(USER_STORAGE_KEY);

    // Clear all messaging-related data
    messagePersistence.clearAllMessages();
    conversationPersistence.clearConversations();
    selectedConversationPersistence.clearSelectedConversation();

    // Clear user mapping and tokens
    userMappingService.clearAll();

    // Clear from global
    if (typeof window !== "undefined") {
      delete (window as any).__MESSAGING_APP_CURRENT_USER_ID__;
    }

    console.log("✅ User logged out successfully - all data cleared");
  };

  const isLoggedIn = currentUserId !== null && mainUserId !== null;

  return (
    <UserContext.Provider
      value={{
        currentUserId,
        mainUserId,
        setUserData,
        currentUserName,
        logout,
        isLoggedIn,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
