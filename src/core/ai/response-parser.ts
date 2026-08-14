import type { AiTurnResponse } from './turn-contract'

function extractJson(text: string): string {
  const trimmed = text.trim()
  if (trimmed.startsWith('```')) {
    return trimmed.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim()
  }
  const start = trimmed.indexOf('{')
  const end = trimmed.lastIndexOf('}')
  return start >= 0 && end > start ? trimmed.slice(start, end + 1) : trimmed
}

export function parseAiTurnResponse(text: string): AiTurnResponse {
  let value: unknown
  try { value = JSON.parse(extractJson(text)) } catch { throw new Error('AI_OUTPUT_PARSE_ERROR') }
  if (!value || typeof value !== 'object') throw new Error('AI_OUTPUT_PARSE_ERROR')
  const record = value as Record<string, unknown>
  if (typeof record.action !== 'string' || !record.action.trim()) throw new Error('AI_OUTPUT_ACTION_MISSING')
  if (typeof record.message !== 'string' || !record.message.trim()) throw new Error('AI_OUTPUT_MESSAGE_MISSING')
  return {
    action: record.action.trim(),
    message: record.message.trim(),
    commandResponse: typeof record.commandResponse === 'string' ? record.commandResponse.trim() : undefined
  }
}
