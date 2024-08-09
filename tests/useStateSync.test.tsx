import { it } from 'vitest'
import { fireEvent, render } from '@testing-library/react'
import { Channel, TwoWayChannel, useChannel, useChannelExternalStateSync, useChannelSourceStateSync } from 'use-channel'

type CounterChannel = TwoWayChannel<{
  onChangeCount: (count: number) => void
}>

it('Two-Way State Sync', async () => {
  function App() {
    const channel = useChannel<CounterChannel>('App')
    const { count } = useChannelExternalStateSync(channel, 'count', 0)
    return (
      <>
        <h1>{count}</h1>
        <Counter channel={channel} />
      </>
    )
  }
  function Counter({ channel: rcvChannel }: { channel: Channel<CounterChannel> }) {
    const channel = useChannel('Counter').connect(rcvChannel)
    const { setCount } = useChannelSourceStateSync(channel, 'count')
    return (
      <button onClick={() => setCount(count => count + 1)}>+ 1</button>
    )
  }
  const { findByText, getByText, unmount } = render(<App />)
  await findByText('0')
  fireEvent.click(getByText('+ 1'))
  await findByText('1')
  unmount()
})
