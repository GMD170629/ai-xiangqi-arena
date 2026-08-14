import type { GameOutcome, GameRules, ValidationResult } from '../../../core/game/contracts'
import {
  ANIMAL_RANK,
  createInitialState,
  denFor,
  effectiveRank,
  isInside,
  isRiver,
  otherSide,
  opponentDen,
  pieceAt,
  positionKey,
  same,
  square,
  trapsFor
} from './board'
import type { DouShouQiSide, DouShouQiState, MoveAction, Piece, Position } from './types'

const DIRECTIONS: readonly Position[] = [
  { col: 1, row: 0 }, { col: -1, row: 0 }, { col: 0, row: 1 }, { col: 0, row: -1 }
]

function add(a: Position, b: Position): Position { return { col: a.col + b.col, row: a.row + b.row } }

function isOwnDen(side: DouShouQiSide, p: Position): boolean { return same(denFor(side), p) }

function canEnter(piece: Piece, to: Position): boolean {
  if (!isInside(to) || isOwnDen(piece.side, to)) return false
  if (isRiver(to) && piece.animal !== 'rat') return false
  return true
}

function jumpDestination(state: DouShouQiState, piece: Piece, direction: Position): Position | null {
  const first = add(piece.position, direction)
  if (!isRiver(first) || (piece.animal !== 'lion' && piece.animal !== 'tiger')) return null

  let cursor = first
  while (isInside(cursor) && isRiver(cursor)) {
    const blocker = pieceAt(state, cursor)
    if (blocker?.animal === 'rat') return null
    cursor = add(cursor, direction)
  }
  return isInside(cursor) ? cursor : null
}

function captureAllowed(attacker: Piece, defender: Piece): boolean {
  const attackerWater = isRiver(attacker.position)
  const defenderWater = isRiver(defender.position)

  if (attacker.animal === 'rat' || defender.animal === 'rat') {
    if (attackerWater !== defenderWater) return false
    if (attackerWater && defenderWater) return attacker.animal === 'rat' && defender.animal === 'rat'
  }

  const attackRank = effectiveRank(attacker)
  const defendRank = effectiveRank(defender)
  if (attackRank === 0) return defendRank === 0

  if (attacker.animal === 'elephant' && defender.animal === 'rat') return false
  if (attacker.animal === 'rat' && defender.animal === 'elephant') return true

  return attackRank >= defendRank
}

function candidateDestinations(state: DouShouQiState, piece: Piece): Position[] {
  const result: Position[] = []
  for (const direction of DIRECTIONS) {
    const adjacent = add(piece.position, direction)
    const jump = jumpDestination(state, piece, direction)
    const target = jump ?? adjacent
    if (!canEnter(piece, target)) continue
    const occupant = pieceAt(state, target)
    if (!occupant) result.push(target)
    else if (occupant.side !== piece.side && captureAllowed(piece, occupant)) result.push(target)
  }
  return result
}

export function legalActions(state: DouShouQiState): MoveAction[] {
  if (outcomeWithoutMobility(state)) return []
  return state.pieces
    .filter((piece) => piece.side === state.turn)
    .flatMap((piece) => candidateDestinations(state, piece).map((to) => ({ type: 'move' as const, from: piece.position, to })))
}

export function validateAction(state: DouShouQiState, action: MoveAction): ValidationResult {
  if (outcomeWithoutMobility(state)) return { ok: false, reason: 'GAME_FINISHED' }
  const piece = pieceAt(state, action.from)
  if (!piece) return { ok: false, reason: 'NO_PIECE_AT_SOURCE' }
  if (piece.side !== state.turn) return { ok: false, reason: 'NOT_CURRENT_SIDE_PIECE' }
  const legal = candidateDestinations(state, piece).some((to) => same(to, action.to))
  return legal ? { ok: true } : { ok: false, reason: `ILLEGAL_MOVE:${square(action.from)}-${square(action.to)}` }
}

export function applyAction(state: DouShouQiState, action: MoveAction): DouShouQiState {
  const validation = validateAction(state, action)
  if (!validation.ok) throw new Error(validation.reason)

  const moving = pieceAt(state, action.from)!
  const target = pieceAt(state, action.to)
  const pieces = state.pieces
    .filter((piece) => piece.id !== target?.id)
    .map((piece) => piece.id === moving.id ? { ...piece, position: { ...action.to } } : piece)
  const turn = otherSide(state.turn)
  const nextBase = { turn, ply: state.ply + 1, pieces, repetition: state.repetition }
  const key = positionKey(nextBase)
  const repetition = { ...state.repetition, [key]: (state.repetition[key] ?? 0) + 1 }
  return { ...nextBase, repetition }
}

function outcomeWithoutMobility(state: DouShouQiState): GameOutcome<DouShouQiSide> | null {
  for (const side of ['blue', 'red'] as const) {
    if (state.pieces.some((piece) => piece.side === side && same(piece.position, opponentDen(side)))) {
      return { type: 'win', winner: side, reason: 'DEN_CAPTURED' }
    }
    if (!state.pieces.some((piece) => piece.side === otherSide(side))) {
      return { type: 'win', winner: side, reason: 'ALL_OPPONENT_PIECES_CAPTURED' }
    }
  }

  const key = positionKey(state)
  if ((state.repetition[key] ?? 0) >= 3) return { type: 'draw', reason: 'THREEFOLD_REPETITION' }
  return null
}

export function outcome(state: DouShouQiState): GameOutcome<DouShouQiSide> | null {
  const resolved = outcomeWithoutMobility(state)
  if (resolved) return resolved

  const hasMove = state.pieces
    .filter((piece) => piece.side === state.turn)
    .some((piece) => candidateDestinations(state, piece).length > 0)
  if (!hasMove) return { type: 'win', winner: otherSide(state.turn), reason: 'NO_LEGAL_ACTIONS' }
  return null
}

export const douShouQiRules: GameRules<DouShouQiState, MoveAction, DouShouQiSide> = {
  createInitialState,
  currentSeat: (state) => state.turn,
  legalActions,
  validateAction,
  applyAction,
  outcome
}

export const douShouQiRuleFacts = {
  ranks: ANIMAL_RANK,
  trapsFor,
  denFor
}
