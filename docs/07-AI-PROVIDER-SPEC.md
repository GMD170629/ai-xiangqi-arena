# 07 · AI Provider 规范

## 目标

允许玩家使用自己的 AI，而不是被绑定到游戏官方模型。

## 首版协议

以 OpenAI Compatible Chat API 为第一接入协议。

Provider 配置：

```ts
interface AIProviderConfig {
  id: string
  name: string
  baseUrl: string
  apiKey?: string
  model: string
  timeoutMs: number
}
```

## 地址范围

允许：
- localhost
- 127.0.0.1
- 局域网 IP
- HTTPS 云端 API

因此桌面客户端应避免受浏览器 CORS 模型限制。

## Provider 抽象

```ts
interface AIProvider {
  testConnection(): Promise<ConnectionResult>
  listModels?(): Promise<ModelInfo[]>
  complete(request: AICompletionRequest): Promise<AICompletionResponse>
}
```

业务层只依赖接口，不依赖 Ollama、LM Studio 等产品名称。

## 首版配置体验

新增 AI：
1. Provider 名称。
2. Base URL。
3. API Key（可选）。
4. Model。
5. 测试连接。
6. 保存。

## 安全

- API Key 只存本地安全存储。
- 日志中永不输出完整 API Key。
- 对局导出不得携带 API Key。
- UI 默认对 Key 做掩码。

## 模型能力差异

首版不要假设模型必然支持：
- Structured Outputs
- Tool Calling
- Reasoning 参数

最基础兼容路径应能通过普通 chat completion + JSON 文本解析工作。
