'use client'
import { useCallback } from 'react'
import { extend } from '@pixi/react'
import { Graphics } from 'pixi.js'
import { PathPoint } from '../constant/types'

// 注册 PixiJS 组件
extend({ Graphics })

interface ConnectionLineProps {
    path: PathPoint[]
  }
  
  export const ConnectionLine = ({ path }: ConnectionLineProps) => {
    const draw = useCallback((g: Graphics) => {
      g.clear()
      g.setStrokeStyle({ width: 3, color: 0x00ff00, alpha: 1 })
  
      // 直接使用路径点坐标（已经包含了所有必要的偏移）
      g.moveTo(path[0].x, path[0].y)
  
      for (let i = 1; i < path.length; i++) {
        g.lineTo(path[i].x, path[i].y)
      }
      g.stroke()
    }, [path])

    return <pixiGraphics draw={draw} />
  }
