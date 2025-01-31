import React from 'react'
import { Level, GAME_LEVELS } from '../types'

interface LevelSelectProps {
  onSelectLevel: (level: Level) => void
}

const LevelSelect: React.FC<LevelSelectProps> = ({ onSelectLevel }) => {
  return (
    <div className="game-info">
      <h1>葱韵环京连连看
        <span className="subtitle">
          Created by 焦糖布丁忆梦梦 皋月朔星
        </span>
      </h1>
      <div className="level-select-grid">
        {GAME_LEVELS.map((level) => (
          <div
            key={level.id}
            className="level-card"
            onClick={() => onSelectLevel(level)}
          >
            <h3 className="level-card-title">{level.name}</h3>
            <p className="level-card-description">{level.description}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default LevelSelect 