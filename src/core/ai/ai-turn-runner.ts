import type { GameModule, SeatId } from '../game/contracts'
import type { MatchRuntime } from '../match/match-runtime'
import type { AiProvider, ProviderConfig } from '../provider/types'
import type { PersonalityProfile } from '../personality/profiles'
import type { CommanderMessage, AiTurnRequest, AiTurnResponse } from './turn-contract'
import { buildTurnMessages } from './prompt-builder'
import { parseAiTurnResponse } from './response-parser'

export interface AiTurnRunResult<State, Action, Seat extends SeatId> {
  response: AiTurnResponse
  action: Action
  snapshot: ReturnType<MatchRuntime<State, Action, Seat>['snapshot']>
  attempts: number
  latencyMs: number
  model?: string
  usage?: { promptTokens?: number; completionTokens?: number; totalTokens?: number }
}

export class AiTurnRunner<State, Action, Seat extends SeatId> {
  constructor(
    private readonly game: GameModule<State, Action, Seat>,
    private readonly match: MatchRuntime<State, Action, Seat>,
    private readonly provider: AiProvider
  ) {}

  async run(config: ProviderConfig, personality: PersonalityProfile, commanderMessages: readonly CommanderMessage[], maxAttempts = 3): Promise<AiTurnRunResult<State, Action, Seat>> {
    const started = Date.now()
    let retryFeedback: string | undefined

    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
      const snapshot = this.match.snapshot()
      if (snapshot.status === 'finished') throw new Error('MATCH_FINISHED')
      const seat = snapshot.currentSeat
      const request: AiTurnRequest<Seat> = {
        protocolVersion: '0.2',
        game: { id: this.game.manifest.id, rulesVersion: this.game.manifest.rulesVersion },
        turn: snapshot.history.length + 1,
        seat,
        state: { machine: this.game.ai.serializeState(snapshot.state, seat) },
        legalActions: this.match.legalActions().map((action) => ({ id: this.game.ai.serializeAction(action) })),
        commanderMessages,
        personality: { id: personality.id, name: personality.name, prompt: personality.prompt }
      }

      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), config.timeoutMs ?? 60000)
      try {
        const completion = await this.provider.complete(config, {
          messages: buildTurnMessages(request, this.game.ai.rulesPrompt(), retryFeedback),
          responseFormat: 'json_object'
        }, controller.signal)
        const response = parseAiTurnResponse(completion.text)
        const action = this.game.actionCodec.decode(response.action)
        if (!action) {
          retryFeedback = `Action '${response.action}' cannot be parsed. Choose one exact legal action id.`
          continue
        }
        const validation = this.game.rules.validateAction(snapshot.state, action)
        if (!validation.ok) {
          retryFeedback = `Illegal action '${response.action}': ${validation.reason ?? 'ILLEGAL_ACTION'}. Choose another legal action.`
          continue
        }
        const dispatched = this.match.dispatch(action)
        if (!dispatched.ok) {
          retryFeedback = `Action rejected by MatchRuntime: ${dispatched.reason ?? 'UNKNOWN_ERROR'}`
          continue
        }
        return {
          response,
          action,
          snapshot: dispatched.snapshot,
          attempts: attempt,
          latencyMs: Date.now() - started,
          model: completion.model,
          usage: completion.usage
        }
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') retryFeedback = 'Provider request timed out. Return one legal action immediately.'
        else if (attempt === maxAttempts) throw error
        else retryFeedback = error instanceof Error ? error.message : String(error)
      } finally {
        clearTimeout(timeout)
      }
    }

    throw new Error(`AI_FAILURE: ${retryFeedback ?? 'MAX_ATTEMPTS_EXCEEDED'}`)
  }
}
