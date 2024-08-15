import { createRoot } from 'react-dom/client'
import { ChannelNet } from './ChannelNet'
import { ReverseState } from './ReverseState'
import { FC, useState } from 'react'
import { Disposal } from './Disposal'
import { GC } from './GC'
import { TwoWayState } from './TwoWayState'
import { InYourControl } from './InYourControl'
import { Starter } from './Starter'
import { Siblings } from './Siblings'
import { Event } from './Event'
import { InitialValue } from './InitialValue'
import { ChannelRef } from './Ref'

const components = [
  Starter,
  ReverseState,
  TwoWayState,
  Siblings,
  ChannelRef,
  ChannelNet,
  InitialValue,
  InYourControl,
  Disposal,
  GC,
  Event,
] as unknown as (FC & { componentName: string })[]

export function App() {
  const [id, setName] = useState<number>(0)
  const [toggle, setToggle] = useState(1)
  const Component = components[id]
  return (
    <>
      {components.map((e, i) => <button key={i} onClick={() => setName(i)}>{e.componentName}</button>)}
      <hr />
      <button onClick={() => setToggle(v => v + 1)}>Reload</button>
      <hr />
      <h1>{components[id].componentName}</h1>
      <Component key={toggle} />
    </>
  )
}

createRoot(document.getElementById('root')!).render(
  <App />,
)
