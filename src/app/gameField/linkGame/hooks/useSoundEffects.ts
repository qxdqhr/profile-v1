import { useRef, useCallback, useEffect } from 'react';

export const useSoundEffects = () => {
    const clickSoundRef = useRef<HTMLAudioElement | null>(null);
    const matchSoundRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            if (!clickSoundRef.current) {
                clickSoundRef.current = new window.Audio('/linkGame/sounds/click.mp3');
                clickSoundRef.current.preload = 'auto';
            }
            if (!matchSoundRef.current) {
                matchSoundRef.current = new window.Audio('/linkGame/sounds/match.mp3');
                matchSoundRef.current.preload = 'auto';
            }
        }
    }, []);

    const playClickSound = useCallback(() => {
        if (clickSoundRef.current) {
            const sound = clickSoundRef.current.cloneNode() as HTMLAudioElement;
            sound.volume = 0.6;
            sound.play().catch(console.error);
        }
    }, []);

    const playMatchSound = useCallback(() => {
        if (matchSoundRef.current) {
            const sound = matchSoundRef.current.cloneNode() as HTMLAudioElement;
            sound.volume = 0.6;
            sound.play().catch(console.error);
        }
    }, []);

    return {
        playClickSound,
        playMatchSound
    };
}; 