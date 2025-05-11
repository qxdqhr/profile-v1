"use client";

import { useState, useEffect } from 'react';
import styles from './StudyMusic.module.css';
import LyricsDisplay from './components/LyricsDisplay';
import SongInfo from './components/SongInfo';
import PlayerControls from './components/PlayerControls';
import { LyricLine } from './types';

export default function Vocaloider_StudyMusic() {
  const [currentLine, setCurrentLine] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const lyrics: LyricLine[] = [
    {
      time: 0,
      ja: "Shake it! Shake it!",
      romaji: "Shake it! Shake it!",
      zh: "摇起来！摇起来！"
    },
    {
      time: 4,
      ja: "今夜はとことん騒ごう",
      romaji: "Konya wa tokoton sawagou",
      zh: "今晚彻底嗨起来吧"
    },
    {
      time: 8,
      ja: "Shake it! Shake it!",
      romaji: "Shake it! Shake it!",
      zh: "摇起来！摇起来！"
    },
    {
      time: 12,
      ja: "音楽に身を任せて",
      romaji: "Ongaku ni mi wo makasete",
      zh: "将身体交给音乐"
    },
    {
      time: 16,
      ja: "Shake it! Shake it!",
      romaji: "Shake it! Shake it!",
      zh: "摇起来！摇起来！"
    },
    {
      time: 20,
      ja: "明日のこと考えないで",
      romaji: "Ashita no koto kangaenaide",
      zh: "别去想明天的事"
    },
    {
      time: 24,
      ja: "Shake it! Shake it!",
      romaji: "Shake it! Shake it!",
      zh: "摇起来！摇起来！"
    },
    {
      time: 28,
      ja: "今を思いっきり楽しもう",
      romaji: "Ima wo omoikkiri tanoshimou",
      zh: "尽情享受当下吧"
    },
    {
      time: 32,
      ja: "退屈な日々に終止符を打って",
      romaji: "Taikutsu na hibi ni shuushifu wo utte",
      zh: "为无聊的日子画上句号"
    },
    {
      time: 36,
      ja: "週末が来るのを待ってた",
      romaji: "Shuumatsu ga kuru no wo matteta",
      zh: "一直在等待周末的到来"
    },
    {
      time: 40,
      ja: "宿題も家事も全部投げ出して",
      romaji: "Shukudai mo kaji mo zenbu nagedashite",
      zh: "把作业和家务全都抛在脑后"
    },
    {
      time: 44,
      ja: "今夜は自由に踊りたいの",
      romaji: "Konya wa jiyuu ni odoritai no",
      zh: "今晚只想自由地跳舞"
    },
    {
      time: 48,
      ja: "音楽が鳴り出したら",
      romaji: "Ongaku ga naridashitara",
      zh: "当音乐响起"
    },
    {
      time: 52,
      ja: "体が勝手に動き出す",
      romaji: "Karada ga katte ni ugokidasu",
      zh: "身体就会不由自主地动起来"
    },
    {
      time: 56,
      ja: "誰も私を止められない",
      romaji: "Dare mo watashi wo tomerarenai",
      zh: "没人能阻止我"
    },
    {
      time: 60,
      ja: "さあ一緒に踊ろう",
      romaji: "Saa issho ni odorou",
      zh: "来吧，一起跳舞"
    },
    // 可以继续添加更多歌词
  ];

  // 使用useEffect钩子来处理歌词自动播放
  useEffect(() => {
    // 声明一个interval变量用于存储定时器ID
    let interval: NodeJS.Timeout | undefined;

    // 当isPlaying为true时开始自动播放
    if (isPlaying) {
      // 设置定时器,每4秒执行一次
      interval = setInterval(() => {
        // 更新当前行数,如果未到最后一行则+1,否则回到第一行
        setCurrentLine((prev) => (prev < lyrics.length - 1 ? prev + 1 : 0));
      }, 4000); // 每4秒切换一行歌词
    }

    // 清理函数,组件卸载或依赖项变化时清除定时器
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying]); // 依赖项为isPlaying,当其变化时重新执行effect


  const handlePrevious = () => {
    setCurrentLine((prev) => (prev > 0 ? prev - 1 : 0));
  };

  const handleNext = () => {
    setCurrentLine((prev) => (prev < lyrics.length - 1 ? prev + 1 : prev));
  };

  return (
    <div className={styles.container}>
      <div className={styles.playerContainer}>
        <LyricsDisplay
          lyrics={lyrics}
          currentLine={currentLine}
        />

        <div className={styles.playerControls}>
          <SongInfo
            title="Shake It!"
            artist="初音未来 (Hatsune Miku)"
            coverImage="/images/miku_shake_it.jpg"
          />

          <PlayerControls
            isPlaying={isPlaying}
            currentLine={currentLine}
            totalLines={lyrics.length}
            onTogglePlay={
              () => {
                setIsPlaying(!isPlaying);
              }
            }
            onPrevious={handlePrevious}
            onNext={handleNext}
          />
        </div>
      </div>
    </div>
  );
}
