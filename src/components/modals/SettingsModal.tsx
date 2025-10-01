import React, { useEffect } from 'react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  // Handle ESC key press
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden'; // Prevent background scrolling
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleNotificationToggle = () => {
    // TODO: Implement notification toggle logic
    console.log('Notification toggle clicked');
  };

  const handleDarkModeToggle = () => {
    // TODO: Implement dark mode toggle logic
    console.log('Dark mode toggle clicked');
  };

  const handleProfileClick = () => {
    // TODO: Navigate to profile settings
    console.log('Profile settings clicked');
  };

  const handlePrivacyClick = () => {
    // TODO: Navigate to privacy settings
    console.log('Privacy settings clicked');
  };

  const handleLanguageClick = () => {
    // TODO: Navigate to language settings
    console.log('Language settings clicked');
  };

  const handleAboutClick = () => {
    // TODO: Show about information
    console.log('About clicked');
  };

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-3 sm:p-4 animate-in fade-in-0 duration-300 backdrop-blur-sm"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-title"
    >
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-sm sm:max-w-md mx-auto overflow-hidden border border-gray-100 animate-in slide-in-from-bottom-4 duration-300">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-green-600 p-4 sm:p-6 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-green-700/20"></div>
          <div className="relative flex items-center justify-between">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm ring-1 ring-white/30">
                <svg className="w-5 h-5 sm:w-7 sm:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <h3 id="settings-title" className="text-lg sm:text-xl font-bold tracking-tight">Settings</h3>
                <p className="text-emerald-100 text-xs sm:text-sm font-medium">Customize your experience</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-xl transition-all duration-200 group touch-manipulation"
              aria-label="Close settings"
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6 group-hover:rotate-90 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 bg-gray-50/30 max-h-[60vh] sm:max-h-[70vh] overflow-y-auto">
          <div className="space-y-2 sm:space-y-3">
            {/* Profile Settings */}
            <button
              onClick={handleProfileClick}
              className="w-full flex items-center justify-between py-3 sm:py-4 px-3 sm:px-4 bg-white border border-gray-100 hover:border-green-200 active:bg-green-50 hover:bg-green-50/50 rounded-lg sm:rounded-xl transition-all duration-200 group shadow-sm hover:shadow-md touch-manipulation min-h-[60px] sm:min-h-[72px]"
            >
              <div className="flex items-center space-x-3 sm:space-x-4">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors flex-shrink-0">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div className="text-left min-w-0 flex-1">
                  <p className="font-semibold text-gray-900 group-hover:text-green-700 transition-colors text-sm sm:text-base">Profile</p>
                  <p className="text-xs sm:text-sm text-gray-500 truncate">Update your information</p>
                </div>
              </div>
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 group-hover:text-green-500 group-hover:translate-x-1 transition-all duration-200 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {/* Notifications Toggle */}
            <div className="bg-white border border-gray-100 rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-sm min-h-[60px] sm:min-h-[72px]">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 sm:space-x-4 min-w-0 flex-1">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5-5-5h5v-5a7.5 7.5 0 000-15z" />
                    </svg>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-gray-900 text-sm sm:text-base">Notifications</p>
                    <p className="text-xs sm:text-sm text-gray-500 truncate">Manage push notifications</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer flex-shrink-0 ml-3">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    defaultChecked 
                    onChange={handleNotificationToggle}
                  />
                  <div className="w-10 h-5 sm:w-11 sm:h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 sm:after:h-5 sm:after:w-5 after:transition-all peer-checked:bg-green-500 shadow-inner"></div>
                </label>
              </div>
            </div>

            {/* Dark Mode Toggle */}
            <div className="bg-white border border-gray-100 rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-sm min-h-[60px] sm:min-h-[72px]">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 sm:space-x-4 min-w-0 flex-1">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                    </svg>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-gray-900 text-sm sm:text-base">Dark Mode</p>
                    <p className="text-xs sm:text-sm text-gray-500 truncate">Toggle theme appearance</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer flex-shrink-0 ml-3">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    onChange={handleDarkModeToggle}
                  />
                  <div className="w-10 h-5 sm:w-11 sm:h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 sm:after:h-5 sm:after:w-5 after:transition-all peer-checked:bg-purple-500 shadow-inner"></div>
                </label>
              </div>
            </div>

            {/* Privacy Settings */}
            <button
              onClick={handlePrivacyClick}
              className="w-full flex items-center justify-between py-3 sm:py-4 px-3 sm:px-4 bg-white border border-gray-100 hover:border-orange-200 active:bg-orange-50 hover:bg-orange-50/50 rounded-lg sm:rounded-xl transition-all duration-200 group shadow-sm hover:shadow-md touch-manipulation min-h-[60px] sm:min-h-[72px]"
            >
              <div className="flex items-center space-x-3 sm:space-x-4">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-orange-100 rounded-lg flex items-center justify-center group-hover:bg-orange-200 transition-colors flex-shrink-0">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <div className="text-left min-w-0 flex-1">
                  <p className="font-semibold text-gray-900 group-hover:text-orange-700 transition-colors text-sm sm:text-base">Privacy</p>
                  <p className="text-xs sm:text-sm text-gray-500 truncate">Manage privacy settings</p>
                </div>
              </div>
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 group-hover:text-orange-500 group-hover:translate-x-1 transition-all duration-200 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {/* Language Settings */}
            <button
              onClick={handleLanguageClick}
              className="w-full flex items-center justify-between py-3 sm:py-4 px-3 sm:px-4 bg-white border border-gray-100 hover:border-indigo-200 active:bg-indigo-50 hover:bg-indigo-50/50 rounded-lg sm:rounded-xl transition-all duration-200 group shadow-sm hover:shadow-md touch-manipulation min-h-[60px] sm:min-h-[72px]"
            >
              <div className="flex items-center space-x-3 sm:space-x-4">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-indigo-100 rounded-lg flex items-center justify-center group-hover:bg-indigo-200 transition-colors flex-shrink-0">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                  </svg>
                </div>
                <div className="text-left min-w-0 flex-1">
                  <p className="font-semibold text-gray-900 group-hover:text-indigo-700 transition-colors text-sm sm:text-base">Language</p>
                  <p className="text-xs sm:text-sm text-gray-500 truncate">Change app language</p>
                </div>
              </div>
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all duration-200 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {/* About */}
            <button
              onClick={handleAboutClick}
              className="w-full flex items-center justify-between py-3 sm:py-4 px-3 sm:px-4 bg-white border border-gray-100 hover:border-gray-200 active:bg-gray-50 hover:bg-gray-50 rounded-lg sm:rounded-xl transition-all duration-200 group shadow-sm hover:shadow-md touch-manipulation min-h-[60px] sm:min-h-[72px]"
            >
              <div className="flex items-center space-x-3 sm:space-x-4">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-gray-200 transition-colors flex-shrink-0">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="text-left min-w-0 flex-1">
                  <p className="font-semibold text-gray-900 group-hover:text-gray-700 transition-colors text-sm sm:text-base">About</p>
                  <p className="text-xs sm:text-sm text-gray-500 truncate">App info and version</p>
                </div>
              </div>
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 group-hover:text-gray-500 group-hover:translate-x-1 transition-all duration-200 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-6 pt-3 sm:pt-4 bg-white border-t border-gray-100 flex-shrink-0">
          <div className="flex space-x-2 sm:space-x-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 px-4 text-gray-700 bg-gray-100 hover:bg-gray-200 active:bg-gray-300 rounded-lg sm:rounded-xl font-semibold transition-all duration-200 touch-manipulation text-sm sm:text-base min-h-[48px]"
            >
              Close
            </button>
            <button
              onClick={() => {
                // TODO: Implement save settings functionality
                console.log('Settings saved');
                onClose();
              }}
              className="flex-1 py-3 px-4 text-white bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 active:from-emerald-800 active:to-green-800 rounded-lg sm:rounded-xl font-semibold transition-all duration-200 touch-manipulation shadow-lg hover:shadow-xl text-sm sm:text-base min-h-[48px]"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
