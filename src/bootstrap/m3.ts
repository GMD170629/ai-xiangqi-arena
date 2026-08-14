import { MatchRuntime } from '../core/match/match-runtime'
import { AutoMatchController } from '../core/ai/auto-match-controller'
import { OpenAiCompatibleProvider } from '../core/provider/openai-compatible'
import { ProviderRepository } from '../core/provider/provider-repository'
import { SecretVault } from '../core/persistence/secret-vault'
import { PersonalityRepository } from '../core/personality/personality-repository'
import { douShouQiModule } from '../games/dou-shou-qi/module'
import { gameUiRegistry } from './games'

export const vault = new SecretVault()
export const providerRepository = new ProviderRepository(vault)
export const personalityRepository = new PersonalityRepository()

export function createM3Session() {
  const match = new MatchRuntime(douShouQiModule)
  const provider = new OpenAiCompatibleProvider()
  const controller = new AutoMatchController(douShouQiModule, match, provider)
  return {
    module: douShouQiModule,
    match,
    provider,
    controller,
    ui: gameUiRegistry.resolve(douShouQiModule.manifest.id, douShouQiModule.manifest.rulesVersion)
  }
}
