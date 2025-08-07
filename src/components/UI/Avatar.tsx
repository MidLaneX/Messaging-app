import React from 'react';
import { User } from '../../types';

interface AvatarProps {
  user: User;
  size?: 'sm' | 'md' | 'lg';
  showOnlineStatus?: boolean;
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  user,
  size = 'md',
  showOnlineStatus = false,
  className = '',
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-12 h-12 text-xl',
    lg: 'w-16 h-16 text-2xl',
  };

  const onlineIndicatorSize = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4',
  };

  return (
    <div className={`relative flex-shrink-0 ${className}`}>
      <div className={`${sizeClasses[size]} bg-gray-300 rounded-full flex items-center justify-center font-medium`}>
        {user.avatar || '👤'}
      </div>
      {showOnlineStatus && user.isOnline && (
        <div className={`absolute bottom-0 right-0 ${onlineIndicatorSize[size]} bg-green-500 border-2 border-white rounded-full`}></div>
      )}
    </div>
  );
};
