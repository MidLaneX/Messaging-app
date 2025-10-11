import React, { useEffect, useState } from 'react';
import { socialAuthService } from '../services/socialAuthService';

interface FacebookLoginButtonProps {
  onSuccess: (accessToken: string, email: string, name: string, profilePicture?: string) => void;
  onError: (error: string) => void;
  disabled?: boolean;
}

const FacebookLoginButton: React.FC<FacebookLoginButtonProps> = ({
  onSuccess,
  onError,
  disabled = false,
}) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const isConfigured = !!process.env.REACT_APP_FACEBOOK_APP_ID;

  const handleUnconfiguredClick = () => {
    onError(
      '⚠️ Facebook login is not configured.\n\n' +
      'To enable Facebook login:\n' +
      '1. Get a Facebook App ID from Facebook Developers\n' +
      '2. Add it to .env as REACT_APP_FACEBOOK_APP_ID\n' +
      '3. Restart the development server\n\n' +
      'See OAUTH_FIX_QUICK.md for detailed instructions.'
    );
  };

  useEffect(() => {
    const initFacebook = async () => {
      try {
        await socialAuthService.initializeFacebook();
        setIsInitialized(true);
      } catch (error) {
        console.error('Failed to initialize Facebook login:', error);
        onError('Failed to initialize Facebook login');
      }
    };

    if (!disabled && isConfigured) {
      initFacebook();
    }
  }, [onError, disabled, isConfigured]);

  const handleFacebookLogin = async () => {
    if (!isConfigured) {
      handleUnconfiguredClick();
      return;
    }

    if (!isInitialized || disabled) return;

    try {
      const response = await socialAuthService.loginWithFacebook();
      onSuccess(
        response.accessToken,
        response.email,
        response.name,
        response.profilePicture
      );
    } catch (error) {
      onError('Facebook login failed or was cancelled');
    }
  };

  return (
    <button
      onClick={handleFacebookLogin}
      disabled={disabled}
      className={`w-full py-2.5 px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center ${
        disabled
          ? 'bg-gray-50 text-gray-400 border border-gray-200 cursor-not-allowed'
          : !isConfigured
          ? 'bg-amber-50 text-amber-700 border border-amber-300 hover:bg-amber-100 cursor-pointer'
          : !isInitialized
          ? 'bg-gray-50 text-gray-400 border border-gray-200 cursor-wait'
          : 'bg-white text-[#1877F2] border border-[#1877F2] hover:bg-blue-50'
      }`}
    >
      <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
      </svg>
      Continue with Facebook
      {!isConfigured && <span className="ml-2 text-xs">⚠️</span>}
    </button>
  );
};

export default FacebookLoginButton;
