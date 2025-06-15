import React from 'react';
import styles from '../styles.module.css';

interface AvatarProps {
  src: string;
  alt: string;
  size?: number;
  borderColor?: string;
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  alt,
  size = 80,
  borderColor,
  className = '',
}) => {
  return (
    <div
      className={`${styles.avatar} ${className}`}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderColor: borderColor || 'transparent',
      }}
    >
      <img src={src} alt={alt} />
    </div>
  );
};