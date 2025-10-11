# Quick Test Guide

## Start the Backend (if not running)

```bash
cd /home/parakrama/Documents/SEP/Backend/collab-service
java -jar target/project-management-tool-collab_service-0.0.1-SNAPSHOT.jar
```

Wait for: `Started CollabServiceApplication`

## Frontend Should Auto-Reload

The React dev server will automatically pick up the changes.

## Test Checklist

### ✅ Test 1: User Profile Icon
- [ ] Open browser console (F12)
- [ ] Look for log: `✅ Fetched user profile: {...}`
- [ ] Check if your username appears correctly in the UI
- [ ] Verify your avatar shows (either profile pic or emoji)

### ✅ Test 2: Click Group Icon to See Members  
- [ ] Click on any group in the sidebar
- [ ] Click the group icon (👥) in the chat header
- [ ] Modal should open showing:
  - [ ] Group name
  - [ ] Member count
  - [ ] List of members with usernames (NOT "Unknown User")
  - [ ] Member emails (if available)
  - [ ] Green dot for online members

**Console should show:**
```
Fetching members for group: <uuid>
Group members response: Array(X)
Sample member: {id: "...", username: "...", email: "...", ...}
Valid members: Array(X)
```

### ✅ Test 3: Group Messages Show Sender Names
- [ ] Open a group chat
- [ ] Look at messages from other users
- [ ] Each message should show:
  - [ ] Sender's name in green text above the message
  - [ ] Sender's avatar on the left
  - [ ] NOT "Unknown User"

## Troubleshooting

### Issue: Still showing "Unknown User" in group members
**Check:**
1. Backend console - any errors when calling `/api/groups/{id}/members`?
2. Browser console - what does "Group members response" show?
3. Is the username field actually populated in your database?

**Fix:**
- Check database: `SELECT * FROM users LIMIT 5;`
- Verify users have username field filled

### Issue: Group messages still show "Unknown" sender
**Check:**
1. Browser console - inspect a message object
2. Does it have `senderName` field?
3. Check backend logs when message is sent

**Fix:**
- Ensure backend was rebuilt and restarted after changes
- Check WebSocket message in browser Network tab

### Issue: User profile not loading
**Check:**
1. Browser console - any 404 or 500 errors?
2. Is the API call to `/api/users/{userId}` successful?
3. Does the user exist in database?

**Fix:**
- Verify your userId is correct
- Check backend logs for errors
- Test API directly: `curl http://localhost:8090/api/users/{your-user-id}`

## Quick API Tests

```bash
# Test get user by ID
curl http://localhost:8090/api/users/YOUR-USER-ID

# Test get group members
curl http://localhost:8090/api/groups/GROUP-ID/members

# Should return array of user objects with username, email, etc.
```

## Expected Console Logs

When everything works:

```
✅ Fetched user profile: {id: "...", username: "...", ...}
Fetching members for group: ...
Group members response: [{id: "...", username: "Alice", ...}, ...]
Valid members: [{id: "...", username: "Alice", isOnline: true}, ...]
```

## Still Have Issues?

1. Check `FIX_SUMMARY.md` for detailed information
2. Verify all backend files were saved
3. Ensure backend was rebuilt: `./mvnw clean package -DskipTests`
4. Restart backend service
5. Clear browser cache and reload
6. Check database has users with usernames populated
