import { MatchRuntime } from '../core/match/match-runtime'
import { AutoMatchController } from '../core/ai/auto-match-controller'
import { OpenAiCompatibleProvider } from '../core/provider/openai-compatible'
import { douShouQiModule } from '../games/dou-shou-qi/module'
import { gameUiRegistry } from './games'

export function createM2Session() {
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
