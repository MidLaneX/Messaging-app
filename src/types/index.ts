export interface User {
  id: string;
  name: string;
  avatar?: string;
  lastSeen?: Date;
  isOnline: boolean;
  isGroup?: boolean;
  participants?: string[]; // For groups
  memberCount?: number; // For groups - total member count
}
export type MessageType = "TEXT" | "IMAGE" | "FILE" | "AUDIO";
export type ChatType = "PRIVATE" | "GROUP";

export interface FileAttachment {
  originalName: string;
  fileName: string; // Secure filename in storage
  fileSize: number;
  mimeType: string;
  fileUrl: string;
  downloadUrl?: string; // Signed URL for secure download
  uploadedAt: string;
  uploadedBy: string;
  category: 'image' | 'video' | 'audio' | 'pdf' | 'document' | 'spreadsheet' | 'presentation' | 'archive' | 'file';
  icon: string;
  previewUrl?: string; // For images/thumbnails
  fileId?: string; // Backend file ID for file operations
}

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
  // Legacy file fields (kept for backward compatibility)
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  fileType?: string;
  // New file attachment structure
  fileAttachment?: FileAttachment;
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
  memberCount?: number; // Add member count for groups
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
