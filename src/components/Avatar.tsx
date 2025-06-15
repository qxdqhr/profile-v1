'use client';

import React from 'react';

interface AvatarProps {
  src?: string;
  size?: 'small' | 'medium' | 'large';
  mood?: 'online' | 'offline' | 'away';
  statusText?: string;
  onClick?: () => void;
}

const Avatar: React.FC<AvatarProps> = ({
  src,
  size = 'medium',
  mood = 'online',
  statusText,
  onClick
}) => {
  const sizeClasses = {
    small: 'w-8 h-8',
    medium: 'w-12 h-12',
    large: 'w-16 h-16'
  };

  const moodColors = {
    online: 'bg-green-500',
    offline: 'bg-gray-500',
    away: 'bg-yellow-500'
  };

  return (
    <div className="relative inline-block" onClick={onClick}>
      <img
        src={src || "/images/avatar.jpg"}
        alt="User Avatar"
        className={`${sizeClasses[size]} rounded-full object-cover border-2 border-white shadow-md cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all duration-200`}
      />
      <div
        className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${moodColors[mood]}`}
      />
      {statusText && (
        <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
          <span className="text-xs text-gray-600">{statusText}</span>
        </div>
      )}
    </div>
  );
};

export default Avatar;
