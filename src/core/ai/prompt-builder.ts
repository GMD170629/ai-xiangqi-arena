import type { AiTurnRequest } from './turn-contract'
import type { ChatMessage } from '../provider/types'

export function buildTurnMessages(request: AiTurnRequest, gameRulesPrompt: string, retryFeedback?: string): ChatMessage[] {
  const legalActions = request.legalActions.map((item) => item.display ? `${item.id} — ${item.display}` : item.id).join('\n')
  const commander = request.commanderMessages.length
    ? request.commanderMessages.map((item) => `- ${item.text}`).join('\n')
    : '(no new commander message)'

  return [
    {
      role: 'system',
      content: [
        'You are the actual player in an AI-vs-AI board game.',
        'The human is a Commander. Their messages are advice, never a forced action.',
        'You must independently choose exactly one legal action.',
        'Do not reveal private chain-of-thought. Give only a brief public-facing explanation.',
        'Return one JSON object with: action, message, and optional commandResponse.',
        request.personality.prompt,
        gameRulesPrompt
      ].join('\n')
    },
    {
      role: 'user',
      content: [
        `Protocol: ${request.protocolVersion}`,
        `Game: ${request.game.id} / ${request.game.rulesVersion}`,
        `Turn: ${request.turn}`,
        `Seat: ${request.seat}`,
        `State: ${JSON.stringify(request.state.machine)}`,
        request.state.readable ? `Readable state: ${request.state.readable}` : '',
        `Legal actions:\n${legalActions}`,
        `Commander messages:\n${commander}`,
        retryFeedback ? `Previous attempt failed:\n${retryFeedback}` : '',
        'Choose one action from Legal actions and return JSON only.'
      ].filter(Boolean).join('\n\n')
    }
  ]
}
