# use-channel

> Easy two-way state and no complexity growth in cross levels. Zero-Dependency & Intuitive API & Fully Typed.

[![GitHub Actions Workflow Status](https://img.shields.io/github/actions/workflow/status/lakca/use-channel/test.yml)](https://github.com/lakca/use-channel/actions)
[![codecov](https://codecov.io/github/lakca/use-channel/graph/badge.svg?token=thMJZOUXn7)](https://codecov.io/github/lakca/use-channel)
[![NPM Version](https://img.shields.io/npm/v/use-channel)](https://www.npmjs.com/package/use-channel)

> 为了简化数据逆向传递及数据跨级穿透传递，建立了通道事件模型。该模型内，不显式关心数据传递的方向，而是以数据源和数据受体为核心建立数据流。
- 正向事件，即由事件源组件传递到事件接受组件，以`on`开头，例如`onChangeSearch`。
- 逆向事件，即由事件接受组件传递到事件源组件，以`$on`开头，例如`$onChangeSearch`。
- 为了简化，你可以借助帮助类型`TwoWayChannel`进行定义。
- 提供`useChannelState`, `useChannelRef`等[状态钩子](#api)，避免凌乱的事件调用。
- 提供[`valtio`](#valtio)等状态库进行状态同步方法（欢迎提交其他状态库[PR](https://github.com/lakca/use-channel/pulls)）。

> In order to simplify the reverse transmission of data and the transmission of data across layers, a channel event model is established. In this
model, the direction of data transmission is not explicitly concerned, but the data flow is established with the data source and data receptor
as the core.
- Forward events, that is, events transmitted from the event source component to the event receiving component, start with `on`, such as `onChangeSearch`.
- Reverse events, that is, events transmitted from the event receiving component to the event source component, start with `$on`, such as `$onChangeSearch`.
- For simplicity, you can define with the help of the help type `TwoWayChannel`.
- Provide [hooks](#api) such as `useChannelState` to avoid messy event calls.
- Provide [utilities](#connect-with-state-management) to synchronize with state management such as [`valtio`](#valtio)([PRs](https://github.com/lakca/use-channel/pulls) for others are welcome).

## Usage

> See more in [examples](examples)' [demo](http://longpeng.me/use-channel/) OR clone the repo and  `pnpm install && pnpm run dev`

```typescript
// for type checks / intellisense
type CounterChannel = TwoWayChannel<{
  onChangeCount: (value: number) => void
  onChangeValue: (value: number) => void
  onChangeValueProp: (value: number) => void
  // + $onChangeCount: (value: number) => void
  // + $onChangeValue: (value: number) => void
}, 'onChangeCount' | 'onChangeValue'>

export function Starter() {
  // create channel (ref-optimized)
  const channel = useChannel<CounterChannel>('Starter') // name is unused yet.

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
      ...
      <Counter channel={channel} /> // Pass channel, for be connected
    </>
  )
}

export function Counter({ channel: rcvChannel }: { channel: Channel<CounterChannel> }) {
  // connect external channel, return type is already mixed.
  const channel = useChannel('Counter').connect(rcvChannel)

  const { count, setCount } = useChannelSourceStateSync(channel, 'count')
  // actually: channel.listen('$onChangeCount') & channel.send('onChangeCount')

  const { value, setValue } = useChannelExternalStateSync(channel, 'value')
  // actually: channel.listen('onChangeValue') & channel.send('$onChangeValue')

  const { value: privateValue, setValue: setValuePrivately } = useChannelExternalState(channel, 'value')
  // actually: channel.listen('onChangeValue')

  const { valueProp, setValueProp } = useChannelExternalState(channel, 'valueProp')
  // actually: channel.listen('onChangeValueProp')
}
```

## API

> See details in [`core.ts`](src/core.ts)

- `type TwoWayChannel<T>`

```typescript
type MyChannel = TwoWayChannel<{
 onChangeValue: (value: string) => void
 // + $onChangeValue: (value: string) => void
}>
```

- `type TwoWayChannel<T, K>`

```typescript
type MyChannel = TwoWayChannel<{
 onChangeValue: (value: string) => void
 onChangeValue2: (value: string) => void
 // + $onChangeValue: (value: string) => void
}, 'onChangeValue'>
```

- `type PropsWithChannel<T, P>`

- `useChannel<MyChannel>(ChannelName?:string): Channel`

- `channel.connect(channel:Channel): Channel`

> Tip: It's uncommon to use event listener/emitter directly, [State Hooks](#state)/[Ref Hooks](#ref) instead.

- `channel.listen<K extends keyof MyChannel>(eventName:K, (...value: Parameters<MyChannel[K]>) => void)`

- `channel.send<K extends keyof MyChannel>(eventName:K, ...value: Parameters<MyChannel[K]>)`

### State

> Note: Only first parameter in listener is used in state.

- `useChannelSourceState(channel:Channel, name:string, initialValue?)`

- `useChannelSourceStateSync(channel:Channel, name:string, initialValue?)`

- `useChannelExternalState(channel:Channel, name:string, initialValue?)`

- `useChannelExternalStateSync(channel:Channel, name:string, initialValue?)`

- `type ChannelStateType`

- `useChannelState(type:ChannelStateType channel:Channel, name:string, initialValue?)`, Prefer to use above distinct hooks.

### Ref

> Note: Only first parameter in listener is used in ref.

- `useChannelRef(type:ChannelStateType channel:Channel, name:string, initialValue?)`

 ```typescript
 // followings are equivalent:
 useChannelRef(channel, 'value')
 useChannelRef(channel, 'value', { dispatch: false })
 useChannelRef(channel, 'value', { dispatch: false, source: false })
 ```

 See [example](examples/Ref.tsx)

### [valtio][valtio]

```typescript
import { useChannelValtio } from 'use-channel/valtio'
// followings are equivalent:
useChannelValtio(channel, store, ['count'])
useChannelValtio(channel, store, [['count', 'count']]) // channel#count -> store.count
useChannelValtio(channel, store, [['count', 'count', { subscribe: true, listen: true }]])
```

## LICENSE

MIT

[valtio]: https://www.npmjs.com/package/valtio
