import { GameRegistry } from '../core/game/registry'
import { MatchRuntime } from '../core/match/match-runtime'
import { GameUiRegistry } from '../client/game-ui-registry'
import { douShouQiModule } from '../games/dou-shou-qi/module'
import { douShouQiUiPlugin } from '../games/dou-shou-qi/ui'

export const gameRegistry = new GameRegistry()
export const gameUiRegistry = new GameUiRegistry()

gameRegistry.register(douShouQiModule)
gameUiRegistry.register(douShouQiUiPlugin)

export function createM1Preview() {
  const match = new MatchRuntime(douShouQiModule)
  return {
    module: douShouQiModule,
    match,
    ui: gameUiRegistry.resolve(douShouQiModule.manifest.id, douShouQiModule.manifest.rulesVersion)
  }
}
