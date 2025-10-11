# Fix Summary: Group Members & User Profiles

## Issues Fixed

### 1. ✅ Username and User Profile Not Loaded - Profile Icon
- **Problem**: User profile information wasn't being fetched from backend
- **Solution**: 
  - Created `userService.ts` to fetch user profile from collab-service
  - Added `useEffect` in App.tsx to fetch current user profile on mount
  - Updated `currentUser` object to use profile data (username, profilePictureUrl)

### 2. ✅ Group Members Shown as "Unknown" - Fetch Correctly  
- **Problem**: Backend was returning only usernames (string array) instead of full user objects
- **Solution**:
  - **Backend Changes**:
    - Modified `GroupService.getGroupMembers()` to return `List<UserDTO>` instead of `List<String>`
    - Added `convertUserToDTO()` method to convert User entities to DTOs with full details
    - Updated `GroupController.getGroupMembers()` return type to `List<UserDTO>`
    - Added `UserDTO` import to both files
  - **Frontend Changes**:
    - Updated `GroupMembersModal` data mapping to handle UserDTO fields:
      - `username` or `displayName` or `email` for display name
      - `profilePictureUrl` for avatar
      - `status === 'online'` for online status
      - `isOnline` boolean field

### 3. ✅ Group Messages Don't Show Sender Names - Only "Unknown"
- **Problem**: Messages in group chats didn't include sender name information
- **Solution**:
  - **Backend Changes**:
    - Added `senderName` field to `ChatMessageDTO.java`
    - Updated `GroupMessageService.convertToDTO()` to include sender username:
      ```java
      .senderName(message.getSender().getUsername())
      ```
    - Updated `PrivateMessageService.convertToDTO()` for consistency
  - **Frontend**:
    - Type already had `senderName` field in Message interface
    - `MessageItem.tsx` already had logic to display `message.senderName`
    - Falls back to looking up in usersMap if senderName is missing

## Files Modified

### Backend (/home/parakrama/Documents/SEP/Backend/collab-service/)

1. **src/main/java/com/midlinex/collab_service/dto/ChatMessageDTO.java**
   - Added `private String senderName;` field

2. **src/main/java/com/midlinex/collab_service/service/GroupService.java**
   - Changed return type: `List<UserDTO> getGroupMembers(UUID groupId)`
   - Added `convertUserToDTO(User user)` method
   - Added import: `import com.midlinex.collab_service.dto.UserDTO;`

3. **src/main/java/com/midlinex/collab_service/controller/GroupController.java**
   - Changed return type: `ResponseEntity<List<UserDTO>> getGroupMembers(...)`
   - Added import: `import com.midlinex.collab_service.dto.UserDTO;`

4. **src/main/java/com/midlinex/collab_service/service/GroupMessageService.java**
   - Added `.senderName(message.getSender().getUsername())` in `convertToDTO()`

5. **src/main/java/com/midlinex/collab_service/service/PrivateMessageService.java**
   - Added `.senderName(message.getSender().getUsername())` in `convertToDTO()`

### Frontend (/home/parakrama/Documents/SEP/Frontend/Messaging-app/)

1. **src/services/userService.ts** (NEW FILE)
   - `getUserById(userId)` - Fetch user profile by ID
   - `getUserByUsername(username)` - Fetch user profile by username
   - `getUsersByIds(userIds)` - Batch fetch multiple users
   - `updateUserStatus(userId, status)` - Update user online status

2. **src/services/index.ts**
   - Added export: `export * from "./userService";`

3. **src/components/modals/GroupMembersModal.tsx**
   - Updated data mapping to handle UserDTO format:
     - `username || displayName || email` for display name
     - `profilePictureUrl` for avatar
     - `status === 'online'` for isOnline check

4. **src/App.tsx**
   - Added import: `import { userService } from "./services/userService";`
   - Added state: `const [userProfile, setUserProfile] = useState<any>(null);`
   - Added useEffect to fetch user profile on mount
   - Updated `currentUser` object to use profile data

## How to Test

### Setup
1. **Build Backend**:
   ```bash
   cd /home/parakrama/Documents/SEP/Backend/collab-service
   ./mvnw clean package -DskipTests
   ```

2. **Restart Backend**:
   ```bash
   java -jar target/project-management-tool-collab_service-0.0.1-SNAPSHOT.jar
   ```

3. **Frontend** (should already be running):
   - If not: `cd /home/parakrama/Documents/SEP/Frontend/Messaging-app && pnpm start`

### Test Scenarios

#### Test 1: User Profile Display
1. Open the app in browser
2. Check browser console for: `✅ Fetched user profile: {...}`
3. Verify user's name appears correctly (from username field)
4. If user has profilePictureUrl, it should display instead of emoji

#### Test 2: Group Members Modal
1. Click on a group conversation in the sidebar
2. In the chat header, click the group icon (👥)
3. **Expected Results**:
   - Modal opens with group name and member count
   - Each member shows:
     - ✅ Username (not "Unknown User")
     - ✅ Email (if available)
     - ✅ Avatar (profile picture or initials)
     - ✅ Green dot if online
   - Console should show:
     ```
     Fetching members for group: <groupId>
     Group members response: [...]
     Processed members data: [...]
     Sample member: {id: "...", username: "...", ...}
     Valid members: [...]
     ```

#### Test 3: Group Chat Sender Names
1. Open a group chat
2. Send a message (or view existing group messages)
3. **Expected Results**:
   - Your messages show on the right (no sender name)
   - Other users' messages show:
     - ✅ Sender's username in green above message
     - ✅ Sender's avatar on left
     - ✅ NOT "Unknown User"
   - Console might show: Retrieved senderName from message data

### Debugging

If issues persist, check console logs for:

1. **Group Members**:
   - Look for "Group members response:" log
   - Check if data structure matches expectations
   - Verify `username` field exists in response

2. **Message Sender Names**:
   - Look for message objects in console
   - Check if `senderName` field is present
   - Verify it's not null or undefined

3. **User Profile**:
   - Look for "Fetching user profile for:" log
   - Check if API returns valid user object
   - Verify username field is populated

## API Endpoints Used

1. **GET** `/api/groups/{groupId}/members`
   - Returns: `List<UserDTO>`
   - Fields: id, username, email, status, isOnline, profilePictureUrl

2. **GET** `/api/users/{userId}`
   - Returns: `UserDTO`
   - Same fields as above

3. **WebSocket** Message payload now includes:
   - `senderName`: Username of message sender
   - Used for displaying sender names in group chats

## Rollback Instructions

If needed, git diff shows all changes. To rollback:

```bash
# Backend
cd /home/parakrama/Documents/SEP/Backend/collab-service
git checkout src/main/java/com/midlinex/collab_service/

# Frontend
cd /home/parakrama/Documents/SEP/Frontend/Messaging-app
git checkout src/services/userService.ts src/App.tsx
git checkout src/components/modals/GroupMembersModal.tsx
```

## Next Steps

1. Test all three scenarios thoroughly
2. If profilePictureUrl is null, consider adding avatar upload feature
3. Consider caching user profiles to reduce API calls
4. Add error boundaries for profile fetch failures
5. Consider adding real-time updates when user profiles change
