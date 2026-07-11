import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import DayNavigator from '../components/layout/DayNavigator'
import { renderWithProviders } from './testUtils'

describe('DayNavigator', () => {
  it('lays out day label, then calendar left of arrows on the right', () => {
    renderWithProviders(
      <DayNavigator
        date="2026-06-15"
        isToday={false}
        compact
        onPrevious={vi.fn()}
        onNext={vi.fn()}
        onGoToToday={vi.fn()}
      />,
    )

    const calendar = screen.getByRole('button', { name: 'Jump to today' })
    const prev = screen.getByRole('button', { name: 'Previous day' })
    const next = screen.getByRole('button', { name: 'Next day' })
    expect(screen.getByText('Monday')).toBeInTheDocument()
    expect(screen.getByText('June 15')).toBeInTheDocument()
    // Calendar appears before arrows in document order (trailing cluster)
    expect(
      calendar.compareDocumentPosition(prev) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy()
    expect(prev.compareDocumentPosition(next) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })

  it('keeps calendar dormant on today', () => {
    renderWithProviders(
      <DayNavigator
        date="2026-06-15"
        isToday
        compact
        onPrevious={vi.fn()}
        onNext={vi.fn()}
        onGoToToday={vi.fn()}
      />,
    )

    expect(screen.getByRole('button', { name: 'Viewing today' })).toBeDisabled()
  })

  it('calls onGoToToday when the calendar is activated on a historical day', async () => {
    const user = userEvent.setup()
    const onGoToToday = vi.fn()

    renderWithProviders(
      <DayNavigator
        date="2026-06-15"
        isToday={false}
        compact
        onPrevious={vi.fn()}
        onNext={vi.fn()}
        onGoToToday={onGoToToday}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Jump to today' }))
    expect(onGoToToday).toHaveBeenCalledTimes(1)
  })

  it('shows entry meta in non-compact mode', () => {
    renderWithProviders(
      <DayNavigator
        date="2026-06-15"
        isToday={false}
        itemCount={3}
        onPrevious={vi.fn()}
        onNext={vi.fn()}
        onGoToToday={vi.fn()}
      />,
    )

    expect(screen.getByText('3 entries')).toBeInTheDocument()
  })
})
