import Phaser from 'phaser'
import { GameData } from './gameData'

declare module 'phaser' {
  namespace Types {
    namespace Core {
      interface GameConfig {
        gameData?: GameData;
      }
    }
  }

  class Game {
    gameData: GameData;
  }
}

export default Phaser 