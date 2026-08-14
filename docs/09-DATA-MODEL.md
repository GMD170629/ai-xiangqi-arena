# 09 · 数据模型

## Game

```ts
interface Game {
  id: string
  status: GameStatus
  redPlayerId: string
  blackPlayerId: string
  commanderSide?: 'red' | 'black'
  currentSide: 'red' | 'black'
  fen: string
  result?: GameResult
  createdAt: string
  finishedAt?: string
}
```

## AIPlayer

```ts
interface AIPlayer {
  id: string
  displayName: string
  providerConfigId: string
  personalityId: string
}
```

## MoveRecord

```ts
interface MoveRecord {
  id: string
  gameId: string
  ply: number
  side: 'red' | 'black'
  move: string
  fenBefore: string
  fenAfter: string
  aiMessage?: string
  requestDurationMs?: number
  retryCount: number
  createdAt: string
}
```

## CommanderMessage

```ts
interface CommanderMessage {
  id: string
  gameId: string
  side: 'red' | 'black'
  text: string
  status: 'pending' | 'consumed'
  createdAt: string
  consumedAt?: string
}
```

## Personality

```ts
interface Personality {
  id: string
  name: string
  tagline: string
  description: string
  prompt: string
  builtIn: boolean
  version: string
}
```

## ProviderConfig

API Key 字段不应进入普通对局导出数据。

```ts
interface ProviderConfig {
  id: string
  name: string
  baseUrl: string
  model: string
  timeoutMs: number
  secretRef?: string
}
```

## GameEvent

推荐事件化记录：
- GAME_STARTED
- COMMANDER_MESSAGE_SENT
- AI_REQUEST_STARTED
- AI_RESPONSE_RECEIVED
- AI_RESPONSE_INVALID
- MOVE_VALIDATED
- MOVE_APPLIED
- CHECK
- GAME_FINISHED
- GAME_ERROR

事件记录用于调试、回放和未来 Benchmark。
