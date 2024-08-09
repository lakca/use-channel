import { Channel, TwoWayChannel, useChannel, useChannelExternalStateSync, useChannelSourceStateSync } from 'use-channel'

type CounterChannel = TwoWayChannel<{
  onChangeCount: (count: number) => void
}>

TwoWayState.componentName = 'TwoWayState'
export function TwoWayState() {
  const channel = useChannel<CounterChannel>('Parent')
  Object.assign(window, { channel })
  const { count, setCount } = useChannelExternalStateSync(channel, 'count', 0)
  return (
    <>
      <blockquote>Sync state in/out.</blockquote>
      <h1>Parent: {count}</h1>
      <p><code>useChannelExternalStateSync(channel, 'count')</code> Will sync with Counter by listen <code>onChangeCount</code> and emit <code>$onChangeCount</code></p>
      <button onClick={() => setCount(count => count + 1)}>Parent + 1</button>
      <Counter channel={channel} />
    </>
  )
}

export function Counter({ channel: rcvChannel }: { channel: Channel<CounterChannel> }) {
  const channel = useChannel('Counter').connect(rcvChannel)
  const { count, setCount } = useChannelSourceStateSync(channel, 'count', 0)
  return (
    <>
      <h1>Counter: {count}</h1>
      <p><code>useChannelSourceStateSync(channel, 'count')</code> Will sync with Parent by emit <code>onChangeCount</code> and listen <code>$onChangeCount</code></p>
      <button onClick={() => setCount(count => count + 1)}>Counter + 1</button>
    </>
  )
}
