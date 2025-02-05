import { useState, useEffect } from 'react'
import { GameData } from '../types/gameData'

export const useGameDataPreload = () => {
  const [gameData, setGameData] = useState<GameData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchGameData = async () => {
      try {
        setIsLoading(true)
        // 这里替换为你的实际API端点
        const response = await fetch('/api/goldMiner/gameData')
        if (!response.ok) {
          throw new Error('Failed to fetch game data')
        }
        const data = await response.json()
        setGameData(data)
        // 将数据存储到 localStorage 以供离线使用
        localStorage.setItem('goldMinerGameData', JSON.stringify(data))
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error occurred')
        // 尝试从 localStorage 加载备份数据
        const cachedData = localStorage.getItem('goldMinerGameData')
        if (cachedData) {
          setGameData(JSON.parse(cachedData))
        }
      } finally {
        setIsLoading(false)
      }
    }

    fetchGameData()
  }, [])

  return { gameData, isLoading, error }
} 