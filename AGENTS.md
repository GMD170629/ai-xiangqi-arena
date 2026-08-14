# AGENTS.md

本文件是 Codex 与其他编码代理在本仓库中的最高优先级项目约束之一。

## 1. 产品不变量

1. 产品核心是 **AI vs AI + Human Commander**，不是任何具体棋类。
2. 人类玩家永远不得直接修改游戏状态或产生棋局 Action。
3. 所有实际 Action 必须来自当前 AI Player。
4. 玩家对 AI 的影响必须通过自然语言 Commander Message 进入 AI 上下文。
5. AI 可以接受、部分接受或拒绝玩家建议。
6. AI 人格通过 Prompt/Profile 影响模型，不通过规则代码伪造固定策略。
7. 禁止用传统棋类引擎、最佳着算法或局面评估器替 AI 决策。
8. 规则层可以生成合法 Action，但不得给 Action 评分、排序或推荐。

## 2. 多游戏架构是硬约束

平台必须支持未来加入五子棋、中国象棋等其他棋类。

具体游戏只能存在于：

```text
src/games/<game-id>/
```

Core 中禁止出现具体游戏概念。例如以下内容出现在 `src/core` 视为架构违规：

- `rat` / `elephant` / `river`
- `cannon` / `xiangqiFen`
- `gomokuStone`
- `if (gameId === "dou-shou-qi")`

禁止为了当前首版方便，把斗兽棋规则写入 Match Runtime 或 AI Runtime。

## 3. GameModule 边界

每个游戏模块必须高内聚地拥有：

- manifest
- domain state
- action 类型与 codec
- rules / legal action generator
- outcome 判断
- AI state serializer / parser
- 游戏专属 UI
- 游戏专属 assets
- 游戏专属 animations/audio/theme
- 测试

游戏模块通过统一 Contract 被平台加载。

新增五子棋时，原则上不得修改：

- `core/match`
- `core/ai`
- `core/commander`
- `core/personality`
- `core/provider`

## 4. Core Runtime

### Match Runtime

负责：
- 对局生命周期
- seat / turn 推进
- 暂停/继续
- 技术失败恢复
- 调用当前 GameModule
- 事件记录与回放

不得：
- 理解具体游戏规则
- 自动替 AI 选择 Action
- 对 Action 做质量评估

### AI Runtime

负责：
- 构造通用 AI Turn Request
- 通过 GameAIAdapter 注入游戏状态与合法 Action
- 调用 Provider
- 解析结构化返回
- 处理超时、格式错误、非法 Action 与重试

不得直接解析某种游戏的坐标或动作语义。

### Commander

负责：
- 接收人类自然语言
- 将消息绑定到指定 seat / AI
- 按协议进入后续 AI 上下文

不得把自然语言偷偷转换成一个强制 Action。

## 5. 首个 Game Module：斗兽棋

首版 Game ID：`dou-shou-qi`

规则版本：`classic-v1`

权威项目规则：

```text
docs/games/dou-shou-qi/RULES.md
```

实现必须遵循文档，而不是依据开发者记忆自行决定存在争议的斗兽棋规则。

## 6. UI 与资源隔离

通用 UI 可放在 `core/ui` 或 shared：
- AI 对话
- Provider 设置
- 通用按钮/弹窗
- 对局状态框架

游戏专属视觉必须放在对应 Game Module：

```text
src/games/dou-shou-qi/ui/assets/
src/games/dou-shou-qi/ui/animations/
src/games/dou-shou-qi/ui/audio/
```

未来象棋、五子棋分别拥有自己的资源树。

动画不得阻塞 Match 状态机；动画只消费已经提交的领域事件。

## 7. AI 输出原则

协议使用通用 `action`，不要在 Core 写死 `move`：

```json
{
  "action": "a3-a4",
  "message": "我准备先把象向前压，逼它重新考虑右路。"
}
```

`message` 是面向玩家的简短说明，不要求模型暴露隐藏推理链。

## 8. 工程原则

- TypeScript strict。
- Core contract 与每个 GameModule 都必须有测试。
- Prompt 必须版本化。
- Rule version 必须版本化。
- 对局必须可记录和回放。
- API Key 不得进入日志、仓库或对局记录。
- Provider-specific 逻辑只能存在于 Provider adapter。
- 任何趣味提示不得改变规则结果。
- 不为未来需求过度抽象，但跨游戏边界必须从第一天严格保持。

## 9. MVP 范围控制

除非明确修改 MVP 文档，不主动加入：
- 排位/Elo
- 好友系统
- 商城
- 技能/卡牌
- AI 数值养成
- 人类直接下棋
- 最佳着分析
- 中心化模型托管
- 第二个 Game Module
