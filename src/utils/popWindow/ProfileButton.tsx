'use client';

import React, { useState } from 'react';
import ProfileModal from './ProfileModal';
import { ProfileData } from './types';
import { BadgeList } from './component/BadgeList';
import { StatList } from './component/StatList';
// 示例数据
const exampleProfileData: ProfileData = {
  name: '张三',
  avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
  title: '高级前端工程师',
  bio: '专注于React和Next.js开发的前端工程师，有5年工作经验。热爱开源，喜欢分享技术经验。',
  contacts: {
    '邮箱': 'zhangsan@example.com',
    '电话': '138-8888-8888',
    '地址': '上海市浦东新区',
  },
  socialLinks: [
    { type: 'GitHub', url: 'https://github.com/zhangsan', icon: '★' },
    { type: 'Twitter', url: 'https://twitter.com/zhangsan', icon: '✦' },
    { type: 'LinkedIn', url: 'https://linkedin.com/in/zhangsan', icon: '✪' },
  ],
  badges: [
    { label: 'React', type: 'primary' },
    { label: 'Next.js', type: 'success' },
    { label: 'TypeScript', type: 'info' },
    { label: 'CSS', type: 'default' },
  ],
  stats: [
    { label: '项目', value: 42 },
    { label: '粉丝', value: 1024 },
    { label: '评分', value: '4.9' },
  ],
  customContent: (
    <div style={{ marginTop: 20, borderTop: '1px solid #eee', paddingTop: 15 }}>
      <h3 style={{ fontSize: 16, marginBottom: 10 }}>专业技能</h3>
      <p style={{ margin: 0, lineHeight: 1.6 }}>
        精通React、Vue、Angular等前端框架，熟悉TypeScript、JavaScript、CSS3、HTML5等前端技术。
        有丰富的大型项目开发经验，能独立负责前端架构设计。
      </p>
    </div>
  ),
};

interface ProfileButtonProps {
  data?: ProfileData;
  buttonText?: string;
  buttonClassName?: string;
  modalTheme?: 'light' | 'dark' | 'blue';
}

/**
 * 个人信息按钮组件，点击后显示个人信息弹窗
 */
const ProfileButton: React.FC<ProfileButtonProps> = ({
  data = exampleProfileData,
  buttonText = '查看个人信息',
  buttonClassName = '',
  modalTheme = 'light',
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const handleContactClick = (type: string, value: string) => {
    if (type === '邮箱') {
      window.open(`mailto:${value}`);
    } else if (type === '电话') {
      window.open(`tel:${value}`);
    }
  };

  return (
    <>
      <button onClick={openModal} className={buttonClassName}>
        {buttonText}
      </button>

      <ProfileModal
        isOpen={isModalOpen}
        onClose={closeModal}
        data={data}
        themeName={modalTheme}
        onContactClick={handleContactClick}
        onSocialLinkClick={(url) => window.open(url, '_blank')}
      >
        {data.customContent}
        {data.badges && <BadgeList badges={data.badges} />}
        {data.stats && <StatList stats={data.stats} />}
      </ProfileModal>
    </>
  );
};

export default ProfileButton;

/**
 * 示例用法:
 * 
 * import ProfileButton from '@/utils/popWindow/selfInfo';
 * 
 * // 使用默认数据
 * <ProfileButton />
 * 
 * // 使用自定义数据
 * <ProfileButton 
 *   data={customData} 
 *   buttonText="查看我的资料" 
 *   modalTheme="blue" 
 * />
 * 
 * // 自定义按钮样式
 * <ProfileButton buttonClassName="myCustomButton" />
 */
