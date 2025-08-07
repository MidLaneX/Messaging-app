import { useState, useCallback } from 'react';
import { User } from '../types';

interface UseUsersReturn {
  users: User[];
  currentUser: User;
  selectedUser: User | null;
  setSelectedUser: (user: User | null) => void;
  updateUserStatus: (userId: string, isOnline: boolean) => void;
  updateLastSeen: (userId: string, lastSeen: Date) => void;
}

export const useUsers = (initialUsers: User[] = [], initialCurrentUser: User): UseUsersReturn => {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [currentUser] = useState<User>(initialCurrentUser);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const updateUserStatus = useCallback((userId: string, isOnline: boolean) => {
    setUsers(prev => 
      prev.map(user => 
        user.id === userId 
          ? { ...user, isOnline, lastSeen: isOnline ? undefined : new Date() }
          : user
      )
    );
  }, []);

  const updateLastSeen = useCallback((userId: string, lastSeen: Date) => {
    setUsers(prev => 
      prev.map(user => 
        user.id === userId ? { ...user, lastSeen } : user
      )
    );
  }, []);

  return {
    users,
    currentUser,
    selectedUser,
    setSelectedUser,
    updateUserStatus,
    updateLastSeen,
  };
};
