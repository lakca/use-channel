# use-channel

> Easy two-way state and no complexity growth in cross levels. Zero-Dependency & Intuitive API & Fully Typed.

![GitHub Actions Workflow Status](https://img.shields.io/github/actions/workflow/status/lakca/use-channel/test.yml)
[![codecov](https://codecov.io/github/lakca/use-channel/graph/badge.svg?token=thMJZOUXn7)](https://codecov.io/github/lakca/use-channel)
![NPM Version](https://img.shields.io/npm/v/use-channel)

> 为了简化数据逆向传递及数据跨级穿透传递，建立了通道事件模型。该模型内，不显式关心数据传递的方向，而是以数据源和数据受体为核心建立数据流。
- 正向事件，即由事件源组件传递到事件接受组件，以`on`开头，例如`onChangeSearch`。
- 逆向事件，即由事件接受组件传递到事件源组件，以`$on`开头，例如`$onChangeSearch`。
- 为了简化，你可以借助帮助类型`TwoWayChannel`进行定义。
- 提供`useChannelState`等[快捷方法](#api)，避免凌乱的事件调用。

> In order to simplify the reverse transmission of data and the transmission of data across layers, a channel event model is established. In this
model, the direction of data transmission is not explicitly concerned, but the data flow is established with the data source and data receptor
as the core.
- Forward events, that is, events transmitted from the event source component to the event receiving component, start with `on`, such as `onChangeSearch`.
- Reverse events, that is, events transmitted from the event receiving component to the event source component, start with `$on`, such as `$onChangeSearch`.
- For simplicity, you can define with the help of the help type `TwoWayChannel`.
- Provide [helper hooks](#api) such as `useChannelState` to avoid messy event calls.

```typescript
type MyChannel<D> = TwoWayChannel<{
 onChangeValue: (value: string) => void
 // + $onChangeValue: (value: string) => void
}>
```

## Demo

> See [examples: Starter](examples/Starter.tsx)

```typescript
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
```

## API

> See details in [`core.ts`](src/core.ts)

```typescript
type TwoWayChannel<T>
type TwoWayChannel<T, K>

type ChannelStateType

type PropsWithChannel<T, P>

useChannel(ChannelName?:string): Channel

channel.connect(channel:Channel): Channel // typed-optimized

useChannelSourceState(channel:Channel, name:string, initialValue?)

useChannelSourceStateSync(channel:Channel, name:string, initialValue?)

useChannelExternalState(channel:Channel, name:string, initialValue?)

useChannelExternalStateSync(channel:Channel, name:string, initialValue?)

useChannelState(type:ChannelStateType channel:Channel, name:string, initialValue?)
```

## Details

See [demo](http://longpeng.me/use-channel/) / [examples](examples) OR clone the repo and  `pnpm install && pnpm run dev`

## LICENSE

MIT
