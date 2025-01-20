import { Howl } from 'howler';
import { Song } from '../types';

class AudioService {
    private sound: Howl | null = null;
    private currentSong: Song | null = null;
    private onTimeUpdate: ((time: number) => void) | null = null;
    private onEnd: (() => void) | null = null;
    private rafId: number | null = null;

    loadSong(song: Song) {
        if (this.sound) {
            this.sound.unload();
        }

        this.currentSong = song;
        this.sound = new Howl({
            src: [song.audioUrl],
            html5: true,
            preload: true,
            onload: () => {
                console.log('Audio loaded:', song.title);
            },
            onloaderror: (id, error) => {
                console.error('Audio load error:', error);
            },
            onend: () => {
                this.stopTimeUpdate();
                this.onEnd?.();
            }
        });
    }

    play() {
        if (!this.sound) return;
        this.sound.play();
        this.startTimeUpdate();
    }

    pause() {
        if (!this.sound) return;
        this.sound.pause();
        this.stopTimeUpdate();
    }

    stop() {
        if (!this.sound) return;
        this.sound.stop();
        this.stopTimeUpdate();
    }

    seek(position: number) {
        if (!this.sound) return;
        this.sound.seek(position);
    }

    setVolume(volume: number) {
        if (!this.sound) return;
        this.sound.volume(Math.max(0, Math.min(1, volume)));
    }

    setPlaybackRate(rate: number) {
        if (!this.sound) return;
        this.sound.rate(Math.max(0.5, Math.min(2, rate)));
    }

    getCurrentTime(): number {
        return this.sound ? this.sound.seek() as number : 0;
    }

    getDuration(): number {
        return this.sound ? this.sound.duration() : 0;
    }

    setOnTimeUpdate(callback: (time: number) => void) {
        this.onTimeUpdate = callback;
    }

    setOnEnd(callback: () => void) {
        this.onEnd = callback;
    }

    private startTimeUpdate() {
        const update = () => {
            if (this.sound && this.sound.playing()) {
                this.onTimeUpdate?.(this.getCurrentTime());
                this.rafId = requestAnimationFrame(update);
            }
        };
        this.rafId = requestAnimationFrame(update);
    }

    private stopTimeUpdate() {
        if (this.rafId !== null) {
            cancelAnimationFrame(this.rafId);
            this.rafId = null;
        }
    }

    dispose() {
        this.stopTimeUpdate();
        if (this.sound) {
            this.sound.unload();
            this.sound = null;
        }
        this.currentSong = null;
        this.onTimeUpdate = null;
        this.onEnd = null;
    }
}

// 创建单例实例
export const audioService = new AudioService(); 