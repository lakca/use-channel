/* eslint-disable @typescript-eslint/no-explicit-any */
import { Dispatch, SetStateAction, useEffect, useMemo, useRef, useState } from 'react'
import { upperFirst, useOnce } from './utils'

type OmitNever<T> = { [k in keyof T as [T[k]] extends [never] ? never : k]: T[k] }

type Listener = (...args: any[]) => any

export type Listeners = Record<string, Listener>

export type PropsWithChannel<T extends Listeners, P> = P extends { channel: unknown } ? never : Omit<P, 'channel'> & { channel?: Channel<T> }

/**
 * Only method with only one parameter will auto generate paired method, except that you specified by providing the second generic type.
 * ```
 * type AutoChannel<D> = TwoWayChannel<{
 *  onChangeSearch: (text: string) => void
 *  onChangeOther: (type: string, value: string) => void
 *  onReload: () => void
 *  // + $onChangeSearch: (text: string) => void
 * }>
 * type SpecifiedChannel<D> = TwoWayChannel<{
 *  onChangeSearch: (text: string) => void
 *  onReload: () => void
 *  // + $onReload: () => void
 * }, 'onReload'>
 * ```
 */
export type TwoWayChannel<T extends Listeners, K extends keyof T = never> = T & OmitNever<{
  [k in ([K] extends [never] ? keyof T : K) as `$${k & string}`]: [K] extends [never] ? T[k] extends ((a: any) => any) ? ((a: any) => any) extends T[k] ? (value: Parameters<T[k]>[0]) => void : never : never : ((value: Parameters<T[k]>[0]) => void)
}>

/**
 * 为了简化数据逆向传递及数据跨级穿透传递，建立了通道事件模型。该模型内，不显式关心数据传递的方向，而是以数据源和数据受体为核心建立数据流。
 * - 正向事件，即由事件源组件传递到事件接受组件，以`on`开头，例如`onChangeSearch`。
 * - 逆向事件，即由事件接受组件传递到事件源组件，以`$on`开头，例如`$onChangeSearch`。
 * - 为了简化，你可以借助帮助类型`TwoWayChannel`进行定义。
 *
 * In order to simplify the reverse transmission of data and the transmission of data across layers, a channel event model is established. In this
 * model, the direction of data transmission is not explicitly concerned, but the data flow is established with the data source and data receptor
 * as the core.
 * - Forward events, that is, events transmitted from the event source component to the event receiving component, start with `on`, such as `onChangeSearch`.
 * - Reverse events, that is, events transmitted from the event receiving component to the event source component, start with `$on`, such as `$onChangeSearch`.
 * - For simplicity, you can define with the help of the help type `TwoWayChannel`.
 *
 * ```
 * type MyChannel<D> = TwoWayChannel<{
 *  onChangeValue: (value: string) => void
 *  // + $onChangeValue: (value: string) => void
 * }>
 * ```
 */
export function useChannel<T extends Listeners = NonNullable<unknown>>(name?: string) {
  const channel = useOnce(() => new Channel<T>(name))
  useEffect(() => {
    return () => channel.clearRefs()
  }, [channel])
  return channel
}

export type StateKey<K extends string, U extends string> = K extends `${U}${infer P}` ? Uncapitalize<P> : never

export type StateValue<T extends Listeners, N extends string, U extends string> = Parameters<T[StateEventName<U, N>]>[0]

export type StateKeys<T extends Listeners, U extends string> = string & keyof { [K in keyof T as StateKey<K & string, U>]: unknown }

type NamedChannelBind<T extends Listeners, N extends string, U extends string> = {
  [K in N as `${K}`]: StateValue<T, N, U>
} & {
  [K in N as `set${Capitalize<K>}`]: Dispatch<SetStateAction<StateValue<T, N, U>>>
}

export const SourcePrefix = 'onChange'

export const ExternalPrefix = '$onChange'

export type StateEventName<U extends string, N extends string> = `${U}${Capitalize<N>}`

