/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect } from 'react'
import { subscribeKey } from 'valtio/utils'

import { Channel, ExternalPrefix, getStateEventName, Listeners, SourcePrefix, StateEventName, StateKeys } from './core'

type ProxyShould<T extends Listeners, S extends string, E extends string> = {
  [K in S]: Parameters<T[StateEventName<typeof SourcePrefix, K>]>[0]
} & {
  [K in E]: Parameters<T[StateEventName<typeof ExternalPrefix, K>]>[0]
}

/**
 * valtio
 */
export function useChannelValtio<T extends Listeners, P extends ProxyShould<T, S[number], E[number]>, S extends StateKeys<T, typeof SourcePrefix>[], E extends Exclude<StateKeys<T, typeof ExternalPrefix>, S[number]>[] = never>(channel: Channel<T>, proxy: P, { sources, externals }: { sources?: S, externals?: E }) {
  useEffect(() => {
    sources?.forEach((e) => {
      subscribeKey(proxy, e, value => (channel.send as any)(getStateEventName(SourcePrefix, e), value))
      channel.listen(getStateEventName(ExternalPrefix, e), ((value: any) => (proxy[e] = value)) as any)
    })
    externals?.filter(e => !sources?.includes(e)).forEach((e) => {
      subscribeKey(proxy, e, value => (channel.send as any)(getStateEventName(ExternalPrefix, e), value))
      channel.listen(getStateEventName(SourcePrefix, e), ((value: any) => (proxy[e] = value)) as any)
    })
    return channel.off()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channel, proxy])
}
