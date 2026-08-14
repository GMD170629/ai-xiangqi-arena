# 10 · MVP Roadmap

## M0 · 产品与协议定型

状态：**已完成。**

产出：
- Platform-first 产品定义。
- AI vs AI + Commander 核心规则。
- GameModule Contract。
- 通用 AI Protocol。
- 斗兽棋 `classic-v1` 规则锁定。
- 斗兽棋 Presentation 资源边界。
- Codex `AGENTS.md` 约束。

## M1 · 工程骨架 + Core Contracts + 斗兽棋规则

状态：**已完成。**

实现：

- Tauri 2 + Vue 3 + TypeScript 项目初始化。
- 通用 GameModule / GameRules / GameActionCodec / GameAIAdapter。
- Game Registry。
- Match Runtime 基础状态机。
- `games/dou-shou-qi/domain`。
- `classic-v1` 规则。
- Action codec。
- 游戏专属 UI/asset/animation 边界。
- 规则与平台测试基线。

验收：

> 可以创建斗兽棋初始 State、生成合法 Action、apply、判断终局，并且 Core 不依赖斗兽棋领域类型。

## M2 · AI Runtime + Provider

状态：**已完成。**

实现：

- AI Turn Protocol `0.2` 运行时。
- GameAIAdapter → 通用 Prompt 管线。
- `AiProvider` 抽象。
- OpenAI Compatible Provider。
- Localhost / LAN / Cloud Base URL 配置。
- `/models` 连通性测试。
- `response_format` 不兼容时自动降级重试。
- JSON / fenced JSON AI Response 解析。
- parse / illegal action / timeout / provider failure 重试。
- Personality Profile。
- Commander message queue / acknowledge 生命周期。
- `AutoMatchController`。
- AI Response 是唯一可以进入 `MatchRuntime.dispatch()` 的玩家动作来源。
- 基于真实斗兽棋模块的非法 AI Action → 重试 → 合法 Action 回归测试。

此外，为尽早验证核心玩法，M2 已提前实现部分 M3 UI：

- Blue / Red 双 AI Provider 配置。
- 双方 Personality 选择。
- Commander 选择阵营并发送自然语言消息。
- AI 自动连续回合。
- 开始 / 暂停 / 重开。
- AI 思考状态、Action、耗时、公开说明和 Commander 回应展示。

验收：

> 两个配置好的 OpenAI-Compatible AI 可以驱动同一局斗兽棋；Commander 只能改变 AI 上下文，不能直接创建 Action。

## M3 · 产品化桌面对局

目标：把 M2 的“可运行验证 UI”升级为真正的产品流程。

待实现：

- Match 创建页，而不是单页开发面板。
- Provider 配置管理与预设。
- 本地设置持久化。
- API Key 安全存储。
- Personality 自定义编辑。
- 更完整的动作历史与 AI 对话时间线。
- 对局异常恢复与更清晰错误提示。
- 认输与结算流程。
- Tauri 原生网络传输方案，降低 WebView CORS 对本地 AI 的影响。

验收：

> 普通用户可以连接自己的 AI，选择一方作为 Commander，完整玩完一局，而不需要理解开发配置。

## M4 · 动效与趣味体验

实现：

- AI 思考状态。
- 动物移动/捕获。
- 鼠入水。
- 狮虎跳河。
- 陷阱/兽穴关键反馈。
- 人格化回应。
- 非法 Action 趣味提示。
- 结算页。

原则：先正确，再有趣；动画绝不侵入规则状态机。

## M5 · 稳定性与对局数据

- Match record。
- Replay。
- Provider 失败恢复。
- 对局统计。
- 性能与日志。
- 安全存储 API Key。
- 打包 Windows/macOS。

## MVP Done

当满足以下条件，首版核心验证完成：

1. 用户可以用自己的本地或云端 AI。
2. AI vs AI 能稳定完成斗兽棋。
3. 玩家只能通过 Commander 影响己方 AI。
4. Personality 对体验有明显影响。
5. 斗兽棋具有足够的动画和趣味性。
6. Core 与 GameModule 解耦。
7. 新增第二种游戏时不需要重写 AI/Match/Commander。

MVP 之后再决定第二个游戏优先做 **五子棋** 还是 **中国象棋**，而不是提前实现。