export function getStateEventName<U extends string, N extends string>(prefix: U, name: N) {
  return `${prefix}${upperFirst(name)}` as const
}

class DefaultValue {}

function noValue(value: any) {
  return value instanceof DefaultValue
}

type Options = { notSyncInitial: boolean, listen: boolean, dispatch: boolean }

function useChannelState<T extends Listeners, N extends StateKeys<T, U>, U extends typeof SourcePrefix | typeof ExternalPrefix>(channel: Channel<T>, name: N, listenName: string, dispatchName: string, initialValue: any, options: Options): NamedChannelBind<T, N, U> {
  const initialValueRef = useRef(initialValue)

  const [initialState, initialized] = useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const snapshots = channel.snapshots as any
    const value = initialValueRef.current
    const snapshot = channel.snapshot(listenName)
    const initial = !noValue(value)
    const offered = !noValue(snapshot)

    if (initial && !offered) {
      snapshots[dispatchName] = [value]
    }
    if (initial) return [value, true]
    if (offered) return [snapshot[0], true]
    return [undefined, false]
  }, [channel, dispatchName, listenName])

  const [value, setValue] = useState(new DefaultValue())

  useEffect(() => {
    initialized && setValue(initialState)
  }, [initialState, initialized])

  useEffect(() => {
    return options.listen ? channel.listen(listenName, setValue as any) : undefined
  }, [channel, listenName, options.listen])

  useEffect(() => {
    if (noValue(value)) {
      return
    }
    options.dispatch && (channel.send as any)(dispatchName, value)
  }, [channel, dispatchName, options.dispatch, value])

  return {
    [`${name}`]: noValue(value) ? undefined : value,
    [`set${upperFirst(name)}`]: setValue,
  } as NamedChannelBind<T, N, U>
}

/**
 * Source State, only sync state to external.
 *
 * Calling `set` state method will emit `onChange` prefixed event.
 *
 * # For example
 *
 * `setMessage` will emit `onChangeMessage` event:
 * ```
 * const { message, setMessage } = useChannelUpState(channel, 'message')
 * ```
 */
export function useChannelSourceState<T extends Listeners, N extends StateKeys<T, typeof SourcePrefix>>(channel: Channel<T>, name: N, initialValue: StateValue<T, N, typeof SourcePrefix> = new DefaultValue(), notSyncInitial = false): NamedChannelBind<T, N, typeof SourcePrefix> {
  return useChannelState(channel, name, getStateEventName(ExternalPrefix, name), getStateEventName(SourcePrefix, name), initialValue, { notSyncInitial, listen: false, dispatch: true })
}

/**
 * External State, only sync state from source.
 *
 * Listening `onChange` prefixed event to update state.
 *
 * # For example
 *
 * `message` will updated by listening on `onChangeMessage` event:
 * ```
 * const { message, setMessage } = useChannelUpState(channel, 'message')
 * ```
 */
export function useChannelExternalState<T extends Listeners, N extends StateKeys<T, typeof SourcePrefix>>(channel: Channel<T>, name: N, initialValue: StateValue<T, N, typeof SourcePrefix> = new DefaultValue(), notSyncInitial = false): NamedChannelBind<T, N, typeof SourcePrefix> {
  return useChannelState(channel, name, getStateEventName(SourcePrefix, name), getStateEventName(ExternalPrefix, name), initialValue, { notSyncInitial, listen: true, dispatch: false })
}

/**
 * Synced Source State, sync between state and external.
 *
 * Calling `set` state method will emit `onChange` prefixed event, and `$onChange` prefixed event will update state.
 *
 * # For example
 *
 * `setMessage` will emit `onChangeMessage` event, and `$onChangeMessage` will be listened to update `message`:
 * ```
 * const { message, setMessage } = useChannelUpState(channel, 'message')
 * ```
 */
