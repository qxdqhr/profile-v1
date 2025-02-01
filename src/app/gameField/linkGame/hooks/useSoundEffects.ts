import { useRef, useCallback, useEffect } from 'react';

export const useSoundEffects = () => {
    const clickSoundRef = useRef<HTMLAudioElement | null>(null);
    const matchSoundRef = useRef<HTMLAudioElement | null>;
    // 创建音效池来处理快速连续播放
    const clickSoundPool = useRef<HTMLAudioElement[]>([]);
    const matchSoundPool = useRef<HTMLAudioElement[]>([]);
    const poolSize = 3; // 音效池大小

    useEffect(() => {
        if (typeof window !== 'undefined') {
            // 初始化音效池
            for (let i = 0; i < poolSize; i++) {
                const clickSound = new window.Audio('/linkGame/sounds/click.mp3');
                const matchSound = new window.Audio('/linkGame/sounds/match.mp3');
                
                // 预加载并设置音量
                clickSound.preload = 'auto';
                matchSound.preload = 'auto';
                clickSound.volume = 0.6;
                matchSound.volume = 0.6;
                
                clickSoundPool.current.push(clickSound);
                matchSoundPool.current.push(matchSound);
            }
        }
    }, []);

    const playClickSound = useCallback(() => {
        if (clickSoundPool.current.length > 0) {
            // 从池中找到一个没在播放的音效
            const availableSound = clickSoundPool.current.find(sound => sound.paused);
            if (availableSound) {
                availableSound.currentTime = 0; // 重置播放位置
                availableSound.play().catch(console.error);
            }
        }
    }, []);

    const playMatchSound = useCallback(() => {
        if (matchSoundPool.current.length > 0) {
            const availableSound = matchSoundPool.current.find(sound => sound.paused);
            if (availableSound) {
                availableSound.currentTime = 0;
                availableSound.play().catch(console.error);
            }
        }
    }, []);

    return {
        playClickSound,
        playMatchSound
    };
}; 