import { useEffect, useRef, useState } from 'react'
import { Channel, TwoWayChannel, useChannel, useChannelExternalStateSync, useChannelSourceStateSync } from 'use-channel'

type CounterChannel = TwoWayChannel<{
  onChangeCount: (count: number) => void
}>

Event.componentName = 'Use Event Directly'
export function Event() {
  const channel = useChannel<CounterChannel>('App')
  const { count, setCount } = useChannelExternalStateSync(channel, 'count', 0)
  const [, setToggle] = useState(false)

  const callings = useRef([0, 0])
  useEffect(() => {
    channel.listen('onChangeCount', () => callings.current[0] += 1)
    channel.listen('$onChangeCount', () => callings.current[1] += 1)
    return channel.disposal
  }, [channel])

  return (
    <>
      <h1>Parent</h1>
      <p>Parent Channel: {count}</p>
      <p>Parent Receiving Times: {callings.current[0]} {callings.current[1]}</p>
      <button onClick={() => setCount(count => count + 1)}>Parent + 1</button>
      <button onClick={() => setToggle(v => !v)}>Get Times</button>
      <SiblingOne channel={channel} />
      <SiblingTwo channel={channel} />
    </>
  )
}

export function SiblingOne({ channel: rcvChannel }: { channel: Channel<CounterChannel> }) {
  const channel = useChannel<CounterChannel>('SiblingOne').connect(rcvChannel)
  const { count, setCount } = useChannelSourceStateSync(channel, 'count')

  const callings = useRef([0, 0])
  useEffect(() => {
    channel.listen('onChangeCount', () => callings.current[0] += 1)
    channel.listen('$onChangeCount', () => callings.current[1] += 1)
    return channel.disposal
  }, [channel])

  return (
    <>
      <h1>SiblingOne</h1>
      <p>SiblingOne Channel: {count}</p>
      <p>SiblingOne Receiving Times: {callings.current[0]} {callings.current[1]}</p>
      <button onClick={() => setCount(count => count + 1)}>SiblingOne + 1</button>
    </>
  )
}

export function SiblingTwo({ channel: rcvChannel }: { channel: Channel<CounterChannel> }) {
  const channel = useChannel<CounterChannel>('SiblingTwo').connect(rcvChannel)
  const { count, setCount } = useChannelExternalStateSync(channel, 'count')

  const callings = useRef([0, 0])
  useEffect(() => {
    channel.listen('onChangeCount', () => callings.current[0] += 1)
    channel.listen('$onChangeCount', () => callings.current[1] += 1)
    return channel.disposal
  }, [channel])

  return (
    <>
      <h1>SiblingTwo</h1>
      <p>SiblingTwo Channel: {count}</p>
      <p>SiblingTwo Receiving Times: {callings.current[0]} {callings.current[1]}</p>
      <button onClick={() => setCount(count => count + 1)}>SiblingTwo + 1</button>
    </>
  )
}
