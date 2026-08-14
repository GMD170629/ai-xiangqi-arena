import type { CommanderMessage } from '../ai/turn-contract'
import type { SeatId } from '../game/contracts'

export class CommanderInbox<Seat extends SeatId> {
  private readonly queues = new Map<Seat, CommanderMessage[]>()

  send(seat: Seat, text: string): CommanderMessage {
    const normalized = text.trim()
    if (!normalized) throw new Error('COMMANDER_MESSAGE_EMPTY')
    const message: CommanderMessage = {
      id: `cmd_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      text: normalized,
      createdAt: new Date().toISOString()
    }
    const queue = this.queues.get(seat) ?? []
    queue.push(message)
    this.queues.set(seat, queue)
    return message
  }

  peek(seat: Seat): readonly CommanderMessage[] {
    return [...(this.queues.get(seat) ?? [])]
  }

  acknowledge(seat: Seat, ids: readonly string[]): void {
    const acknowledged = new Set(ids)
    this.queues.set(seat, (this.queues.get(seat) ?? []).filter((item) => !acknowledged.has(item.id)))
  }

  clear(seat?: Seat): void {
    if (seat === undefined) this.queues.clear()
    else this.queues.delete(seat)
  }
}
