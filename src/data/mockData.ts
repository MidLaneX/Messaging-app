import { User, Message } from '../types';

export const mockUsers: User[] = [
  {
    id: "user-1",
    name: "Alice Johnson",
    avatar: "👩‍💼",
    lastSeen: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
    isOnline: true,
  },
  {
    id: "user-2",
    name: "Bob Smith",
    avatar: "👨‍💻",
    lastSeen: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
    isOnline: false,
  },
  {
    id: "user-3",
    name: "Carol Williams",
    avatar: "👩‍🎨",
    lastSeen: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    isOnline: false,
  },
  {
    id: "user-4",
    name: "David Brown",
    avatar: "👨‍🔬",
    lastSeen: new Date(),
    isOnline: true,
  },
  {
    id: "user-5",
    name: "Emma Davis",
    avatar: "👩‍🚀",
    lastSeen: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    isOnline: false,
  },
];

export const mockMessages: Message[] = [
  {
    id: "msg-1",
    senderId: "user-1",
    receiverId: "current-user",
    content: "Hey! How are you doing?",
    timestamp: new Date(Date.now() - 10 * 60 * 1000),
    isRead: true,
    type: 'text',
  },
  {
    id: "msg-2",
    senderId: "current-user",
    receiverId: "user-1",
    content: "I'm doing great! Thanks for asking 😊",
    timestamp: new Date(Date.now() - 8 * 60 * 1000),
    isRead: true,
    type: 'text',
  },
  {
    id: "msg-3",
    senderId: "user-1",
    receiverId: "current-user",
    content: "That's awesome! Are you free for a quick call later?",
    timestamp: new Date(Date.now() - 5 * 60 * 1000),
    isRead: false,
    type: 'text',
  },
  {
    id: "msg-4",
    senderId: "user-2",
    receiverId: "current-user",
    content: "Could you review the code changes I made yesterday?",
    timestamp: new Date(Date.now() - 45 * 60 * 1000),
    isRead: false,
    type: 'text',
  },
  {
    id: "msg-5",
    senderId: "current-user",
    receiverId: "user-2",
    content: "Sure thing! I'll take a look this afternoon.",
    timestamp: new Date(Date.now() - 40 * 60 * 1000),
    isRead: true,
    type: 'text',
  },
];

export const currentUser: User = {
  id: "current-user",
  name: "You",
  avatar: "😊",
  isOnline: true,
};
