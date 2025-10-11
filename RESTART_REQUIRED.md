# 🔄 Restart Required

## Environment Variables Updated

The `.env` file has been updated with social authentication credentials. **You must restart the development server** for the changes to take effect.

## Quick Fix

### 1. Stop the Current Server

Press `Ctrl+C` in the terminal where `npm start` is running

### 2. Restart the Server

```bash
cd /home/parakrama/Documents/SEP/Frontend/Messaging-app
npm start
```

### 3. Verify Environment Variables

After restart, open the browser console and check:

```javascript
// Check if env vars are loaded
console.log('Google Client ID:', process.env.REACT_APP_GOOGLE_CLIENT_ID?.substring(0, 20) + '...');
console.log('Facebook App ID:', process.env.REACT_APP_FACEBOOK_APP_ID);
console.log('Main App API:', process.env.REACT_APP_MAIN_APP_API_URL);
```

You should see:
```
Google Client ID: 868509332944-0opebuommt7vqucco5rdb4l5qsdl4guu.apps.googleusercontent.com
Facebook App ID: 1234567890123456
Main App API: http://localhost:8080/api
```

## What Was Added

### `.env` File

```bash
# Main app authentication endpoint
REACT_APP_MAIN_APP_API_URL="http://localhost:8080/api"

# Social Authentication
REACT_APP_GOOGLE_CLIENT_ID=868509332944-0opebuommt7vqucco5rdb4l5qsdl4guu.apps.googleusercontent.com
REACT_APP_FACEBOOK_APP_ID=1234567890123456
```

## Why Restart is Needed

**Create React App loads environment variables at build time**, not runtime. Changes to `.env` files require a server restart to be picked up.

### Environment Variable Rules

1. **Must start with `REACT_APP_`** to be accessible in the app
2. **Loaded only at startup** - changes require restart
3. **Never commit sensitive credentials** - use `.env.local` for secrets

## After Restart

You should see:
- ✅ No warnings about "Google Client ID not configured"
- ✅ No warnings about "Facebook App ID not configured"
- ✅ Google Sign-In button renders properly
- ✅ Facebook Login button is enabled

## Still Having Issues?

### Clear Cache and Restart

```bash
# Stop the server (Ctrl+C)
rm -rf node_modules/.cache
npm start
```

### Check Environment Variable Loading

Add this to `src/index.tsx` temporarily:

```typescript
console.log('🔧 Environment Variables Loaded:');
console.log('GOOGLE_CLIENT_ID:', !!process.env.REACT_APP_GOOGLE_CLIENT_ID);
console.log('FACEBOOK_APP_ID:', !!process.env.REACT_APP_FACEBOOK_APP_ID);
console.log('MAIN_APP_API_URL:', process.env.REACT_APP_MAIN_APP_API_URL);
```

### Verify File Contents

```bash
cat .env | grep REACT_APP_GOOGLE_CLIENT_ID
cat .env | grep REACT_APP_FACEBOOK_APP_ID
cat .env | grep REACT_APP_MAIN_APP_API_URL
```

## Expected Behavior After Restart

### Login Page Should Show:

1. **Email/Password Form** ✅
2. **"Or continue with" divider** ✅
3. **Google Sign-In button** (official Google style) ✅
4. **Facebook Login button** (blue with Facebook logo) ✅

### Console Should Show:

```
⚙️ Configuring Google Identity Services...
📦 Loading Google Identity Services...
✅ Google Identity Services loaded
📦 Loading Facebook SDK...
✅ Facebook SDK loaded
```

## Next Steps

Once restarted:
1. ✅ Test Google login
2. ✅ Test Facebook login
3. ✅ Test email/password login
4. ✅ Verify user mapping works

---

**Note:** This is a one-time setup. Once the server is restarted, the credentials will be available until you change them again.
