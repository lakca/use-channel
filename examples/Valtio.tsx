import { Channel, TwoWayChannel, useChannel, useChannelExternalState, useChannelExternalStateSync, useChannelSourceStateSync } from 'use-channel'
import { useOnce } from 'use-channel/utils'
import { useChannelValtio } from 'use-channel/valtio'
import { proxy, useSnapshot } from 'valtio'

type CounterChannel = TwoWayChannel<{
  onChangeCount: (count: number) => void
  onChangeValue: (count: number) => void
}>

ConnectValtio.componentName = 'Use with Valtio'
export function ConnectValtio() {
  const channel = useChannel<CounterChannel>('App')
  const { count, setCount } = useChannelExternalStateSync(channel, 'count')
  const { value, setValue } = useChannelSourceStateSync(channel, 'value', 0)
  return (
    <>
      <blockquote>Connect with <a href="https://www.npmjs.com/package/valtio">valtio</a>.</blockquote>
      <h1>Parent</h1>
      <p>(Channel-External-Sync) <span>Parent Channel: {count}</span></p>
      <p>(Channel-Source-Sync) <span>Channel Value: {value}</span></p>
      <button onClick={() => setCount(count => count + 1)}>Channel + 1</button>
      <button onClick={() => setValue(count => count + 1)}>Channel Value + 1</button>
      <Counter channel={channel} />
      <GC channel={channel} />
    </>
  )
}

export function Counter({ channel: rcvChannel }: { channel: Channel<CounterChannel> }) {
  const channel = useChannel<CounterChannel>('Counter').connect(rcvChannel)
  const store = useOnce(() => proxy({ count: 0, value: 0 }))
  const snap = useSnapshot(store)
  const { count } = useChannelSourceStateSync(channel, 'count', store.count)
  useChannelValtio(channel, store, ['count'], ['value'])
  return (
    <>
      <h1>Counter</h1>
      <p>(Store-Source-Sync) <span>Store: {store.count}</span></p>
      <p>(Store-External-Sync) <span>Store Value: {snap.value}</span></p>
      <p>(Channel-Source-Sync) <span>Channel: {count}</span></p>
      <button onClick={() => store.count += 1}>Store + 1</button>
      <button onClick={() => store.value += 1}>Store Value + 1</button>
    </>
  )
}

export function GC({ channel: rcvChannel }: { channel: Channel<CounterChannel> }) {
  const channel = useChannel<CounterChannel>('GC').connect(rcvChannel)
  const { count } = useChannelExternalState(channel, 'count')
  const store = proxy({ count: 0 })
  useChannelValtio(channel, store, ['count'])
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const listeners = channel.listeners['onChangeCount']?.length
  return (
    <>
      <h1>Counter</h1>
      <p>(Channel-External) <span>GC Channel: {count}</span></p>
      <p>Listeners: {listeners}</p>
    </>
  )
}