export function useChannelSourceStateSync<T extends Listeners, N extends StateKeys<T, typeof SourcePrefix> & StateKeys<T, typeof ExternalPrefix>>(channel: Channel<T>, name: N, initialValue: StateValue<T, N, typeof SourcePrefix> = new DefaultValue(), notSyncInitial = false): NamedChannelBind<T, N, typeof SourcePrefix> {
  return useChannelState(channel, name, getStateEventName(ExternalPrefix, name), getStateEventName(SourcePrefix, name), initialValue, { notSyncInitial, listen: true, dispatch: true })
}

/**
 * Synced External State, sync between state and source.
 *
 * Calling `set` state method will emit `$onChange` prefixed event, and `onChange` prefixed event will update state.
 *
 * # For example
 *
 * `setMessage` will emit `$onChangeMessage` event, and `onChangeMessage` will be listened to update `message`:
 * ```
 * const { message, setMessage } = useChannelDownState(channel, 'message')
 * ```
 */
export function useChannelExternalStateSync<T extends Listeners, N extends StateKeys<T, typeof ExternalPrefix> & StateKeys<T, typeof SourcePrefix>>(channel: Channel<T>, name: N, initialValue: StateValue<T, N, typeof ExternalPrefix> = new DefaultValue(), notSyncInitial = false): NamedChannelBind<T, N, typeof ExternalPrefix> {
  return useChannelState(channel, name, getStateEventName(SourcePrefix, name), getStateEventName(ExternalPrefix, name), initialValue, { notSyncInitial, listen: true, dispatch: true })
}

export class Channel<T extends Listeners> {
  private backwards: Set<Channel<any>> = new Set()
  private forwards: Set<Channel<any>> = new Set()
  private listeners: Partial<Record<keyof T, Listener[]>> = {}
  private snapshots: Partial<{ [k in keyof T]: Parameters<T[k]> }> = {}
  readonly name: string | undefined

  constructor(name?: string) {
    this.name = name
  }

  connect<T1 extends Listeners>(channel?: Channel<T1>) {
    if (channel) {
      this.backwards.add(channel)
      channel.forwards.add(this)
    }
    return this as Channel<T & T1>
  }

  private getForwards(name: keyof T, touches: Set<Channel<any>> = new Set()) {
    const listeners = [...this.listeners[name] || []]
    touches.add(this)
    this.forwards.forEach(e => touches.has(e) || listeners.push(...e.getForwards(name, touches)))
    return listeners
  }

  private getBackwards(name: keyof T, touches: Set<Channel<any>> = new Set()) {
    const listeners = [...this.listeners[name] || []]
    touches.add(this)
    this.backwards.forEach(e => touches.has(e) || listeners.push(...e.getBackwards(name, touches)))
    return listeners
  }

  private getListeners(name: keyof T) {
    const touches: Set<Channel<any>> = new Set()
    return this.getForwards(name, touches).concat(this.getBackwards(name, touches))
  }

  snapshot<N extends keyof T>(name: N): Parameters<T[N]> | DefaultValue {
    for (const channel of this.backwards) {
      if (name in channel.snapshots) {
        return channel.snapshots[name] as never
      }
      else {
        return channel.snapshot(name) as never
      }
    }
    return new DefaultValue()
  }

  send<N extends keyof T>(name: N, ...args: Parameters<T[N]>) {
    this.snapshots[name] = args
    this.getListeners(name).forEach(listener => listener(...args))
  }

  listen<N extends keyof T>(name: N, fn: T[N]) {
    this.listeners[name] = this.listeners[name] || []
    this.listeners[name].includes(fn) || this.listeners[name].push(fn)
    return () => {
      const index = this.listeners[name]?.indexOf(fn)
      index != null && index > -1 && this.listeners[name]!.splice(index, 1)
    }
  }

  off() {
    this.listeners = {}
  }

  get disposal() {
    return () => this.off()
  }

  clearRefs() {
    this.forwards.forEach(e => e.backwards.delete(this))
    this.backwards.forEach(e => e.forwards.delete(this))
    this.listeners = {}
    this.snapshots = {}
  }
}
