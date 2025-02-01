import { useRef, useCallback, useEffect } from 'react';

export const useSoundEffects = () => {
    // 减少音效池大小，移动端设备不需要太多实例
    const poolSize = 2;
    const clickSoundPool = useRef<HTMLAudioElement[]>([]);
    const matchSoundPool = useRef<HTMLAudioElement[]>([]);
    
    // 添加防抖控制
    const lastPlayTimeRef = useRef<number>(0);
    const minInterval = 50; // 最小播放间隔（毫秒）

    useEffect(() => {
        if (typeof window !== 'undefined') {
            // 清空现有的音效池
            clickSoundPool.current = [];
            matchSoundPool.current = [];

            // 初始化音效池
            for (let i = 0; i < poolSize; i++) {
                const clickSound = new window.Audio('/linkGame/sounds/click.mp3');
                const matchSound = new window.Audio('/linkGame/sounds/match.mp3');
                
                // 优化音频设置
                clickSound.preload = 'auto';
                matchSound.preload = 'auto';
                clickSound.volume = 0.4; // 降低音量
                matchSound.volume = 0.4;
                
                // 设置较短的音频
                // clickSound.duration = 0.1;
                // matchSound.duration = 0.1;
                
                clickSoundPool.current.push(clickSound);
                matchSoundPool.current.push(matchSound);
            }
        }

        // 清理函数
        return () => {
            clickSoundPool.current.forEach(sound => {
                sound.pause();
                sound.src = '';
            });
            matchSoundPool.current.forEach(sound => {
                sound.pause();
                sound.src = '';
            });
        };
    }, []);

    const playClickSound = useCallback(() => {
        const now = Date.now();
        if (now - lastPlayTimeRef.current < minInterval) {
            return; // 如果间隔太短，跳过播放
        }
        
        if (clickSoundPool.current.length > 0) {
            const availableSound = clickSoundPool.current.find(sound => 
                sound.paused || sound.ended
            );
            
            if (availableSound) {
                try {
                    availableSound.currentTime = 0;
                    const playPromise = availableSound.play();
                    if (playPromise) {
                        playPromise.catch(() => {
                            // 忽略播放错误，避免控制台报错
                        });
                    }
                    lastPlayTimeRef.current = now;
                } catch (error) {
                    // 忽略播放错误
                }
            }
        }
    }, []);

    const playMatchSound = useCallback(() => {
        const now = Date.now();
        if (now - lastPlayTimeRef.current < minInterval) {
            return;
        }
        
        if (matchSoundPool.current.length > 0) {
            const availableSound = matchSoundPool.current.find(sound => 
                sound.paused || sound.ended
            );
            
            if (availableSound) {
                try {
                    availableSound.currentTime = 0;
                    const playPromise = availableSound.play();
                    if (playPromise) {
                        playPromise.catch(() => {
                            // 忽略播放错误
                        });
                    }
                    lastPlayTimeRef.current = now;
                } catch (error) {
                    // 忽略播放错误
                }
            }
        }
    }, []);

    return {
        playClickSound,
        playMatchSound
    };
}; 