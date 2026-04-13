import { describe, it, expect } from 'vitest'
import { validateExpense } from '@/lib/validate-expense'

describe('validateExpense', () => {
  const valid = {
    title: 'Team lunch',
    amount: 50,
    category: 'MEALS',
    date: '2026-04-01',
  }

  it('returns no errors for valid input', () => {
    expect(validateExpense(valid)).toEqual([])
  })

  it('returns error when title is missing', () => {
    const errors = validateExpense({ ...valid, title: '' })
    expect(errors).toContain('title is required')
  })

  it('returns error when title is purely numeric', () => {
    const errors = validateExpense({ ...valid, title: '123' })
    expect(errors).toContain('title must be descriptive text, not just a number')
  })

  it('returns error when amount is zero', () => {
    const errors = validateExpense({ ...valid, amount: 0 })
    expect(errors).toContain('amount must be greater than zero')
  })

  it('returns error when amount is negative', () => {
    const errors = validateExpense({ ...valid, amount: -10 })
    expect(errors).toContain('amount must be greater than zero')
  })

  it('returns error when amount is NaN', () => {
    const errors = validateExpense({ ...valid, amount: NaN })
    expect(errors).toContain('amount must be greater than zero')
  })

  it('returns error when category is invalid', () => {
    const errors = validateExpense({ ...valid, category: 'FLIGHTS' })
    expect(errors).toContain('category is invalid')
  })

  it('returns error when date is missing', () => {
    const errors = validateExpense({ ...valid, date: '' })
    expect(errors).toContain('date is required')
  })

  it('returns multiple errors at once', () => {
    const errors = validateExpense({ title: '', amount: -1, category: 'BAD', date: '' })
    expect(errors).toHaveLength(4)
  })
})
