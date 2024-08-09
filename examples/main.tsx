import { createRoot } from 'react-dom/client'
import { ChannelNet } from './ChannelNet'
import { ReverseState } from './ReverseState'
import { useState } from 'react'
import { Disposal } from './Disposal'
import { GC } from './GC'
import { TwoWayState } from './TwoWayState'
import { InYourControl } from './InYourControl'

const components = [
  ReverseState,
  TwoWayState,
  InYourControl,
  ChannelNet,
  Disposal,
  GC,
]

export function App() {
  const [id, setName] = useState<number>(0)
  const Component = components[id]
  return (
    <>
      {components.map((e, i) => <button key={i} onClick={() => setName(i)}>{e.name}</button>)}
      <h1>{components[id].name}</h1>
      <Component />
    </>
  )
}

createRoot(document.getElementById('root')!).render(
  <App />,
)
