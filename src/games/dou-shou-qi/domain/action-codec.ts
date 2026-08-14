import type { GameActionCodec } from '../../../core/game/contracts'
import { pos, square } from './board'
import type { MoveAction } from './types'

export const douShouQiActionCodec: GameActionCodec<MoveAction> = {
  encode(action) { return `${square(action.from)}-${square(action.to)}` },
  decode(value) {
    const match = /^([a-g][1-9])-([a-g][1-9])$/.exec(value.trim().toLowerCase())
    return match ? { type: 'move', from: pos(match[1]), to: pos(match[2]) } : null
  }
}
