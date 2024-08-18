import { it } from 'vitest'
import { fireEvent, render } from '@testing-library/react'
import { Disposal } from 'examples/Disposal'

it('Disposal', async () => {
  const { findByText, getByTestId, unmount } = render(<Disposal />)

  await findByText('Channel 1 Listeners Count: 3')
  await findByText('Channel 2 Listeners Count: 2')
  fireEvent.click(getByTestId('toggle'))
  await findByText('Channel 1 Listeners Count: 0')
  await findByText('Channel 2 Listeners Count: 0')
  fireEvent.click(getByTestId('toggle'))
  await findByText('Channel 1 Listeners Count: 3')
  await findByText('Channel 2 Listeners Count: 2')
  fireEvent.click(getByTestId('toggle'))
  await findByText('Channel 1 Listeners Count: 0')
  await findByText('Channel 2 Listeners Count: 0')
  unmount()
})
