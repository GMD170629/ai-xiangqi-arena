import type { Animal, DouShouQiSide, DouShouQiState, Piece, Position } from './types'

export const BOARD_COLS = 7
export const BOARD_ROWS = 9

export const ANIMAL_RANK: Record<Animal, number> = {
  rat: 1, cat: 2, dog: 3, wolf: 4, leopard: 5, tiger: 6, lion: 7, elephant: 8
}

export const BLUE_DEN = pos('d1')
export const RED_DEN = pos('d9')
export const BLUE_TRAPS = ['c1', 'e1', 'd2'].map(pos)
export const RED_TRAPS = ['c9', 'e9', 'd8'].map(pos)
export const RIVER = new Set(['b4','c4','e4','f4','b5','c5','e5','f5','b6','c6','e6','f6'])

const INITIAL: readonly [DouShouQiSide, Animal, string][] = [
  ['blue','tiger','a1'], ['blue','lion','g1'], ['blue','cat','b2'], ['blue','dog','f2'],
  ['blue','elephant','a3'], ['blue','wolf','c3'], ['blue','leopard','e3'], ['blue','rat','g3'],
  ['red','lion','a9'], ['red','tiger','g9'], ['red','cat','f8'], ['red','dog','b8'],
  ['red','elephant','g7'], ['red','wolf','e7'], ['red','leopard','c7'], ['red','rat','a7']
]

export function pos(square: string): Position {
  if (!/^[a-g][1-9]$/.test(square)) throw new Error(`Invalid square: ${square}`)
  return { col: square.charCodeAt(0) - 97, row: Number(square[1]) - 1 }
}

export function square(position: Position): string {
  return `${String.fromCharCode(97 + position.col)}${position.row + 1}`
}

export function isInside(p: Position): boolean {
  return p.col >= 0 && p.col < BOARD_COLS && p.row >= 0 && p.row < BOARD_ROWS
}

export function same(a: Position, b: Position): boolean { return a.col === b.col && a.row === b.row }
export function isRiver(p: Position): boolean { return RIVER.has(square(p)) }
export function pieceAt(state: DouShouQiState, p: Position): Piece | undefined { return state.pieces.find((piece) => same(piece.position, p)) }
export function denFor(side: DouShouQiSide): Position { return side === 'blue' ? BLUE_DEN : RED_DEN }
export function opponentDen(side: DouShouQiSide): Position { return side === 'blue' ? RED_DEN : BLUE_DEN }
export function trapsFor(side: DouShouQiSide): readonly Position[] { return side === 'blue' ? BLUE_TRAPS : RED_TRAPS }
export function otherSide(side: DouShouQiSide): DouShouQiSide { return side === 'blue' ? 'red' : 'blue' }

export function trapOwner(p: Position): DouShouQiSide | null {
  if (BLUE_TRAPS.some((t) => same(t, p))) return 'blue'
  if (RED_TRAPS.some((t) => same(t, p))) return 'red'
  return null
}

export function effectiveRank(piece: Piece): number {
  const owner = trapOwner(piece.position)
  return owner && owner !== piece.side ? 0 : ANIMAL_RANK[piece.animal]
}

export function positionKey(state: Pick<DouShouQiState, 'turn' | 'pieces'>): string {
  const pieces = [...state.pieces]
    .sort((a, b) => a.id.localeCompare(b.id))
    .map((p) => `${p.id}:${square(p.position)}`)
    .join('|')
  return `${state.turn}|${pieces}`
}

export function createInitialState(): DouShouQiState {
  const pieces = INITIAL.map(([side, animal, at]) => ({ id: `${side}-${animal}`, side, animal, position: pos(at) }))
  const base = { turn: 'blue' as const, ply: 0, pieces, repetition: {} }
  const key = positionKey(base)
  return { ...base, repetition: { [key]: 1 } }
}
