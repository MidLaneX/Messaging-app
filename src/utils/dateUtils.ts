/**
 * Safely convert various date formats to Date object
 */
export const createSafeDate = (dateValue: any): Date | undefined => {
  if (!dateValue) return undefined;
  if (dateValue instanceof Date) return dateValue;

  try {
    const date = new Date(dateValue);
    return isNaN(date.getTime()) ? undefined : date;
  } catch (error) {
    console.warn("Invalid date value:", dateValue);
    return undefined;
  }
};

/**
 * Format time for display in messages
 */
export const formatMessageTime = (date: Date | string | undefined): string => {
  const safeDate = createSafeDate(date);
  if (!safeDate) return '';
  
  return safeDate.toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: false 
  });
};

/**
 * Format date for display in message separators
 */
export const formatMessageDate = (date: Date | string | undefined): string => {
  const safeDate = createSafeDate(date);
  if (!safeDate) return '';
  
  const now = new Date();
  const isToday = safeDate.toDateString() === now.toDateString();
  const isYesterday = safeDate.toDateString() === new Date(now.getTime() - 24 * 60 * 60 * 1000).toDateString();
  
  if (isToday) return 'Today';
  if (isYesterday) return 'Yesterday';
  
  return safeDate.toLocaleDateString([], { 
    month: 'short', 
    day: 'numeric',
    year: safeDate.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
  });
};

/**
 * Format relative time for last seen or message timestamps
 */
export const formatRelativeTime = (date: Date | string | undefined): string => {
  if (!date) return '';
  
  // Convert to Date object safely
  const safeDate = createSafeDate(date);
  if (!safeDate) return '';
  
  const now = new Date();
  const diff = now.getTime() - safeDate.getTime();
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (minutes < 1) return 'now';
  if (minutes < 60) return `${minutes}m`;
  if (hours < 24) return `${hours}h`;
  return `${days}d`;
};

/**
 * Format last seen text
 */
export const formatLastSeen = (lastSeen: Date | string | undefined): string => {
  if (!lastSeen) return "Offline";

  // Convert to Date object safely
  const safeDate = createSafeDate(lastSeen);
  if (!safeDate) return "Offline";

  const now = new Date();
  const diff = now.getTime() - safeDate.getTime();
  
  // If difference is negative (future date), treat as offline
  if (diff < 0) return "Offline";
  
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (minutes < 1) return "Last seen just now";
  if (minutes < 60)
    return `Last seen ${minutes} minute${minutes > 1 ? "s" : ""} ago`;
  if (hours < 24) return `Last seen ${hours} hour${hours > 1 ? "s" : ""} ago`;
  if (days < 7) return `Last seen ${days} day${days > 1 ? "s" : ""} ago`;

  // For older dates, show the actual date
  return `Last seen ${safeDate.toLocaleDateString()}`;
};

/**
 * Check if two dates are on the same day
 */
export const isSameDay = (date1: Date, date2: Date): boolean => {
  return date1.toDateString() === date2.toDateString();
};

/**
 * Truncate text to specified length
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
};
