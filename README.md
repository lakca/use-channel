# use-channel

> 为了简化数据逆向传递及数据跨级穿透传递，建立了通道事件模型。该模型内，不显式关心数据传递的方向，而是以数据源和数据受体为核心建立数据流。
- 正向事件，即由事件源组件传递到事件接受组件，以`on`开头，例如`onChangeSearch`。
- 逆向事件，即由事件接受组件传递到事件源组件，以`$on`开头，例如`$onChangeSearch`。
- 为了简化，你可以借助帮助类型`TwoWayChannel`进行定义。

> In order to simplify the reverse transmission of data and the transmission of data across layers, a channel event model is established. In this
model, the direction of data transmission is not explicitly concerned, but the data flow is established with the data source and data receptor
as the core.
- Forward events, that is, events transmitted from the event source component to the event receiving component, start with `on`, such as `onChangeSearch`.
- Reverse events, that is, events transmitted from the event receiving component to the event source component, start with `$on`, such as `$onChangeSearch`.
- For simplicity, you can define with the help of the help type `TwoWayChannel`.

```typescript
type MyChannel<D> = TwoWayChannel<{
 onChangeValue: (value: string) => void
 // + $onChangeValue: (value: string) => void
}>
```

```typescript
export function TwoWayState() {
  const channel = useChannel<CounterChannel>('Parent')
  const { count, setCount } = useChannelExternalStateSync(channel, 'count', 0)
  // actually: channel.listen('onChangeCount') & channel.send('$onChangeCount')
  return (
    <>
      <h1>Parent: {count}</h1>
      <button onClick={() => setCount(count => count + 1)}>Parent + 1</button>
      <Counter channel={channel} />
    </>
  )
}

export function Counter({ channel: rcvChannel }: { channel: Channel<CounterChannel> }) {
  const channel = useChannel('Counter').connect(rcvChannel)
  const { count, setCount } = useChannelSourceStateSync(channel, 'count', 0)
  // actually: channel.listen('$onChangeCount') & channel.send('onChangeCount')
  return (
    <>
      <button onClick={() => setCount(count => count + 1)}>Counter + 1</button>
    </>
  )
}
```

API (See details in [`core.ts`](src/core.ts)):

- `useChannel(ChannelName?:string)`
- `useChannelSourceState(channel:Channel, stateName:string, initialValue?)`
- `useChannelSourceStateSync(channel:Channel, stateName:string, initialValue?)`
- `useChannelExternalState(channel:Channel, stateName:string, initialValue?)`
- `useChannelExternalStateSync(channel:Channel, stateName:string, initialValue?)`
- `channel.connect(channel:Channel)`
- `type TwoWayChannel`

## Get Details

See [demo](http://longpeng.me/use-channel/) / [examples](examples) OR clone the repo and  `pnpm install && pnpm run dev`
