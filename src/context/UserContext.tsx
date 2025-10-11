import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { userMappingService } from "../services/userMappingService";

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
      }
    }
  }, []);

  const setUserData = (mainId: number, collabId: string, userName: string) => {
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
    setCurrentUserIdState(null);
    setMainUserIdState(null);
    setCurrentUserName(null);
    localStorage.removeItem(USER_STORAGE_KEY);

    // Clear user mapping and tokens
    userMappingService.clearAll();

    // Clear from global
    if (typeof window !== "undefined") {
      delete (window as any).__MESSAGING_APP_CURRENT_USER_ID__;
    }

    console.log("✅ User logged out successfully");
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
