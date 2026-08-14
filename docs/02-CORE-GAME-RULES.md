# 02 · 平台核心游戏规则

本文件定义跨所有棋类都成立的 **Meta Rules**。具体棋类规则不得写入这里。

## 最高规则

**任何会改变比赛领域状态的 Action，都必须由当前回合 AI Player 返回。**

## Human Commander

人类可以：
- 查看游戏状态与历史。
- 查看己方 AI 的公开反馈。
- 给己方 AI 发送自然语言信息。
- 暂停、继续、认输、重开。
- 在开局前配置 AI、Provider 和 Personality。

人类不可以：
- 点击/拖动棋子或单位来执行动作。
- 直接输入一个规范 Action 并强制执行。
- 修改领域 State。
- 绕过 AI Player 调用 GameRules.applyAction。

## AI Player

AI 必须：
- 根据当前上下文独立选择 Action。
- 输出 GameAIAdapter 可解析的 Action。
- 遇到非法 Action 后根据错误重新尝试。

AI 可以：
- 接受 Commander 建议。
- 部分采纳。
- 拒绝并解释。
- 犯战略或战术错误。

AI 不会从平台获得：
- 最佳 Action。
- 局面评分。
- 搜索结果。
- 规则层生成的动作质量排名。

## GameModule / Referee

规则模块可以：
- 创建初始 State。
- 获取当前 seat。
- 生成全部合法 Action。
- 验证 Action。
- 确定性地 apply Action。
- 判断 outcome。

规则模块不可以：
- 推荐 Action。
- 给合法 Action 排序为好/坏。
- 计算胜率或局面估值。
- 替 AI 自动行动。

## Standard Mode

MVP 默认向 AI 提供 **未按质量排序** 的合法 Action 集合，以减少本地小模型的非法输出。

合法集合属于“规则信息”，不属于决策引擎。

未来可以加入 Pure Mode：只给状态和规则，由 AI 自己推导合法 Action，但不作为首版要求。

## 非法 Action

默认流程：

1. AI 返回 Action。
2. GameAIAdapter 解析。
3. GameRules 校验。
4. 非法则返回结构化错误。
5. AI 重试。
6. 单回合默认最多 3 次。
7. 超过上限，记为 `AI_FAILURE` 技术失败。

Game-specific 错误由游戏模块提供可读描述；Core 只处理错误类别。

## 超时与 Provider 错误

这些属于技术状态，不属于棋类规则：

- `PROVIDER_TIMEOUT`
- `PROVIDER_UNAVAILABLE`
- `OUTPUT_PARSE_ERROR`
- `ILLEGAL_ACTION`
- `AI_FAILURE`

平台必须区分“规则胜负”和“技术性结束”。

## 规则版本

每场比赛必须记录：

```text
gameId
rulesVersion
```

旧对局回放永远使用创建时的 rulesVersion，不因后续规则更新而改变结果。
