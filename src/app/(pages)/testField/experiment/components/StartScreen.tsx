"use client";

import { useExam } from '../context/ExamContext';
import styles from '../styles.module.css';
import { useEffect, useState } from 'react';

const StartScreen = () => {
  const { startExam } = useExam();
  const [showIntro, setShowIntro] = useState(false);
  
  // 页面加载后显示介绍内容的动画效果
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowIntro(true);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={styles["start-container"]}>
      <div className={styles["floating-bubbles"]}>
        {[...Array(10)].map((_, index) => (
          <div 
            key={index}
            className={styles.bubble}
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${5 + Math.random() * 10}s`
            }}
          />
        ))}
      </div>
      
      <div className={`${styles["start-content"]} ${showIntro ? styles.visible : ''}`}>
        <h1 className={styles["start-title"]}>在线考试系统</h1>
        <p className={styles["start-description"]}>
          欢迎参加本次考试！本考试包含多种题型，满分为100分。
          请仔细阅读题目，并在规定时间内完成作答。
        </p>
        
        <div className={styles["start-rules"]}>
          <h2>考试须知：</h2>
          <ul>
            <li className={styles["fade-in-item"]} style={{ animationDelay: '0.3s' }}>
              考试时间：30分钟
            </li>
            <li className={styles["fade-in-item"]} style={{ animationDelay: '0.6s' }}>
              题目类型：单选题、多选题
            </li>
            <li className={styles["fade-in-item"]} style={{ animationDelay: '0.9s' }}>
              题目数量：5题
            </li>
            <li className={styles["fade-in-item"]} style={{ animationDelay: '1.2s' }}>
              请勿刷新页面，否则答题进度会丢失
            </li>
          </ul>
        </div>
        
        <button 
          className={`${styles["start-button"]} ${styles["pulsing"]}`}
          onClick={startExam}
        >
          开始答题
        </button>
      </div>
    </div>
  );
};

export default StartScreen; 