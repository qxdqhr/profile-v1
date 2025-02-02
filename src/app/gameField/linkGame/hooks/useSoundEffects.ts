import { useCallback, useRef } from 'react';

const SOUND_EFFECTS = {
    click: '/linkGame/sounds/click.mp3',
    match: '/linkGame/sounds/match.mp3'
};

export const useSoundEffects = () => {
    const audioRefs = useRef<{ [key: string]: HTMLAudioElement }>({});

    // 初始化音效
    if (Object.keys(audioRefs.current).length === 0) {
        Object.entries(SOUND_EFFECTS).forEach(([key, path]) => {
            const audio = new Audio(path);
            audio.preload = 'auto';
            audioRefs.current[key] = audio;
        });
    }

    const playSound = useCallback(async (soundKey: keyof typeof SOUND_EFFECTS) => {
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