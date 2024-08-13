import { Channel, TwoWayChannel, useChannel, useChannelExternalStateSync, useChannelSourceStateSync } from 'use-channel'

type CounterChannel = TwoWayChannel<{
  onChangeCount: (count: number) => void
}>

Siblings.componentName = 'Chat with siblings'
export function Siblings() {
  const channel = useChannel<CounterChannel>('App')
  const { count, setCount } = useChannelExternalStateSync(channel, 'count', 0)
  return (
    <>
      <h1>Parent</h1>
      <p>Parent Channel: {count}</p>
      <button onClick={() => setCount(count => count + 1)}>Parent + 1</button>
      <SiblingOne channel={channel} />
      <SiblingTwo channel={channel} />
    </>
  )
}

export function SiblingOne({ channel: rcvChannel }: { channel: Channel<CounterChannel> }) {
  const channel = useChannel<CounterChannel>('SiblingOne').connect(rcvChannel)
  const { count, setCount } = useChannelSourceStateSync(channel, 'count')
  return (
    <>
      <h1>SiblingOne</h1>
      <p>SiblingOne Channel: {count}</p>
      <button onClick={() => setCount(count => count + 1)}>SiblingOne + 1</button>
    </>
  )
}

export function SiblingTwo({ channel: rcvChannel }: { channel: Channel<CounterChannel> }) {
  const channel = useChannel<CounterChannel>('SiblingTwo').connect(rcvChannel)
  const { count, setCount } = useChannelExternalStateSync(channel, 'count')
  return (
    <>
      <h1>SiblingTwo</h1>
      <p>SiblingTwo Channel: {count}</p>
      <button onClick={() => setCount(count => count + 1)}>SiblingTwo + 1</button>
    </>
  )
}
