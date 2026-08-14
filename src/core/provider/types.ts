export interface ProviderConfig {
  id: string
  name: string
  baseUrl: string
  apiKey?: string
  model: string
  timeoutMs?: number
  temperature?: number
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface ChatCompletionRequest {
  messages: readonly ChatMessage[]
  responseFormat?: 'json_object'
}

export interface ChatCompletionResult {
  text: string
  model?: string
  usage?: {
    promptTokens?: number
    completionTokens?: number
    totalTokens?: number
  }
}

export interface AiProvider {
  readonly kind: string
  complete(config: ProviderConfig, request: ChatCompletionRequest, signal?: AbortSignal): Promise<ChatCompletionResult>
  testConnection(config: ProviderConfig, signal?: AbortSignal): Promise<{ ok: boolean; message: string }>
  listModels?(config: ProviderConfig, signal?: AbortSignal): Promise<string[]>
}
