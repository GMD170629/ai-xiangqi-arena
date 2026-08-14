import { load, type Store } from '@tauri-apps/plugin-store'
import { isTauriRuntime } from '../platform/runtime'

const FILE_NAME = 'ai-board-arena.settings.json'
const memory = new Map<string, unknown>()
let store: Store | null = null

async function backend(): Promise<Store | null> {
  if (!isTauriRuntime()) return null
  if (!store) store = await load(FILE_NAME, { autoSave: 100 })
  return store
}

export async function readSetting<T>(key: string, fallback: T): Promise<T> {
  const target = await backend()
  if (!target) return (memory.get(key) as T | undefined) ?? fallback
  return (await target.get<T>(key)) ?? fallback
}

export async function writeSetting<T>(key: string, value: T): Promise<void> {
  const target = await backend()
  if (!target) {
    memory.set(key, value)
    return
  }
  await target.set(key, value)
  await target.save()
}

export async function deleteSetting(key: string): Promise<void> {
  const target = await backend()
  if (!target) {
    memory.delete(key)
    return
  }
  await target.delete(key)
  await target.save()
}
