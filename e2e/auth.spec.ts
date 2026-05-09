import { test, expect } from '@playwright/test'

test.describe('Login flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.context().clearCookies()
  })

  test('employee login redirects to /employee/expenses', async ({ page }) => {
    await page.goto('/login')
    await page.getByLabel('Email').fill('employee1@example.com')
    await page.getByLabel('Password').fill('demo1234')
    await page.getByRole('button', { name: 'Sign in' }).click()

    await expect(page).toHaveURL('/employee/expenses', { timeout: 10000 })
    await expect(page.getByRole('heading', { name: 'My Expenses' })).toBeVisible()
  })

  test('manager login redirects to /manager/expenses', async ({ page }) => {
    await page.goto('/login')
    await page.getByLabel('Email').fill('manager1@example.com')
    await page.getByLabel('Password').fill('demo1234')
    await page.getByRole('button', { name: 'Sign in' }).click()

    await expect(page).toHaveURL('/manager/expenses', { timeout: 10000 })
    await expect(page.getByRole('heading', { name: 'Expense Review Queue' })).toBeVisible()
  })

  test('wrong password shows error message', async ({ page }) => {
    await page.goto('/login')
    await page.getByLabel('Email').fill('employee1@example.com')
    await page.getByLabel('Password').fill('wrongpassword')
    await page.getByRole('button', { name: 'Sign in' }).click()

    await expect(page.getByRole('alert')).toBeVisible()
    await expect(page).toHaveURL('/login')
  })

  test('visiting protected route without session redirects to /login', async ({ page }) => {
    await page.goto('/employee/expenses')
    await expect(page).toHaveURL('/login', { timeout: 10000 })
  })

  test('logout clears session and redirects to /login', async ({ page }) => {
    await page.goto('/login')
    await page.getByLabel('Email').fill('employee1@example.com')
    await page.getByLabel('Password').fill('demo1234')
    await page.getByRole('button', { name: 'Sign in' }).click()
    await expect(page).toHaveURL('/employee/expenses', { timeout: 10000 })

    await page.getByRole('button', { name: 'Sign out' }).click()
    await expect(page).toHaveURL('/login', { timeout: 10000 })

    await page.goto('/employee/expenses')
    await expect(page).toHaveURL('/login', { timeout: 10000 })
  })

  test('employee visiting /manager/expenses is redirected away', async ({ page }) => {
    await page.goto('/login')
    await page.getByLabel('Email').fill('employee1@example.com')
    await page.getByLabel('Password').fill('demo1234')
    await page.getByRole('button', { name: 'Sign in' }).click()
    await expect(page).toHaveURL('/employee/expenses', { timeout: 10000 })

    await page.goto('/manager/expenses')
    await expect(page).toHaveURL('/employee/expenses', { timeout: 10000 })
  })

  test('manager visiting /employee/submit is redirected away', async ({ page }) => {
    await page.goto('/login')
    await page.getByLabel('Email').fill('manager1@example.com')
    await page.getByLabel('Password').fill('demo1234')
    await page.getByRole('button', { name: 'Sign in' }).click()
    await expect(page).toHaveURL('/manager/expenses', { timeout: 10000 })

    await page.goto('/employee/submit')
    await expect(page).toHaveURL('/manager/expenses', { timeout: 10000 })
  })
})
