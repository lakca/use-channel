import { Channel, useChannel, useChannelExternalState, useChannelSourceState } from 'use-channel'

type CounterChannel = {
  onChangeCount: (count: number) => void
}

ReverseState.componentName = 'ReverseState'
export function ReverseState() {
  const channel = useChannel<CounterChannel>('Parent')
  Object.assign(window, { channel })
  const { count, setCount } = useChannelExternalState(channel, 'count', 0)
  return (
    <>
      <blockquote>Reverse state flow in your control.</blockquote>
      <h1>Parent: {count}</h1>
      <p><code>useChannelExternalState(channel, 'count')</code> Will accept state change from Counter with <code>onChangeCount</code> event while you can still update state privately.</p>
      <button onClick={() => setCount(count => count + 1)}>Parent + 1</button>
      <Counter channel={channel} />
    </>
  )
}

export function Counter({ channel: rcvChannel }: { channel: Channel<CounterChannel> }) {
  const channel = useChannel('Counter').connect(rcvChannel)
  const { count, setCount } = useChannelSourceState(channel, 'count', 0)
  return (
    <>
      <h1>Counter: {count}</h1>
      <p><code>useChannelSourceState(channel, 'count')</code> Will broadcast state change by emit <code>onChangeCount</code></p>
      <button onClick={() => setCount(count => count + 1)}>Counter + 1</button>
    </>
  )
}
