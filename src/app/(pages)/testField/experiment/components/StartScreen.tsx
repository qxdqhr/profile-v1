"use client";

import { useExam } from '../context/ExamContext';
import styles from '../styles.module.css';
import { useEffect, useState } from 'react';
import { mockStartScreenData } from '../mockData';

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
        <h1 className={styles["start-title"]}>{mockStartScreenData.title}</h1>
        <p className={styles["start-description"]}>
          {mockStartScreenData.description}
        </p>
        
        <div className={styles["start-rules"]}>
          <h2>{mockStartScreenData.rules.title}</h2>
          <ul>
            {mockStartScreenData.rules.items.map((item, index) => (
              <li 
                key={index}
                className={styles["fade-in-item"]} 
                style={{ animationDelay: `${0.3 * (index + 1)}s` }}
              >
                {item}
              </li>
            ))}
          </ul>
        </div>
        
        <button 
          className={`${styles["start-button"]} ${styles["pulsing"]}`}
          onClick={startExam}
        >
          {mockStartScreenData.buttonText}
        </button>
      </div>
    </div>
  );
};

export default StartScreen; 