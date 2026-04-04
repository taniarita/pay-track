import { test, expect } from '@playwright/test'

test.describe('Login flow', () => {
  test.beforeEach(async ({ page }) => {
    // Clear cookies between tests
    await page.context().clearCookies()
  })

  test('employee login redirects to /employee/expenses', async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[name="email"]', 'employee1@example.com')
    await page.fill('input[name="password"]', 'demo1234')
    await page.click('button[type="submit"]')

    await expect(page).toHaveURL('/employee/expenses', { timeout: 10000 })
    await expect(page.getByRole('heading', { name: 'My Expenses' })).toBeVisible()
  })

  test('manager login redirects to /manager/expenses', async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[name="email"]', 'manager1@example.com')
    await page.fill('input[name="password"]', 'demo1234')
    await page.click('button[type="submit"]')

    await expect(page).toHaveURL('/manager/expenses', { timeout: 10000 })
    await expect(page.getByRole('heading', { name: 'Expense Review Queue' })).toBeVisible()
  })

  test('wrong password shows error message', async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[name="email"]', 'employee1@example.com')
    await page.fill('input[name="password"]', 'wrongpassword')
    await page.click('button[type="submit"]')

    await expect(page.getByRole('alert')).toBeVisible()
    await expect(page).toHaveURL('/login')
  })

  test('visiting protected route without session redirects to /login', async ({ page }) => {
    await page.goto('/employee/expenses')
    await expect(page).toHaveURL('/login', { timeout: 10000 })
  })

  test('logout clears session and redirects to /login', async ({ page }) => {
    // Log in first
    await page.goto('/login')
    await page.fill('input[name="email"]', 'employee1@example.com')
    await page.fill('input[name="password"]', 'demo1234')
    await page.click('button[type="submit"]')
    await expect(page).toHaveURL('/employee/expenses', { timeout: 10000 })

    // Sign out
    await page.click('button:has-text("Sign out")')
    await expect(page).toHaveURL('/login', { timeout: 10000 })

    // Verify session is gone
    await page.goto('/employee/expenses')
    await expect(page).toHaveURL('/login', { timeout: 10000 })
  })

  test('employee visiting /manager/expenses is redirected away', async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[name="email"]', 'employee1@example.com')
    await page.fill('input[name="password"]', 'demo1234')
    await page.click('button[type="submit"]')
    await expect(page).toHaveURL('/employee/expenses', { timeout: 10000 })

    await page.goto('/manager/expenses')
    await expect(page).toHaveURL('/employee/expenses', { timeout: 10000 })
  })

  test('manager visiting /employee/submit is redirected away', async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[name="email"]', 'manager1@example.com')
    await page.fill('input[name="password"]', 'demo1234')
    await page.click('button[type="submit"]')
    await expect(page).toHaveURL('/manager/expenses', { timeout: 10000 })

    await page.goto('/employee/submit')
    await expect(page).toHaveURL('/manager/expenses', { timeout: 10000 })
  })
})
