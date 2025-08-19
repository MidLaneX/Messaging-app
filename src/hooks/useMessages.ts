import { useState, useCallback } from 'react';
import { Message } from '../types';
import { generateId } from '../utils';

interface UseMessagesReturn {
  messages: Message[];
  addMessage: (content: string, senderId: string, recipientId: string) => void;
  markAsRead: (messageId: string) => void;
  getMessagesForUsers: (userId1: string, userId2: string) => Message[];
  getUnreadCount: (senderId: string, recipientId: string) => number;
  getLastMessage: (userId1: string, userId2: string) => Message | undefined;
}

export const useMessages = (
  initialMessages: Message[] = []
): UseMessagesReturn => {
  const [messages, setMessages] = useState<Message[]>(initialMessages);

  const addMessage = useCallback(
    (content: string, senderId: string, recipientId: string) => {
      const newMessage: Message = {
        id: generateId(),
        senderId,
        recipientId,
        content,
        type: "TEXT",
        chatType: "PRIVATE", // or another valid ChatType value
      };

      setMessages((prev) => [...prev, newMessage]);
    },
    []
  );

  const markAsRead = useCallback((messageId: string) => {
    setMessages((prev) =>
      prev.map((msg) => (msg.id === messageId ? { ...msg, isRead: true } : msg))
    );
  }, []);

  const getMessagesForUsers = useCallback(
    (userId1: string, userId2: string): Message[] => {
      return messages
        .filter(
          (msg) =>
            (msg.senderId === userId1 && msg.recipientId === userId2) ||
            (msg.senderId === userId2 && msg.recipientId === userId1)
        )
        .sort((a, b) => {
          const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return aTime - bTime;
        });
    },
    [messages]
  );

  const getUnreadCount = useCallback(
    (senderId: string, recipientId: string): number => {
      return messages.filter(
        (msg) =>
          msg.senderId === senderId &&
          msg.recipientId === recipientId &&
          !msg.readAt
      ).length;
    },
    [messages]
  );

  const getLastMessage = useCallback(
    (userId1: string, userId2: string): Message | undefined => {
      const userMessages = getMessagesForUsers(userId1, userId2);
      return userMessages.length > 0
        ? userMessages[userMessages.length - 1]
        : undefined;
    },
    [getMessagesForUsers]
  );

  return {
    messages,
    addMessage,
    markAsRead,
    getMessagesForUsers,
    getUnreadCount,
    getLastMessage,
  };
};
