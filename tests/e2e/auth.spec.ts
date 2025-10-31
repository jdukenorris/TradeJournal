import { test, expect } from '@playwright/test'

test.describe('Authentication Flow', () => {
  test('should redirect to sign-in when not authenticated', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page).toHaveURL(/.*sign-in/)
  })

  test('sign-up page should load', async ({ page }) => {
    await page.goto('/sign-up')
    await expect(page.locator('h1')).toContainText('Sign Up')
  })

  test('sign-in page should load', async ({ page }) => {
    await page.goto('/sign-in')
    await expect(page.locator('h1')).toContainText('Sign In')
  })

  test('should navigate between sign-in and sign-up', async ({ page }) => {
    await page.goto('/sign-in')
    await page.click('text=Sign up')
    await expect(page).toHaveURL(/.*sign-up/)

    await page.click('text=Sign in')
    await expect(page).toHaveURL(/.*sign-in/)
  })
})

