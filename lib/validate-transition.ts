export function validateTransition(
  current: string,
  next: string
): string | null {
  if (current !== 'PENDING') return 'expense is already decided'
  if (next !== 'APPROVED' && next !== 'REJECTED') return 'invalid target status'
  return null
}
