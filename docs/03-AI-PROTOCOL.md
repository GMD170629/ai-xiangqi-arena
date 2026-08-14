# 03 · AI 对局协议

## 目标

AI Protocol 定义平台如何把 **当前游戏状态 + 合法 Action + Commander 消息 + Personality** 交给模型，以及模型如何返回最终 Action。

协议必须同时做到：

- Provider 无关。
- Game 无关。
- 不要求模型输出隐藏推理链。
- 能让不同棋类复用同一套 AI Runtime。

## Turn Request

逻辑结构：

```json
{
  "protocolVersion": "0.2",
  "matchId": "match_xxx",
  "turn": 12,
  "seat": "blue",
  "game": {
    "id": "dou-shou-qi",
    "rulesVersion": "classic-v1"
  },
  "state": {
    "machine": {},
    "readable": "当前局面的人类可读描述"
  },
  "history": [
    {
      "turn": 11,
      "seat": "red",
      "action": "a7-a6",
      "display": "鼠 a7 → a6"
    }
  ],
  "legalActions": [
    {
      "id": "a3-a4",
      "display": "象 a3 → a4"
    }
  ],
  "commanderMessages": [
    {
      "text": "别急着冲兽穴，我觉得右边有机会。",
      "createdAt": "..."
    }
  ],
  "personality": {
    "id": "calm-strategist",
    "prompt": "..."
  }
}
```

`state.machine`、`state.readable`、`legalActions` 的具体内容完全由当前 `GameAIAdapter` 产生。

Core 不解析这些字段中的游戏语义。

## Legal Actions

MVP 使用 Standard Mode：

- GameRules 生成合法 Action。
- GameAIAdapter 序列化为稳定 ID + 可读描述。
- 不包含 score、rank、evaluation、recommended 等优劣信息。
- 不得按质量排序。
- 排序应稳定且与棋力无关，便于测试与复现。

未来可加入 Pure Mode，但不是 MVP 前置条件。

## AI Response

最小输出：

```json
{
  "action": "a3-a4",
  "message": "我先把象向前压，保留右路的压力。"
}
```

可选：

```json
{
  "action": "a3-a4",
  "message": "我先把象向前压。",
  "commandResponse": "你的右路判断有道理，但我暂时不直接冲穴。"
}
```

### 字段语义

- `action`：必须对应当前 GameAIAdapter 可解析的一个 Action。
- `message`：面向玩家的简短决策说明。
- `commandResponse`：对 Commander 最新消息的公开回应，可省略。

禁止依赖模型返回长篇 Chain of Thought 才能驱动游戏。

## Prompt 分层

建议最终 Prompt 由以下层组成：

```text
Platform System Prompt
+ Personality Prompt
+ Game Rules Digest
+ Current State
+ Recent History
+ Legal Actions
+ Commander Messages
+ Output Contract
```

其中：

- Platform Prompt 说明 AI 是真正的 Player。
- Personality 只影响角色与表达/决策倾向。
- Game Rules Digest 由 GameModule 提供。
- Commander 只能建议，不能成为强制动作接口。

## 对具体动作建议的处理

玩家可以用自然语言说：

> “要不要让鼠往前走一格？”

这仍然只是建议。

平台不能因此直接构造 Action。只有 AI Response 中返回的 `action` 才能进入规则校验。

## 错误恢复

### Parse Error

返回：

```json
{
  "type": "OUTPUT_PARSE_ERROR",
  "message": "Return exactly one valid action using the required schema."
}
```

### Illegal Action

GameModule 返回结构化规则错误，例如：

```json
{
  "type": "ILLEGAL_ACTION",
  "code": "RIVER_ENTRY_FORBIDDEN",
  "message": "Only the rat may enter river squares in this rules version."
}
```

AI Runtime 将其作为下一次重试上下文。

### Retry

MVP 默认：

- 每回合最多 3 次规则/解析重试。
- Provider timeout 可独立重试。
- 达到限制后触发 `AI_FAILURE`。

## 协议版本

Protocol Version 与 Game Rules Version 分开：

```text
protocolVersion = 0.2
gameId = dou-shou-qi
rulesVersion = classic-v1
```

这样增加新游戏不需要创建新的 AI 协议。
