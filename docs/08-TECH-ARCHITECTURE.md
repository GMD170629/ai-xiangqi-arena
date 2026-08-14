# 08 · 技术架构

## 首版技术方向

桌面优先：

```text
Tauri 2
+ Vue 3
+ TypeScript strict
+ Pinia（UI/application state）
```

原因：客户端需要自然访问 localhost/LAN AI、保存本地配置、管理密钥，并获得比纯 Web 更稳定的本地集成能力。

## 总体结构

```text
Desktop App
│
├─ Presentation Shell
│   ├─ Match Screen
│   ├─ Commander Panel
│   ├─ AI/Personality UI
│   └─ Provider Settings
│
├─ Core
│   ├─ Match Runtime
│   ├─ AI Runtime
│   ├─ Commander
│   ├─ Personality
│   ├─ Provider
│   ├─ Persistence
│   └─ Game Registry / Contracts
│
└─ Game Modules
    ├─ dou-shou-qi   # MVP
    ├─ gomoku        # future
    └─ xiangqi       # future
```

## 目录建议

```text
src/
  app/
  core/
    game-contracts/
    game-registry/
    match/
    ai/
    commander/
    personality/
    provider/
    persistence/
    ui/
  games/
    dou-shou-qi/
      manifest.ts
      domain/
      ai/
      ui/
      tests/
```

## Game Registry

App 通过 Registry 获取可用游戏：

```ts
registry.register(douShouQiModule)
```

Core runtime 只看到 `GameModule` interface。

不要在 Core 中 switch `gameId` 执行业务逻辑。

## Match Runtime

Match Runtime 只处理通用生命周期：

```text
CREATED
READY
RUNNING
WAITING_FOR_AI
APPLYING_ACTION
PAUSED
FINISHED
FAILED
```

它通过 GameModule 获取：

- current seat
- legal actions
- validation result
- next state
- outcome

## AI Runtime

```text
Match asks for action
      ↓
GameAIAdapter serializes state
      ↓
AI Runtime builds protocol request
      ↓
Provider
      ↓
AI response
      ↓
GameAIAdapter parses action
      ↓
GameRules validates
```

AI Runtime 不知道 action 是棋子移动、五子棋落点还是其他形式。

## 状态边界

建议分三类状态：

### Domain State

GameModule 的纯数据、确定性、可序列化状态。

### Match State

Core 的生命周期、seat、turn、错误、时间等信息。

### UI State

动画、选项卡、面板展开、输入框等视觉状态。

三者不得混成一个全局 store。

## 动画边界

Game action 先被规则确定性 apply，再发布 Domain Event；Presentation 消费事件播放动画。

动画完成与否不能决定规则是否成功。

## 测试策略

### Core

- Match state machine。
- AI retry/error handling。
- Provider adapter contract。
- Commander message lifecycle。

### Game Module

- 所有规则边界。
- action parser/serializer。
- deterministic replay。

### Integration

使用 Fake AI Provider 跑完整 AI vs AI 对局。

M1 必须先让斗兽棋在 headless test/runtime 中跑通，再制作高保真棋盘。
