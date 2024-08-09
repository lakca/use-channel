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

## Quick Start

See [examples](examples) OR clone the repo and  `pnpm install && pnpm run dev`
