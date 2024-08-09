import { useEffect, useState } from 'react'
import { useChannel } from 'use-channel'

type CounterChannel = {
  onChangeCount: (count: number) => void
}

Disposal.componentName = 'Disposal'
export function Disposal() {
  const [display, setDisplay] = useState(true)

  return (
    <>
      <button onClick={() => setDisplay(v => !v)}>{display ? 'Remove' : 'Mount'}</button>
      {display && <Counter />}
    </>
  )
}

export function Counter() {
  const channel = useChannel<CounterChannel>('App')
  Object.assign(window, channel)
  const listener = () => {}
  useEffect(() => {
    channel.listen('onChangeCount', listener), [channel]
    channel.listen('onChangeCount', listener), [channel]
    return channel.disposal
  }, [channel])
  return <>Dispose</>
}
