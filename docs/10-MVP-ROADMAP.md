# 10 · MVP 路线图

## M0 · 产品与协议定型

状态：当前阶段。

验收：
- README 与产品规则完成。
- AI Protocol 定义完成。
- Provider 边界完成。
- 人格与 Commander 交互完成。

## M1 · Xiangqi Rules + Game Runtime

目标：完全不接 AI，也能通过测试驱动棋局状态机。

验收：
- 标准初始棋盘。
- 合法走法校验。
- 将军/将死/和棋。
- 回合推进。
- 规则单元测试。
- 不存在任何棋步评价算法。

## M2 · AI Runtime

目标：单个真实 AI 能根据当前棋盘返回合法走法。

验收：
- OpenAI Compatible Provider。
- Base URL / Key / Model 配置。
- Prompt Builder。
- JSON 解析。
- 非法着重试。
- 超时处理。

## M3 · AI vs AI

目标：两个真实 AI 可以从开局自动运行到终局或明确技术失败。

这是首个核心里程碑。

## M4 · Commander

目标：人类可以通过自然语言影响己方 AI。

验收：
- 发送指令。
- 下一回合注入。
- AI 反馈 accepted / partial / rejected。
- 仍然没有任何直接走棋入口。

## M5 · Personality + Fun

目标：让 AI 成为“角色”。

验收：
- 4 个内置人格。
- 自定义人格。
- 思考/落子/将军/拒绝/非法着/胜负动效。
- Reduced Motion。
- 趣味提示池。

## M6 · 首版打磨

- 对局记录。
- Provider 管理。
- 错误日志。
- 首次使用引导。
- 复赛。
- 基础设置。
- 安装包构建。

## MVP 最终验收

用户能在一台电脑上：
1. 配置两个自己的 AI。
2. 给其中一方选择人格并作为 Commander。
3. 开始一局 AI vs AI 象棋。
4. 全程不直接移动任何棋子。
5. 通过自然语言影响己方 AI。
6. 看到 AI 自主完成对局，并获得清晰、有趣的过程反馈。
