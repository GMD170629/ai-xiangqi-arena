import type { GameOutcome, SeatId } from '../game/contracts'

export type MatchStatus = 'active' | 'finished'

export interface MatchHistoryEntry<Action, Seat extends SeatId> {
  ply: number
  seat: Seat
  action: Action
  encodedAction: string
}

export interface MatchSnapshot<State, Action, Seat extends SeatId> {
  status: MatchStatus
  gameId: string
  rulesVersion: string
  state: State
  currentSeat: Seat
  history: readonly MatchHistoryEntry<Action, Seat>[]
  outcome: GameOutcome<Seat> | null
}

export type DispatchResult<State, Action, Seat extends SeatId> =
  | { ok: true; snapshot: MatchSnapshot<State, Action, Seat> }
  | { ok: false; reason: string; snapshot: MatchSnapshot<State, Action, Seat> }
