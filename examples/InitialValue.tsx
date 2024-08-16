import { CounterChannel, External, ExternalSync, Source, SourceSync } from '../examples/Components'
import { NONE, useChannel } from 'use-channel'

InitialValue.componentName = 'Initial Value For State'
export function InitialValue() {
  return (
    <>
      <InitialValueCase1 /> <hr />
      <InitialValueCase2 /> <hr />
      <InitialValueCase3 /> <hr />
      <InitialValueCase4 />
    </>
  )
}

export function InitialValueCase1() {
  const channel = useChannel<CounterChannel>('APP')
  return (
    <External channel={channel} initialValue="External">
      <Source channel={channel} initialValue="Source">
        <ExternalSync channel={channel} initialValue="ExternalSync">
          <SourceSync channel={channel} initialValue="SourceSync"></SourceSync>
        </ExternalSync>
      </Source>
    </External>
  )
}

export function InitialValueCase2() {
  const channel = useChannel<CounterChannel>('APP')
  return (
    <External channel={channel} initialValue={NONE}>
      <Source channel={channel} initialValue="Source">
        <ExternalSync channel={channel} initialValue="ExternalSync">
          <SourceSync channel={channel} initialValue="SourceSync"></SourceSync>
        </ExternalSync>
      </Source>
    </External>
  )
}

export function InitialValueCase3() {
  const channel = useChannel<CounterChannel>('APP')
  return (
    <External channel={channel} initialValue={NONE}>
      <Source channel={channel} initialValue={NONE}>
        <ExternalSync channel={channel} initialValue="ExternalSync">
          <SourceSync channel={channel} initialValue="SourceSync"></SourceSync>
        </ExternalSync>
      </Source>
    </External>
  )
}

export function InitialValueCase4() {
  const channel = useChannel<CounterChannel>('APP')
  return (
    <External channel={channel} initialValue={NONE}>
      <Source channel={channel} initialValue={NONE}>
        <ExternalSync channel={channel} initialValue={NONE}>
          <SourceSync channel={channel} initialValue="SourceSync"></SourceSync>
        </ExternalSync>
      </Source>
    </External>
  )
}
