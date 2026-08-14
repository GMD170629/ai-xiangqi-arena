import type { GameModule, GameOutcome, SeatId } from '../game/contracts'
import type { DispatchResult, MatchHistoryEntry, MatchSnapshot } from './types'

export class MatchRuntime<State, Action, Seat extends SeatId> {
  private state: State
  private history: MatchHistoryEntry<Action, Seat>[] = []
  private externalOutcome: GameOutcome<Seat> | null = null

  constructor(private readonly game: GameModule<State, Action, Seat>, initialState?: State) {
    this.state = initialState ?? game.rules.createInitialState()
  }

  snapshot(): MatchSnapshot<State, Action, Seat> {
    const outcome = this.externalOutcome ?? this.game.rules.outcome(this.state)
    return {
      status: outcome ? 'finished' : 'active',
      gameId: this.game.manifest.id,
      rulesVersion: this.game.manifest.rulesVersion,
      state: this.state,
      currentSeat: this.game.rules.currentSeat(this.state),
      history: [...this.history],
      outcome
    }
  }

  legalActions(): readonly Action[] {
    if (this.snapshot().status === 'finished') return []
    return this.game.rules.legalActions(this.state)
  }

  finish(outcome: GameOutcome<Seat>): MatchSnapshot<State, Action, Seat> {
    if (!this.externalOutcome) this.externalOutcome = outcome
    return this.snapshot()
  }

  dispatch(action: Action): DispatchResult<State, Action, Seat> {
    const before = this.snapshot()
    if (before.status === 'finished') return { ok: false, reason: 'MATCH_FINISHED', snapshot: before }

    const validation = this.game.rules.validateAction(this.state, action)
    if (!validation.ok) return { ok: false, reason: validation.reason ?? 'ILLEGAL_ACTION', snapshot: before }

    const seat = this.game.rules.currentSeat(this.state)
    this.state = this.game.rules.applyAction(this.state, action)
    this.history.push({
      ply: this.history.length + 1,
      seat,
      action,
      encodedAction: this.game.actionCodec.encode(action)
    })

    return { ok: true, snapshot: this.snapshot() }
  }
}
