# 10 · MVP Roadmap

## M0 · 产品与协议定型

状态：**已完成。**

产出：Platform-first 产品定义、AI vs AI + Commander 核心规则、GameModule Contract、通用 AI Protocol、斗兽棋 `classic-v1` 规则与 Presentation 边界、Codex `AGENTS.md` 约束。

## M1 · 工程骨架 + Core Contracts + 斗兽棋规则

状态：**已完成。**

实现：Tauri 2 + Vue 3 + TypeScript、通用 GameModule/GameRules/GameActionCodec/GameAIAdapter、Game Registry、Match Runtime、斗兽棋规则与 Action codec、游戏专属 UI/asset/animation 边界、规则测试基线。

验收：Core 不依赖斗兽棋领域类型，但可以通过 GameModule 完成状态创建、合法 Action、apply 与终局判断。

## M2 · AI Runtime + Provider

状态：**已完成。**

实现：AI Turn Protocol `0.2`、通用 Prompt 管线、OpenAI-Compatible Provider、Localhost/LAN/Cloud、自主 Action、JSON 解析、非法 Action/超时/Provider 失败重试、Personality、Commander lifecycle、AutoMatchController 与回归测试。

验收：两个配置好的 OpenAI-Compatible AI 可以驱动同一局斗兽棋；Commander 只能改变 AI 上下文，不能直接创建 Action。

## M3 · 产品化桌面对局

状态：**已完成第一版。**

实现：

- 首页 / AI 管理 / 创建对局 / 比赛场四段式产品流程。
- Provider Library：新增、编辑、删除、持久化。
- OpenAI-Compatible `/models` 模型发现。
- Tauri Store 保存普通设置与上次对局选择。
- Tauri Stronghold 加密保存 API Key；桌面启动后由用户解锁 Secret Vault。
- Web 开发模式不持久保存 API Key。
- Tauri HTTP Client 从 Rust 后端发起 AI 请求，绕开 WebView CORS 对 localhost/LAN AI 的限制。
- 自定义 Personality 创建与持久化。
- 双方 AI / Personality 选择与 Commander 阵营选择。
- AI 连续对弈、暂停/继续、错误后重试。
- Commander 消息、AI Action、公开说明、回应和耗时统一时间线。
- 通用 Match Runtime 外部终止能力。
- Commander 认输与结算状态。

验收：

> 普通用户可以保存自己的 AI，创建一局，选择要影响的 AI，在不直接操作棋子的前提下完成对局。

说明：M3 的重点是产品流程和桌面能力。更丰富的视觉表现、动作演出和趣味反馈属于 M4。

## M4 · 动效与趣味体验

待实现：

- 真正连续的动物移动动画，而不是仅重渲染棋子。
- 捕获演出。
- 鼠入水 / 出水。
- 狮虎跳河轨迹。
- 陷阱与兽穴关键反馈。
- AI 思考状态的角色化表现。
- 非法 Action 重试的趣味提示。
- Personality 驱动的关键事件短句。
- 更完整的结算页。
- 音效与 reduced-motion 适配。

原则：先正确，再有趣；动画绝不侵入规则状态机。

## M5 · 稳定性与对局数据

待实现：

- Match record 持久化。
- Replay。
- 对局统计。
- Provider 健康检查与更完整故障恢复。
- 日志脱敏。
- Windows/macOS 构建与安装验证。
- CI 自动测试与打包。

## MVP Done

当满足以下条件，首版核心验证完成：

1. 用户可以用自己的本地或云端 AI。
2. AI vs AI 能稳定完成斗兽棋。
3. 玩家只能通过 Commander 影响己方 AI。
4. Personality 对体验有明显影响。
5. 斗兽棋具有足够的动画和趣味性。
6. Core 与 GameModule 解耦。
7. 新增第二种游戏时不需要重写 AI/Match/Commander。

MVP 之后再决定第二个游戏优先做 **五子棋** 还是 **中国象棋**。
