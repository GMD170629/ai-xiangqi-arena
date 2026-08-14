import type { GameAiAdapter } from '../../../core/game/contracts'
import { square } from '../domain/board'
import { douShouQiActionCodec } from '../domain/action-codec'
import type { DouShouQiSide, DouShouQiState, MoveAction } from '../domain/types'

export const douShouQiAiAdapter: GameAiAdapter<DouShouQiState, MoveAction, DouShouQiSide> = {
  rulesPrompt() {
    return [
      'You are playing Dou Shou Qi (Jungle).',
      'Move one animal orthogonally. Only rats enter rivers; lions and tigers may jump rivers unless a rat blocks the path.',
      'Normal captures require equal or higher rank. A land rat may capture an elephant; an elephant may not capture a rat.',
      'Enemy pieces in your traps have effective rank 0. Entering the opponent den wins. Never enter your own den.',
      'Choose exactly one action from the provided legalActions list.'
    ].join(' ')
  },
  serializeState(state, perspective) {
    return {
      perspective,
      turn: state.turn,
      ply: state.ply,
      pieces: state.pieces.map((piece) => ({ side: piece.side, animal: piece.animal, square: square(piece.position) }))
    }
  },
  serializeAction(action) { return douShouQiActionCodec.encode(action) }
}
