import type { AiProvider, ChatCompletionRequest, ChatCompletionResult, ProviderConfig } from './types'

function normalizeBaseUrl(value: string): string {
  return value.trim().replace(/\/+$/, '')
}

function headers(config: ProviderConfig): Record<string, string> {
  const result: Record<string, string> = { 'Content-Type': 'application/json' }
  if (config.apiKey?.trim()) result.Authorization = `Bearer ${config.apiKey.trim()}`
  return result
}

async function readError(response: Response): Promise<string> {
  try {
    const body = await response.json() as { error?: { message?: string }; message?: string }
    return body.error?.message ?? body.message ?? `${response.status} ${response.statusText}`
  } catch {
    return `${response.status} ${response.statusText}`
  }
}

async function postCompletion(config: ProviderConfig, request: ChatCompletionRequest, signal: AbortSignal | undefined, includeResponseFormat: boolean): Promise<Response> {
  return fetch(`${normalizeBaseUrl(config.baseUrl)}/chat/completions`, {
    method: 'POST',
    headers: headers(config),
    signal,
    body: JSON.stringify({
      model: config.model,
      messages: request.messages,
      temperature: config.temperature ?? 0.7,
      ...(includeResponseFormat && request.responseFormat === 'json_object' ? { response_format: { type: 'json_object' } } : {})
    })
  })
}

export class OpenAiCompatibleProvider implements AiProvider {
  readonly kind = 'openai-compatible'

  async complete(config: ProviderConfig, request: ChatCompletionRequest, signal?: AbortSignal): Promise<ChatCompletionResult> {
    let response = await postCompletion(config, request, signal, true)

    // Some local OpenAI-compatible servers support chat/completions but not response_format.
    // Retry once without that optional field to maximize Ollama/LM Studio/custom endpoint compatibility.
    if (!response.ok && request.responseFormat === 'json_object' && [400, 404, 422].includes(response.status)) {
      response = await postCompletion(config, request, signal, false)
    }

    if (!response.ok) throw new Error(`PROVIDER_HTTP_ERROR: ${await readError(response)}`)

    const body = await response.json() as {
      model?: string
      choices?: Array<{ message?: { content?: string | null } }>
      usage?: { prompt_tokens?: number; completion_tokens?: number; total_tokens?: number }
    }
    const text = body.choices?.[0]?.message?.content
    if (!text) throw new Error('PROVIDER_EMPTY_RESPONSE')

    return {
      text,
      model: body.model,
      usage: body.usage ? {
        promptTokens: body.usage.prompt_tokens,
        completionTokens: body.usage.completion_tokens,
        totalTokens: body.usage.total_tokens
      } : undefined
    }
  }

  async testConnection(config: ProviderConfig, signal?: AbortSignal): Promise<{ ok: boolean; message: string }> {
    try {
      const response = await fetch(`${normalizeBaseUrl(config.baseUrl)}/models`, { headers: headers(config), signal })
      if (!response.ok) return { ok: false, message: await readError(response) }
      return { ok: true, message: 'Provider reachable' }
    } catch (error) {
      return { ok: false, message: error instanceof Error ? error.message : String(error) }
    }
  }
}
