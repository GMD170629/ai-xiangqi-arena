import { describe, expect, it } from 'vitest'
import { GameRegistry } from '../../src/core/game/registry'
import { douShouQiModule } from '../../src/games/dou-shou-qi/module'

describe('GameRegistry', () => {
  it('registers a game by game id and rules version', () => {
    const registry = new GameRegistry()
    registry.register(douShouQiModule)
    expect(registry.list()).toEqual([{ id:'dou-shou-qi', rulesVersion:'classic-v1', name:'斗兽棋' }])
  })
})
