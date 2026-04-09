const VALID_CATEGORIES = ['MEALS', 'TRANSPORT', 'ACCOMMODATION', 'OTHER']

export function validateExpense(input: {
  title?: unknown
  amount?: unknown
  category?: unknown
  date?: unknown
}): string[] {
  const errors: string[] = []

  if (!input.title || typeof input.title !== 'string' || input.title.trim() === '') {
    errors.push('title is required')
  } else if (!isNaN(Number(input.title.trim()))) {
    errors.push('title must be descriptive text, not just a number')
  }

  if (typeof input.amount !== 'number' || !Number.isFinite(input.amount) || input.amount <= 0) {
    errors.push('amount must be greater than zero')
  }

  if (!input.category || !VALID_CATEGORIES.includes(input.category as string)) {
    errors.push('category is invalid')
  }

  if (!input.date || typeof input.date !== 'string' || input.date.trim() === '') {
    errors.push('date is required')
  }

  return errors
}
