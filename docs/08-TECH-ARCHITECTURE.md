# 08 · 技术架构

## 首版形态

优先桌面客户端，以便直接访问本机/局域网 AI 服务。

建议起点：
- Tauri 2
- Vue 3
- TypeScript
- Rust/Tauri command 处理本地网络、安全存储与必要系统能力

技术栈在正式 M1 启动前可再确认，但模块边界应保持不变。

## 逻辑架构

```text
UI
 │
 ▼
Game Runtime ───── Event Log
 │
 ├──── Xiangqi Rules
 │
 └──── AI Runtime ───── AI Provider ───── User AI
```

## Xiangqi Rules

纯规则模块：
- Board State
- Move Parser
- Legal Move Validator
- Legal Move Generator
- Check / Mate / Draw

不得依赖 AI Runtime。

## AI Runtime

- Prompt Builder
- Personality Layer
- Commander Message Queue
- Protocol Parser
- Retry Controller
- Timeout Controller

## Game Runtime

推荐状态机：

```text
IDLE
READY
WAITING_FOR_AI
VALIDATING_MOVE
ANIMATING_MOVE
TURN_COMPLETE
PAUSED
FINISHED
ERROR
```

动画完成与棋局事实必须解耦：棋局状态是事实源，动画只是展示。

## UI 主要区域

首版主对局页：
- 中央棋盘。
- 红/黑 AI 卡片。
- 当前思考状态。
- Commander 聊天/指令区域。
- 最近棋步。
- 对局控制。

## 本地优先

首版不要求后端服务器。

本地负责：
- Provider 配置
- 人格配置
- 对局数据
- Prompt 版本
- 日志

未来联网功能再单独引入服务端。
