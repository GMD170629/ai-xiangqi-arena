import { describe, expect, it } from 'vitest'
import { AiTurnRunner } from './ai-turn-runner'
import { MatchRuntime } from '../match/match-runtime'
import type { AiProvider, ChatCompletionRequest, ChatCompletionResult, ProviderConfig } from '../provider/types'
import { douShouQiModule } from '../../games/dou-shou-qi/module'

class SequenceProvider implements AiProvider {
  readonly kind = 'test'
  private index = 0
  constructor(private readonly outputs: string[]) {}

  async complete(_config: ProviderConfig, _request: ChatCompletionRequest): Promise<ChatCompletionResult> {
    return { text: this.outputs[this.index++] ?? this.outputs[this.outputs.length - 1]! }
  }

  async testConnection(): Promise<{ ok: boolean; message: string }> {
    return { ok: true, message: 'ok' }
  }
}

describe('AiTurnRunner', () => {
  it('retries an invalid AI action and dispatches only the later legal action', async () => {
    const match = new MatchRuntime(douShouQiModule)
    const firstLegal = match.legalActions()[0]!
    const legalId = douShouQiModule.actionCodec.encode(firstLegal)
    const provider = new SequenceProvider([
      '{"action":"not-a-real-action","message":"try"}',
      JSON.stringify({ action: legalId, message: 'legal now' })
    ])
    const runner = new AiTurnRunner(douShouQiModule, match, provider)

    const result = await runner.run(
      { id: 'test', name: 'test', baseUrl: 'http://unused/v1', model: 'test' },
      { id: 'test', name: 'test', description: 'test', prompt: 'test' },
      []
    )

    expect(result.attempts).toBe(2)
    expect(result.response.action).toBe(legalId)
    expect(result.snapshot.history).toHaveLength(1)
  })
})
