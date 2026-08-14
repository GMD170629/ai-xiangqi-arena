# 11 · Game Module 规范

## 目标

平台必须能够在不修改 Match Runtime、AI Runtime、Commander、Personality、Provider 等核心模块的前提下增加新的棋类游戏。

新增一个游戏应该主要表现为：新增一个 `games/<game-id>/` 模块并注册 manifest。

禁止把具体棋类规则散落到 Core。

## GameModule

建议逻辑接口：

```ts
export interface GameModule<State, Action> {
  manifest: GameManifest
  rules: GameRules<State, Action>
  ai: GameAIAdapter<State, Action>
  presentation: GamePresentation
}
```

### GameManifest

包含：
- `id`
- `name`
- `version`
- `rulesVersion`
- 玩家/阵营定义
- 最小/最大玩家数
- 功能能力声明

### GameRules

只负责确定性规则：

```ts
interface GameRules<State, Action> {
  createInitialState(): State
  getCurrentSeat(state: State): string
  getLegalActions(state: State): Action[]
  validateAction(state: State, action: Action): ValidationResult
  applyAction(state: State, action: Action): State
  getOutcome(state: State): GameOutcome | null
}
```

不得包含：
- 最佳动作
- 局面评分
- 动作排序
- AI 决策
- 搜索算法

### GameAIAdapter

负责把游戏领域状态转换成 AI 可理解、Provider 无关的上下文：

```ts
interface GameAIAdapter<State, Action> {
  serializeState(state: State): SerializableGameState
  serializeLegalActions(actions: Action[]): SerializableAction[]
  parseAction(output: unknown): ParseResult<Action>
  describeRules(): string
  describeAction(action: Action): string
}
```

Core 不得自行理解具体棋类动作格式。

### GamePresentation

负责游戏专属展示能力，例如：
- Board/Scene renderer
- 棋子/单位资源
- 地形资源
- 游戏主题
- 游戏内动作动画
- 吃子/胜负等专属反馈
- 游戏音效

## 强制目录约定

```text
src/
  core/
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
        state.ts
        rules.ts
        actions.ts
        outcome.ts
      ai/
        adapter.ts
        rules-prompt.ts
      ui/
        components/
        assets/
          board/
          pieces/
          effects/
        animations/
        audio/
        theme/
      tests/
    gomoku/          # future
    xiangqi/         # future
```

## 依赖方向

允许：

```text
App/Game Registry -> GameModule
GameModule -> Core contracts/shared utilities
Core runtime -> GameModule interface
```

禁止：

```text
core/match -> games/dou-shou-qi/domain/*
core/ai -> if (gameId === "dou-shou-qi")
shared/ui -> 斗兽棋棋子资源
```

Core 中出现 `rat`、`elephant`、`river`、`xiangqiFen`、`gomokuStone` 等具体游戏概念视为架构违规。

## 资源隔离

游戏专属视觉资源必须归属于游戏模块。

例如斗兽棋：

```text
src/games/dou-shou-qi/ui/assets/
```

未来象棋、五子棋拥有自己的对应目录。

只有真正跨游戏的资源才可以进入 `core/ui` 或 `shared`，例如：
- 按钮
- 弹窗
- AI 对话气泡
- Provider 图标
- 通用加载状态

## 验收标准

架构是否成功，可以通过一个问题验证：

> 如果明天增加五子棋，是否需要修改 AI Runtime 和 Match Runtime？

正确答案应当是：**原则上不需要。**
