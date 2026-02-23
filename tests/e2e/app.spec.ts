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

  // (6) Pipeline History link is present on home page
  test('shows Pipeline History link on home page', async ({ page }) => {
    await expect(page.getByRole('link', { name: /View Pipeline History/i })).toBeVisible()
  })

  // (7) Pipeline History link navigates to history page
  test('Pipeline History link navigates to history page', async ({ page }) => {
    await page.getByRole('link', { name: /View Pipeline History/i }).click()
    await page.waitForLoadState('networkidle')
    await expect(page).toHaveURL('/history')
    await expect(page.getByRole('heading', { name: 'Pipeline History' })).toBeVisible()
  })
})

test.describe('Pipeline History page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/history')
    await page.waitForLoadState('networkidle')
  })

  // (8) History page loads and shows the heading
  test('shows the Pipeline History heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Pipeline History' })).toBeVisible()
  })

  // (9) History page shows table with correct columns
  test('shows history table with correct columns', async ({ page }) => {
    await expect(page.getByRole('table')).toBeVisible()
    await expect(page.getByRole('columnheader', { name: /Run Name/i })).toBeVisible()
    await expect(page.getByRole('columnheader', { name: /Status/i })).toBeVisible()
    await expect(page.getByRole('columnheader', { name: /Started At/i })).toBeVisible()
    await expect(page.getByRole('columnheader', { name: /Duration/i })).toBeVisible()
    await expect(page.getByRole('columnheader', { name: /Tool Calls/i })).toBeVisible()
    await expect(page.getByRole('columnheader', { name: /LLM Calls/i })).toBeVisible()
    await expect(page.getByRole('columnheader', { name: /Total Tokens/i })).toBeVisible()
  })

  // (10) NavBar has Pipeline History link
  test('NavBar has Pipeline History link', async ({ page }) => {
    // NavBar has "Pipeline History" link, home page has "View Pipeline History" link
    await expect(page.getByRole('link', { name: /Pipeline History/i })).toHaveCount(1)
    await expect(page.getByRole('link', { name: /View Pipeline History/i })).not.toBeVisible() // Not on this page
  })

  // (11) Clicking EDH Builder logo navigates to home
  test('clicking logo navigates to home page', async ({ page }) => {
    await page.getByRole('link', { name: 'EDH Builder', exact: false }).first().click()
    await page.waitForLoadState('networkidle')
    await expect(page).toHaveURL('/')
    await expect(page.getByRole('heading', { name: 'EDH Deck Builder' })).toBeVisible()
  })
})
