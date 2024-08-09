import { useState } from 'react'
import { Channel, useChannel } from 'use-channel'

type CounterChannel = {
  onChangeCount: (count: number) => void
}

function getPrivate<R>(obj: object, prop: string): R {
  return (obj as Record<string, unknown>)[prop] as unknown as R
}

GC.componentName = 'GC'
export function GC() {
  const [index, setIndex] = useState(0)
  const channel = useChannel<CounterChannel>('App')
  return (
    <>
      <blockquote>References should be cleared before unmount, including backwards (connecting) and forwards (connected).</blockquote>
      <button onClick={() => setIndex(v => v + 1)}>{index}th Counter</button>
      <h2>forwards:</h2><p>{[...getPrivate<Channel<CounterChannel>[]>(channel, 'forwards')].map(e => e.name)}</p>
      <h2>backwards:</h2><p>{[...getPrivate<Channel<CounterChannel>[]>(channel, 'backwards')].map(e => e.name)}</p>
      <Counter key={index} channel={channel} index={index} />
    </>
  )
}

export function Counter({ channel: rcv, index }: { index: number, channel: Channel<CounterChannel> }) {
  const channel = useChannel<CounterChannel>(`Counter-${index}`).connect(rcv)
  return (
    <>
      <h1>New Counter {index}th:</h1>
      <h2>forwards:</h2><p>{[...getPrivate<Channel<CounterChannel>[]>(channel, 'forwards')].map(e => e.name)}</p>
      <h2>backwards:</h2><p>{[...getPrivate<Channel<CounterChannel>[]>(channel, 'backwards')].map(e => e.name)}</p>
    </>
  )
}
