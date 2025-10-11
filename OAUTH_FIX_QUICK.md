# 🚀 Quick Fix: Google OAuth Error 400

## TL;DR - 2 Minute Fix

1. Go to: https://console.cloud.google.com/apis/credentials
2. Click your OAuth Client ID
3. Add to **Authorized JavaScript origins**:
   ```
   http://localhost:3000
   ```
4. Click **SAVE**
5. Wait 5 minutes
6. Refresh your app

**Done!** ✅

---

## Alternative: Use Your Own Client ID (5 minutes)

### Step 1: Create New OAuth Client

```bash
# Go to: https://console.cloud.google.com/apis/credentials
# Click: + CREATE CREDENTIALS → OAuth client ID
# Type: Web application
# Add origin: http://localhost:3000
# Copy the Client ID
```

### Step 2: Update .env

```bash
# Open: /home/parakrama/Documents/SEP/Frontend/Messaging-app/.env
# Replace with your new Client ID:
REACT_APP_GOOGLE_CLIENT_ID=YOUR-NEW-CLIENT-ID.apps.googleusercontent.com
```

### Step 3: Restart

```bash
# Press Ctrl+C to stop server
npm start
```

**Done!** ✅

---

## Don't Want to Fix Now?

Just use **email/password login** instead! Social login is optional.

The regular email/password authentication works perfectly without OAuth configuration.

---

## Error Explained

**Error:** `origin_mismatch`

**Meaning:** Google doesn't recognize `http://localhost:3000` as a valid origin for this app.

**Fix:** Add it in Google Cloud Console (takes 2 minutes)

---

## Full Guide

See: `docs/GOOGLE_OAUTH_FIX.md` for detailed step-by-step instructions with screenshots.
