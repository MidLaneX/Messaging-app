import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface UserContextType {
  currentUserId: string | null;
  setCurrentUserId: (userId: string) => void;
  currentUserName: string | null;
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
  const [currentUserId, setCurrentUserIdState] = useState<string | null>(null);
  const [currentUserName, setCurrentUserName] = useState<string | null>(null);

  // Load user from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem(USER_STORAGE_KEY);
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setCurrentUserIdState(userData.id);
        setCurrentUserName(userData.name);
      } catch (error) {
        console.error('Error parsing saved user data:', error);
        localStorage.removeItem(USER_STORAGE_KEY);
      }
    }
  }, []);

  const setCurrentUserId = (userId: string) => {
    // Map userId to name
    const userMap: Record<string, string> = {
      'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11': 'Parakrama',
      'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12': 'Pasindu'
    };

    const userName = userMap[userId] || 'Unknown User';
    
    setCurrentUserIdState(userId);
    setCurrentUserName(userName);
    
    // Save to localStorage
    const userData = { id: userId, name: userName };
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));
    
    // Update the APP_CONFIG dynamically
    if (typeof window !== 'undefined') {
      (window as any).__MESSAGING_APP_CURRENT_USER_ID__ = userId;
    }
  };

  const logout = () => {
    setCurrentUserIdState(null);
    setCurrentUserName(null);
    localStorage.removeItem(USER_STORAGE_KEY);
    
    // Clear from global
    if (typeof window !== 'undefined') {
      delete (window as any).__MESSAGING_APP_CURRENT_USER_ID__;
    }
  };

  const isLoggedIn = currentUserId !== null;

  return (
    <UserContext.Provider
      value={{
        currentUserId,
        setCurrentUserId,
        currentUserName,
        logout,
        isLoggedIn,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
