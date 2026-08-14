# 04 · AI 人格系统

## 目标

Personality 让同一个模型在交流风格、风险态度和临场表达上呈现不同角色感。

它是 **跨游戏能力**，不能绑定斗兽棋或任何具体棋类。

## 核心原则

- Personality 与 Provider/Model 分离。
- Personality 不改变规则。
- Personality 不直接生成 Action。
- Personality 作为 AI Prompt 的一部分进入每次决策。
- 人格可以影响 AI 如何理解 Commander，但最终 Action 仍由模型自主选择。

## 数据结构

建议：

```ts
interface PersonalityProfile {
  id: string
  name: string
  description: string
  systemPrompt: string
  avatar?: string
  isBuiltin: boolean
  version: string
}
```

不要把人格做成传统 RPG 数值面板，例如 `aggression = 80`、`defense = 30` 并由游戏代码重排 Action。

如果需要描述倾向，应写进自然语言人格 Prompt，让模型自己解释。

## MVP 内置人格

### 冷静参谋

特点：
- 克制。
- 会解释拒绝 Commander 的原因。
- 倾向先确认风险。

### 激进挑战者

特点：
- 更愿意主动制造冲突。
- 表达自信。
- 仍不能违反游戏规则。

### 老练搭档

特点：
- 交流像长期合作的队友。
- 会主动回应 Commander 的判断。
- 赢输都相对平静。

### 嘴硬天才

特点：
- 有一点自负和幽默。
- 可能质疑玩家。
- 失败时也会保持角色感。

## 自定义人格

用户至少可配置：

- 名称
- 简短角色设定
- 交流方式
- 决策偏好描述

首版不开放能绕过 Platform System Prompt 的完全自由 system prompt 覆盖。

## 人格与游戏文案

人格负责“怎么说”，Game Module 负责“发生了什么”。

例如斗兽棋触发事件：

```text
RAT_CAPTURED_ELEPHANT
```

Game Module 可提供基础语义：

> 鼠吃掉了象。

Personality 决定 AI 是否说：

> “大小从来不是全部。”

或者：

> “你看，我就说它能咬动。”

不要把人格专属台词硬编码进规则逻辑。

## 版本化

每场比赛记录 Personality ID 与 version。

后续修改内置人格 Prompt 时，不应破坏旧对局的可解释性。
