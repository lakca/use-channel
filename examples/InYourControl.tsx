import { Channel, TwoWayChannel, useChannel, useChannelExternalState, useChannelExternalStateSync, useChannelSourceState, useChannelSourceStateSync } from 'use-channel'

type CounterChannel = TwoWayChannel<{
  onChangePub: (count: number) => void
  onChangePri: (count: number) => void
}>

export function InYourControl() {
  const channel = useChannel<CounterChannel>('Parent')
  Object.assign(window, { channel })
  const { pub, setPub } = useChannelExternalStateSync(channel, 'pub', 0)
  const { pri, setPri } = useChannelExternalStateSync(channel, 'pri', 0)
  const { pub: pub2, setPub: setPub2 } = useChannelExternalState(channel, 'pub', 0)
  return (
    <>
      <blockquote>Sync state or not total in your control.</blockquote>
      <h2>Public: {pub}</h2>
      <h2>Public (Privately): {pub2}</h2>
      <h2>Private: {pri}</h2>
      <p><code>useChannelExternalStateSync(channel, 'pub')</code> Will sync outside by listen <code>onChangeCount</code> and emit <code>$onChangeCount</code></p>
      <button onClick={() => setPub(v => v + 1)}>Public + 1</button>
      <p>Although here use <code>useChannelExternalStateSync(channel, 'pri')</code>, but <code>Private</code> will ignore change emission since <code>useChannelSourceState</code> used by it.</p>
      <button onClick={() => setPri(v => v + 1)}>Private + 1</button>
      <p>Here use <code>useChannelExternalState(channel, 'pub')</code>, so change will not be emitted outside.</p>
      <button onClick={() => setPub2(v => v + 1)}>Public + 1</button>
      <hr />
      <Public channel={channel} />
      <hr />
      <Private channel={channel} />
    </>
  )
}

export function Public({ channel: rcvChannel }: { channel: Channel<CounterChannel> }) {
  const channel = useChannel('Public').connect(rcvChannel)
  const { pub, setPub } = useChannelSourceStateSync(channel, 'pub', 0)
  return (
    <>
      <h2>Public: {pub}</h2>
      <p><code>useChannelSourceStateSync(channel, 'pub')</code> Will emit <code>onChangeCount</code> and listen <code>$onChangeCount</code></p>
      <button onClick={() => setPub(v => v + 1)}>Public + 1</button>
    </>
  )
}

export function Private({ channel: rcvChannel }: { channel: Channel<CounterChannel> }) {
  const channel = useChannel('Private').connect(rcvChannel)
  const { pri, setPri } = useChannelSourceState(channel, 'pri', 0)
  return (
    <>
      <h2>Private: {pri}</h2>
      <p><code>useChannelSourceState(channel, 'pri')</code> Will emit change but ignore outside changes (<del><code>$onChangeCount</code></del>).</p>
      <button onClick={() => setPri(v => v + 1)}>Private + 1</button>
    </>
  )
}
