import type { GameModule } from '../../core/game/contracts'
import { douShouQiAiAdapter } from './ai/adapter'
import { douShouQiActionCodec } from './domain/action-codec'
import { douShouQiRules } from './domain/rules'
import type { DouShouQiSide, DouShouQiState, MoveAction } from './domain/types'

export const douShouQiModule: GameModule<DouShouQiState, MoveAction, DouShouQiSide> = {
  manifest: {
    id: 'dou-shou-qi',
    name: '斗兽棋',
    rulesVersion: 'classic-v1',
    seats: ['blue', 'red']
  },
  rules: douShouQiRules,
  actionCodec: douShouQiActionCodec,
  ai: douShouQiAiAdapter
}
