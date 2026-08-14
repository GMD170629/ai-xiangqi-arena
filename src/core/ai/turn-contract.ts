import type { SeatId } from '../game/contracts'

export interface CommanderMessage {
  id: string
  text: string
  createdAt: string
}

export interface SerializedLegalAction {
  id: string
  display?: string
}

export interface AiTurnRequest<Seat extends SeatId = SeatId> {
  protocolVersion: '0.2'
  game: { id: string; rulesVersion: string }
  turn: number
  seat: Seat
  state: { machine: unknown; readable?: string }
  legalActions: readonly SerializedLegalAction[]
  commanderMessages: readonly CommanderMessage[]
  personality: { id: string; name: string; prompt: string }
}

export interface AiTurnResponse {
  action: string
  message: string
  commandResponse?: string
}
