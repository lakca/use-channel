import { Channel, TwoWayChannel, useChannel, useChannelExternalState, useChannelExternalStateSync, useChannelSourceState, useChannelSourceStateSync } from 'use-channel'

// for type checks (intellisense)
type CounterChannel = TwoWayChannel<{
  onChangeCount: (count: number) => void
  onChangeValue: (value: number) => void
  onChangeValueProp: (value: number) => void
}, 'onChangeCount' | 'onChangeValue'>

Starter.componentName = 'Starter'
export function Starter() {
  // create channel (ref-optimized)
  const channel = useChannel<CounterChannel>('Starter')

  const { value, setValue } = useChannelSourceStateSync(channel, 'value', 0)
  // actually: channel.listen('$onChangeValue') & channel.send('onChangeValue')

  const { valueProp, setValueProp } = useChannelSourceState(channel, 'valueProp', 0)
  // actually: channel.send('onChangeValueProp')

  const { count, setCount } = useChannelExternalStateSync(channel, 'count', 0)
  // actually: channel.listen('onChangeCount') & channel.send('$onChangeCount')

  const { count: privateCount, setCount: setCountPrivately } = useChannelExternalState(channel, 'count')
  // actually: channel.listen('onChangeCount')

  return (
    <>
      <h1>Starter</h1>
      <p>Starter count: {count}</p>
      <p>Starter privateCount: {privateCount}</p>
      <p>Starter value: {value}</p>
      <p>Starter valueProp: {valueProp}</p>
      <button data-testid="Starter:setCount" onClick={() => setCount(v => v + 1)}>count + 1</button>
      <button data-testid="Starter:setCountPrivately" onClick={() => setCountPrivately(v => v + 1)}>private count + 1</button>
      <button data-testid="Starter:setValue" onClick={() => setValue(v => v + 1)}>value + 1</button>
      <button data-testid="Starter:setValueProp" onClick={() => setValueProp(v => v + 1)}>valueProp + 1</button>
      <Counter channel={channel} />
    </>
  )
}

export function Counter({ channel: rcvChannel }: { channel: Channel<CounterChannel> }) {
  // connect external channel.
  const channel = useChannel('Counter').connect(rcvChannel)

  const { count, setCount } = useChannelSourceStateSync(channel, 'count')
  // actually: channel.listen('$onChangeCount') & channel.send('onChangeCount')

  const { value, setValue } = useChannelExternalStateSync(channel, 'value')
  // actually: channel.listen('onChangeValue') & channel.send('$onChangeValue')

  const { value: privateValue, setValue: setValuePrivately } = useChannelExternalState(channel, 'value')
  // actually: channel.listen('onChangeValue')

  const { valueProp, setValueProp } = useChannelExternalState(channel, 'valueProp')
  // actually: channel.listen('onChangeValueProp')

  return (
    <>
      <h1>Counter</h1>
      <p>Counter count: {count}</p>
      <p>Counter value: {value}</p>
      <p>Counter privateValue: {privateValue}</p>
      <p>Counter valueProp: {valueProp}</p>
      <button data-testid="Counter:setCount" onClick={() => setCount(v => v + 1)}>count + 1</button>
      <button data-testid="Counter:setCountPrivately" onClick={() => setValue(v => v + 1)}>value + 1</button>
      <button data-testid="Counter:setValue" onClick={() => setValuePrivately(v => v + 1)}>private value + 1</button>
      <button data-testid="Counter:setValueProp" onClick={() => setValueProp(v => v + 1)}>value prop (privately) + 1</button>
    </>
  )
}
