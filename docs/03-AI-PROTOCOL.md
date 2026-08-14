# 03 · AI 对局协议

## 目标

AI Protocol 定义游戏如何把“棋局 + 玩家指令 + AI 人格”交给模型，以及模型如何返回走法。

协议必须保持 Provider 无关。

## Turn Request

逻辑结构示例：

```json
{
  "protocolVersion": "0.1",
  "game": "xiangqi",
  "gameId": "game_xxx",
  "turn": 17,
  "side": "red",
  "board": {
    "fen": "..."
  },
  "history": [
    { "ply": 1, "move": "..." },
    { "ply": 2, "move": "..." }
  ],
  "legalMoves": ["..."],
  "commanderMessages": [
    {
      "text": "先稳一下右翼，不要着急兑子。",
      "createdAt": "..."
    }
  ],
  "personality": {
    "name": "稳健老将",
    "prompt": "..."
  }
}
```

## Legal Moves

首版默认采用 **Standard Mode**：向 AI 提供未排序的合法着列表，目的是减少小模型因规则理解不足产生的非法着。

规则：
- 合法着列表只能来自 Referee。
- 不携带 score、rank、best、evaluation 等任何优劣信息。
- 列表顺序不得按棋步质量排序。

后续可增加 Pure Mode：不传合法着，仅传棋盘与规则。

## AI Response

推荐结构：

```json
{
  "move": "...",
  "message": "我会先稳住右翼，再寻找反击机会。",
  "commanderReaction": "accepted"
}
```

`commanderReaction` 可选：
- `accepted`
- `partially_accepted`
- `rejected`
- `no_instruction`

它只用于 UI 展示，不影响规则系统。

## 不要求 Chain of Thought

产品不依赖模型输出完整内部推理链。

`message` 应当是简短、面向玩家的决策说明，例如 1～3 句话。

## Prompt 层次

建议上下文按以下层次构造：

1. Core System Rules
2. Personality Prompt
3. Current Game Context
4. Commander Messages
5. Output Schema

Core System Rules 不允许被人格或玩家指令覆盖。

## 重试协议

### 格式错误

返回：
- 输出无法解析。
- 重新只返回协议要求结构。

### 非法着

返回：
- 指定走法非法。
- 简短错误原因。
- 当前仍可选择的合法着。
- 要求重新独立选择。

### 最大重试

默认 3 次；可配置。

## Prompt 版本化

每盘记录：
- protocolVersion
- corePromptVersion
- personalityVersion

便于后续复现模型行为。
