export type SeatId = string

export interface GameManifest<Seat extends SeatId = SeatId> {
  id: string
  name: string
  rulesVersion: string
  seats: readonly Seat[]
}

export interface ValidationResult {
  ok: boolean
  reason?: string
}

export type GameOutcome<Seat extends SeatId> =
  | { type: 'win'; winner: Seat; reason: string }
  | { type: 'draw'; reason: string }

export interface GameRules<State, Action, Seat extends SeatId> {
  createInitialState(): State
  currentSeat(state: State): Seat
  legalActions(state: State): readonly Action[]
  validateAction(state: State, action: Action): ValidationResult
  applyAction(state: State, action: Action): State
  outcome(state: State): GameOutcome<Seat> | null
}

export interface GameActionCodec<Action> {
  encode(action: Action): string
  decode(value: string): Action | null
}

export interface GameAiAdapter<State, Action, Seat extends SeatId> {
  rulesPrompt(): string
  serializeState(state: State, perspective: Seat): unknown
  serializeAction(action: Action): string
}

export interface GameModule<State, Action, Seat extends SeatId> {
  manifest: GameManifest<Seat>
  rules: GameRules<State, Action, Seat>
  actionCodec: GameActionCodec<Action>
  ai: GameAiAdapter<State, Action, Seat>
}
