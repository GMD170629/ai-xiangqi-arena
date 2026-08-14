import type { Component } from 'vue'

export interface GameUiPlugin {
  gameId: string
  rulesVersion: string
  boardComponent: Component
}

export class GameUiRegistry {
  private readonly plugins = new Map<string, GameUiPlugin>()

  register(plugin: GameUiPlugin): void {
    const key = `${plugin.gameId}@${plugin.rulesVersion}`
    if (this.plugins.has(key)) throw new Error(`Game UI already registered: ${key}`)
    this.plugins.set(key, plugin)
  }

  resolve(gameId: string, rulesVersion: string): GameUiPlugin {
    const key = `${gameId}@${rulesVersion}`
    const plugin = this.plugins.get(key)
    if (!plugin) throw new Error(`Game UI not registered: ${key}`)
    return plugin
  }
}
