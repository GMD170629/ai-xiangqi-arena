# 09 · 数据模型

## 原则

持久化模型必须以 `gameId + rulesVersion + generic action/state payload` 支持多游戏，不能建立斗兽棋专属的顶层数据库结构。

## GameDefinition

```ts
interface GameDescriptor {
  gameId: string
  name: string
  moduleVersion: string
  rulesVersion: string
}
```

## Match

```ts
interface MatchRecord {
  id: string
  game: GameDescriptor
  status: MatchStatus
  seats: MatchSeat[]
  createdAt: string
  startedAt?: string
  finishedAt?: string
  outcome?: GameOutcome
}
```

## MatchSeat

```ts
interface MatchSeat {
  seatId: string
  aiProfileId: string
  personalityId: string
  commanderEnabled: boolean
}
```

不要假定 seat 一定叫红/黑。具体 seat ID 由 GameManifest 定义。

## AI Profile

```ts
interface AIProfile {
  id: string
  name: string
  providerProfileId: string
  model: string
  modelParams?: Record<string, unknown>
}
```

## Personality

```ts
interface PersonalityRecord {
  id: string
  name: string
  prompt: string
  version: string
}
```

## CommanderMessage

```ts
interface CommanderMessage {
  id: string
  matchId: string
  seatId: string
  text: string
  status: "pending" | "consumed" | "acknowledged"
  createdAt: string
  consumedAt?: string
}
```

## Turn / Action Event

```ts
interface ActionRecord {
  id: string
  matchId: string
  turn: number
  seatId: string
  actionId: string
  actionPayload: unknown
  displayText: string
  stateHashBefore: string
  stateHashAfter: string
  createdAt: string
}
```

`actionPayload` 由 GameModule 序列化；Core 不查询其中的游戏语义。

## AI Invocation

建议记录：

- turn
- attempt
- provider profile ID
- model
- protocol version
- prompt version
- personality version
- latency
- usage/token（如果 Provider 提供）
- response status
- parse/validation error code

默认不必永久保存完整原始 Prompt；可以提供开发日志模式。

任何情况下都不记录 API Key。

## Snapshot 与 Replay

完整回放至少需要：

```text
gameId
rulesVersion
initial configuration
ordered ActionRecords
```

GameRules 必须具备 deterministic apply，才能从初始状态重放到任意 turn。

可以周期性保存 State Snapshot 加速长局加载，但 Snapshot 是优化，不是规则真相。

## 技术性终局

Outcome 要区分：

```text
GAME_WIN
GAME_DRAW
RESIGNATION
AI_FAILURE
PROVIDER_FAILURE
ABORTED
```

这样 Benchmark 数据不会把 API 故障误统计为正常棋力结果。
