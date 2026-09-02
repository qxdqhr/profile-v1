"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import styles from '../StudyMusic.module.css';
import { LyricLine } from '../types';

interface LyricsDisplayProps {
  lyrics: LyricLine[];
  currentLine: number;
}

type LanguageOption = 'ja' | 'romaji' | 'zh';

export default function LyricsDisplay({ lyrics, currentLine }: LyricsDisplayProps) {
  const [selectedLanguages, setSelectedLanguages] = useState<LanguageOption[]>(['ja', 'zh']);

  const toggleLanguage = (lang: LanguageOption) => {
    if (selectedLanguages.includes(lang)) {
      // 不允许取消选择所有语言
      if (selectedLanguages.length > 1) {
        setSelectedLanguages(selectedLanguages.filter(l => l !== lang));
      }
    } else {
      setSelectedLanguages([...selectedLanguages, lang]);
    }
  };

  return (
    <div className={styles.lyricsMainSection}>
      <h1 className={styles.mainTitle}>Shake It!</h1>
      
      <div className={styles.languageSelector}>
        <label className={styles.checkboxLabel}>
          <input
            type="checkbox"
            checked={selectedLanguages.includes('ja')}
            onChange={() => toggleLanguage('ja')}
            className={styles.checkbox}
          />
          <span className={styles.checkboxText}>日本語</span>
        </label>
        
        <label className={styles.checkboxLabel}>
          <input
            type="checkbox"
            checked={selectedLanguages.includes('romaji')}
            onChange={() => toggleLanguage('romaji')}
            className={styles.checkbox}
          />
          <span className={styles.checkboxText}>Romaji</span>
        </label>
        
        <label className={styles.checkboxLabel}>
          <input
            type="checkbox"
            checked={selectedLanguages.includes('zh')}
            onChange={() => toggleLanguage('zh')}
            className={styles.checkbox}
          />
          <span className={styles.checkboxText}>中文</span>
        </label>
      </div>
      
      <div className={styles.lyricsContainer}>
        {lyrics.map((line, index) => (
          <motion.div
            key={index}
            className={`${styles.lyricLine} ${currentLine === index ? styles.active : ''}`}
            initial={{ opacity: 0.5, y: 20 }}
            animate={currentLine === index ? 
              { opacity: 1, y: 0, scale: 1.05 } : 
              { opacity: 0.5, y: 0, scale: 1 }
            }
            transition={{ duration: 0.3 }}
          >
            <div className={styles.multiLangLine}>
              {selectedLanguages.includes('ja') && (
                <div className={styles.jaLine}>{line.ja}</div>
              )}
              {selectedLanguages.includes('romaji') && (
                <div className={styles.romajiLine}>{line.romaji}</div>
              )}
              {selectedLanguages.includes('zh') && (
                <div className={styles.zhLine}>{line.zh}</div>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
} 