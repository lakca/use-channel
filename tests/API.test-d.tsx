import { render } from '@testing-library/react'
import { TwoWayChannel, useChannel, useChannelExternalState, useChannelExternalStateSync, useChannelSourceState, useChannelSourceStateSync, useChannelState, SourcePrefix, ExternalPrefix, getStateEventName, StateKey, useChannelRef, PropsWithChannel, StateValue, Channel, StateKeys } from 'use-channel'
import { it, expectTypeOf, expect, describe } from 'vitest'

describe('Test API', () => {
  it('State Name <-> Event Name', () => {
    expectTypeOf('dusevMzfG' as const).toEqualTypeOf<StateKey<'onChangeDusevMzfG', typeof SourcePrefix>>()
    expectTypeOf('dusevMzfG' as const).toEqualTypeOf<StateKey<'$onChangeDusevMzfG', typeof ExternalPrefix>>()

    expect(getStateEventName(SourcePrefix, 'dusevMzfG')).toBe('onChangeDusevMzfG')
    expect(getStateEventName(ExternalPrefix, 'dusevMzfG')).toBe('$onChangeDusevMzfG')

    expectTypeOf('' as unknown as StateKeys<TwoWayChannel<{
      onChangeA: (v: number) => void
      onChangeB: (v: number) => void
      onChangeC: (v: number) => void
    }>, typeof SourcePrefix>).toEqualTypeOf<'a' | 'b' | 'c'>()
    expectTypeOf('' as unknown as StateKeys<TwoWayChannel<{
      onChangeA: (v: number) => void
      onChangeB: (v: number) => void
      onChangeC: (v: number) => void
    }>, typeof ExternalPrefix>).toEqualTypeOf<'a' | 'b' | 'c'>()
    expectTypeOf('' as unknown as StateKeys<TwoWayChannel<{
      onChangeA: (v: number) => void
      onChangeB: (v: number) => void
      onChangeC: (v: number) => void
    }, 'onChangeA' | 'onChangeB'>, typeof SourcePrefix>).toEqualTypeOf<'a' | 'b' | 'c'>()
    expectTypeOf('' as unknown as StateKeys<TwoWayChannel<{
      onChangeA: (v: number) => void
      onChangeB: (v: number) => void
      onChangeC: (v: number) => void
    }, 'onChangeA' | 'onChangeB'>, typeof ExternalPrefix>).toEqualTypeOf<'a' | 'b'>()
  })

  it('State Value', () => {
    class V {}
    type TestChannel = TwoWayChannel<{ onChangeAotEjULBJwMwYJAqYlqUqDbkf: (v: V) => void }>
    expectTypeOf('' as unknown as StateValue<TestChannel, 'aotEjULBJwMwYJAqYlqUqDbkf', typeof SourcePrefix>).toEqualTypeOf<V>()
    expectTypeOf('' as unknown as StateValue<TestChannel, 'aotEjULBJwMwYJAqYlqUqDbkf', typeof ExternalPrefix>).toEqualTypeOf<V>()
  })

  it('PropsWithChannel', () => {
    type TestChannel = TwoWayChannel<{
      onChangeValuexWBqUycoCcDdk: (v: number) => void
    }>
    expectTypeOf({ }).toMatchTypeOf<PropsWithChannel<TestChannel, Record<string, never>>>()
    // eslint-disable-next-line @typescript-eslint/ban-types
    expectTypeOf({ channel: {} as Channel<TestChannel> }).toMatchTypeOf<PropsWithChannel<TestChannel, {}>>()
  })

  it('Test Hooks Return', () => {
    type TestChannel = TwoWayChannel<{
      onChangeValuexWBqUycoCcDdk: (v: number) => void
    }>

    function App() {
      const channel = useChannel<TestChannel>('Test')

      expectTypeOf(useChannelSourceState(channel, 'valuexWBqUycoCcDdk')).toMatchTypeOf<{ valuexWBqUycoCcDdk: number, setValuexWBqUycoCcDdk: (v: number) => void }>()
      expectTypeOf(useChannelSourceStateSync(channel, 'valuexWBqUycoCcDdk')).toMatchTypeOf<{ valuexWBqUycoCcDdk: number, setValuexWBqUycoCcDdk: (v: number) => void }>()
      expectTypeOf(useChannelExternalState(channel, 'valuexWBqUycoCcDdk')).toMatchTypeOf<{ valuexWBqUycoCcDdk: number, setValuexWBqUycoCcDdk: (v: number) => void }>()
      expectTypeOf(useChannelExternalStateSync(channel, 'valuexWBqUycoCcDdk')).toMatchTypeOf<{ valuexWBqUycoCcDdk: number, setValuexWBqUycoCcDdk: (v: number) => void }>()
      expectTypeOf(useChannelState('Source', channel, 'valuexWBqUycoCcDdk')).toMatchTypeOf<{ valuexWBqUycoCcDdk: number, setValuexWBqUycoCcDdk: (v: number) => void }>()
      expectTypeOf(useChannelState('SourceSync', channel, 'valuexWBqUycoCcDdk')).toMatchTypeOf<{ valuexWBqUycoCcDdk: number, setValuexWBqUycoCcDdk: (v: number) => void }>()
      expectTypeOf(useChannelState('External', channel, 'valuexWBqUycoCcDdk')).toMatchTypeOf<{ valuexWBqUycoCcDdk: number, setValuexWBqUycoCcDdk: (v: number) => void }>()
      expectTypeOf(useChannelState('ExternalSync', channel, 'valuexWBqUycoCcDdk')).toMatchTypeOf<{ valuexWBqUycoCcDdk: number, setValuexWBqUycoCcDdk: (v: number) => void }>()

      expectTypeOf(useChannelRef(channel, 'valuexWBqUycoCcDdk')).toMatchTypeOf<{ current: number }>()

      return <></>
    }
    const { unmount } = render(<App />)
    unmount()
  })
})
