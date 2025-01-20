'use client';

import React, { useEffect, useState } from 'react';
import { Player } from './components/player';
import { Lyrics } from './components/lyrics';
import { GameControl } from './components/game';
import { SettingsPanel } from './components/settings';
import { useGameStore, useLyricsStore } from './store';
import { audioService } from './services/audio';
import { dataService } from './services/data';
import { Song, LyricsData } from './types';


export default function VocaloidtoGO() {
    const [showSettings, setShowSettings] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const { session } = useGameStore();
    const { loadLyrics } = useLyricsStore();

    // 加载初始数据
    useEffect(() => {
        const loadInitialData = async () => {
            try {
                setIsLoading(true);
                const songs = await dataService.getAllSongs();
                if (songs.length > 0) {
                    const firstSong = songs[0];
                    const lyrics = await dataService.getLyrics(firstSong.id);
                    if (lyrics) {
                        loadLyrics(lyrics);
                    }
                }
            } catch (err) {
                setError('加载数据失败，请刷新页面重试');
                console.error('Failed to load initial data:', err);
            } finally {
                setIsLoading(false);
            }
        };

        loadInitialData();
    }, [loadLyrics]);

    // 处理音频时间更新
    useEffect(() => {
        if (session.currentSong) {
            audioService.setOnTimeUpdate((time) => {
                // 更新歌词显示
                useLyricsStore.getState().updateTime(time);
            });

            audioService.setOnEnd(() => {
                // 处理歌曲结束
                useGameStore.getState().endGame();
            });
        }

        return () => {
            audioService.dispose();
        };
    }, [session.currentSong]);

    // 同步播放速度
    useEffect(() => {
        audioService.setPlaybackRate(session.settings.playbackSpeed);
    }, [session.settings.playbackSpeed]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-xl">加载中...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-xl text-red-500">{error}</div>
            </div>
        );
    }

    return (
        <div className="vocaloid-to-go">
            {/* 游戏区域 */}
            <main className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-1 gap-8">
                    {/* 游戏控制区 */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <GameControl />
                    </div>

                    {/* 歌词显示区 */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <Lyrics />
                    </div>
                </div>
            </main>

            {/* 播放器 */}
            <footer className="fixed bottom-0 left-0 right-0">
                <Player onSettingsClick={() => setShowSettings(true)} />
            </footer>

            {/* 设置面板 */}
            {showSettings && (
                <SettingsPanel onClose={() => setShowSettings(false)} />
            )}
        </div>
    );
}
