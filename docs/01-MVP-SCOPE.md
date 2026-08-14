# 01 · MVP 范围

## MVP 目标

验证：

> **AI 自主对弈 + 人类自然语言影响 + AI 人格**

是否能形成有趣、稳定、可重复的游戏体验。

首版只实现一个 Game Module：**斗兽棋 `dou-shou-qi/classic-v1`**。

但工程边界从第一天按多游戏平台设计。

## P0

### 对局

- 创建斗兽棋新对局。
- 蓝/红双方各配置一个 AI Player。
- AI vs AI 自动回合。
- 暂停、继续、重新开始、认输。
- 显示动作历史和当前状态。
- 根据 GameModule 判断终局。
- 完整对局记录与基础回放能力。

### Commander 交互

- 玩家选择自己指挥的一方。
- 玩家在对局中向己方 AI 发送自然语言消息。
- 消息进入该 AI 后续决策上下文。
- AI 返回简短、面向玩家的反馈。
- AI 可接受、部分接受或拒绝建议。
- 人类无法通过棋盘直接产生 Action。

### AI 人格

- 内置至少 4 种人格。
- 支持自定义人格。
- Personality 与 Model/Provider 分离。
- 同一模型可快速切换不同人格复赛。

### AI Provider

- OpenAI Compatible API。
- Base URL / API Key / Model。
- localhost / LAN / Cloud。
- 连通性测试。
- Provider 配置本地保存，Key 安全存储。

### 斗兽棋

- 完整 `classic-v1` 规则。
- 独立 domain、AI adapter、UI、assets、animations。
- 游戏规则单元测试。
- 清晰的动物等级、河流、陷阱、兽穴表现。

### 动效与趣味反馈

- 通用 AI 思考状态。
- 斗兽棋移动/捕获动画。
- 鼠入水、狮虎跳河、陷阱、冲穴等轻量专属反馈。
- AI 非法 Action 重试提示。
- AI 拒绝 Commander 的人格化反馈。
- 对局结束的一句人格化发言。

## P1

- 对战统计。
- 对局导出。
- 一键复赛。
- AI 头像与展示名。
- 对局速度档位。
- 多套斗兽棋视觉主题。

## 明确不做

- 第二种棋类。
- 排位 / Elo。
- 联机大厅。
- 好友系统。
- 商城。
- 指挥点、技能、卡牌。
- AI 数值养成。
- 人类直接下棋。
- 最佳着/引擎分析。
- 平台服务器托管用户模型。

## MVP 架构验收

即使首版只有斗兽棋，也必须满足：

> 删除 `src/games/dou-shou-qi/` 后，Core 仍然可以独立编译其 contracts/runtime；未来新增 `src/games/gomoku/` 不需要修改核心 AI 与 Match 逻辑。
