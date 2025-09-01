import { test, expect } from '@playwright/test'

test('shows games and filters by search', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByPlaceholder('Search games...')).toBeVisible()
  await expect(page.getByRole('button', { name: /keno/i })).toBeVisible()

  await page.getByPlaceholder('Search games...').fill('x')
  await expect(page.getByRole('button', { name: /keno/i })).toHaveCount(0)

  await page.getByPlaceholder('Search games...').fill('ke')
  await expect(page.getByRole('button', { name: /keno/i })).toBeVisible()
})

test('clicking game navigates to keno url', async ({ page }) => {
  await page.goto('/')
  const [nav] = await Promise.all([
    page.waitForNavigation({ url: /keno/ }),
    page.getByRole('button', { name: /open/i }).click(),
  ])
  expect(nav?.url() || page.url()).toMatch(/keno/)
})


