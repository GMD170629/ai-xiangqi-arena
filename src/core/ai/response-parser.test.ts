import { describe, expect, it } from 'vitest'
import { parseAiTurnResponse } from './response-parser'

describe('parseAiTurnResponse', () => {
  it('parses strict JSON', () => {
    expect(parseAiTurnResponse('{"action":"a3-a4","message":"推进。"}')).toEqual({ action: 'a3-a4', message: '推进。', commandResponse: undefined })
  })

  it('accepts fenced JSON from less strict compatible models', () => {
    const parsed = parseAiTurnResponse('```json\n{"action":"a3-a4","message":"推进。","commandResponse":"收到。"}\n```')
    expect(parsed.action).toBe('a3-a4')
    expect(parsed.commandResponse).toBe('收到。')
  })

  it('rejects missing action', () => {
    expect(() => parseAiTurnResponse('{"message":"no move"}')).toThrow('AI_OUTPUT_ACTION_MISSING')
  })
})
