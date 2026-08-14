import type { ProviderConfig } from './types'
import { readSetting, writeSetting } from '../persistence/settings-store'
import { SecretVault } from '../persistence/secret-vault'

const SETTINGS_KEY = 'providers'
const secretKey = (id: string) => `provider/${id}/api-key`

export type ProviderProfile = Omit<ProviderConfig, 'apiKey'> & { hasApiKey?: boolean }

export class ProviderRepository {
  constructor(readonly vault: SecretVault) {}

  async list(): Promise<ProviderProfile[]> {
    return readSetting<ProviderProfile[]>(SETTINGS_KEY, [])
  }

  async save(profile: ProviderProfile, apiKey?: string): Promise<void> {
    const providers = await this.list()
    const next: ProviderProfile = { ...profile, hasApiKey: Boolean(apiKey) || profile.hasApiKey }
    const index = providers.findIndex((item) => item.id === profile.id)
    if (index >= 0) providers[index] = next; else providers.push(next)
    await writeSetting(SETTINGS_KEY, providers)
    if (apiKey !== undefined) await this.vault.set(secretKey(profile.id), apiKey)
  }

  async remove(id: string): Promise<void> {
    await writeSetting(SETTINGS_KEY, (await this.list()).filter((item) => item.id !== id))
    if (this.vault.unlocked) await this.vault.remove(secretKey(id))
  }

  async materialize(id: string): Promise<ProviderConfig> {
    const profile = (await this.list()).find((item) => item.id === id)
    if (!profile) throw new Error(`PROVIDER_NOT_FOUND:${id}`)
    const { hasApiKey: _hasApiKey, ...config } = profile
    return { ...config, apiKey: this.vault.unlocked ? await this.vault.get(secretKey(id)) : undefined }
  }
}
