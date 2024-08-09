import { it } from 'vitest'
import { fireEvent, render } from '@testing-library/react'
import { ReverseState } from 'examples/ReverseState'

it('Reverse State Sync', async () => {
  const { findByText, getByText, unmount } = render(<ReverseState />)
  await findByText('Parent: 0')
  await findByText('Counter: 0')
  fireEvent.click(getByText('Parent + 1'))
  await findByText('Parent: 1')
  await findByText('Counter: 0')
  fireEvent.click(getByText('Counter + 1'))
  await findByText('Counter: 1')
  await findByText('Parent: 1')
  unmount()
})
