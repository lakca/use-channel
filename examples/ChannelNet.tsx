import { PropsWithChildren } from 'react'
import { Channel, TwoWayChannel, useChannel, useChannelExternalState, useChannelExternalStateSync, useChannelSourceState, useChannelSourceStateSync } from 'use-channel'

type ParentChannel = TwoWayChannel<{
  onChangeParent: (value: string) => void
}>
type MiddleChannel = {
  onChangeMiddle: (value: string) => void
}
type ChildChannel = TwoWayChannel<{
  onChangeChild: (value: string) => void
}>

ChannelNet.componentName = 'ChannelNet'
export function ChannelNet() {
  const channel = useChannel<ParentChannel & ChildChannel>('Parent')
  const { parent } = useChannelSourceStateSync(channel, 'parent')
  const { child, setChild } = useChannelExternalStateSync(channel, 'child')
  return (
    <>
      <blockquote>Cross multiple levels at your hand.</blockquote>
      <h1><ColorP>Parent</ColorP>: <ColorP>{parent}</ColorP></h1>
      <h2>Parent Show <ColorC>Child</ColorC>: <ColorC>{child}</ColorC></h2>
      <label>
        <p><code>useChannelExternalStateSync(channel, 'child')</code> Will emit state out by <code>$onChangeChild</code> and accept outside emission <code>onChangeChild</code>.</p>
        <b>Parent Set <ColorC>Child</ColorC></b>
        <input data-testid="Parent Set Child" onChange={e => setChild(e.target.value)} />
      </label>
      <hr />
      <Middle channel={channel as Channel<ParentChannel & MiddleChannel>} />
    </>
  )
}

export function Middle({ channel: rcvChannel }: { channel: Channel<ParentChannel & MiddleChannel> }) {
  const channel = useChannel('Middle').connect(rcvChannel)
  const { middle, setMiddle } = useChannelSourceState(channel, 'middle', '0')
  const { parent, setParent } = useChannelExternalStateSync(channel, 'parent')
  return (
    <>
      <h1><ColorM>Middle</ColorM>: <ColorM>{middle}</ColorM></h1>
      <h2>Middle Show <ColorP>Parent</ColorP>: <ColorP>{parent}</ColorP></h2>
      <label>
        <p><code>useChannelExternalStateSync(channel, 'parent')</code> Will emit state out by <code>$onChangeParent</code>.</p>
        <b>Middle Set <ColorP>Parent</ColorP></b>
        <input data-testid="Middle Set Parent" onChange={e => setParent(e.target.value)} />
      </label>
      <label>
        <p><code>useChannelSourceState(channel, 'middle', '0')</code> Will emit state out by <code>onChangeMiddle</code> but not accept outside emission <del><code>$onChangeMiddle</code></del>.</p>
        <b>Set <ColorM>Middle</ColorM></b>
        <input data-testid="Middle Set" onChange={e => setMiddle(e.target.value)} />
      </label>
      <hr />
      <Child channel={channel} />
    </>
  )
}

export function Child({ channel: rcvChannel }: { channel: Channel<ParentChannel & MiddleChannel & ChildChannel> }) {
  const channel = useChannel('Child').connect(rcvChannel)
  const { child } = useChannelSourceStateSync(channel, 'child', '0')
  const { parent, setParent } = useChannelExternalStateSync(channel, 'parent')

  /**
     * Since `MiddleChannel` is not a two-way channel (`onChangeMiddle` has no corresponding `$onChangeMiddle` event), so ts problem will be reported when use synchronous state.
     *
     * Warn: This is only guarded by types check, do not abuse.
     */
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  useChannelExternalStateSync(channel, 'middle') // Argument of type '"middle"' is not assignable to parameter of type '"parent" | "child"'.ts(2345)

  /** Use *receptor* instead: */
  const { middle, setMiddle } = useChannelExternalState(channel, 'middle')

  return (
    <>
      <h1><ColorC>Child</ColorC>: <ColorC>{child}</ColorC></h1>
      <h2>Child Show <ColorP>Parent</ColorP>: <ColorP>{parent}</ColorP></h2>
      <h2>Child Show <ColorM>Middle</ColorM>: <ColorM>{middle}</ColorM></h2>
      <label>
        <p><code>useChannelExternalStateSync(channel, 'parent')</code> Will emit state out by <code>$onChangeParent</code>.</p>
        <b>Child Set <ColorP>Parent</ColorP></b>
        <input data-testid="Child Set Parent" onChange={e => setParent(e.target.value)} />
      </label>
      <label>
        <p><code>useChannelExternalState(channel, 'middle')</code> Will not emit state out <del><code>$onChangeParent</code></del>.</p>
        <b>Child Set Middle Privately</b>
        <input data-testid="Child Set Middle Privately" onChange={e => setMiddle(e.target.value)} />
      </label>
    </>
  )
}

function Color({ color, children }: PropsWithChildren<{ color: string }>) {
  return <span style={{ color }}>{children}</span>
}

function ColorP({ children }: PropsWithChildren) {
  return <Color color="red">{children}</Color>
}
function ColorM({ children }: PropsWithChildren) {
  return <Color color="green">{children}</Color>
}
function ColorC({ children }: PropsWithChildren) {
  return <Color color="blue">{children}</Color>
}
