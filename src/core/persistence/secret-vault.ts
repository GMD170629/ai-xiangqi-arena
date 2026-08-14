import { appDataDir, join } from '@tauri-apps/api/path'
import { Stronghold, type Client } from '@tauri-apps/plugin-stronghold'
import { isTauriRuntime } from '../platform/runtime'

const CLIENT_NAME = 'ai-board-arena'
const memory = new Map<string, string>()

export class SecretVault {
  private stronghold: Stronghold | null = null
  private client: Client | null = null

  get unlocked(): boolean { return !isTauriRuntime() || this.client !== null }

  async unlock(password: string): Promise<void> {
    if (!isTauriRuntime()) return
    if (!password.trim()) throw new Error('VAULT_PASSWORD_REQUIRED')
    const path = await join(await appDataDir(), 'provider-secrets.hold')
    const stronghold = await Stronghold.load(path, password)
    let client: Client
    try { client = await stronghold.loadClient(CLIENT_NAME) }
    catch { client = await stronghold.createClient(CLIENT_NAME) }
    this.stronghold = stronghold
    this.client = client
  }

  async get(key: string): Promise<string | undefined> {
    if (!isTauriRuntime()) return memory.get(key)
    if (!this.client) throw new Error('VAULT_LOCKED')
    const value = await this.client.getStore().get(key)
    return value ? new TextDecoder().decode(value) : undefined
  }

  async set(key: string, value: string): Promise<void> {
    if (!isTauriRuntime()) {
      if (value) memory.set(key, value); else memory.delete(key)
      return
    }
    if (!this.client || !this.stronghold) throw new Error('VAULT_LOCKED')
    const store = this.client.getStore()
    if (value) await store.insert(key, new TextEncoder().encode(value))
    else await store.remove(key)
    await this.stronghold.save()
  }

  async remove(key: string): Promise<void> { await this.set(key, '') }

  async lock(): Promise<void> {
    if (this.stronghold) await this.stronghold.unload()
    this.stronghold = null
    this.client = null
  }
}
