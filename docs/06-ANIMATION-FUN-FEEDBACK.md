# 06 · 动画与趣味反馈

## 原则

动画和趣味提示服务于两个目标：

1. 让 AI 对弈更有观赏性。
2. 让 AI 像一个有存在感的棋手，而不是后台 API。

但它们永远不能影响领域状态与规则结果。

## 两层动画

### Platform Animation

跨游戏共享：

- AI 思考呼吸状态。
- Provider 请求中。
- AI 返回后短暂停顿。
- Commander 消息被 AI 读取的轻反馈。
- AI 非法 Action / 重试状态。
- AI 拒绝建议时的角色反馈。
- Match 开始/结束框架动画。

这些属于 Core/Shared UI。

### Game Presentation Animation

由具体 GameModule 完全拥有，例如斗兽棋：

- 动物移动。
- 捕获。
- 鼠入水。
- 狮虎跳河。
- 陷阱弱化。
- 冲入兽穴。

未来五子棋的落子波纹、中国象棋的吃子反馈分别存在自己的模块中。

## 事件驱动

动画只消费已经发生的领域事件：

```text
GameRules.applyAction
      ↓
Domain Events
      ↓
Presentation maps events to animation
```

禁止：

```text
animation complete -> then apply rule
```

规则状态必须先确定，动画只是表现。

## 动效节奏

MVP 优先：

- 单次普通 Action 300-600ms。
- 关键动作可略长，但不要拖慢整盘 AI 对局。
- 支持“快速模式”缩短或跳过非关键动画。
- AI 思考时间较长时用轻量循环状态，不要反复播放高刺激效果。

## 趣味提示

提示来源分三类：

1. Platform 技术事件。
2. Game-specific 领域事件。
3. AI Personality 的公开文本。

### 示例

技术事件：

> “它刚刚试了一步不合法的动作，正在重新考虑。”

斗兽棋事件：

> “一只鼠挡住了狮子的跳河路线。”

人格反馈：

> “我当然知道那边有陷阱。”

## 文案管理

- 使用 event key + i18n。
- 不把趣味文本写入规则代码。
- 不让文案成为 AI 决策输入，除非它本来就是 Commander/Personality 上下文。
