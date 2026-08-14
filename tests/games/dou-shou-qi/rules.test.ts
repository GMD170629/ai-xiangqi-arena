import { describe, expect, it } from 'vitest'
import { MatchRuntime } from '../../../src/core/match/match-runtime'
import { positionKey, pos } from '../../../src/games/dou-shou-qi/domain/board'
import { douShouQiRules } from '../../../src/games/dou-shou-qi/domain/rules'
import type { DouShouQiState, Piece } from '../../../src/games/dou-shou-qi/domain/types'
import { douShouQiModule } from '../../../src/games/dou-shou-qi/module'

function state(turn: 'blue' | 'red', pieces: Piece[]): DouShouQiState {
  const base = { turn, ply: 0, pieces, repetition: {} }
  const key = positionKey(base)
  return { ...base, repetition: { [key]: 1 } }
}

function piece(id: string, side: 'blue' | 'red', animal: Piece['animal'], at: string): Piece {
  return { id, side, animal, position: pos(at) }
}

describe('Dou Shou Qi classic-v1', () => {
  it('creates the classic 16-piece initial position', () => {
    const initial = douShouQiRules.createInitialState()
    expect(initial.pieces).toHaveLength(16)
    expect(initial.turn).toBe('blue')
    expect(douShouQiRules.legalActions(initial).length).toBeGreaterThan(0)
  })

  it('allows a land rat to capture an elephant but not the reverse', () => {
    const ratTurn = state('blue', [piece('b-rat','blue','rat','a3'), piece('r-elephant','red','elephant','a4')])
    expect(douShouQiRules.validateAction(ratTurn, { type:'move', from:pos('a3'), to:pos('a4') }).ok).toBe(true)

    const elephantTurn = state('blue', [piece('b-elephant','blue','elephant','a3'), piece('r-rat','red','rat','a4')])
    expect(douShouQiRules.validateAction(elephantTurn, { type:'move', from:pos('a3'), to:pos('a4') }).ok).toBe(false)
  })

  it('lets rats enter water and blocks other animals', () => {
    const ratState = state('blue', [piece('b-rat','blue','rat','a4'), piece('r-cat','red','cat','g9')])
    expect(douShouQiRules.validateAction(ratState, { type:'move', from:pos('a4'), to:pos('b4') }).ok).toBe(true)

    const catState = state('blue', [piece('b-cat','blue','cat','a4'), piece('r-cat','red','cat','g9')])
    expect(douShouQiRules.validateAction(catState, { type:'move', from:pos('a4'), to:pos('b4') }).ok).toBe(false)
  })

  it('allows tiger river jumps but a rat in the river blocks them', () => {
    const clear = state('blue', [piece('b-tiger','blue','tiger','a4'), piece('r-cat','red','cat','g9')])
    expect(douShouQiRules.validateAction(clear, { type:'move', from:pos('a4'), to:pos('d4') }).ok).toBe(true)

    const blocked = state('blue', [piece('b-tiger','blue','tiger','a4'), piece('r-rat','red','rat','b4')])
    expect(douShouQiRules.validateAction(blocked, { type:'move', from:pos('a4'), to:pos('d4') }).ok).toBe(false)
  })

  it('reduces an enemy piece in a trap so any defender may capture it', () => {
    const trapped = state('blue', [piece('b-rat','blue','rat','b1'), piece('r-elephant','red','elephant','c1')])
    expect(douShouQiRules.validateAction(trapped, { type:'move', from:pos('b1'), to:pos('c1') }).ok).toBe(true)
  })

  it('forbids entering your own den and wins on the opponent den', () => {
    const ownDen = state('blue', [piece('b-cat','blue','cat','d2'), piece('r-rat','red','rat','a9')])
    expect(douShouQiRules.validateAction(ownDen, { type:'move', from:pos('d2'), to:pos('d1') }).ok).toBe(false)

    const attack = state('blue', [piece('b-cat','blue','cat','d8'), piece('r-rat','red','rat','a9')])
    const next = douShouQiRules.applyAction(attack, { type:'move', from:pos('d8'), to:pos('d9') })
    expect(douShouQiRules.outcome(next)).toEqual({ type:'win', winner:'blue', reason:'DEN_CAPTURED' })
  })

  it('keeps MatchRuntime game-agnostic while rejecting illegal actions', () => {
    const runtime = new MatchRuntime(douShouQiModule)
    const rejected = runtime.dispatch({ type:'move', from:pos('a1'), to:pos('a9') })
    expect(rejected.ok).toBe(false)
    expect(runtime.snapshot().history).toHaveLength(0)
  })
})
