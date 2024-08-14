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
import { ConnectValtio } from './Valtio'

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
  ConnectValtio,
] as unknown as (FC & { componentName: string })[]

export function App() {
  const initialIndex = Number(window.location.hash.slice(1))
  const [toggle, setToggle] = useState(1)
  const [index, setIndex] = useState(isNaN(initialIndex) || initialIndex < 0 || initialIndex > components.length ? 0 : initialIndex)
  const Component = components[index]
  return (
    <>
      {components.map((e, i) => (
        <button
          key={i}
          onClick={() => {
            setIndex(i)
            window.location.hash = `#${i}`
          }}
        >{e.componentName}
        </button>
      ))}
      <hr />
      <button onClick={() => setToggle(v => v + 1)}>Reload</button>
      <hr />
      <h1>{components[index].componentName}</h1>
      <Component key={toggle} />
    </>
  )
}

createRoot(document.getElementById('root')!).render(
  <App />,
)
