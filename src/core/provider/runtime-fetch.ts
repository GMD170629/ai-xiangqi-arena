import { fetch as tauriFetch } from '@tauri-apps/plugin-http'
import { isTauriRuntime } from '../platform/runtime'

export function runtimeFetch(input: string | URL | Request, init?: RequestInit): Promise<Response> {
  if (isTauriRuntime()) return tauriFetch(input, init)
  return globalThis.fetch(input, init)
}
