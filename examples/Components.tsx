import { NONE, PropsWithChannel, TwoWayChannel, useChannel, useChannelExternalState, useChannelExternalStateSync, useChannelSourceState, useChannelSourceStateSync } from 'use-channel'
import { PropsWithChildren } from 'react'

export type CounterChannel = TwoWayChannel<{
  onChangeCount: (count: string) => void
}>

// eslint-disable-next-line @typescript-eslint/ban-types, @typescript-eslint/no-explicit-any
type Props = PropsWithChannel<CounterChannel, PropsWithChildren<{ initialValue?: any }>>

export function External(props: Props) {
  const channel = useChannel<CounterChannel>('External').connect(props.channel)
  const { count, setCount } = useChannelExternalState(channel, 'count', 'initialValue' in props ? props.initialValue : NONE)
  return (
    <>
      <div>External: {count}</div>
      <input onChange={e => setCount(e.target.value)} />
      {props.children}
    </>
  )
}

export function ExternalSync(props: Props) {
  const channel = useChannel<CounterChannel>('ExternalSync').connect(props.channel)
  const { count, setCount } = useChannelExternalStateSync(channel, 'count', 'initialValue' in props ? props.initialValue : NONE)
  return (
    <>
      <div>ExternalSync: {count}</div>
      <input onChange={e => setCount(e.target.value)} />
      {props.children}
    </>
  )
}

export function Source(props: Props) {
  const channel = useChannel<CounterChannel>('Source').connect(props.channel)
  const { count, setCount } = useChannelSourceState(channel, 'count', 'initialValue' in props ? props.initialValue : NONE)
  return (
    <>
      <div>Source: {count}</div>
      <input onChange={e => setCount(e.target.value)} />
      {props.children}
    </>
  )
}

export function SourceSync(props: Props) {
  const channel = useChannel<CounterChannel>('SourceSync').connect(props.channel)
  const { count, setCount } = useChannelSourceStateSync(channel, 'count', 'initialValue' in props ? props.initialValue : NONE)
  return (
    <>
      <div>SourceSync: {count}</div>
      <input onChange={e => setCount(e.target.value)} />
      {props.children}
    </>
  )
}
