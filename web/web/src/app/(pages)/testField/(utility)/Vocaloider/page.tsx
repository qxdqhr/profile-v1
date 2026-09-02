"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import styles from './Vocaloider.module.css';

const Vocaloider: React.FC = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    // 初始检查
    checkIfMobile();
    
    // 监听窗口大小变化
    window.addEventListener('resize', checkIfMobile);
    
    // 清理监听器
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>学唱术力口</h1>
      
      <div className={styles.featuresContainer}>
        <div className={styles.featureCard}>
          <h2>歌词学习</h2>
          <p>通过互动式界面学习日语歌词，提供发音指导和翻译。</p>
          <Link href="/testField/Vocaloider/StudyMusic" className={styles.featureLink}>
            {isMobile ? '学习' : '开始学习'}
          </Link>
        </div>
        
        <div className={styles.featureCard}>
          <h2>发音练习</h2>
          <p>录制并比较您的发音与原唱，获得实时反馈和改进建议。</p>
          <Link href="/testField/Vocaloider/PronunciationPractice" className={styles.featureLink}>
            {isMobile ? '练习' : '开始练习'}
          </Link>
        </div>
        
        <div className={styles.featureCard}>
          <h2>歌曲库</h2>
          <p>浏览我们精选的Vocaloid歌曲库，按难度、歌手或流派筛选。</p>
          <Link href="/testField/Vocaloider/SongLibrary" className={styles.featureLink}>
            {isMobile ? '浏览' : '浏览歌曲'}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Vocaloider;
