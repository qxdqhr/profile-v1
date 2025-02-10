import { NextResponse } from 'next/server'
import type { GameData } from '@/app/(pages)/gameField/goldMiner/types/gameData'

export async function GET() {
  try {
    // 模拟游戏数据
    const gameData: GameData = {
      levels: Array.from({ length: 12 }, (_, i) => ({
        id: i + 1,
        targetScore: (i + 1) * 200, // 每关目标分数递增
        timeLimit: 60, // 每关60秒
        objects: {
          gold: 3 + Math.floor(i / 3), // 金块数量随关卡增加
          stone: 2 + Math.floor(i / 2), // 石头数量随关卡增加
          diamond: Math.floor(i / 4)    // 钻石从第4关开始出现
        }
      })),
      highScores: {}, // 初始无最高分
      settings: {
        soundEnabled: true,
        musicEnabled: true
      }
    }

    return NextResponse.json(gameData)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch game data' },
      { status: 500 }
    )
  }
}

// 更新游戏设置
export async function PUT(request: Request) {
  try {
    const data = await request.json()
    
    // 这里可以添加数据验证
    if (!data || typeof data.settings !== 'object') {
      return NextResponse.json(
        { error: 'Invalid settings data' },
        { status: 400 }
      )
    }

    // 这里应该添加数据持久化逻辑
    // 目前只返回更新成功的响应
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    )
  }
}

// 更新最高分
export async function POST(request: Request) {
  try {
    const data = await request.json()
    
    // 验证数据
    if (!data || typeof data.level !== 'number' || typeof data.score !== 'number') {
      return NextResponse.json(
        { error: 'Invalid score data' },
        { status: 400 }
      )
    }

    // 这里应该添加分数持久化逻辑
    // 目前只返回更新成功的响应
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update high score' },
      { status: 500 }
    )
  }
} 