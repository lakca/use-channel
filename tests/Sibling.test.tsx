import { it } from 'vitest'
import { fireEvent, render } from '@testing-library/react'
import { Siblings } from 'examples/Siblings'

it('Siblings', async () => {
  const { findByText, getByText, unmount } = render(<Siblings />)

  await findByText('Parent Channel: 0')
  await findByText('SiblingOne Channel: 0')
  await findByText('SiblingTwo Channel: 0')
  fireEvent.click(getByText('Parent + 1'))
  await findByText('Parent Channel: 1')
  await findByText('SiblingOne Channel: 1')
  await findByText('SiblingTwo Channel: 1')
  fireEvent.click(getByText('SiblingOne + 1'))
  await findByText('Parent Channel: 2')
  await findByText('SiblingOne Channel: 2')
  await findByText('SiblingTwo Channel: 2')
  fireEvent.click(getByText('SiblingTwo + 1'))
  await findByText('Parent Channel: 3')
  await findByText('SiblingOne Channel: 3')
  await findByText('SiblingTwo Channel: 3')
  unmount()
})
