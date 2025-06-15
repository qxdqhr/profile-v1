import React from 'react';
import Modal, { ModalProps } from './component/Modal';
import styles from './styles.module.css';
import { Avatar } from './component/Avatar';
import { ProfileData, SocialLink } from './types';

export interface ProfileModalProps extends Omit<ModalProps, 'title' | 'children'> {
  data: ProfileData;
  showAvatar?: boolean;
  showContacts?: boolean;
  showSocial?: boolean;
  showBio?: boolean;
  avatarSize?: number;
  onAvatarClick?: () => void;
  onSocialLinkClick?: (url: string, type: string) => void;
  onContactClick?: (type: string, value: string) => void;
  themeName?: 'light' | 'dark' | 'blue';
  children?: React.ReactNode;
}

const ProfileModal: React.FC<ProfileModalProps> = ({
  data,
  showAvatar = true,
  showContacts = true,
  showSocial = true,
  showBio = true,
  avatarSize = 80,
  onAvatarClick,
  onSocialLinkClick,
  onContactClick,
  themeName = 'light',
  ...modalProps
}) => {
  // 渲染社交媒体链接
  const renderSocialLinks = () => {
    if (!data.socialLinks || data.socialLinks.length === 0) return null;
    return (
      <div className={styles.socialLinks}>
        {data.socialLinks.map((link: SocialLink, index: number) => (
          <a
            key={index}
            href={link.url}
            className={styles.socialLink}
            title={link.type}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => {
              if (onSocialLinkClick) {
                e.preventDefault();
                onSocialLinkClick(link.url, link.type);
              }
            }}
          >
            {link.icon ? (
              <span className={styles.socialIcon}>{link.icon}</span>
            ) : (
              <span className={styles.socialType}>{link.type}</span>
            )}
          </a>
        ))}
      </div>
    );
  };

  // 渲染联系方式
  const renderContacts = () => {
    if (!data.contacts || Object.keys(data.contacts).length === 0) return null;
    return (
      <div className={styles.contactInfo}>
        {Object.entries(data.contacts).map(([type, value], index) => (
          <div 
            key={index} 
            className={styles.contactItem}
            onClick={() => onContactClick && onContactClick(type, value)}
          >
            <span className={styles.contactType}>{type}:</span>
            <span className={styles.contactValue}>{value}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <Modal
      {...modalProps}
      title={''}
      className={`${styles.profileModal} ${styles[`theme-${themeName}`]}`}
    >
      <div className={styles.profileHeader}>
        {showAvatar && data.avatar && (
          <div 
            className={styles.avatarContainer}
            onClick={onAvatarClick}
            style={{ cursor: onAvatarClick ? 'pointer' : 'default' }}
          >
            <Avatar 
              src={data.avatar} 
              alt={data.name} 
              size={avatarSize} 
            />
          </div>
        )}
        <div className={styles.profileInfo}>
          <h2 className={styles.profileName}>{data.name}</h2>
          {data.title && <div className={styles.profileTitle}>{data.title}</div>}
          {showSocial && renderSocialLinks()}
        </div>
      </div>
      
      {showBio && data.bio && (
        <div className={styles.profileBio}>
          <p>{data.bio}</p>
        </div>
      )}
      
      {showContacts && renderContacts()}
      
      {data.customContent && (
        <div className={styles.customContent}>
          {data.customContent}
        </div>
      )}
    </Modal>
  );
};

export default ProfileModal; 