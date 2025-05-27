'use client';

import React from 'react';
import MainPage from "@/app/_components/MainPage";
import "./index.css";
import { AutoOpenModal, ProfileData } from '@/utils/popWindow';

// 示例个人信息数据
const profileData: ProfileData = {
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
  ],
  stats: [
    { label: '项目', value: 42 },
    { label: '粉丝', value: 1024 },
    { label: '评分', value: '4.9' },
  ],
};

export default function Home() {
  return (
    <>
      {/* 保留原有页面内容 */}
      <MainPage />
      
      {/* 自动弹窗组件 */}
      {/* <AutoOpenModal 
        data={profileData} 
        delay={1000} 
        themeName="blue"
        onClose={() => console.log('弹窗已关闭')}
      /> */}
    </>
  );
}

