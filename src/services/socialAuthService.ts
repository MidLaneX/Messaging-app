/**
 * Social Authentication Service for Messaging App
 * 
 * Handles Google and Facebook authentication using OAuth
 * Adapted from main app's social auth service
 */

// Get credentials from environment
const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID || '';
const FACEBOOK_APP_ID = process.env.REACT_APP_FACEBOOK_APP_ID || '';

export interface SocialAuthResponse {
  accessToken: string;
  provider: 'google' | 'facebook';
  email: string;
  name: string;
  profilePicture?: string;
}

export interface GoogleCredentialResponse {
  credential: string;
  select_by: string;
}

export interface FacebookAuthResponse {
  authResponse: {
    accessToken: string;
    expiresIn: number;
    signedRequest: string;
    userID: string;
  };
  status: string;
}

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          renderButton: (parent: HTMLElement, options: any) => void;
          prompt: () => void;
        };
      };
    };
    FB?: {
      init: (config: any) => void;
      login: (callback: (response: FacebookAuthResponse) => void, options?: any) => void;
      api: (path: string, callback: (response: any) => void) => void;
    };
  }
}

export class SocialAuthService {
  private static instance: SocialAuthService;

  static getInstance(): SocialAuthService {
    if (!SocialAuthService.instance) {
      SocialAuthService.instance = new SocialAuthService();
    }
    return SocialAuthService.instance;
  }

  // Initialize Google Identity Services
  initializeGoogle(onCredentialResponse: (response: GoogleCredentialResponse) => void): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!GOOGLE_CLIENT_ID) {
        console.warn('⚠️ Google Client ID not configured in environment variables');
        reject(new Error('Google Client ID not configured'));
        return;
      }

      // Load Google Identity Services script if not already loaded
      if (!window.google) {
        console.log('📦 Loading Google Identity Services...');
        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        script.onload = () => {
          console.log('✅ Google Identity Services loaded');
          this.configureGoogle(onCredentialResponse);
          resolve();
        };
        script.onerror = () => {
          console.error('❌ Failed to load Google Identity Services');
          reject(new Error('Failed to load Google Identity Services'));
        };
        document.head.appendChild(script);
      } else {
        this.configureGoogle(onCredentialResponse);
        resolve();
      }
    });
  }

  private configureGoogle(onCredentialResponse: (response: GoogleCredentialResponse) => void) {
    console.log('⚙️ Configuring Google Identity Services...');
    window.google?.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: onCredentialResponse,
      auto_select: false,
      cancel_on_tap_outside: true,
    });
  }

  // Render Google Sign-In button
  renderGoogleButton(elementId: string, theme: 'outline' | 'filled_blue' | 'filled_black' = 'outline') {
    const element = document.getElementById(elementId);
    if (!element || !window.google) {
      console.warn('⚠️ Cannot render Google button - element or SDK not found');
      return;
    }

    window.google.accounts.id.renderButton(element, {
      theme,
      size: 'large',
      width: '100%',
      text: 'continue_with',
      shape: 'rectangular',
    });
  }

  // Initialize Facebook SDK
  initializeFacebook(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!FACEBOOK_APP_ID) {
        console.warn('⚠️ Facebook App ID not configured in environment variables');
        reject(new Error('Facebook App ID not configured'));
        return;
      }

      // Load Facebook SDK script if not already loaded
      if (!window.FB) {
        console.log('📦 Loading Facebook SDK...');
        const script = document.createElement('script');
        script.src = 'https://connect.facebook.net/en_US/sdk.js';
        script.async = true;
        script.defer = true;
        script.onload = () => {
          console.log('✅ Facebook SDK loaded');
          window.FB?.init({
            appId: FACEBOOK_APP_ID,
            cookie: true,
            xfbml: true,
            version: 'v18.0',
          });
          resolve();
        };
        script.onerror = () => {
          console.error('❌ Failed to load Facebook SDK');
          reject(new Error('Failed to load Facebook SDK'));
        };
        document.head.appendChild(script);
      } else {
        resolve();
      }
    });
  }

  // Facebook login
  loginWithFacebook(): Promise<SocialAuthResponse> {
    return new Promise((resolve, reject) => {
      if (!window.FB) {
        reject(new Error('Facebook SDK not initialized'));
        return;
      }

      console.log('🔐 Initiating Facebook login...');
      window.FB.login((response: FacebookAuthResponse) => {
        if (response.authResponse) {
          console.log('✅ Facebook authentication successful');
          // Get user profile information
          window.FB?.api('/me?fields=name,email,picture', (userInfo: any) => {
            console.log('✅ Facebook user info retrieved');
            resolve({
              accessToken: response.authResponse.accessToken,
              provider: 'facebook',
              email: userInfo.email,
              name: userInfo.name,
              profilePicture: userInfo.picture?.data?.url,
            });
          });
        } else {
          console.log('❌ Facebook login cancelled or failed');
          reject(new Error('Facebook login was cancelled or failed'));
        }
      }, { scope: 'email,public_profile' });
    });
  }

  // Decode Google JWT token (simplified version)
  decodeGoogleCredential(credential: string): Promise<SocialAuthResponse> {
    return new Promise((resolve, reject) => {
      try {
        // Split the JWT token
        const parts = credential.split('.');
        if (parts.length !== 3) {
          throw new Error('Invalid JWT token');
        }

        // Decode the payload (base64url)
        const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
        
        console.log('✅ Google credential decoded successfully');
        resolve({
          accessToken: credential,
          provider: 'google',
          email: payload.email,
          name: payload.name,
          profilePicture: payload.picture,
        });
      } catch (error) {
        console.error('❌ Failed to decode Google credential:', error);
        reject(new Error('Failed to decode Google credential'));
      }
    });
  }
}

export const socialAuthService = SocialAuthService.getInstance();
