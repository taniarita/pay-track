import { test, expect } from '@playwright/test'

test.describe('Expense submission and history', () => {
  test.beforeEach(async ({ page }) => {
    await page.context().clearCookies()
    await page.goto('/login')
    await page.getByLabel('Email').fill('employee1@example.com')
    await page.getByLabel('Password').fill('demo1234')
    await page.getByRole('button', { name: 'Sign in' }).click()
    await expect(page).toHaveURL('/employee/expenses', { timeout: 10000 })
  })

  test('employee submits expense and sees it in history with pending badge', async ({ page }) => {
    await page.goto('/employee/submit')
    await expect(page.getByRole('heading', { name: 'Submit Expense' })).toBeVisible()

    await page.getByLabel('Title').fill('Team lunch')
    await page.getByLabel(/Amount/i).fill('75.50')
    await page.getByLabel('Category').selectOption('MEALS')
    await page.getByLabel('Date').fill('2026-04-05')

    await page.getByRole('button', { name: 'Submit expense' }).click()

    await expect(page.getByText(/submitted successfully/i)).toBeVisible({ timeout: 5000 })

    await page.goto('/employee/expenses')
    await expect(page.getByRole('cell', { name: 'Team lunch' }).first()).toBeVisible()
    await expect(page.getByText(/pending/i).first()).toBeVisible()
  })

  test('form shows validation error when title is empty', async ({ page }) => {
    await page.goto('/employee/submit')

    await page.getByLabel(/Amount/i).fill('50')
    await page.getByLabel('Category').selectOption('TRANSPORT')
    await page.getByLabel('Date').fill('2026-04-05')

    await page.getByRole('button', { name: 'Submit expense' }).click()

    await expect(page.getByRole('alert').filter({ hasText: /title/i })).toBeVisible()
    await expect(page).toHaveURL('/employee/submit')
  })
})
