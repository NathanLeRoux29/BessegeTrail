import { expect, test, type Page } from '@playwright/test'

// Bandeau des 6 partenaires de démo, plus larges que l'écran : il défile.

function trackOffset(page: Page) {
  return page.locator('#partenaires .marquee-track').first().evaluate(track => new DOMMatrix(getComputedStyle(track).transform).m41)
}

test('ACC-29 : les logos sont affichés à la même hauteur', async ({ page }) => {
  await page.goto('/')
  const heights = await page.locator('#partenaires .marquee-track:not([aria-hidden]) img').evaluateAll(images => images.map(image => Math.round(image.getBoundingClientRect().height)))

  expect(heights).toHaveLength(6)
  expect(new Set(heights).size).toBe(1)
})

test('ACC-31 : les logos défilent de gauche à droite', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('#partenaires .marquee')).not.toHaveClass(/is-static/)

  const before = await trackOffset(page)
  await page.waitForTimeout(600)
  expect(await trackOffset(page)).toBeGreaterThan(before)
})

test('ACC-32 : le défilement s’arrête au survol, au focus et avec le bouton (aria-pressed)', async ({ page }) => {
  await page.goto('/')
  const marquee = page.locator('#partenaires .marquee')
  const toggle = page.getByRole('button', { name: 'Mettre en pause le défilement' })

  await marquee.hover()
  const hovered = await trackOffset(page)
  await page.waitForTimeout(400)
  expect(await trackOffset(page)).toBe(hovered)

  await page.mouse.move(0, 0)
  await page.locator('#partenaires .marquee-track:not([aria-hidden]) a').first().focus()
  const focused = await trackOffset(page)
  await page.waitForTimeout(400)
  expect(await trackOffset(page)).toBe(focused)

  await toggle.click()
  await page.mouse.move(0, 0)
  await expect(page.getByRole('button', { name: 'Reprendre le défilement' })).toHaveAttribute('aria-pressed', 'true')
  const paused = await trackOffset(page)
  await page.waitForTimeout(400)
  expect(await trackOffset(page)).toBe(paused)
})

test.describe('avec prefers-reduced-motion', () => {
  test.use({ reducedMotion: 'reduce' })

  test('ACC-33 : grille fixe centrée, sans copie ni bouton de pause', async ({ page }) => {
    await page.goto('/')

    await expect(page.locator('#partenaires .marquee')).toHaveClass(/is-static/)
    await expect(page.locator('#partenaires .marquee-track[aria-hidden="true"]')).toBeHidden()
    await expect(page.locator('#partenaires button.marquee-toggle')).toHaveCount(0)
  })
})
