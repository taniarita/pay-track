import { test, expect, type Page } from '@playwright/test'

async function loginAsManager(page: Page) {
  await page.context().clearCookies()
  await page.goto('/login')
  await page.getByLabel('Email').fill('manager1@example.com')
  await page.getByLabel('Password').fill('demo1234')
  await page.getByRole('button', { name: 'Sign in' }).click()
  await expect(page).toHaveURL('/manager/expenses', { timeout: 10000 })
}

async function loginAsEmployee(page: Page) {
  await page.context().clearCookies()
  await page.goto('/login')
  await page.getByLabel('Email').fill('employee1@example.com')
  await page.getByLabel('Password').fill('demo1234')
  await page.getByRole('button', { name: 'Sign in' }).click()
  await expect(page).toHaveURL('/employee/expenses', { timeout: 10000 })
}

async function submitExpense(page: Page, title: string) {
  await page.goto('/employee/submit')
  await page.getByLabel('Title').fill(title)
  await page.getByLabel(/Amount/i).fill('100')
  await page.getByLabel('Category').selectOption('MEALS')
  await page.getByLabel('Date').fill('2026-04-20')
  await page.getByRole('button', { name: 'Submit expense' }).click()
  await expect(page.getByText(/submitted successfully/i)).toBeVisible({ timeout: 5000 })
}

test.describe('Manager review queue', () => {
  test('manager sees the review queue heading', async ({ page }) => {
    await loginAsManager(page)
    await expect(page.getByRole('heading', { name: 'Expense Review Queue' })).toBeVisible()
  })

  test('manager approves expense and it disappears from queue', async ({ browser }) => {
    const employeePage = await browser.newPage()
    await loginAsEmployee(employeePage)
    const title = `Approve test ${Date.now()}`
    await submitExpense(employeePage, title)
    await employeePage.close()

    const managerPage = await browser.newPage()
    await loginAsManager(managerPage)
    const row = managerPage.getByRole('row').filter({ hasText: title })
    await expect(row).toBeVisible({ timeout: 5000 })
    await row.getByRole('button', { name: 'Approve' }).click()

    await expect(managerPage.getByText(title)).not.toBeVisible({ timeout: 5000 })
    await managerPage.close()
  })

  test('manager rejects expense with reason and it disappears from queue', async ({ browser }) => {
    const employeePage = await browser.newPage()
    await loginAsEmployee(employeePage)
    const title = `Reject test ${Date.now()}`
    await submitExpense(employeePage, title)
    await employeePage.close()

    const managerPage = await browser.newPage()
    await loginAsManager(managerPage)
    const row = managerPage.getByRole('row').filter({ hasText: title })
    await expect(row).toBeVisible({ timeout: 5000 })
    await row.getByRole('button', { name: 'Reject' }).click()
    await managerPage.getByLabel('Rejection reason').fill('Policy violation')
    await managerPage.getByRole('button', { name: 'Confirm reject' }).click()

    await expect(managerPage.getByText(title)).not.toBeVisible({ timeout: 5000 })
    await managerPage.close()
  })

  test('employee sees rejection reason in history after manager rejects', async ({ browser }) => {
    const employeePage = await browser.newPage()
    await loginAsEmployee(employeePage)
    const title = `Rejection reason test ${Date.now()}`
    await submitExpense(employeePage, title)

    const managerPage = await browser.newPage()
    await loginAsManager(managerPage)
    const row = managerPage.getByRole('row').filter({ hasText: title })
    await expect(row).toBeVisible({ timeout: 5000 })
    await row.getByRole('button', { name: 'Reject' }).click()
    await managerPage.getByLabel('Rejection reason').fill('Over budget limit')
    await managerPage.getByRole('button', { name: 'Confirm reject' }).click()
    await expect(managerPage.getByText(title)).not.toBeVisible({ timeout: 5000 })
    await managerPage.close()

    await employeePage.goto('/employee/expenses')
    const expenseRow = employeePage.getByRole('row').filter({ hasText: title })
    await expect(expenseRow.getByText('Over budget limit')).toBeVisible({ timeout: 5000 })
    await employeePage.close()
  })
})
