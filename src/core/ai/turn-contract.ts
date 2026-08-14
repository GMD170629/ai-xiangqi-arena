import type { SeatId } from '../game/contracts'

export interface CommanderMessage {
  id: string
  text: string
  createdAt: string
}

export interface AiTurnRequest<Seat extends SeatId = SeatId> {
  protocolVersion: '0.1'
  game: { id: string; rulesVersion: string }
  turn: number
  seat: Seat
  state: unknown
  legalActions: readonly string[]
  commanderMessages: readonly CommanderMessage[]
  personality: { id: string; name: string; prompt: string }
}

export interface AiTurnResponse {
  action: string
  message: string
}
