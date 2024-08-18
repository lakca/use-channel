import { useCallback, useEffect, useState } from 'react'
import { Channel, TwoWayChannel, useChannel, useChannelExternalState, useChannelExternalStateSync, useChannelSourceState, useChannelSourceStateSync } from 'use-channel'

type CounterChannel = TwoWayChannel<{
  onChangeCount: (count: number) => void
}>

Disposal.componentName = 'Disposal'
export function Disposal() {
  const [display, setDisplay] = useState(true)
  const channel1 = useChannel<CounterChannel>()
  const channel2 = useChannel<CounterChannel>()
  const getListenerCount = useCallback((channel: Channel<CounterChannel>) => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return Object.values(channel.listeners).reduce((_, v) => _ + v.length, 0)
  }, [])
  const [listenerCount1, setListenerCount1] = useState(getListenerCount(channel1))
  const [listenerCount2, setListenerCount2] = useState(getListenerCount(channel2))

  useEffect(() => {
    setListenerCount1(getListenerCount(channel1))
    setListenerCount2(getListenerCount(channel2))
  }, [channel1, channel2, display, getListenerCount])

  return (
    <>
      <button data-testid="toggle" onClick={() => setDisplay(v => !v)}>{display ? 'Remove' : 'Mount'}</button>
      <p>Channel 1 Listeners Count: {listenerCount1}</p>
      <p>Channel 2 Listeners Count: {listenerCount2}</p>
      {display && <Counter1 channel={channel1} />}
      {display && <Counter2 channel={channel2} />}
    </>
  )
}

export function Counter1({ channel }: { channel: Channel<CounterChannel> }) {
  useChannelSourceState(channel, 'count')
  useChannelSourceStateSync(channel, 'count')
  useChannelExternalState(channel, 'count')
  useChannelExternalStateSync(channel, 'count')
  return <h1>Counter1</h1>
}

export function Counter2({ channel }: { channel: Channel<CounterChannel> }) {
  useEffect(() => {
    channel.listen('onChangeCount', () => {}), [channel]
    channel.listen('onChangeCount', () => {}), [channel]
    return channel.disposal
  }, [channel])
  return <h1>Counter2</h1>
}
