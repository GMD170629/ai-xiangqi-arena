import type { GameModule, SeatId } from '../game/contracts'
import type { MatchRuntime } from '../match/match-runtime'
import type { AiProvider, ProviderConfig } from '../provider/types'
import type { PersonalityProfile } from '../personality/profiles'
import { CommanderInbox } from '../commander/commander-inbox'
import { AiTurnRunner, type AiTurnRunResult } from './ai-turn-runner'

export interface SeatAgentConfig {
  provider: ProviderConfig
  personality: PersonalityProfile
}

export class AutoMatchController<State, Action, Seat extends SeatId> {
  readonly commander = new CommanderInbox<Seat>()
  private readonly runner: AiTurnRunner<State, Action, Seat>
  private readonly agents = new Map<Seat, SeatAgentConfig>()

  constructor(game: GameModule<State, Action, Seat>, private readonly match: MatchRuntime<State, Action, Seat>, provider: AiProvider) {
    this.runner = new AiTurnRunner(game, match, provider)
  }

  configureSeat(seat: Seat, config: SeatAgentConfig): void {
    this.agents.set(seat, config)
  }

  async playNextTurn(): Promise<AiTurnRunResult<State, Action, Seat>> {
    const snapshot = this.match.snapshot()
    if (snapshot.status === 'finished') throw new Error('MATCH_FINISHED')
    const seat = snapshot.currentSeat
    const agent = this.agents.get(seat)
    if (!agent) throw new Error(`AI_AGENT_NOT_CONFIGURED:${seat}`)
    const messages = this.commander.peek(seat)
    const result = await this.runner.run(agent.provider, agent.personality, messages)
    this.commander.acknowledge(seat, messages.map((item) => item.id))
    return result
  }
}
