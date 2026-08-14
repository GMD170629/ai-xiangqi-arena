import type { GameModule, SeatId } from './contracts'

type AnyGameModule = GameModule<unknown, unknown, SeatId>

export class GameRegistry {
  private readonly modules = new Map<string, AnyGameModule>()

  register<State, Action, Seat extends SeatId>(module: GameModule<State, Action, Seat>): void {
    const key = this.key(module.manifest.id, module.manifest.rulesVersion)
    if (this.modules.has(key)) throw new Error(`Game module already registered: ${key}`)
    this.modules.set(key, module as unknown as AnyGameModule)
  }

  resolve<State, Action, Seat extends SeatId>(gameId: string, rulesVersion: string): GameModule<State, Action, Seat> {
    const key = this.key(gameId, rulesVersion)
    const module = this.modules.get(key)
    if (!module) throw new Error(`Game module not registered: ${key}`)
    return module as unknown as GameModule<State, Action, Seat>
  }

  list(): readonly { id: string; rulesVersion: string; name: string }[] {
    return [...this.modules.values()].map((module) => ({
      id: module.manifest.id,
      rulesVersion: module.manifest.rulesVersion,
      name: module.manifest.name
    }))
  }

  private key(id: string, rulesVersion: string): string {
    return `${id}@${rulesVersion}`
  }
}
