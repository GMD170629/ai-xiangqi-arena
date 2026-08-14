# 07 · AI Provider 规范

## 目标

让用户可以使用自己的 AI 参加对局，包括：

- 本地模型。
- 局域网模型服务。
- 云端兼容 API。

平台业务层只依赖统一 Provider Contract。

## MVP 接入标准

首版优先支持 **OpenAI Compatible Chat API**。

用户配置：

```text
Name
Base URL
API Key (optional for local)
Model
```

典型场景：

```text
localhost model server
LAN model server
self-hosted compatible gateway
cloud compatible endpoint
```

## Provider Contract

建议：

```ts
interface AIProvider {
  id: string
  testConnection(config: ProviderConfig): Promise<ConnectionResult>
  listModels?(config: ProviderConfig): Promise<ModelInfo[]>
  complete(request: ProviderRequest): Promise<ProviderResponse>
}
```

AI Runtime 不得出现：

```ts
if (provider === "ollama")
if (provider === "xxx")
```

Provider 差异只存在 adapter 内。

## Capability

建议 Provider/Profile 可以声明：

```ts
interface ProviderCapabilities {
  streaming: boolean
  structuredOutput: boolean
  systemMessages: boolean
  modelListing: boolean
}
```

AI Protocol 根据 capability 做降级，但不能改变 Game Rules。

## 本地模型体验

桌面客户端应允许：

- `127.0.0.1` / `localhost`
- 私有 LAN 地址
- HTTP（仅本地/明确允许场景）
- HTTPS 云端地址

后续可以增加常见本地服务自动探测，但不作为 M1 前置条件。

## 安全

- API Key 使用系统安全存储或 Tauri 对应安全方案。
- Key 不写日志。
- Key 不进入 Match Record。
- 导出对局不得包含 Provider secret。
- UI 必须显示请求将发送到哪个 Base URL。

## 可复现信息

对局记录可以保存：

- Provider profile ID
- provider type
- model name
- endpoint category（local/lan/cloud）
- sampling 参数

但不保存 secret。
