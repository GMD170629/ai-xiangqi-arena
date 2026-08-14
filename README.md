# AI Board Arena

> 一个让 AI 真正成为棋手、人类只能通过语言影响 AI 的棋类对弈平台。

当前仓库名仍为 `ai-xiangqi-arena`，但产品定义已经从“AI 象棋”升级为 **通用 AI 棋类竞技场**。首个可玩 Game Module 改为 **斗兽棋（Dou Shou Qi）**。

## 产品核心

**游戏真正的玩法不是某一种棋，而是：AI 对弈 + 人类影响。**

人类不是棋手，而是 Commander；AI 才是真正执行动作的 Player。

```text
Human Commander
      │ natural language
      ▼
   AI Player
      │ autonomous action
      ▼
  Game Module
      │ validate/apply
      ▼
 Match Runtime
```

人类不能拖动棋子、点击落点或直接提交一个动作。玩家只能表达判断、策略、情绪与建议，AI 可以接受、部分接受或拒绝，并自主决定最终动作。

## 首版：斗兽棋

首版从中国象棋切换为斗兽棋，原因是它更适合快速验证核心玩法：

- 单局流程更短。
- 规则更容易被不同规模的模型理解。
- 动物等级、鼠吃象、河流、陷阱和兽穴天然具有趣味性。
- AI 的聪明或离谱决定更容易被玩家看懂。
- 适合验证游戏专属 UI、资源与动画如何作为模块隔离。

首版使用项目规则版本：`dou-shou-qi/classic-v1`。

## 首版核心功能

- AI vs AI 自动对局。
- 玩家选择己方 AI，并在对局过程中与其自然语言交流。
- AI 人格预设与自定义人格。
- OpenAI Compatible Provider，可连接 localhost / LAN / Cloud AI。
- AI 自主动作、非法动作校验与重试。
- 适度的游戏专属动画和人格化趣味反馈。
- 完整对局、指令、AI 返回、动作、异常和 Provider 元数据记录。

## 多游戏架构

平台 Core 不知道斗兽棋中的鼠、象、河流，也不应该知道未来象棋中的炮或五子棋中的黑白子。

每种游戏以高内聚 `GameModule` 接入：

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
      domain/
      ai/
      ui/
        components/
        assets/
        animations/
        audio/
        theme/
    gomoku/      # future
    xiangqi/     # future
```

新增游戏原则上不修改 Match Runtime、AI Runtime、Commander 或 Provider。

## 最重要的不变量

1. 人类不能直接产生游戏 Action。
2. 所有实际 Action 必须来自当前 AI Player。
3. Game Rules 只负责规则，不负责“哪一步更好”。
4. 禁止引入最佳着搜索、局面评分或传统棋类决策引擎替 AI 下棋。
5. AI 人格与模型分离。
6. Game-specific 规则、UI、资产、动画必须留在对应 Game Module。
7. Core 中不得出现具体游戏领域概念。

## 文档

从 [`docs/INDEX.md`](docs/INDEX.md) 开始。

重点：

- `docs/00-PRODUCT-VISION.md`：产品愿景
- `docs/01-MVP-SCOPE.md`：首版范围
- `docs/02-CORE-GAME-RULES.md`：平台核心规则
- `docs/03-AI-PROTOCOL.md`：通用 AI 对局协议
- `docs/11-GAME-MODULE-SPEC.md`：Game Module 抽象
- `docs/12-PLATFORM-PRINCIPLES.md`：Platform-first 原则
- `docs/games/dou-shou-qi/RULES.md`：斗兽棋 `classic-v1`
- `docs/games/dou-shou-qi/PRESENTATION.md`：斗兽棋视觉与资源规范

## 当前阶段

M0：产品与协议定型。

下一步进入 M1：**建立平台 Core + GameModule Contract + 斗兽棋规则模块**，而不是先写一个只能运行斗兽棋的耦合应用。
