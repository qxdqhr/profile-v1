import React from 'react'
import { Level } from '../constant/types'
import { GAME_LEVELS,GAME_TITLE,GAME_SUBTITLE } from '../constant/const'

interface LevelSelectProps {
  onSelectLevel: (level: Level) => void
}

const LevelSelect: React.FC<LevelSelectProps> = ({ onSelectLevel }) => {
  return (
    <div className="linkGame-container">
      <div className="game-header">
        <div className="game-info">
          <h1>{GAME_TITLE}
            <span className="subtitle">
            {GAME_SUBTITLE}
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
      </div>
    </div>
  )
}

export default LevelSelect 