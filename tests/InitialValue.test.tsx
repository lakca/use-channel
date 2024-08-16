/* eslint-disable @typescript-eslint/no-unused-vars */
import { describe, it } from 'vitest'
import { render } from '@testing-library/react'
import { InitialValueCase1, InitialValueCase2, InitialValueCase3, InitialValueCase4 } from 'examples/InitialValue'

describe('Test InitialValue', () => {
  it('InitialValueCase1', async () => {
    const { findByText, unmount } = render(<InitialValueCase1 />)
    await findByText('External: External')
    await findByText('Source: External')
    await findByText('ExternalSync: External')
    await findByText('SourceSync: External')
    unmount()
  })
  it('InitialValueCase2', async () => {
    const { findByText, unmount } = render(<InitialValueCase2 />)
    await findByText('External: Source')
    await findByText('Source: Source')
    await findByText('ExternalSync: Source')
    await findByText('SourceSync: Source')
    unmount()
  })
  it('InitialValueCase3', async () => {
    const { findByText, unmount } = render(<InitialValueCase3 />)
    await findByText('External:')
    await findByText('Source:')
    await findByText('ExternalSync: ExternalSync')
    await findByText('SourceSync: ExternalSync')
    unmount()
  })
  it('InitialValueCase4', async () => {
    const { findByText, unmount } = render(<InitialValueCase4 />)
    await findByText('External: SourceSync')
    await findByText('Source:')
    await findByText('ExternalSync: SourceSync')
    await findByText('SourceSync: SourceSync')
    unmount()
  })
})
