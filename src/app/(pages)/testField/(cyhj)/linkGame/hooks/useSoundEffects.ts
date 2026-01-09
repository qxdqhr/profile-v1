import { useCallback, useRef, useEffect } from 'react';

const SOUND_EFFECTS = {
  click: '/linkGame/sounds/click.mp3',
  match: '/linkGame/sounds/match.mp3'
};

export const useSoundEffects = () => {
  const audioRefs = useRef<{ [key: string]: HTMLAudioElement }>({});

  // 将初始化移到 useEffect 中，确保在浏览器环境下执行
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // 初始化音效
    if (Object.keys(audioRefs.current).length === 0) {
      Object.entries(SOUND_EFFECTS).forEach(([key, path]) => {
        const audio = new Audio(path);
        audio.preload = 'auto';
        audioRefs.current[key] = audio;
      });
    }

    // 清理函数
    return () => {
      Object.values(audioRefs.current).forEach(audio => {
        audio.pause();
        audio.src = '';
      });
    };
  }, []);

  const playSound = useCallback(async (soundKey: keyof typeof SOUND_EFFECTS) => {
    if (typeof window === 'undefined') return;
        
    try {
      const audio = audioRefs.current[soundKey];
      if (!audio) return;

      // 重置音频到开始位置
      audio.currentTime = 0;
      await audio.play();
    } catch (error) {
      console.error(`播放音效失败 ${soundKey}:`, error);
    }
  }, []);

  const playClickSound = useCallback(() => {
    playSound('click');
  }, [playSound]);

  const playMatchSound = useCallback(() => {
    playSound('match');
  }, [playSound]);

  return {
    playClickSound,
    playMatchSound
  };
}; 