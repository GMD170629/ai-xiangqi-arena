# 05 · Human-AI Interaction

## 核心关系

人类不是操作棋子的 Player，而是 **Commander**。

Commander 的玩法在于：

> 用自然语言表达意图，然后观察 AI 如何理解并落实。

## 交互流程

```text
Human message
    ↓
Commander Store
    ↓
绑定到己方 Seat / AI Player
    ↓
进入下一次 AI Turn Context
    ↓
AI 独立决定 Action
    ↓
AI 返回公开回应
```

## 玩家可以说什么

允许非常自然的语言：

- “稳一点。”
- “我觉得右边危险。”
- “这次可以大胆一点。”
- “别老想着换子。”
- “你刚才那步我没看懂。”
- “要不要让鼠往河里走？”

即使用户提到了一个具体动作，这也只是建议，不能绕过 AI。

## 消息生命周期

MVP 建议区分：

### Pending

玩家发送后，尚未被 AI 在决策中读取。

### Consumed

已经进入至少一次 AI Turn Request。

### Acknowledged

AI 在公开反馈中明确回应了该消息。

不要要求每条消息都必须被逐句回答，否则会让棋局节奏变成聊天机器人。

## 上下文策略

为避免长局无限增长：

- 最近 Commander 消息完整保留。
- 较早消息可以压缩成短摘要。
- 当前人格始终保留。
- 当前 Game Rules Digest 始终由 GameModule 提供。
- 历史 Action 允许按窗口 + 摘要方式压缩。

压缩逻辑属于 AI Runtime，不属于具体 GameModule。

## UI

Commander 面板至少包含：

- AI 名称/人格。
- 当前 AI 状态：等待 / 思考 / 重试 / 已行动。
- 对话历史。
- 输入框。
- 发送状态。

棋盘区域不提供任何直接执行 Action 的控件。

## AI 拒绝

拒绝是玩法的一部分，而不是错误。

例如：

> Commander：冲进去，别管那只象。
>
> AI：我不同意。那样会让我们马上丢掉关键单位，我先换一条路线。

随后 AI 自己选择 Action。

## 隐私

如果用户连接本地模型：

- Commander 消息可以完全留在本机。
- UI 应清楚显示当前 Provider 是 Local / LAN / Cloud。
- 不应把 Commander 对话额外上传到产品服务器。
