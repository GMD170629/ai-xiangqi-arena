import type { GameUiPlugin } from '../../../client/game-ui-registry'
import DouShouQiBoard from './DouShouQiBoard.vue'

export const douShouQiUiPlugin: GameUiPlugin = {
  gameId: 'dou-shou-qi',
  rulesVersion: 'classic-v1',
  boardComponent: DouShouQiBoard
}
