/* eslint-disable @typescript-eslint/no-explicit-any */
import { Dispatch, MutableRefObject, SetStateAction, useEffect, useMemo, useRef, useState } from 'react'
import { lowerFirst, upperFirst, useSyncEffect, useMounted, useOnce } from './utils'

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

export type ChannelStateEventName<T extends Listeners, S extends string = typeof SourcePrefix, E extends string = typeof ExternalPrefix> = keyof {
  [k in StateKeys<T, S> as `${S}${Capitalize<k>}`]: null
} | keyof {
  [k in StateKeys<T, E> as `${E}${Capitalize<k>}`]: null
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

export function getEventStateName<U extends string, E extends string>(prefix: U, name: E) {
  return name.startsWith(prefix) ? lowerFirst(name.slice(prefix.length)) as StateKey<E, U> : null
}

class Singleton {}

export const NONE = new Singleton()

function noValue(value: any | typeof NONE): value is typeof NONE {
  return value === NONE
}

type Options = {
  /** Initialize state does not count on connected channels, also will not emit initial state to connected channels. */
  notSyncInitial: boolean
  listen: boolean
  dispatch: boolean
}

function _useChannelState<T extends Listeners, N extends StateKeys<T, U>, U extends typeof SourcePrefix | typeof ExternalPrefix>(channel: Channel<T>, name: N, listenName: string, dispatchName: string, initialValue: any, options: Options): NamedChannelBind<T, N, U> {
  initialValue = useRef(initialValue).current
  options = useRef(options).current
  const mounted = useMounted()

  const [initialState, shouldDispatchInitialState] = useOnce(() => {
    if (options.notSyncInitial) {
      return [noValue(initialValue) ? undefined : initialValue, false]
    }
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const snapshots = channel.snapshots as any
    const snapshot = channel.snapshot(name)
    const initial = !noValue(initialValue)
    const offered = !noValue(snapshot)

    if (initial && !offered) {
      snapshots[name] = [initialValue]
    }
    if (offered) return [snapshot[0], false]
    if (initial) return [initialValue, true]
    return [undefined, false]
  // eslint-disable-next-line react-hooks/exhaustive-deps
  })

  const [value, setValue] = useState(initialState)

  useEffect(() => {
    // shouldDispatchInitialState && setValue(initialState)
    shouldDispatchInitialState && options.dispatch && (channel.send as any)(dispatchName, value)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useSyncEffect(() => {
    return options.listen ? channel.listen(listenName, setValue as any) : undefined
  }, [channel, listenName, options.listen])

  useEffect(() => {
    if (mounted && options.dispatch) {
      options.dispatch && (channel.send as any)(dispatchName, value)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channel, dispatchName, options.dispatch, value])

  return {
    [`${name}`]: value,
    [`set${upperFirst(name)}`]: setValue,
  } as NamedChannelBind<T, N, U>
}

export type ChannelStateType = 'Source' | 'External' | 'SourceSync' | 'ExternalSync'

type ChannelStateName<T extends Listeners, K extends ChannelStateType> =
   'Source' extends K ? StateKeys<T, typeof SourcePrefix> :
     'External' extends K ? StateKeys<T, typeof SourcePrefix> :
       'SourceSync' extends K ? StateKeys<T, typeof SourcePrefix> & StateKeys<T, typeof ExternalPrefix> :
         'ExternalSync' extends K ? StateKeys<T, typeof ExternalPrefix> & StateKeys<T, typeof SourcePrefix> : never

function getStateConfig<K extends ChannelStateType, N extends string>(type: K, name: N) {
  switch (type) {
    case 'Source':
      return {
        listenerName: getStateEventName(ExternalPrefix, name),
        dispatchName: getStateEventName(SourcePrefix, name),
        options: { listen: false, dispatch: true },
      }
    case 'SourceSync':
      return {
        listenerName: getStateEventName(ExternalPrefix, name),
        dispatchName: getStateEventName(SourcePrefix, name),
        options: { listen: true, dispatch: true },
      }
    case 'External':
      return {
        listenerName: getStateEventName(SourcePrefix, name),
        dispatchName: getStateEventName(ExternalPrefix, name),
        options: { listen: true, dispatch: false },
      }
    case 'ExternalSync':
      return {
        listenerName: getStateEventName(SourcePrefix, name),
        dispatchName: getStateEventName(ExternalPrefix, name),
        options: { listen: true, dispatch: true },
      }
  }
}

/**
 * Prefer to use standalone hooks:
 * - {@link useChannelSourceState}
 * - {@link useChannelSourceStateSync}
 * - {@link useChannelExternalState}
 * - {@link useChannelExternalStateSync}
 */
export function useChannelState<T extends Listeners, K extends ChannelStateType, N extends ChannelStateName<T, K>>(type: K, channel: Channel<T>, name: N, initialValue: StateValue<T, N, typeof SourcePrefix> = NONE, notSyncInitial = false): NamedChannelBind<T, N, typeof SourcePrefix> {
  const { listenerName, dispatchName, options } = getStateConfig(type, name)!
  return _useChannelState(channel, name, listenerName, dispatchName, initialValue, { ...options, notSyncInitial })
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
 * const { message, setMessage } = useChannelSourceState(channel, 'message')
 * ```
 */
export function useChannelSourceState<T extends Listeners, N extends ChannelStateName<T, 'Source'>>(channel: Channel<T>, name: N, initialValue: StateValue<T, N, typeof SourcePrefix> = NONE, notSyncInitial = false): NamedChannelBind<T, N, typeof SourcePrefix> {
  return useChannelState('Source', channel, name, initialValue, notSyncInitial)
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
 * const { message, setMessage } = useChannelExternalState(channel, 'message')
 * ```
 */
export function useChannelExternalState<T extends Listeners, N extends ChannelStateName<T, 'External'>>(channel: Channel<T>, name: N, initialValue: StateValue<T, N, typeof SourcePrefix> = NONE, notSyncInitial = false): NamedChannelBind<T, N, typeof SourcePrefix> {
  return useChannelState('External', channel, name, initialValue, notSyncInitial)
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
 * const { message, setMessage } = useChannelSourceStateSync(channel, 'message')
 * ```
 */
export function useChannelSourceStateSync<T extends Listeners, N extends ChannelStateName<T, 'SourceSync'>>(channel: Channel<T>, name: N, initialValue: StateValue<T, N, typeof SourcePrefix> = NONE, notSyncInitial = false): NamedChannelBind<T, N, typeof SourcePrefix> {
  return useChannelState('SourceSync', channel, name, initialValue, notSyncInitial)
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
 * const { message, setMessage } = useChannelExternalStateSync(channel, 'message')
 * ```
 */
export function useChannelExternalStateSync<T extends Listeners, N extends ChannelStateName<T, 'ExternalSync'>>(channel: Channel<T>, name: N, initialValue: StateValue<T, N, typeof ExternalPrefix> = NONE, notSyncInitial = false): NamedChannelBind<T, N, typeof ExternalPrefix> {
  return useChannelState('ExternalSync', channel, name, initialValue, notSyncInitial)
}

type RefOptions = {
  /** whether dispatch event when current changed. */
  dispatch?: boolean
  /** whether is source ref, i.e. listen `$onChange` instead of `onChange`. It's usually uncommon to set this option */
  source?: boolean
}

/**
 * Ref instead of State.
 *
 * Typically used as an alternative to *passing a ref*, to proactively get the internal state of other components. The difference from state is no rerendering triggered.
 *
 * ```typescript
 * // followings are equivalent:
 * useChannelRef(channel, 'value')
 * useChannelRef(channel, 'value', { dispatch: false })
 * useChannelRef(channel, 'value', { dispatch: false, source: false })
 * ```
 */
export function useChannelRef<T extends Listeners, N extends StateKeys<T, U>, U extends typeof SourcePrefix | typeof ExternalPrefix>(channel: Channel<T>, name: N, options?: RefOptions) {
  options = { dispatch: false, source: false, ...options }
  const ref = useRef<StateValue<T, N, U>>()
  const listenName = getStateEventName(options.source ? ExternalPrefix : SourcePrefix, name)
  const dispatchName = getStateEventName(options.source ? SourcePrefix : ExternalPrefix, name)

  const refProxy = useMemo<MutableRefObject<StateValue<T, N, U>>>(() => Object.create(null, {
    current: {
      get() {
        return ref.current
      },
      set(v: StateValue<T, N, U>) {
        ref.current = v
        options.dispatch && (channel.send as any)(dispatchName, v)
      },
    },
  }), [channel.send, dispatchName, options.dispatch])

  useSyncEffect(() => {
    return channel.listen(listenName, ((v: any) => {
      ref.current = v
    }) as any)
  }, [channel, listenName])

  return refProxy
}

export class Channel<T extends Listeners, S extends string = typeof SourcePrefix, E extends string = typeof ExternalPrefix> {
  private backwards: Set<Channel<any>> = new Set()
  private forwards: Set<Channel<any>> = new Set()
  private listeners: Partial<Record<keyof T, Listener[]>> = {}
  private snapshots: Partial<{ [k in StateKeys<T, S> & StateKeys<T, E>]: Parameters<T[k]> }> = {}
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

  private traverse(
    getConnections: (channel: Channel<any>) => Channel<any>[],
    callback: (channel: Channel<any>) => boolean,
    touches: Set<Channel<any>> = new Set(),
  ) {
    let end = false
    getConnections(this).some((channel: Channel<any>) => {
      if (!touches.has(channel)) {
        touches.add(channel)
        end = callback(channel)
        return end || channel.traverse(getConnections, callback, touches)
      }
    })
    return end
  }

  private getListeners(name: keyof T, touches: Set<Channel<any>> = new Set()) {
    const listeners = [...(this.listeners[name] || [])]
    touches.add(this)
    this.traverse(
      channel => [...channel.backwards, ...channel.forwards],
      (channel) => {
        listeners.push(...channel.getListeners(name, touches))
        return false
      }, touches)
    return listeners
  }

  private static getSnapValue<T extends Listeners, N extends keyof T>(channel: Channel<T>, name: N) {
    return name in channel.snapshots ? channel.snapshots[name] as any : NONE
  }

  snapshot<N extends keyof T>(name: N): Parameters<T[N]> | typeof NONE {
    let found = Channel.getSnapValue(this, name)
    found === NONE && this.traverse(
      channel => [...channel.backwards, ...channel.forwards],
      (channel) => {
        found = Channel.getSnapValue(channel, name)
        return found !== NONE
      })
    return found
  }

  send<N extends keyof T>(name: N, ...args: Parameters<T[N]>) {
    const stateEventName = name as ChannelStateEventName<T, S, E>
    const stateName = getEventStateName(SourcePrefix, stateEventName) || getEventStateName(ExternalPrefix, stateEventName)
    if (stateName) (this.snapshots as any)[stateName] = args
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
