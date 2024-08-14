/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect } from 'react'
import { subscribeKey } from 'valtio/utils'

import { Channel, ExternalPrefix, getStateEventName, Listeners, SourcePrefix, StateKeys } from './core'

type Options = { subscribe?: boolean, listen?: boolean }

const DefaultOptions = { subscribe: true, listen: true }

type RawConfig<K, P> = K extends keyof P ? K | [K, keyof P] | [K, keyof P, Options] : [K, keyof P] | [K, keyof P, Options]

type InferRawConfigKey<Config, P> = Config extends keyof P ? Config : Config extends [infer K, keyof P] | [infer K, keyof P, Options] ? K : never

function unifyConfig<K extends string, P>(rawConfig: RawConfig<K, P>) {
  const cfg = (typeof rawConfig === 'string' ? [rawConfig, rawConfig] : rawConfig) as unknown as [K, keyof P, Options]
  if (cfg.length < 2) cfg[1] = cfg[0] as never
  cfg[2] = { ...DefaultOptions, ...cfg[2] }
  return cfg
}

/**
 * Connect with valtio.
 * @param sources Subscribe valtio to send `onChange`, and listen `$onChange` to update valtio.
 *
 * @example
 *
 * ```ts
 * // followings are equivalent:
 * useChannelValtio(channel, store, ['count'])
 * useChannelValtio(channel, store, [['count', 'count']]) // channel#count -> store.count
 * useChannelValtio(channel, store, [['count', 'count', { subscribe: true, listen: true }]])
 * ```
 */
export function useChannelValtio<T extends Listeners, P extends object, S extends StateKeys<T, typeof SourcePrefix>[], Sources extends RawConfig<S[number], P>[] = never>(channel: Channel<T>, proxy: P, sources: Sources): void

/**
 * Connect with valtio.
 * @param sources Subscribe valtio to send `onChange`, and listen `$onChange` to update valtio.
 * @param externals Subscribe valtio to send `$onChange`, and listen `onChange` to update valtio.
 */
export function useChannelValtio<T extends Listeners, P extends object, S extends StateKeys<T, typeof SourcePrefix>[], Sources extends RawConfig<S[number], P>[] = never>(channel: Channel<T>, proxy: P, sources: Sources, externals: RawConfig<Exclude<StateKeys<T, typeof ExternalPrefix>, InferRawConfigKey<Sources[number], P>>, P>[]): void

export function useChannelValtio<T extends Listeners, P extends object, S extends StateKeys<T, typeof SourcePrefix>[], Sources extends RawConfig<S[number], P>[] = never>(channel: Channel<T>, proxy: P, sources: Sources, externals?: RawConfig<Exclude<StateKeys<T, typeof ExternalPrefix>, InferRawConfigKey<Sources[number], P>>, P>[]): void {
  useEffect(() => {
    const disposals: (() => void)[] = []

    const unifiedSources = sources?.map(s => unifyConfig(s))
    const names = unifiedSources.map(e => e[0])
    const unifiedExternals = externals?.map(s => unifyConfig(s))

    unifiedSources?.forEach(([name, storeKey, { subscribe, listen }]) => {
      subscribe && disposals.push(subscribeKey(proxy, storeKey, value => (channel.send as any)(getStateEventName(SourcePrefix, name), value)))
      listen && disposals.push(channel.listen(getStateEventName(ExternalPrefix, name), ((value: any) => (proxy[storeKey] = value)) as any))
    })
    unifiedExternals?.filter(e => !names?.includes(e[0])).forEach(([name, storeKey, { subscribe, listen }]) => {
      subscribe && disposals.push(subscribeKey(proxy, storeKey, value => (channel.send as any)(getStateEventName(ExternalPrefix, name), value)))
      listen && disposals.push(channel.listen(getStateEventName(SourcePrefix, name), ((value: any) => (proxy[storeKey] = value)) as any))
    })
    return () => disposals.forEach(f => f())
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channel, proxy])
}
