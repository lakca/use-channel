import { useState } from 'react'
import { Channel, TwoWayChannel, useChannel, useChannelRef, useChannelSourceStateSync } from 'use-channel'

type CounterChannel = TwoWayChannel<{
  onChangeCount: (count: number) => void
}>

ChannelRef.componentName = 'Channel Ref'
export function ChannelRef() {
  const channel = useChannel<CounterChannel>('App')
  const [, toggle] = useState(false)
  const count = useChannelRef(channel, 'count')
  return (
    <>
      <h1>Parent</h1>
      <blockquote>Ref without dispatch</blockquote>
      <p>Parent Channel: {count.current}</p>
      <button onClick={() => toggle(v => !v)}>App Get</button>
      <SiblingOne channel={channel} />
      <SiblingTwo channel={channel} />
    </>
  )
}

export function SiblingOne({ channel: rcvChannel }: { channel: Channel<CounterChannel> }) {
  const channel = useChannel<CounterChannel>('SiblingOne').connect(rcvChannel)
  const { count, setCount } = useChannelSourceStateSync(channel, 'count', 0)
  channel.listen('$onChangeCount', console.log)
  return (
    <>
      <h1>SiblingOne</h1>
      <blockquote>Source State</blockquote>
      <p>SiblingOne Channel: {count}</p>
      <button onClick={() => setCount(count => count + 1)}>SiblingOne + 1</button>
    </>
  )
}

export function SiblingTwo({ channel: rcvChannel }: { channel: Channel<CounterChannel> }) {
  const channel = useChannel<CounterChannel>('SiblingTwo').connect(rcvChannel)
  const [, toggle] = useState(false)
  const count = useChannelRef(channel, 'count', { dispatch: true })
  return (
    <>
      <h1>SiblingTwo</h1>
      <blockquote>Ref with dispatch</blockquote>
      <p>SiblingTwo Channel: {count.current}</p>
      <button onClick={() => toggle(v => !v)}>SiblingTwo Get</button>
      <button onClick={() => count.current += 1}>SiblingTwo + 1</button>
    </>
  )
}
