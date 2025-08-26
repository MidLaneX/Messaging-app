export interface User {
  id: string;
  name: string;
  avatar?: string;
  lastSeen?: Date;
  isOnline: boolean;
  isGroup?: boolean;
  participants?: string[]; // For groups
}
export type MessageType = "TEXT" | "IMAGE" | "FILE" | "AUDIO";
export type ChatType = "PRIVATE" | "GROUP";

export interface Message {
  id: string; // UUID string
  senderId: string;
  senderName?: string; // For displaying sender names in groups
  recipientId?: string;
  groupId?: string;
  recipientIds?: string[];
  content: string;
  encryptedContent?: string;
  type: "TEXT" | "FILE" | "IMAGE" | "SYSTEM";
  chatType: "PRIVATE" | "GROUP";
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  fileType?: string;
  encryptionKeyId?: string; // UUID string
  createdAt?: string | null; // ISO string
  deliveredAt?: string | null; // ISO string
  readAt?: string | null; // ISO string
  isEdited?: boolean;
  editedAt?: string | null; // ISO string
  chatId?: string;
}

export interface ChatRoom {
  id: string;
  participants: string[];
  lastMessage?: Message;
  unreadCount: number;
  isGroup: boolean;
  name?: string;
  avatar?: string;
}

export interface OnlineStatus {
  [userId: string]: boolean;
}

export interface StatusUpdate {
  userId: string;
  status: "ONLINE" | "OFFLINE";
  lastSeen?: string | null; // ISO string timestamp
}

export interface MessageStatus {
  id: string;
  messageId: string;
  userId: string;
  status: 'sent' | 'delivered' | 'read';
  timestamp: Date;
}
