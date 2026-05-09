import { describe, it, expect } from 'vitest'
import { validateTransition } from '@/lib/validate-transition'

describe('validateTransition', () => {
  it('allows PENDING → APPROVED', () => {
    expect(validateTransition('PENDING', 'APPROVED')).toBeNull()
  })

  it('allows PENDING → REJECTED', () => {
    expect(validateTransition('PENDING', 'REJECTED')).toBeNull()
  })

  it('rejects APPROVED → REJECTED', () => {
    expect(validateTransition('APPROVED', 'REJECTED')).toBe('expense is already decided')
  })

  it('rejects REJECTED → APPROVED', () => {
    expect(validateTransition('REJECTED', 'APPROVED')).toBe('expense is already decided')
  })

  it('rejects APPROVED → APPROVED', () => {
    expect(validateTransition('APPROVED', 'APPROVED')).toBe('expense is already decided')
  })

  it('rejects REJECTED → REJECTED', () => {
    expect(validateTransition('REJECTED', 'REJECTED')).toBe('expense is already decided')
  })
})
