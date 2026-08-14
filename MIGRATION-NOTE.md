# Project Pivot

项目在 M0 阶段从“AI 象棋游戏”调整为“通用 AI 棋类对弈平台”。

本文件仅用于记录这次方向切换，后续产品定义以 `README.md`、`AGENTS.md` 与 `docs/` 最新文档为准。

关键变化：

1. 产品核心从具体棋类调整为 **AI vs AI + Human Commander**。
2. 所有棋类通过高内聚 `GameModule` 接入。
3. 首个 Game Module 从中国象棋改为斗兽棋 `dou-shou-qi/classic-v1`。
4. 游戏专属规则、UI、资源、动画必须隔离在对应 `games/<game-id>/` 模块。
5. 中国象棋与五子棋作为后续可插拔 Game Module，不再影响 Core 设计。
