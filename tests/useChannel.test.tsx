import { expect, it, vi } from 'vitest'
import { useEffect, useState } from 'react'
import { fireEvent, render } from '@testing-library/react'
import { Channel, useChannel } from 'use-channel'

type CounterChannel = {
  onChangeCount: (count: number) => void
}

it('Reverse Data Flow', async () => {
  function App() {
    const channel = useChannel<CounterChannel>('App')
    const [count, setCount] = useState(0)
    useEffect(() => channel.listen('onChangeCount', setCount), [channel])
    return (
      <>
        <h1>{count}</h1>
        <Counter channel={channel} count={count} />
      </>
    )
  }
  function Counter({ count, channel: rcvChannel }: { count: number, channel: Channel<CounterChannel> }) {
    const channel = useChannel('Counter').connect(rcvChannel)
    return (
      <button onClick={() => channel.send('onChangeCount', count + 1)}>+ 1</button>
    )
  }
  const { findByText, getByText, unmount } = render(<App />)
  await findByText('0')
  fireEvent.click(getByText('+ 1'))
  await findByText('1')
  unmount()
})

it('Dispose listeners', async () => {
  let ch: Channel<CounterChannel> | null = null
  const listener = vi.fn(() => {})
  function App() {
    const channel = ch = useChannel<CounterChannel>('App')
    useEffect(() => {
      channel.listen('onChangeCount', listener), [channel]
      channel.listen('onChangeCount', listener), [channel]
      return channel.disposal
    }, [channel])
    return <>Dispose</>
  }
  const { unmount } = render(<App />)
  unmount()
  ch!.send('onChangeCount', 0)
  ch!.send('onChangeCount', 0)
  ch!.send('onChangeCount', 0)
  ch!.send('onChangeCount', 0)
  expect(listener).toHaveBeenCalledTimes(0)
})
