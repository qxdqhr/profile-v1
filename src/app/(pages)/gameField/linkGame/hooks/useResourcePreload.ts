import { useState, useEffect } from 'react'
import { TYPES_COUNT } from '../types'

interface PreloadStatus {
  isLoading: boolean
  progress: number
  error: string | null
}

// 预定义音乐列表
const MUSIC_LIST = [
  { name: 'ShakeIt!-Miku', path: '/linkGame/mp3/ShakeIt!-Miku.mp3' },
  // ... 其他音乐
]

// 预定义音效列表
const SOUND_EFFECTS = {
  click: '/linkGame/sounds/click.mp3',
  match: '/linkGame/sounds/match.mp3'
}

// 修改音频加载逻辑
const loadAudio = (src: string) => {

  console.log('当前环境:', {
    isWechat: /MicroMessenger/i.test(navigator.userAgent),
    userAgent: navigator.userAgent
  });

  return new Promise((resolve, reject) => {
    const audio = new Audio();
    audio.preload = 'auto';
    
    // 添加超时处理
    const timeout = setTimeout(() => {
      console.log(`音频加载超时: ${src}`);
      resolve(null); // 超时后也继续进行，不阻塞整体加载
    }, 5000);
    
    // 微信环境特殊处理
    const isWechat = /MicroMessenger/i.test(navigator.userAgent);
    if (isWechat) {
      // 微信环境下直接跳过等待 canplaythrough
      audio.src = src;
      audio.load();
      setTimeout(() => {
        clearTimeout(timeout);
        resolve(null);
      }, 100);
      return;
    }
    
    audio.addEventListener('canplaythrough', () => {
      clearTimeout(timeout);
      resolve(null);
    }, { once: true });
    
    audio.addEventListener('error', () => {
      clearTimeout(timeout);
      console.error(`音频加载失败: ${src}`);
      resolve(null); // 失败后也继续进行
    });
    
    audio.src = src;
    audio.load();
  });
};

export const useResourcePreload = () => {
  const [status, setStatus] = useState<PreloadStatus>({
    isLoading: true,
    progress: 0,
    error: null
  })

  useEffect(() => {
    const preloadResources = async () => {
      try {
        // 计算需要加载的总资源数（图片 + 背景图 + 音效）
        const totalResources = TYPES_COUNT + 1 + Object.keys(SOUND_EFFECTS).length + MUSIC_LIST.length
        let loadedResources = 0

        const updateProgress = () => {
          loadedResources++
          setStatus(prev => ({
            ...prev,
            progress: (loadedResources / totalResources) * 100
          }))
        }

        // 预加载背景图
        try {
          const bgImg = new Image()
          await new Promise((resolve, reject) => {
            bgImg.onload = resolve
            bgImg.onerror = () => reject('背景图加载失败')
            bgImg.src = '/linkGame/background.png'
          })
          updateProgress()
        } catch (error) {
          throw new Error('背景图加载失败: ' + error)
        }

        // 预加载方块图片
        try {
          const imageLoadPromises = Array.from({ length: TYPES_COUNT }, (_, i) => {
            return new Promise((resolve, reject) => {
              const img = new Image()
              img.onload = () => {
                updateProgress()
                resolve(null)
              }
              img.onerror = () => reject(`图标 ${i} 加载失败`)
              img.src = `/linkGame/icon/icon_${i}.png`
            })
          })

          await Promise.all(imageLoadPromises)
        } catch (error) {
          throw new Error('方块图片加载失败: ' + error)
        }

        // 预加载音效（必须加载完成）
        try {
          const soundEffectPromises = Object.values(SOUND_EFFECTS).map(path => loadAudio(path));
          await Promise.all(soundEffectPromises);
          updateProgress();
        } catch (error) {
          console.warn('音效加载异常:', error);
          // 继续执行，不抛出错误
        }

        // 音乐预加载（必须加载完成）
        try {
          const musicLoadPromises = MUSIC_LIST.map(music => loadAudio(music.path));
          await Promise.all(musicLoadPromises);
          updateProgress();
        } catch (error) {
          console.warn('音乐加载异常:', error);
          // 继续执行，不抛出错误
        }

        setStatus({
          isLoading: false,
          progress: 100,
          error: null
        })
      } catch (error) {
        console.error('资源加载错误:', error)
        setStatus({
          isLoading: false,
          progress: 0,
          error: error instanceof Error ? error.message : '资源加载失败，请刷新页面重试'
        })
      }
    }

    preloadResources()
  }, [])

  return status
} 