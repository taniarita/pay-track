import { test, expect } from '@playwright/test'

test.describe('Expense submission and history', () => {
  test.beforeEach(async ({ page }) => {
    await page.context().clearCookies()
    await page.goto('/login')
    await page.fill('input[name="email"]', 'employee1@example.com')
    await page.fill('input[name="password"]', 'demo1234')
    await page.click('button[type="submit"]')
    await expect(page).toHaveURL('/employee/expenses', { timeout: 10000 })
  })

  test('employee submits expense and sees it in history with pending badge', async ({ page }) => {
    await page.goto('/employee/submit')
    await expect(page.getByRole('heading', { name: 'Submit Expense' })).toBeVisible()

    await page.fill('input[name="title"]', 'Team lunch')
    await page.fill('input[name="amount"]', '75.50')
    await page.selectOption('select[name="category"]', 'MEALS')
    await page.fill('input[name="date"]', '2026-04-05')

    await page.click('button[type="submit"]')

    await expect(page.getByText(/submitted successfully/i)).toBeVisible({ timeout: 5000 })

    await page.goto('/employee/expenses')
    await expect(page.getByText('Team lunch')).toBeVisible()
    await expect(page.getByText(/pending/i).first()).toBeVisible()
  })

  test('form shows validation error when title is empty', async ({ page }) => {
    await page.goto('/employee/submit')

    await page.fill('input[name="amount"]', '50')
    await page.selectOption('select[name="category"]', 'TRANSPORT')
    await page.fill('input[name="date"]', '2026-04-05')

    await page.click('button[type="submit"]')

    await expect(page.getByText(/title/i)).toBeVisible()
    await expect(page).toHaveURL('/employee/submit')
  })
})
