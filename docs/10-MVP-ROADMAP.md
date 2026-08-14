# 10 · MVP Roadmap

## M0 · 产品与协议定型

状态：**当前阶段，核心方向已完成调整。**

产出：
- Platform-first 产品定义。
- AI vs AI + Commander 核心规则。
- GameModule Contract。
- 通用 AI Protocol。
- 斗兽棋 `classic-v1` 规则锁定。
- 斗兽棋 Presentation 资源边界。
- Codex `AGENTS.md` 约束。

## M1 · 工程骨架 + Core Contracts + 斗兽棋规则

目标：没有真实 AI、没有漂亮 UI，也能证明多游戏架构成立。

实现：

- Tauri 2 + Vue 3 + TypeScript 项目初始化。
- `core/game-contracts`。
- Game Registry。
- Match Runtime 基础状态机。
- `games/dou-shou-qi/domain`。
- `classic-v1` 全部规则。
- Action codec。
- deterministic replay。
- 完整规则单元测试。

验收：

> 测试代码可以创建斗兽棋初始 State、生成合法 Action、apply、判断终局，并且 Core 不 import 斗兽棋领域类型。

## M2 · AI Runtime + Provider

实现：

- 通用 Turn Request。
- GameAIAdapter。
- OpenAI Compatible Provider。
- Fake Provider。
- parse/illegal/retry/timeout。
- Personality Prompt。
- Commander message lifecycle。

验收：

> 两个 Fake/真实 AI 可以在 headless 模式下完成一整局斗兽棋，所有实际 Action 都来自 AI Response。

## M3 · 可玩的桌面对局

实现：

- Match 创建页。
- 双方 AI 配置。
- Provider 设置。
- Personality 选择/自定义。
- 斗兽棋棋盘。
- Commander 面板。
- 动作历史。
- 暂停、继续、重开、认输。

验收：

> 普通用户可以连接自己的 AI，选择一方作为 Commander，完整玩完一局。

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
