/**
 * Google OAuth Diagnostic Tool
 * Helps identify client ID mismatches and configuration issues
 */

export const diagnoseGoogleOAuth = () => {
  const frontendClientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;
  
  console.group('🔍 Google OAuth Diagnostic');
  console.log('Frontend Client ID:', frontendClientId);
  console.log('Current Domain:', window.location.origin);
  console.log('Expected Domain for this Client ID: Check Google Cloud Console');
  
  // Check if client ID format is correct
  const clientIdPattern = /^\d+-[a-zA-Z0-9]+\.apps\.googleusercontent\.com$/;
  const isValidFormat = clientIdPattern.test(frontendClientId || '');
  
  console.log('Client ID Format Valid:', isValidFormat);
  
  if (!isValidFormat) {
    console.error('❌ Invalid Google Client ID format!');
    console.log('Expected format: xxxxx-yyyyyyy.apps.googleusercontent.com');
  }
  
  // Check environment
  console.log('Environment Info:');
  console.log('- NODE_ENV:', process.env.NODE_ENV);
  console.log('- Current URL:', window.location.href);
  console.log('- Main App API URL:', process.env.REACT_APP_MAIN_APP_API_URL);
  
  console.groupEnd();
  
  return {
    frontendClientId,
    isValidFormat,
    currentDomain: window.location.origin,
    mainAppApiUrl: process.env.REACT_APP_MAIN_APP_API_URL
  };
};