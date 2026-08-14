export type DouShouQiSide = 'blue' | 'red'
export type Animal = 'rat' | 'cat' | 'dog' | 'wolf' | 'leopard' | 'tiger' | 'lion' | 'elephant'

export interface Position { col: number; row: number }
export interface Piece { id: string; side: DouShouQiSide; animal: Animal; position: Position }
export interface MoveAction { type: 'move'; from: Position; to: Position }

export interface DouShouQiState {
  turn: DouShouQiSide
  ply: number
  pieces: readonly Piece[]
  repetition: Readonly<Record<string, number>>
}
