import { test, expect } from '@playwright/test'

test.describe('Home page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
  })

  // (1) Home page loads and shows the heading
  test('shows the EDH Deck Builder heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'EDH Deck Builder' })).toBeVisible()
  })

  // (2) Both tab buttons are present
  test('shows Paste Decklist and Moxfield URL tab buttons', async ({ page }) => {
    await expect(page.getByRole('tab', { name: /Paste Decklist/i })).toBeVisible()
    await expect(page.getByRole('tab', { name: /Moxfield URL/i })).toBeVisible()
  })

  // (3) Clicking the Moxfield tab makes it active (aria-selected="true")
  test('clicking Moxfield URL tab makes it active', async ({ page }) => {
    const moxTab = page.getByRole('tab', { name: /Moxfield URL/i })
    const pasteTab = page.getByRole('tab', { name: /Paste Decklist/i })

    // Initially paste tab is active
    await expect(pasteTab).toHaveAttribute('aria-selected', 'true')
    await expect(moxTab).toHaveAttribute('aria-selected', 'false')

    await moxTab.click()

    await expect(moxTab).toHaveAttribute('aria-selected', 'true')
    await expect(pasteTab).toHaveAttribute('aria-selected', 'false')
  })

  // (4) Submitting the paste form while empty shows an error message
  test('submitting empty paste form shows an error', async ({ page }) => {
    // Paste tab is active by default; click the submit button with no text
    await page.getByRole('button', { name: /View Deck/i }).click()
    await expect(page.locator('.import-error')).toBeVisible()
    await expect(page.locator('.import-error')).toHaveText('Please paste a decklist first.')
  })

  // (5) Submitting an invalid Moxfield URL shows an error message
  test('submitting an invalid Moxfield URL shows an error', async ({ page }) => {
    await page.getByRole('tab', { name: /Moxfield URL/i }).click()

    await page.getByLabel('Moxfield Deck URL').fill('https://not-moxfield.com/bad-url')
    await page.getByRole('button', { name: /Import from Moxfield/i }).click()

    await expect(page.locator('.import-error')).toBeVisible()
    await expect(page.locator('.import-error')).toContainText(
      'Could not parse a Moxfield deck ID from that URL'
    )
  })
})
