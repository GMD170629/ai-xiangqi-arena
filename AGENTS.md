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

具体游戏只能存在于 `src/games/<game-id>/`。Core 中禁止出现 `rat/elephant/river`、`cannon/xiangqiFen`、`gomokuStone` 或 `if (gameId === "dou-shou-qi")` 等具体游戏概念。

新增五子棋、中国象棋等 Game Module 时，原则上不得修改 `core/match`、`core/ai`、`core/commander`、`core/personality`、`core/provider`，除非确实缺少新的跨游戏能力。

## 3. GameModule 边界

每个游戏模块必须高内聚拥有：manifest、domain state、Action 类型与 codec、rules/legal actions、outcome、AI adapter、游戏专属 UI/assets/animations/audio/theme 和测试。

## 4. Core Runtime

### Match Runtime

负责对局生命周期、seat/turn 推进、技术失败/外部终止、调用 GameModule、事件记录与回放。不得理解具体游戏规则、替 AI 选 Action 或评价 Action。

### AI Runtime

负责通用 Turn Request、GameAIAdapter、Provider 调用、Response 解析、超时/格式/非法 Action 重试。不得直接解析具体棋类坐标或动作语义。

### Commander

只负责自然语言消息生命周期。不得把人类消息转换成强制 Action。

## 5. 首个 Game Module：斗兽棋

- Game ID：`dou-shou-qi`
- Rules Version：`classic-v1`
- 权威规则：`docs/games/dou-shou-qi/RULES.md`

争议规则以文档为准，不依据开发者记忆修改。

## 6. UI 与资源隔离

通用产品 UI 可进入 shared/client；游戏专属视觉必须留在对应 `src/games/<game-id>/ui/` 下。动画不得阻塞 Match 状态机，只消费已经提交的领域状态/事件。

## 7. AI 输出原则

Core 使用通用 `action`：

```json
{
  "action": "a3-a4",
  "message": "我准备先把象向前压。"
}
```

公开 `message` 不是隐藏推理链。

## 8. Provider、网络与密钥安全

- OpenAI-Compatible 业务逻辑只能存在 Provider adapter。
- 桌面端 Provider HTTP 必须经过 `runtimeFetch` / Tauri HTTP Client，不回退到 WebView fetch 处理 localhost/LAN 请求。
- Web 调试模式允许使用浏览器 fetch，但不是正式桌面网络路径。
- Provider 普通配置使用 Tauri Store。
- API Key 必须使用 Stronghold Secret Vault；不得写入 Tauri Store、localStorage、日志、Match record 或仓库。
- Web 调试模式不得持久保存 API Key，只允许当前内存会话使用。
- Stronghold vault password 不得自动保存。
- 删除/导出日志时继续遵守 secret redaction。
- Tauri CSP 保持收紧；不要为了 Provider URL 把远程域名加入 WebView CSP，因为 Provider 请求由 Rust HTTP 插件执行。
- HTTP 插件当前允许用户自定义 HTTP/HTTPS Provider URL，这是 BYO AI 的产品要求；不要再扩大为其他协议或远程脚本加载。

## 9. 工程原则

- TypeScript strict。
- Core contract 与每个 GameModule 都必须有测试。
- Prompt、Rule version 必须版本化。
- 对局必须可记录和回放。
- Provider-specific 逻辑只能存在于 Provider adapter。
- 任何趣味提示不得改变规则结果。
- 不为未来需求过度抽象，但跨游戏边界必须严格保持。

## 10. MVP 范围控制

除非明确修改 MVP 文档，不主动加入：排位/Elo、好友、商城、技能/卡牌、AI 数值养成、人类直接下棋、最佳着分析、中心化模型托管、第二个 Game Module。
