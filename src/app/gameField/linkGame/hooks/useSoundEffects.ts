import { useCallback, useEffect, useRef } from 'react';

export const useSoundEffects = () => {
    const clickSoundRef = useRef<HTMLAudioElement | null>(null);
    const matchSoundRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        clickSoundRef.current = new Audio('/linkGame/sounds/click.mp3');
        matchSoundRef.current = new Audio('/linkGame/sounds/match.mp3');

        return () => {
            if (clickSoundRef.current) {
                clickSoundRef.current = null;
            }
            if (matchSoundRef.current) {
                matchSoundRef.current = null;
            }
        };
    }, []);

    const playClickSound = useCallback(() => {
        if (clickSoundRef.current) {
            clickSoundRef.current.currentTime = 0;
            clickSoundRef.current.play().catch(() => {
                // 忽略用户未进行交互时的自动播放错误
            });
        }
    }, []);

    const playMatchSound = useCallback(() => {
        if (matchSoundRef.current) {
            matchSoundRef.current.currentTime = 0;
            matchSoundRef.current.play().catch(() => {
                // 忽略用户未进行交互时的自动播放错误
            });
        }
    }, []);

    return {
        playClickSound,
        playMatchSound
    };
}; 