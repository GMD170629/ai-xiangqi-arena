import { describe, expect, it } from 'vitest'
import { CommanderInbox } from './commander-inbox'

describe('CommanderInbox', () => {
  it('keeps messages isolated by seat and acknowledges delivered messages', () => {
    const inbox = new CommanderInbox<'blue' | 'red'>()
    const blue = inbox.send('blue', '守一下右路')
    inbox.send('red', '主动进攻')
    expect(inbox.peek('blue').map((item) => item.text)).toEqual(['守一下右路'])
    expect(inbox.peek('red')).toHaveLength(1)
    inbox.acknowledge('blue', [blue.id])
    expect(inbox.peek('blue')).toHaveLength(0)
    expect(inbox.peek('red')).toHaveLength(1)
  })
})
