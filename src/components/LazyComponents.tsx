/**
 * Lazy-loaded components for better performance
 */
import { lazy } from 'react';

// Lazy load heavy components
export const ChatWindow = lazy(() => import('./ChatWindow'));
export const UserList = lazy(() => import('./UserList'));
export const SettingsModal = lazy(() => import('./modals/SettingsModal'));
export const CreateGroupModal = lazy(() => import('./modals/CreateGroupModal'));
export const NewChatModal = lazy(() => import('./modals/NewChatModal'));

// Lazy load heavy UI components
export const EmojiPicker = lazy(() => import('./UI/EmojiPicker'));
export const FileAttachmentMenu = lazy(() => import('./UI/FileAttachmentMenu'));