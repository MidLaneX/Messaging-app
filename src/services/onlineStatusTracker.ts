/**
 * Online Status Tracker Service
 * 
 * Tracks user online status based on:
 * 1. Recent message activity (sent message in last 2 minutes = online)
 * 2. WebSocket connection activity (if available)
 * 
 * This is a client-side solution since backend isOnline isn't reliable.
 */

// Time threshold for considering a user online based on message activity (2 minutes)
const ONLINE_THRESHOLD_MS = 2 * 60 * 1000;

// Map to track last activity time for each user
const userActivityMap = new Map<string, Date>();

// Map to track users we know are connected via WebSocket
const connectedUsersSet = new Set<string>();

/**
 * Update user activity when they send a message
 */
export function updateUserActivity(userId: string): void {
  userActivityMap.set(userId, new Date());
  console.log(`📱 Updated activity for user ${userId}`);
}

/**
 * Mark user as connected via WebSocket
 */
export function markUserConnected(userId: string): void {
  connectedUsersSet.add(userId);
  userActivityMap.set(userId, new Date());
  console.log(`🟢 User ${userId} marked as connected`);
}

/**
 * Mark user as disconnected from WebSocket
 */
export function markUserDisconnected(userId: string): void {
  connectedUsersSet.delete(userId);
  console.log(`🔴 User ${userId} marked as disconnected`);
}

/**
 * Check if user is online based on:
 * 1. WebSocket connection status
 * 2. Recent message activity (within last 2 minutes)
 */
export function isUserOnline(userId: string): boolean {
  // Check if user is in connected users set
  if (connectedUsersSet.has(userId)) {
    return true;
  }

  // Check if user has recent activity
  const lastActivity = userActivityMap.get(userId);
  if (lastActivity) {
    const timeSinceActivity = Date.now() - lastActivity.getTime();
    const isActive = timeSinceActivity < ONLINE_THRESHOLD_MS;
    
    if (isActive) {
      console.log(`✅ User ${userId} is online (active ${Math.round(timeSinceActivity / 1000)}s ago)`);
    }
    
    return isActive;
  }

  return false;
}

/**
 * Get last activity time for a user
 */
export function getUserLastActivity(userId: string): Date | undefined {
  return userActivityMap.get(userId);
}

/**
 * Update activity from message timestamp
 */
export function updateActivityFromMessage(userId: string, messageTimestamp: string | Date): void {
  const messageDate = typeof messageTimestamp === 'string' 
    ? new Date(messageTimestamp) 
    : messageTimestamp;

  const currentActivity = userActivityMap.get(userId);
  
  // Only update if this message is more recent than current activity
  if (!currentActivity || messageDate > currentActivity) {
    userActivityMap.set(userId, messageDate);
    console.log(`📩 Updated activity from message for user ${userId}:`, messageDate);
  }
}

/**
 * Clean up old activity records (call periodically)
 * Removes activity records older than 1 hour
 */
export function cleanupOldActivity(): void {
  const oneHourAgo = Date.now() - (60 * 60 * 1000);
  const usersToRemove: string[] = [];
  
  userActivityMap.forEach((lastActivity, userId) => {
    if (lastActivity.getTime() < oneHourAgo) {
      usersToRemove.push(userId);
    }
  });
  
  usersToRemove.forEach(userId => {
    userActivityMap.delete(userId);
    console.log(`🧹 Cleaned up old activity for user ${userId}`);
  });
}

/**
 * Clear all tracking data (useful for logout/cleanup)
 */
export function clearAllTracking(): void {
  userActivityMap.clear();
  connectedUsersSet.clear();
  console.log('🧹 Cleared all online status tracking');
}

/**
 * Get all currently online users
 */
export function getOnlineUsers(): string[] {
  const onlineUsers = new Set<string>();
  
  // Add connected users
  connectedUsersSet.forEach(userId => onlineUsers.add(userId));
  
  // Add users with recent activity
  const now = Date.now();
  userActivityMap.forEach((lastActivity, userId) => {
    if (now - lastActivity.getTime() < ONLINE_THRESHOLD_MS) {
      onlineUsers.add(userId);
    }
  });
  
  return Array.from(onlineUsers);
}
